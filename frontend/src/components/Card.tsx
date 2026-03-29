import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card as CardType } from '../api';
import { TypeBadge, PriorityBadge, GreenScoreBadge, TagBadge } from './CardBadge';

interface CardProps {
  card: CardType;
  onClick: (card: CardType) => void;
}

function parseTags(raw: string | null): string[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function Card({ card, onClick }: CardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'card', card },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const tags = parseTags(card.tags);

  const handleClick = (e: React.MouseEvent) => {
    // Prevent modal from opening when clicking on links
    const target = e.target as HTMLElement;
    if (target.tagName === 'A' || target.closest('a')) return;
    onClick(card);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className="bg-surface border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-accent/50 transition-colors select-none"
    >
      {/* Header row: type + priority */}
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <TypeBadge type={card.type} />
        <PriorityBadge priority={card.priority} />
      </div>

      {/* Title */}
      <p className="text-text text-sm font-medium leading-snug mb-2">{card.title}</p>

      {/* Divider */}
      {(tags.length > 0 || card.green_score !== null || card.repo_link) && (
        <div className="border-t border-border mb-2" />
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}

      {/* Footer: green score + github link */}
      {(card.green_score !== null || card.repo_link) && (
        <div className="flex items-center gap-2 flex-wrap">
          {card.green_score !== null && <GreenScoreBadge score={card.green_score} />}
          {card.repo_link && (
            <a
              href={`https://github.com/${card.repo_link}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted hover:text-accent transition-colors flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              GitHub
            </a>
          )}
        </div>
      )}

      {/* Date */}
      <div className="mt-2 text-right text-xs text-muted">{formatDate(card.created_at)}</div>
    </div>
  );
}
