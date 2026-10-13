import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  const [session, setSession] = useState<Session | null>(null);
  const [copied, setCopied] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiGet(`/api/sessions/${id}`).then(setSession);
  }, [id]);

  if (!session) return <div className="page">Загрузка…</div>;

  const answers = session.answers ?? {};
  // Use saved values if done, otherwise compute fresh
  const result = session.status === 'done' && session.temperature
    ? {
        score: session.score ?? 0,
        temperature: session.temperature,
        bmi: session.bmi ?? 0,
        weeks_left: (answers[5] as A5 | undefined)?.date
          ? Math.max(0, Math.floor((new Date((answers[5] as A5).date!).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000)))
          : 0,
        sessions_possible: 0,
        recommendation: (session as unknown as { recommendation?: string[] }).recommendation ?? [],
        flags: computeResult(answers).flags,
      }
    : computeResult(answers);

  const summaryText = buildSummaryText(answers, result);
  const a5 = answers[5] as A5 | undefined;

  function editStep(n: number) {
    navigate(`/q/${id}/${n}?back=summary`);
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function complete() {
    setCompleting(true);
    await apiPost(`/api/sessions/${id}/complete`, {
      score: result.score,
      temperature: result.temperature,
      bmi: result.bmi,
      weeks_left: result.weeks_left,
      sessions_possible: result.sessions_possible,
      recommendation: result.recommendation,
      summary_text: summaryText,
    });
    navigate('/');
  }

  const color = TEMP_COLORS[result.temperature] ?? '#6b7280';
  const isDone = session.status === 'done';

  return (
    <div className="page">
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

      {/* BMI */}
      {result.bmi > 0 && (
        <div className="summary-section">
          <h3>Параметры</h3>
          {(() => {
            const a6 = answers[6] as A6 | undefined;
            const diff = a6?.goal_weight && a6?.weight ? Number(a6.weight) - Number(a6.goal_weight) : null;
            return (
              <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                <Stat label="ИМТ" value={String(result.bmi)} />
                {diff && diff > 0 && <Stat label="Цель" value={`−${diff} кг`} />}
              </div>
            );
          })()}
        </div>
      )}

      {/* Flags */}
      {result.flags.length > 0 && (
        <div className="summary-section">
          <h3>Флаги</h3>
          <div style={{ marginTop: 4 }}>
            {result.flags.map((f, i) => <div key={i} className="flag-item">{f}</div>)}
          </div>
        </div>
      )}

      {/* All answers */}
      <div className="summary-section">
        <h3>Все ответы</h3>
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
          <div key={n} className="summary-row">
            <span className="label">{STEP_TITLES[n - 1]}</span>
            <span className="value" style={{ maxWidth: '60%' }}>{getAnswerLabel(n, answers)}</span>
            {!isDone && (
              <button className="edit-link" onClick={() => editStep(n)}>изменить</button>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
        <button className="btn btn-outline" onClick={copyToClipboard}>
          {copied ? '✓ Скопировано!' : 'Скопировать для Fitbase'}
        </button>
        {!isDone && (
          <button className="btn btn-primary" disabled={completing} onClick={complete}>
            {completing ? 'Сохраняем…' : 'Завершить квалификацию'}
          </button>
        )}
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          {isDone ? '← Главная' : 'Новая квалификация'}
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
