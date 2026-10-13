export const SESSIONS_PER_WEEK_MIN = 2;
export const SESSIONS_PER_WEEK_MAX = 3;
export const SESSIONS_PER_WEEK = SESSIONS_PER_WEEK_MAX; // backward compat

export const DISTANCES = [
  { id: 'near',     label: 'До 15 минут',   score: 3 },
  { id: 'medium',   label: '15–30 минут',   score: 2 },
  { id: 'far',      label: '30–60 минут',   score: 1 },
  { id: 'very_far', label: 'Больше часа',   score: 0 },
];

export const AGE_GROUPS = [
  { id: 'under18', label: 'До 18',   flag: 'minor' },
  { id: '18-25',   label: '18–25' },
  { id: '26-35',   label: '26–35' },
  { id: '36-45',   label: '36–45' },
  { id: '46-55',   label: '46–55' },
  { id: '56+',     label: '56+' },
];

export const POSTPARTUM_PERIODS = [
  { id: 'lt6w',  label: 'Меньше 6 недель' },
  { id: '6w-6m', label: '6 недель – 6 месяцев' },
  { id: 'gt6m',  label: 'Больше 6 месяцев' },
];

export const CONTRAINDICATIONS = {
  stop: [
    { id: 'pregnancy',   label: 'Беременность' },
    { id: 'pacemaker',   label: 'Кардиостимулятор' },
    { id: 'heart',       label: 'Серьёзные проблемы с сердцем (недостаточность, тяжёлая аритмия, тяжёлая гипертензия)' },
    { id: 'epilepsy',    label: 'Эпилепсия' },
    { id: 'oncology',    label: 'Онкология' },
    { id: 'anticoag',    label: 'Приём антикоагулянтов' },
    { id: 'transplant',  label: 'Трансплантация органов' },
    { id: 'cyst',        label: 'Киста / миома' },
  ],
  temporary: [
    { id: 'surgery',    label: 'Операция за последние 3 месяца' },
    { id: 'infection',  label: 'Острая инфекция / простуда' },
  ],
  attention: [
    { id: 'pressure',     label: 'Давление (повышенное или пониженное)' },
    { id: 'diabetes',     label: 'Диабет / инсулинорезистентность' },
    { id: 'hernia',       label: 'Грыжа (поясничная, паховая, живота)' },
    { id: 'knees',        label: 'Проблемы с коленями' },
    { id: 'circulation',  label: 'Нарушения кровообращения / варикоз' },
    { id: 'dizziness',    label: 'Головокружения' },
  ],
};

export const GOALS = [
  { id: 'belly',     label: 'Живот',                                    score: 1 },
  { id: 'hips',      label: 'Бёдра и ягодицы',                         score: 1 },
  { id: 'weight',    label: 'Скинуть общий вес',                        score: 1 },
  { id: 'cellulite', label: 'Целлюлит / тяжесть в ногах / тонус кожи', score: 1 },
];

export const TIMING_OPTIONS = [
  { id: 'birthday', label: 'К дню рождения' },
  { id: 'wedding',  label: 'К свадьбе' },
  { id: 'vacation', label: 'К отпуску' },
  { id: 'date',     label: 'К конкретной дате' },
  { id: 'none',     label: 'Без конкретного срока', score: 0 },
];

export const EXPERIENCE = [
  { id: 'gym',      label: 'Ходил(а) в зал' },
  { id: 'diet',     label: 'Диеты' },
  { id: 'hardware', label: 'Аппаратные процедуры' },
  { id: 'massage',  label: 'Массаж' },
  { id: 'nothing',  label: 'Ничего не пробовал(а)' },
];

export const TIME_SLOTS = [
  { id: 'morning',  label: 'Утро' },
  { id: 'day',      label: 'День' },
  { id: 'evening',  label: 'Вечер' },
  { id: 'weekend',  label: 'Выходные' },
];

export const SOURCES = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok',    label: 'TikTok' },
  { id: '2gis',      label: '2ГИС' },
  { id: 'referral',  label: 'Рекомендация знакомых' },
  { id: 'passing',   label: 'Проходил(а) мимо' },
  { id: 'website',   label: 'Сайт' },
  { id: 'other',     label: 'Другое' },
];

// Per-step config flags
export const STEP_CONFIG: { skippable?: boolean }[] = [
  {}, {}, {}, {}, {}, { skippable: true }, {}, {}, {}, {},
];

export const STEP_TITLES = [
  'Далеко ли живёт', 'Возраст', 'Противопоказания', 'Что хочет убрать',
  'Сроки', 'Параметры', 'Опыт', 'Удобное время', 'Мотивация', 'Откуда узнали',
];

export const TEMP_THRESHOLDS = { hot: 9, warm: 5 };

