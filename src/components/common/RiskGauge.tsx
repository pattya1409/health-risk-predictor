import type { RiskLevel } from '../../types';

interface RiskGaugeProps {
  score: number;
  level: RiskLevel;
  label: string;
  size?: number;
}

const levelColors: Record<RiskLevel, string> = {
  low: '#34d399',
  moderate: '#fbbf24',
  high: '#fb923c',
  critical: '#f87171',
};

export default function RiskGauge({ score, level, label, size = 120 }: RiskGaugeProps) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const offset = circumference - progress;
  const color = levelColors[level];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth="8"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{score}</span>
        </div>
      </div>
      <span className="text-sm font-medium text-slate-300">{label}</span>
      <span
        className="text-xs font-semibold px-2 py-0.5 rounded-full"
        style={{ color, backgroundColor: `${color}15` }}
      >
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </span>
    </div>
  );
}
