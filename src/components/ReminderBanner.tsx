import type { ReminderCardState } from '../types';

interface Props {
  card: ReminderCardState;
}

export function ReminderBanner({ card }: Props) {
  const tone = card.level === 'warning'
    ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-200'
    : 'bg-blue-500/10 border-blue-500/30 text-blue-200';

  return (
    <div className={`rounded-2xl border p-4 ${tone}`}>
      <p className="text-sm font-semibold">{card.title}</p>
      <p className="text-xs mt-1 opacity-85">{card.detail}</p>
    </div>
  );
}
