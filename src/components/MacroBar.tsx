interface MacroBarProps {
  label: string;
  value: number;
  target: number;
  colour: string;
  unit?: string;
}

export function MacroBar({ label, value, target, colour, unit = 'g' }: MacroBarProps) {
  const pct = Math.min((value / target) * 100, 100);
  const over = value > target;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-slate-400">
        <span>{label}</span>
        <span className={over ? 'text-red-400' : 'text-slate-300'}>
          {value.toFixed(1)}{unit} / {target}{unit}
        </span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: colour }}
        />
      </div>
    </div>
  );
}
