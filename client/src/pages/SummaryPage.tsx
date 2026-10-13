import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { apiGet, apiPost } from '../api';
import {
  TEMP_BADGES, TEMP_COLORS, TEMP_TIPS, STEP_TITLES,
  DISTANCES, AGE_GROUPS, CONTRAINDICATIONS, GOALS, TIMING_OPTIONS,
  EXPERIENCE, TIME_SLOTS, SOURCES,
  A1, A2, A3, A4, A5, A6, A7, A8, A9, A10, Answers,
  computeResult, buildSummaryText,
} from '../config/qualify';

interface Session {
  id: string; consultant: string; status: string; answers: Answers;
  score?: number; temperature?: string; bmi?: number; summary_text?: string;
}

function getAnswerLabel(step: number, answers: Answers): string {
  const a = answers[step];
  if (!a) return '—';
  switch (step) {
    case 1: return DISTANCES.find(d => d.id === (a as A1).value)?.label ?? '—';
    case 2: return AGE_GROUPS.find(g => g.id === (a as A2).value)?.label ?? '—';
    case 3: {
      const c = a as A3;
      if (c.none) return 'Противопоказаний нет';
      const all = [...CONTRAINDICATIONS.stop, ...CONTRAINDICATIONS.temporary, ...CONTRAINDICATIONS.attention];
      const labels = all.filter(x => c.selected.includes(x.id)).map(x => x.label);
      if (c.other) labels.push(c.other);
      return labels.join(', ') || '—';
    }
    case 4: {
      const g = a as A4;
      const labels = GOALS.filter(x => g.selected.includes(x.id)).map(x => x.label);
      if (g.other) labels.push(g.other);
      return labels.join(', ') || '—';
    }
    case 5: {
      const t = a as A5;
      const opt = TIMING_OPTIONS.find(o => o.id === t.type)?.label ?? '—';
      if (t.type !== 'none' && t.date) return `${opt}: ${new Date(t.date).toLocaleDateString('ru-RU')}`;
      return opt;
    }
    case 6: {
      const p = a as A6;
      if (p.skipped) return 'Не указаны';
      return `${p.height} см, ${p.weight} кг${p.goal_weight ? `, цель ${p.goal_weight} кг` : ''}`;
    }
    case 7: {
      const e = a as A7;
      const labels = EXPERIENCE.filter(x => e.selected.includes(x.id)).map(x => x.label);
      if (e.what_failed) labels.push(`(${e.what_failed})`);
      return labels.join(', ') || '—';
    }
    case 8: return TIME_SLOTS.filter(t => (a as A8).selected.includes(t.id)).map(t => t.label).join(', ') || '—';
    case 9: return `${(a as A9).value}/10`;
    case 10: return SOURCES.find(s => s.id === (a as A10).value)?.label ?? '—';
    default: return '—';
  }
}