export const GOAL_EQUIPMENT: Record<string, string[]> = {
  belly:     ['Vacu Activ', 'InfraShape'],
  hips:      ['InfraShape', 'InfraStep'],
  weight:    ['Vacu Activ', 'InfraStep'],
  cellulite: ['RollShape'],
};

export const TEMP_TIPS: Record<string, string> = {
  hot:      'Записывай на бесплатный замер и пробную прямо сейчас, предложи ближайшее время',
  warm:     'Запиши на бесплатный замер, сделай акцент на сроке и результате',
  cold:     'Не дави. Предложи бесплатный замер без обязательств, договорись о повторном контакте',
  stop:     'Не записывать. Мягко объяснить противопоказание, предложить вернуться после консультации врача',
  postpone: 'Договориться о дате, когда можно будет прийти, поставить напоминание',
};

export const TEMP_BADGES: Record<string, string> = {
  hot: '🔥 Горячий', warm: '🌤 Тёплый', cold: '❄️ Холодный', stop: '⛔ Стоп', postpone: '⏸ Отложить',
};

export const TEMP_COLORS: Record<string, string> = {
  hot: '#e65100', warm: '#f59e0b', cold: '#3b82f6', stop: '#dc2626', postpone: '#6b7280',
};

// ─── Answer types ─────────────────────────────────────────────────────────────
export type A1 = { value: string };
export type A2 = {
  value: string;
  postpartum?: boolean;
  postpartum_period?: 'lt6w' | '6w-6m' | 'gt6m';
  breastfeeding?: boolean;
};
export type A3 = { selected: string[]; none: boolean; other: string };
export type A4 = { selected: string[]; other: string; goal_words?: string };
export type A5 = { type: string; date?: string };
export type A6 = { height: number | ''; weight: number | ''; goal_weight?: number | ''; skipped?: boolean };
export type A7 = { selected: string[]; what_failed: string };
export type A8 = { selected: string[] };
export type A9 = { value: number };
export type A10 = { value: string };

export interface Answers {
  [key: number]: unknown;
  used_scripts?: string[];
}

// ─── Compute result ───────────────────────────────────────────────────────────
export function computeResult(answers: Answers) {
  const a1 = answers[1] as A1 | undefined;
  const a2 = answers[2] as A2 | undefined;
  const a3 = answers[3] as A3 | undefined;
  const a4 = answers[4] as A4 | undefined;
  const a5 = answers[5] as A5 | undefined;
  const a6 = answers[6] as A6 | undefined;
  const a8 = answers[8] as A8 | undefined;
  const a9 = answers[9] as A9 | undefined;

  let score = 0;
  score += DISTANCES.find(d => d.id === a1?.value)?.score ?? 0;

  const goalIds = a4?.selected ?? [];
  score += goalIds.length;

  let weeks_left = 0;
  let sessions_possible = 0;
  let sessions_min = 0;
  if (a5?.type && a5.type !== 'none' && a5.date) {
    const diffMs = new Date(a5.date).getTime() - Date.now();
    weeks_left = Math.max(0, Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)));
    sessions_possible = weeks_left * SESSIONS_PER_WEEK_MAX;
    sessions_min = weeks_left * SESSIONS_PER_WEEK_MIN;
    score += weeks_left <= 12 ? 3 : 2;
  }

  if ((a8?.selected ?? []).length > 0) score += 1;

  const mot = a9?.value ?? 0;
  if (mot >= 8) score += 3;
  else if (mot >= 5) score += 2;

  let bmi = 0;
  if (!a6?.skipped && a6?.height && a6?.weight) {
    const h = Number(a6.height) / 100;
    bmi = Math.round((Number(a6.weight) / (h * h)) * 10) / 10;
  }

  // Temperature from contraindications
  const stopIds = new Set(CONTRAINDICATIONS.stop.map(c => c.id));
  const tempIds = new Set(CONTRAINDICATIONS.temporary.map(c => c.id));
  const sel = a3?.none ? [] : (a3?.selected ?? []);
  let temperature: string;
  if (sel.some(s => stopIds.has(s))) temperature = 'stop';
  else if (sel.some(s => tempIds.has(s))) temperature = 'postpone';
  else if (score >= TEMP_THRESHOLDS.hot) temperature = 'hot';
  else if (score >= TEMP_THRESHOLDS.warm) temperature = 'warm';
  else temperature = 'cold';

  // Postpartum overrides (but not if stop)
  if (temperature !== 'stop' && a2?.postpartum && a2.postpartum_period === 'lt6w') {
    temperature = 'postpone';
  }

  // Equipment
  const eq = new Set<string>();
  for (const g of goalIds) for (const e of GOAL_EQUIPMENT[g] ?? []) eq.add(e);

  // Format recommendation
  const format_recommendation = goalIds.includes('cellulite')
    ? 'SlimWay Complex (активная фаза + RollShape)'
    : 'Кросс-пакет (Vacu Activ, InfraShape, InfraStep)';

  // Flags
  const flags: string[] = [];
  if (a2?.value === 'under18') flags.push('Нужно присутствие/согласие родителя');
  if (a2?.postpartum && a2.postpartum_period === 'lt6w')
    flags.push('Допуск после родов: от 6 нед. (кесарево — от 8), только с разрешения врача');
  else if (a2?.postpartum && a2.postpartum_period === '6w-6m')
    flags.push('Уточнить разрешение врача (после кесарева — от 8 недель)');
  if (a2?.breastfeeding) flags.push('Грудное вскармливание — особое внимание, сказать тренеру');

  for (const s of sel) {
    const item = CONTRAINDICATIONS.attention.find(c => c.id === s);
    if (item) flags.push(`Сказать тренеру: ${item.label}`);
  }
  if (sel.includes('knees') && goalIds.length > 0)
    flags.push('Проблемы с коленями — на старте мягче: InfraShape');
  if (weeks_left > 0 && weeks_left < 2) flags.push('Очень мало времени — обсудить реалистичный результат');
  if (bmi >= 35) flags.push('ИМТ ≥ 35 — обсудить с тренером нагрузку');

  return { score, temperature, bmi, weeks_left, sessions_possible, sessions_min, recommendation: Array.from(eq), flags, format_recommendation };
}

