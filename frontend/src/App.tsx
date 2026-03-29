import { useState } from 'react';
import { useBoard } from './hooks/useBoard';
import Board from './components/Board';
import CardModal from './components/CardModal';
import Toolbar from './components/Toolbar';
import { Card, CardPayload } from './api';

export default function App() {
  const { board, loading, error, fetchBoard, createCard, updateCard, deleteCard, moveCard, optimisticMove } =
    useBoard();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editCard, setEditCard] = useState<Card | null>(null);
  const [defaultColumnId, setDefaultColumnId] = useState<string>('');

  const openNewCard = (columnId?: string) => {
    setEditCard(null);
    setDefaultColumnId(columnId ?? board?.columns[0]?.id ?? '');
    setModalOpen(true);
  };

  const openEditCard = (card: Card) => {
    setEditCard(card);
    setDefaultColumnId(card.column_id);
    setModalOpen(true);
  };

  const handleSave = async (columnId: string, data: CardPayload) => {
    if (editCard) {
      await updateCard(editCard.id, { ...data, column_id: columnId });
    } else {
      await createCard(columnId, data);
    }
    setModalOpen(false);
  };

  const handleDelete = async (cardId: string) => {
    await deleteCard(cardId);
    setModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <div className="text-accent text-xl">Loading MonadicPlanner...</div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-bg gap-4">
        <div className="text-error text-xl">{error ?? 'Board not found'}</div>
        <button
          onClick={() => void fetchBoard()}
          className="px-4 py-2 bg-surface border border-border rounded text-text hover:border-accent transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-bg overflow-hidden">
      <Toolbar
        boardName={board.name}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        filterPriority={filterPriority}
        onFilterPriorityChange={setFilterPriority}
        onNewCard={() => openNewCard()}
      />

      <Board
        board={board}
        searchQuery={searchQuery}
        filterType={filterType}
        filterPriority={filterPriority}
        onCardClick={openEditCard}
        onAddCard={openNewCard}
        onMoveCard={moveCard}
        optimisticMove={optimisticMove}
      />

      {modalOpen && (
        <CardModal
          card={editCard}
          columns={board.columns}
          defaultColumnId={defaultColumnId}
          onSave={handleSave}
          onDelete={editCard ? handleDelete : undefined}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
