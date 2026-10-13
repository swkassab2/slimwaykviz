import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { apiGet, apiPatch } from '../api';
import {
  STEP_TITLES, STEP_CONFIG, DISTANCES, AGE_GROUPS, CONTRAINDICATIONS, GOALS, TIMING_OPTIONS,
  EXPERIENCE, TIME_SLOTS, SOURCES, SESSIONS_PER_WEEK,
  A1, A2, A3, A4, A5, A6, A7, A8, A9, A10, Answers,
} from '../config/qualify';

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ current, maxVisited, id }: { current: number; maxVisited: number; id: string }) {
  const navigate = useNavigate();
  return (
    <div className="progress-bar">
      {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
        <div
          key={n}
          className={`progress-step ${n === current ? 'current' : n <= maxVisited ? 'done' : ''}`}
          onClick={() => n < current && navigate(`/q/${id}/${n}`)}
        >
          {n}
        </div>
      ))}
    </div>
  );
}

// ─── Step 1: Distance ─────────────────────────────────────────────────────────
function Step1({ answer, onChange }: { answer?: A1; onChange: (v: A1) => void }) {
  return (
    <div className="options">
      {DISTANCES.map((d, i) => (
        <button key={d.id} className={`option-btn ${answer?.value === d.id ? 'selected' : ''}`}
          onClick={() => onChange({ value: d.id })}>
          <span style={{ opacity: .45, marginRight: 8 }}>{i + 1}.</span>{d.label}
        </button>
      ))}
    </div>
  );
}

// ─── Step 2: Age ──────────────────────────────────────────────────────────────
function Step2({ answer, onChange }: { answer?: A2; onChange: (v: A2) => void }) {
  return (
    <>
      {answer?.value === 'under18' && (
        <div className="alert alert-warn" style={{ marginTop: 12 }}>
          Нужно присутствие/согласие родителя
        </div>
      )}
      <div className="options">
        {AGE_GROUPS.map((g, i) => (
          <button key={g.id} className={`option-btn ${answer?.value === g.id ? 'selected' : ''}`}
            onClick={() => onChange({ value: g.id })}>
            <span style={{ opacity: .45, marginRight: 8 }}>{i + 1}.</span>{g.label}
          </button>
        ))}
      </div>
    </>
  );
}