export function buildSummaryText(answers: Answers, result: ReturnType<typeof computeResult>): string {
  const a2 = answers[2] as A2 | undefined;
  const a3 = answers[3] as A3 | undefined;
  const a4 = answers[4] as A4 | undefined;
  const a5 = answers[5] as A5 | undefined;
  const a6 = answers[6] as A6 | undefined;
  const a8 = answers[8] as A8 | undefined;
  const a9 = answers[9] as A9 | undefined;
  const a10 = answers[10] as A10 | undefined;

  const lines: string[] = [];
  lines.push(`Температура: ${TEMP_BADGES[result.temperature]}`);

  const goalLabels = GOALS.filter(g => (a4?.selected ?? []).includes(g.id)).map(g => g.label);
  if (a4?.other) goalLabels.push(a4.other);
  if (goalLabels.length) lines.push(`Запрос: ${goalLabels.join(', ')}`);
  if (a4?.goal_words) lines.push(`Своими словами: ${a4.goal_words}`);

  if (a5?.type !== 'none' && a5?.date) {
    const d = new Date(a5.date).toLocaleDateString('ru-RU');
    lines.push(`Срок: до ${d} (${result.weeks_left} нед, ~${result.sessions_min}–${result.sessions_possible} сеансов)`);
  }

  if (a6?.skipped) lines.push('Параметры: не указаны');
  else if (result.bmi) {
    const goalDiff = a6?.goal_weight && a6?.weight ? Number(a6.weight) - Number(a6.goal_weight) : null;
    lines.push(`ИМТ: ${result.bmi}` + (goalDiff && goalDiff > 0 ? `, цель: −${goalDiff} кг` : ''));
  }

  const allContra = [...CONTRAINDICATIONS.stop, ...CONTRAINDICATIONS.temporary, ...CONTRAINDICATIONS.attention];
  const sel = a3?.none ? [] : (a3?.selected ?? []);
  const contrLabels = allContra.filter(c => sel.includes(c.id)).map(c => c.label);
  if (a3?.other) contrLabels.push(a3.other);
  lines.push(contrLabels.length ? `Противопоказания: ${contrLabels.join(', ')}` : 'Противопоказаний нет');

  const ageLabel = AGE_GROUPS.find(a => a.id === a2?.value)?.label;
  if (ageLabel) lines.push(`Возраст: ${ageLabel}`);

  if (a2?.postpartum) {
    const periodLabel = POSTPARTUM_PERIODS.find(p => p.id === a2.postpartum_period)?.label ?? '';
    lines.push(`После родов: ${periodLabel}${a2.breastfeeding ? ', грудное вскармливание' : ''}`);
  }

  const timeLabels = TIME_SLOTS.filter(t => (a8?.selected ?? []).includes(t.id)).map(t => t.label);
  if (timeLabels.length) lines.push(`Время: ${timeLabels.join(', ')}`);

  if (a9?.value) lines.push(`Мотивация: ${a9.value}/10`);

  const sourceLabel = SOURCES.find(s => s.id === a10?.value)?.label;
  if (sourceLabel) lines.push(`Источник: ${sourceLabel}`);

  if (result.recommendation.length) lines.push(`Аппараты: ${result.recommendation.join(', ')}`);
  lines.push(`Формат: ${result.format_recommendation}`);
  lines.push('(Окончательно — после диагностики и пробной)');

  return lines.join('\n');
}
