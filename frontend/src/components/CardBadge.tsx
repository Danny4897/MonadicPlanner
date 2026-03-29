type CardType = 'module' | 'feature' | 'bug' | 'release' | 'milestone';
type Priority = 'critical' | 'high' | 'medium' | 'low';

const TYPE_ICONS: Record<CardType, string> = {
  module: '🧩',
  feature: '⚡',
  bug: '🐛',
  release: '🚀',
  milestone: '🏁',
};

const PRIORITY_COLORS: Record<Priority, string> = {
  critical: 'bg-red-900/60 text-red-300 border-red-700',
  high: 'bg-orange-900/60 text-orange-300 border-orange-700',
  medium: 'bg-yellow-900/60 text-yellow-300 border-yellow-700',
  low: 'bg-gray-800/60 text-gray-400 border-gray-600',
};

interface TypeBadgeProps {
  type: CardType;
}

export function TypeBadge({ type }: TypeBadgeProps) {
  return (
    <span className="text-xs px-1.5 py-0.5 rounded bg-surface border border-border text-muted flex items-center gap-1">
      <span>{TYPE_ICONS[type]}</span>
      <span>{type}</span>
    </span>
  );
}

interface PriorityBadgeProps {
  priority: Priority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span
      className={`text-xs px-1.5 py-0.5 rounded border font-medium ${PRIORITY_COLORS[priority]}`}
    >
      {priority}
    </span>
  );
}

interface GreenScoreBadgeProps {
  score: number;
}

export function GreenScoreBadge({ score }: GreenScoreBadgeProps) {
  const color =
    score >= 90
      ? 'bg-green-900/60 text-green-300 border-green-700'
      : score >= 70
      ? 'bg-yellow-900/60 text-yellow-300 border-yellow-700'
      : 'bg-red-900/60 text-red-300 border-red-700';

  return (
    <span className={`text-xs px-1.5 py-0.5 rounded border font-mono ${color}`}>
      GS:{score}
    </span>
  );
}

interface TagBadgeProps {
  tag: string;
}

export function TagBadge({ tag }: TagBadgeProps) {
  return (
    <span className="text-xs px-1.5 py-0.5 rounded bg-surface border border-border text-muted">
      🏷 {tag}
    </span>
  );
}