// ─── Step 3: Contraindications ────────────────────────────────────────────────
function Step3({ answer, onChange }: { answer?: A3; onChange: (v: A3) => void }) {
  const a: A3 = answer ?? { selected: [], none: false, other: '' };
  const stopIds = new Set(CONTRAINDICATIONS.stop.map(c => c.id));
  const tempIds = new Set(CONTRAINDICATIONS.temporary.map(c => c.id));
  const hasStop = a.selected.some(s => stopIds.has(s));
  const hasTemp = !hasStop && a.selected.some(s => tempIds.has(s));

  function toggle(id: string) {
    const sel = a.selected.includes(id) ? a.selected.filter(s => s !== id) : [...a.selected, id];
    onChange({ ...a, selected: sel, none: false });
  }

  function toggleNone() {
    onChange({ selected: [], none: !a.none, other: '' });
  }

  const groups = [
    { key: 'stop' as const, label: '🛑 СТОП', items: CONTRAINDICATIONS.stop },
    { key: 'temporary' as const, label: '⏳ ВРЕМЕННО', items: CONTRAINDICATIONS.temporary },
    { key: 'attention' as const, label: '⚠️ ВНИМАНИЕ', items: CONTRAINDICATIONS.attention },
  ];

  return (
    <>
      {hasStop && (
        <div className="alert alert-stop">
          Аппараты запрещены. Пробную не записывать без консультации специалиста
        </div>
      )}
      {hasTemp && (
        <div className="alert alert-warn">Пробную отложить</div>
      )}

      {groups.map(g => (
        <div key={g.key} className={`contra-group ${g.key}`}>
          <h4>{g.label}</h4>
          <div className="options" style={{ gap: 6 }}>
            {g.items.map(item => (
              <button key={item.id}
                className={`option-btn ${a.selected.includes(item.id) ? (g.key === 'stop' ? 'selected-stop' : 'selected') : ''}`}
                onClick={() => toggle(item.id)}
                style={{ padding: '10px 14px', fontSize: 14 }}>
                {a.selected.includes(item.id) ? '☑ ' : '☐ '}{item.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      <hr className="contra-divider" />
      <button className={`option-btn none-btn ${a.none ? 'selected' : ''}`} onClick={toggleNone}>
        {a.none ? '✓ ' : ''}Противопоказаний нет
      </button>

      <div className="field" style={{ marginTop: 12 }}>
        <label>Другое (необязательно)</label>
        <input type="text" value={a.other}
          onChange={e => onChange({ ...a, other: e.target.value })}
          placeholder="Укажите если есть" />
      </div>
    </>
  );
}

// ─── Step 4: Goals ────────────────────────────────────────────────────────────
function Step4({ answer, onChange }: { answer?: A4; onChange: (v: A4) => void }) {
  const a: A4 = answer ?? { selected: [], other: '' };
  function toggle(id: string) {
    const sel = a.selected.includes(id) ? a.selected.filter(s => s !== id) : [...a.selected, id];
    onChange({ ...a, selected: sel });
  }
  return (
    <>
      <div className="options">
        {GOALS.map(g => (
          <button key={g.id} className={`option-btn ${a.selected.includes(g.id) ? 'selected' : ''}`}
            onClick={() => toggle(g.id)}>
            {a.selected.includes(g.id) ? '✓ ' : ''}{g.label}
          </button>
        ))}
      </div>
      <div className="field" style={{ marginTop: 12 }}>
        <label>Другое (необязательно)</label>
        <input type="text" value={a.other}
          onChange={e => onChange({ ...a, other: e.target.value })}
          placeholder="Что-то ещё?" />
      </div>
    </>
  );
}

// ─── Step 5: Timing ───────────────────────────────────────────────────────────
function Step5({ answer, onChange }: { answer?: A5; onChange: (v: A5) => void }) {
  const a: A5 = answer ?? { type: '', date: '' };
  const today = new Date().toISOString().split('T')[0];
  const needsDate = a.type && a.type !== 'none';

  let weeksLeft = 0;
  let sessionsPossible = 0;
  if (a.date) {
    const diff = new Date(a.date).getTime() - Date.now();
    weeksLeft = Math.max(0, Math.floor(diff / (7 * 24 * 60 * 60 * 1000)));
    sessionsPossible = weeksLeft * SESSIONS_PER_WEEK;
  }

  return (
    <>
      <div className="options">
        {TIMING_OPTIONS.map((opt, i) => (
          <button key={opt.id} className={`option-btn ${a.type === opt.id ? 'selected' : ''}`}
            onClick={() => onChange({ type: opt.id, date: opt.id === 'none' ? '' : a.date })}>
            <span style={{ opacity: .45, marginRight: 8 }}>{i + 1}.</span>{opt.label}
          </button>
        ))}
      </div>
      {needsDate && (
        <>
          <div className="field" style={{ marginTop: 16 }}>
            <label>Выберите дату</label>
            <input type="date" min={today} value={a.date ?? ''}
              onChange={e => onChange({ ...a, date: e.target.value })} />
          </div>
          {a.date && weeksLeft >= 0 && (
            <div className="alert alert-info" style={{ marginTop: 8 }}>
              До даты {weeksLeft} {plural(weeksLeft, 'неделя', 'недели', 'недель')} — успеем около {sessionsPossible} сеансов
            </div>
          )}
          {a.date && weeksLeft < 2 && (
            <div className="alert alert-warn">Очень мало времени — обсудить реалистичный результат</div>
          )}
        </>
      )}
    </>
  );
}

// ─── Step 6: Params ───────────────────────────────────────────────────────────
function Step6({ answer, onChange }: { answer?: A6; onChange: (v: A6) => void }) {
  const a: A6 = answer ?? { height: '', weight: '', goal_weight: '' };

  let bmi = 0;
  if (!a.skipped && a.height && a.weight) {
    const h = Number(a.height) / 100;
    bmi = Math.round((Number(a.weight) / (h * h)) * 10) / 10;
  }
  const goalDiff = !a.skipped && a.goal_weight && a.weight && Number(a.goal_weight) > 0
    ? Number(a.weight) - Number(a.goal_weight)
    : null;

  function handleField(field: keyof A6, val: string) {
    const num = val === '' ? '' : parseFloat(val);
    onChange({ ...a, [field]: num, skipped: false });
  }

  if (a.skipped) {
    return (
      <div className="alert alert-info" style={{ marginTop: 16 }}>
        Параметры пропущены. Введите данные ниже чтобы заполнить.
        <div className="field" style={{ marginTop: 12 }}>
          <label>Рост (см)</label>
          <input type="number" min={120} max={220} placeholder="170"
            onChange={e => handleField('height', e.target.value)} />
        </div>
        <div className="field" style={{ marginTop: 8 }}>
          <label>Вес (кг)</label>
          <input type="number" min={30} max={250} placeholder="70"
            onChange={e => handleField('weight', e.target.value)} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="field">
        <label>Рост (см)</label>
        <input type="number" value={a.height} min={120} max={220} placeholder="170"
          onChange={e => handleField('height', e.target.value)} />
      </div>
      <div className="field">
        <label>Вес (кг)</label>
        <input type="number" value={a.weight} min={30} max={250} placeholder="70"
          onChange={e => handleField('weight', e.target.value)} />
      </div>
      <div className="field">
        <label>Желаемый вес (кг, необязательно)</label>
        <input type="number" value={a.goal_weight ?? ''} min={30} max={250} placeholder="60"
          onChange={e => handleField('goal_weight', e.target.value)} />
      </div>
      {bmi > 0 && (
        <div className="bmi-badge">
          ИМТ: {bmi}
          {goalDiff !== null && goalDiff > 0 ? ` · цель: −${goalDiff} кг` : ''}
        </div>
      )}
    </>
  );
}

// ─── Step 7: Experience ───────────────────────────────────────────────────────
function Step7({ answer, onChange }: { answer?: A7; onChange: (v: A7) => void }) {
  const a: A7 = answer ?? { selected: [], what_failed: '' };
  function toggle(id: string) {
    const sel = a.selected.includes(id) ? a.selected.filter(s => s !== id) : [...a.selected, id];
    onChange({ ...a, selected: sel });
  }
  return (
    <>
      <div className="options">
        {EXPERIENCE.map(e => (
          <button key={e.id} className={`option-btn ${a.selected.includes(e.id) ? 'selected' : ''}`}
            onClick={() => toggle(e.id)}>
            {a.selected.includes(e.id) ? '✓ ' : ''}{e.label}
          </button>
        ))}
      </div>
      <div className="field" style={{ marginTop: 12 }}>
        <label>Что не сработало (необязательно)</label>
        <input type="text" value={a.what_failed}
          onChange={e => onChange({ ...a, what_failed: e.target.value })}
          placeholder="Подробности…" />
      </div>
    </>
  );
}

// ─── Step 8: Time slots ───────────────────────────────────────────────────────
function Step8({ answer, onChange }: { answer?: A8; onChange: (v: A8) => void }) {
  const a: A8 = answer ?? { selected: [] };
  function toggle(id: string) {
    const sel = a.selected.includes(id) ? a.selected.filter(s => s !== id) : [...a.selected, id];
    onChange({ selected: sel });
  }
  return (
    <div className="options" style={{ gridTemplateColumns: '1fr 1fr' }}>
      {TIME_SLOTS.map(t => (
        <button key={t.id} className={`option-btn ${a.selected.includes(t.id) ? 'selected' : ''}`}
          onClick={() => toggle(t.id)}>
          {a.selected.includes(t.id) ? '✓ ' : ''}{t.label}
        </button>
      ))}
    </div>
  );
}

// ─── Step 9: Motivation ───────────────────────────────────────────────────────
function Step9({ answer, onChange }: { answer?: A9; onChange: (v: A9) => void }) {
  const a: A9 = answer ?? { value: 0 };
  return (
    <>
      <p style={{ color: '#6b7280', marginTop: 8 }}>Насколько важно решить это сейчас?</p>
      <div className="scale-grid">
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
          <button key={n} className={`scale-btn ${a.value === n ? 'selected' : ''}`}
            onClick={() => onChange({ value: n })}>{n}</button>
        ))}
      </div>
    </>
  );
}

// ─── Step 10: Source ──────────────────────────────────────────────────────────
function Step10({ answer, onChange }: { answer?: A10; onChange: (v: A10) => void }) {
  return (
    <div className="options">
      {SOURCES.map((s, i) => (
        <button key={s.id} className={`option-btn ${answer?.value === s.id ? 'selected' : ''}`}
          onClick={() => onChange({ value: s.id })}>
          <span style={{ opacity: .45, marginRight: 8 }}>{i + 1}.</span>{s.label}
        </button>
      ))}
    </div>
  );
}

// ─── Validation ───────────────────────────────────────────────────────────────
function canProceed(step: number, answers: Answers): boolean {
  const a = answers[step] as Record<string, unknown> | undefined;
  switch (step) {
    case 1: return !!(a as A1 | undefined)?.value;
    case 2: return !!(a as A2 | undefined)?.value;
    case 3: {
      const c = a as A3 | undefined;
      return !!(c?.none || (c?.selected?.length ?? 0) > 0);
    }
    case 4: {
      const c = a as A4 | undefined;
      return !!((c?.selected?.length ?? 0) > 0 || c?.other);
    }
    case 5: {
      const c = a as A5 | undefined;
      return !!(c?.type && (c.type === 'none' || c.date));
    }
    case 6: {
      const c = a as A6 | undefined;
      return !!(c?.skipped || (c?.height && c?.weight));
    }
    case 7: return !!((a as A7 | undefined)?.selected?.length ?? 0);
    case 8: return !!((a as A8 | undefined)?.selected?.length ?? 0);
    case 9: return !!((a as A9 | undefined)?.value ?? 0);
    case 10: return !!(a as A10 | undefined)?.value;
    default: return true;
  }
}

// ─── Single-select keyboard mapping ──────────────────────────────────────────
const SINGLE_SELECT_OPTIONS: Record<number, { id: string }[]> = {
  1: DISTANCES,
  2: AGE_GROUPS,
  5: TIMING_OPTIONS,
  10: SOURCES,
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function QuizPage() {
  const { id, step } = useParams<{ id: string; step: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fromSummary = searchParams.get('back') === 'summary';
  const stepNum = parseInt(step ?? '1', 10);

  const [answers, setAnswers] = useState<Answers>({});
  const [maxVisited, setMaxVisited] = useState(stepNum);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!id) return;
    apiGet(`/api/sessions/${id}`).then((s) => {
      setAnswers(s.answers ?? {});
      setMaxVisited(Math.max(s.current_step ?? stepNum, stepNum));
    });
  }, [id]);

  useEffect(() => {
    setMaxVisited(mv => Math.max(mv, stepNum));
  }, [stepNum]);

  function autoSave(newAnswers: Answers) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      await apiPatch(`/api/sessions/${id}`, { answers: newAnswers, current_step: stepNum });
      setSaving(false);
      setSavedAt(new Date());
    }, 500);
  }

  function update(value: unknown) {
    const next = { ...answers, [stepNum]: value };
    setAnswers(next);
    autoSave(next);
  }

  function goNext() {
    if (!canProceed(stepNum, answers)) return;
    if (fromSummary || stepNum === 10) navigate(`/q/${id}/summary`);
    else navigate(`/q/${id}/${stepNum + 1}`);
  }

  function goBack() {
    if (fromSummary) navigate(`/q/${id}/summary`);
    else if (stepNum > 1) navigate(`/q/${id}/${stepNum - 1}`);
    else navigate('/');
  }

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === 'Enter') { goNext(); return; }
      const n = parseInt(e.key, 10);
      if (isNaN(n) || n < 1) return;
      const opts = SINGLE_SELECT_OPTIONS[stepNum];
      if (opts && n <= opts.length) update({ value: opts[n - 1].id });
      // Step 9: 1-9 map to motivation values
      if (stepNum === 9 && n >= 1 && n <= 9) update({ value: n });
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stepNum, answers]);

  const proceed = canProceed(stepNum, answers);
  const isSkippable = STEP_CONFIG[stepNum - 1]?.skippable;
  const isSkipped = stepNum === 6 && !!(answers[6] as A6 | undefined)?.skipped;

  function skip() {
    update({ skipped: true, height: '', weight: '', goal_weight: '' } as A6);
  }

  return (
    <div className="page">
      <ProgressBar current={stepNum} maxVisited={maxVisited} id={id!} />

      {saving && <div className="save-indicator">Сохранение…</div>}
      {!saving && savedAt && <div className="save-indicator">Сохранено</div>}

      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{STEP_TITLES[stepNum - 1]}</h2>
      <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 4 }}>Шаг {stepNum} из 10</p>

      <div className="step-enter">
        {stepNum === 1 && <Step1 answer={answers[1] as A1} onChange={update} />}
        {stepNum === 2 && <Step2 answer={answers[2] as A2} onChange={update} />}
        {stepNum === 3 && <Step3 answer={answers[3] as A3} onChange={update} />}
        {stepNum === 4 && <Step4 answer={answers[4] as A4} onChange={update} />}
        {stepNum === 5 && <Step5 answer={answers[5] as A5} onChange={update} />}
        {stepNum === 6 && <Step6 answer={answers[6] as A6} onChange={update} />}
        {stepNum === 7 && <Step7 answer={answers[7] as A7} onChange={update} />}
        {stepNum === 8 && <Step8 answer={answers[8] as A8} onChange={update} />}
        {stepNum === 9 && <Step9 answer={answers[9] as A9} onChange={update} />}
        {stepNum === 10 && <Step10 answer={answers[10] as A10} onChange={update} />}
      </div>

      <div className="nav-btns">
        <button className="btn btn-secondary" onClick={goBack}>
          {fromSummary ? '← К результату' : stepNum === 1 ? 'Главная' : 'Назад'}
        </button>
        {isSkippable && !isSkipped && (
          <button className="btn btn-secondary" onClick={skip} style={{ color: '#9ca3af' }}>
            Пропустить
          </button>
        )}
        <button className="btn btn-primary" disabled={!proceed} onClick={goNext}>
          {stepNum === 10 || fromSummary ? 'Итог →' : 'Далее →'}
        </button>
      </div>
    </div>
  );
}

function plural(n: number, one: string, few: string, many: string) {
  const m = Math.abs(n) % 100;
  const m2 = m % 10;
  if (m > 10 && m < 20) return many;
  if (m2 === 1) return one;
  if (m2 >= 2 && m2 <= 4) return few;
  return many;
}
