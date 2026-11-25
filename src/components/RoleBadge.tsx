import type { CompetitionCategory, GoalLevel, Role } from '@/lib/types';

const ROLE_STYLES: Record<Role, string> = {
  Frontend: 'bg-sky-50 text-sky-700 border-sky-200',
  Backend: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Data/AI': 'bg-violet-50 text-violet-700 border-violet-200',
  'UI/UX': 'bg-rose-50 text-rose-700 border-rose-200',
  Business: 'bg-amber-50 text-amber-800 border-amber-200',
};

const CATEGORY_STYLES: Record<CompetitionCategory, string> = {
  Hackathon: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Data Science': 'bg-purple-50 text-purple-700 border-purple-200',
  BCC: 'bg-orange-50 text-orange-700 border-orange-200',
  KTI: 'bg-teal-50 text-teal-700 border-teal-200',
};

const GOAL_SHORT: Record<GoalLevel, { label: string; style: string }> = {
  1: { label: 'Eksplorasi', style: 'bg-slate-100 text-slate-700 border-slate-200' },
  2: { label: 'Target Final', style: 'bg-blue-50 text-blue-700 border-blue-200' },
  3: { label: 'Target Juara', style: 'bg-amber-50 text-amber-800 border-amber-300' },
};

export function RoleBadge({ role, count }: { role: Role; count?: number }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${ROLE_STYLES[role]}`}
    >
      {count !== undefined ? `${count}x ` : ''}
      {role}
    </span>
  );
}

export function CategoryBadge({ category }: { category: CompetitionCategory }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_STYLES[category]}`}
    >
      {category}
    </span>
  );
}

export function GoalBadge({ goalLevel }: { goalLevel: GoalLevel }) {
  const info = GOAL_SHORT[goalLevel];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${info.style}`}
    >
      {info.label}
    </span>
  );
}