export default function SummaryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);

  // Re-fetch whenever we return to this page (e.g., after editing a step)
  useEffect(() => {
    if (!id) return;
    apiGet(`/api/sessions/${id}`).then(setSession);
  }, [id, location.key]);

  if (!session) return <div className="page">Загрузка…</div>;

  const answers = session.answers ?? {};
  // Always compute fresh so edits are reflected immediately
  const result = computeResult(answers);
  const summaryText = buildSummaryText(answers, result);
  const a5 = answers[5] as A5 | undefined;
  const a6 = answers[6] as A6 | undefined;
  const paramsSkipped = !!a6?.skipped;
  const isDone = session.status === 'done';
  const color = TEMP_COLORS[result.temperature] ?? '#6b7280';

  function editStep(n: number) {
    navigate(`/q/${id}/${n}?back=summary`);
  }

  function goBack() {
    if (location.key !== 'default') navigate(-1);
    else navigate('/');
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function complete() {
    setSaving(true);
    await apiPost(`/api/sessions/${id}/complete`, {
      score: result.score,
      temperature: result.temperature,
      bmi: result.bmi,
      weeks_left: result.weeks_left,
      sessions_possible: result.sessions_possible,
      recommendation: result.recommendation,
      summary_text: summaryText,
    });
    setSaving(false);
    if (isDone) {
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 2000);
    } else {
      navigate('/');
    }
  }

  return (
    <div className="page">
      {/* Header with back button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }} onClick={goBack}>
          ← Назад
        </button>
        <span style={{ color: '#9ca3af', fontSize: 14 }}>{session.consultant}</span>
      </div>

      {/* Badge */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div className="badge" style={{ background: color, fontSize: 24 }}>
          {TEMP_BADGES[result.temperature]}
        </div>
        <div style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Счёт: {result.score} баллов</div>
      </div>

      {/* Consultant tip */}
      <div className="summary-section" style={{ borderLeft: `4px solid ${color}` }}>
        <h3>Подсказка консультанту</h3>
        <p style={{ fontSize: 15 }}>{TEMP_TIPS[result.temperature]}</p>
      </div>

      {/* Equipment */}
      {result.recommendation.length > 0 && (
        <div className="summary-section">
          <h3>Рекомендованные аппараты</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
            {result.recommendation.map(eq => (
              <span key={eq} style={{ background: 'var(--teal-light)', color: '#065f5a', padding: '6px 12px', borderRadius: 8, fontWeight: 600, fontSize: 14 }}>
                {eq}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Timing */}
      {a5?.type !== 'none' && a5?.date && (
        <div className="summary-section">
          <h3>Срок</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 4 }}>
            <Stat label="Дата" value={new Date(a5.date).toLocaleDateString('ru-RU')} />
            <Stat label="Недель" value={String(result.weeks_left)} />
            <Stat label="Сеансов" value={`~${result.sessions_possible}`} />
          </div>
        </div>
      )}

      {/* Params / BMI */}
      <div className="summary-section">
        <h3>Параметры</h3>
        {paramsSkipped
          ? <p style={{ color: '#9ca3af', fontSize: 14, marginTop: 4 }}>Не указаны</p>
          : result.bmi > 0
            ? (() => {
                const diff = a6?.goal_weight && a6?.weight ? Number(a6.weight) - Number(a6.goal_weight) : null;
                return (
                  <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                    <Stat label="ИМТ" value={String(result.bmi)} />
                    {diff && diff > 0 && <Stat label="Цель" value={`−${diff} кг`} />}
                  </div>
                );
              })()
            : <p style={{ color: '#9ca3af', fontSize: 14, marginTop: 4 }}>Не заполнены</p>
        }
      </div>

      {/* Flags */}
      {result.flags.length > 0 && (
        <div className="summary-section">
          <h3>Флаги</h3>
          <div style={{ marginTop: 4 }}>
            {result.flags.map((f, i) => <div key={i} className="flag-item">{f}</div>)}
          </div>
        </div>
      )}

      {/* All answers — always editable */}
      <div className="summary-section">
        <h3>Все ответы</h3>
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
          <div key={n} className="summary-row">
            <span className="label">{STEP_TITLES[n - 1]}</span>
            <span className="value" style={{ maxWidth: '55%' }}>{getAnswerLabel(n, answers)}</span>
            <button className="edit-link" onClick={() => editStep(n)}>изменить</button>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
        <button className="btn btn-outline" onClick={copyToClipboard}>
          {copied ? '✓ Скопировано!' : 'Скопировать для Fitbase'}
        </button>
        <button className="btn btn-primary" disabled={saving} onClick={complete}>
          {saving ? 'Сохраняем…' : savedOk ? '✓ Сохранено' : isDone ? 'Сохранить изменения' : 'Завершить квалификацию'}
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          {isDone ? '← Главная' : 'Главная'}
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#9ca3af' }}>{label}</div>
    </div>
  );
}
