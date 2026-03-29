import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverlay,
} from '@dnd-kit/core';
import { Board as BoardType, Card as CardType, Column as ColumnType } from '../api';
import ColumnComponent from './Column';
import CardComponent from './Card';

interface BoardProps {
  board: BoardType;
  searchQuery: string;
  filterType: string;
  filterPriority: string;
  onCardClick: (card: CardType) => void;
  onAddCard: (columnId: string) => void;
  onMoveCard: (cardId: string, columnId: string, position: number) => Promise<void>;
  optimisticMove: (
    cardId: string,
    fromColumnId: string,
    toColumnId: string,
    newPosition: number
  ) => void;
}

function filterCards(cards: CardType[], searchQuery: string, filterType: string, filterPriority: string): CardType[] {
  return cards.filter((card) => {
    const matchesSearch = !searchQuery || card.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !filterType || card.type === filterType;
    const matchesPriority = !filterPriority || card.priority === filterPriority;
    return matchesSearch && matchesType && matchesPriority;
  });
}

export default function Board({
  board,
  searchQuery,
  filterType,
  filterPriority,
  onCardClick,
  onAddCard,
  onMoveCard,
  optimisticMove,
}: BoardProps) {
  const [activeCard, setActiveCard] = useState<CardType | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const findColumn = (id: string): ColumnType | undefined =>
    board.columns.find(
      (col) => col.id === id || col.cards.some((c) => c.id === id)
    );

  const handleDragStart = (event: DragStartEvent) => {
    const card = event.active.data.current?.card as CardType | undefined;
    if (card) setActiveCard(card);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCol = findColumn(activeId);
    const overCol = findColumn(overId) ?? board.columns.find((c) => c.id === overId);

    if (!activeCol || !overCol) return;
    if (activeCol.id === overCol.id) return;

    // Optimistic cross-column move during drag
    const overCards = overCol.cards;
    const overIndex = overCards.findIndex((c) => c.id === overId);
    const newIndex = overIndex >= 0 ? overIndex : overCards.length;

    optimisticMove(activeId, activeCol.id, overCol.id, newIndex);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find final positions after optimistic update
    const targetCol = board.columns.find(
      (col) => col.id === overId || col.cards.some((c) => c.id === overId)
    );
    if (!targetCol) return;

    const targetCards = targetCol.cards;
    const targetIndex = targetCards.findIndex((c) => c.id === overId);
    const finalIndex = targetIndex >= 0 ? targetIndex : targetCards.length;

    void onMoveCard(activeId, targetCol.id, finalIndex);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div
        className="flex gap-4 p-4 overflow-x-auto flex-1"
        style={{ alignItems: 'flex-start' }}
      >
        {board.columns.map((column) => {
          const filtered = filterCards(column.cards, searchQuery, filterType, filterPriority);
          return (
            <ColumnComponent
              key={column.id}
              column={column}
              filteredCards={filtered}
              onCardClick={onCardClick}
              onAddCard={onAddCard}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeCard ? (
          <div className="rotate-2 opacity-90">
            <CardComponent card={activeCard} onClick={() => undefined} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
