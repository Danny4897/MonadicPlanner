import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column as ColumnType, Card as CardType } from '../api';
import CardComponent from './Card';

interface ColumnProps {
  column: ColumnType;
  filteredCards: CardType[];
  onCardClick: (card: CardType) => void;
  onAddCard: (columnId: string) => void;
}

export default function Column({ column, filteredCards, onCardClick, onAddCard }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id, data: { type: 'column', column } });

  return (
    <div
      className="flex flex-col flex-shrink-0 rounded-xl border transition-colors"
      style={{
        width: 280,
        backgroundColor: '#161b22',
        borderColor: isOver ? '#00ff88' : '#30363d',
      }}
    >
      {/* Column header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 rounded-t-xl border-b border-border"
        style={{ backgroundColor: column.color + '33' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-text">{column.name}</span>
          <span className="text-xs bg-surface border border-border rounded-full px-1.5 py-0.5 text-muted">
            {filteredCards.length}
          </span>
        </div>
        <button
          onClick={() => onAddCard(column.id)}
          className="text-muted hover:text-accent transition-colors text-lg leading-none"
          title="Add card"
        >
          +
        </button>
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto p-2 flex flex-col gap-2"
        style={{ minHeight: 60 }}
      >
        <SortableContext
          items={filteredCards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {filteredCards.map((card) => (
            <CardComponent key={card.id} card={card} onClick={onCardClick} />
          ))}
        </SortableContext>

        {filteredCards.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-8 text-muted text-xs border border-dashed border-border rounded-lg">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}
