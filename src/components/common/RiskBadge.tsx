import type { RiskLevel } from '../../types';

const riskColors: Record<RiskLevel, { bg: string; text: string; border: string; dot: string }> = {
  low: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  moderate: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-400' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', dot: 'bg-orange-400' },
  critical: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-400' },
};

interface RiskBadgeProps {
  level: RiskLevel;
  showScore?: boolean;
  score?: number;
}

export default function RiskBadge({ level, showScore, score }: RiskBadgeProps) {
  const colors = riskColors[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} ${colors.border} border`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {level.charAt(0).toUpperCase() + level.slice(1)}
      {showScore && score !== undefined && ` (${score})`}
    </span>
  );
}
