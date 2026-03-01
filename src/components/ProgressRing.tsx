interface Props {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  colour?: string;
  label?: string;
}

export function ProgressRing({ value, max, size = 120, strokeWidth = 10, colour = '#f97316', label }: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const offset = circumference * (1 - pct);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1e293b" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={colour} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
        <text
          x="50%" y="50%"
          textAnchor="middle" dominantBaseline="middle"
          fill="white" fontSize={size * 0.18} fontWeight="600"
          transform={`rotate(90, ${size / 2}, ${size / 2})`}
        >
          {Math.round(pct * 100)}%
        </text>
      </svg>
      {label && <span className="text-xs text-slate-400">{label}</span>}
    </div>
  );
}
