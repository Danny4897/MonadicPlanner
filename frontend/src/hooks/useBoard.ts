import { useState, useEffect, useCallback } from 'react';
import { Board, Card, CardPayload, boardsApi, columnsApi, cardsApi } from '../api';

const BOARD_ID = 'main';

export function useBoard() {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoard = useCallback(async () => {
    try {
      const data = await boardsApi.get(BOARD_ID);
      setBoard(data);
      setError(null);
    } catch (err) {
      setError('Failed to load board');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchBoard();
  }, [fetchBoard]);

  const createCard = useCallback(
    async (columnId: string, data: CardPayload): Promise<Card | null> => {
      try {
        const card = await columnsApi.createCard(columnId, data);
        await fetchBoard();
        return card;
      } catch (err) {
        console.error(err);
        return null;
      }
    },
    [fetchBoard]
  );

  const updateCard = useCallback(
    async (cardId: string, data: CardPayload): Promise<Card | null> => {
      try {
        const card = await cardsApi.update(cardId, data);
        await fetchBoard();
        return card;
      } catch (err) {
        console.error(err);
        return null;
      }
    },
    [fetchBoard]
  );

  const deleteCard = useCallback(
    async (cardId: string): Promise<void> => {
      try {
        await cardsApi.delete(cardId);
        await fetchBoard();
      } catch (err) {
        console.error(err);
      }
    },
    [fetchBoard]
  );

  const moveCard = useCallback(
    async (cardId: string, columnId: string, position: number): Promise<void> => {
      try {
        await cardsApi.move(cardId, columnId, position);
        await fetchBoard();
      } catch (err) {
        console.error(err);
      }
    },
    [fetchBoard]
  );

  // Optimistic drag update: update board state without waiting for server
  const optimisticMove = useCallback(
    (cardId: string, fromColumnId: string, toColumnId: string, newPosition: number) => {
      setBoard((prev) => {
        if (!prev) return prev;
        const columns = prev.columns.map((col) => {
          if (col.id === fromColumnId) {
            return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
          }
          return col;
        });

        const movingCard = prev.columns
          .flatMap((c) => c.cards)
          .find((c) => c.id === cardId);
        if (!movingCard) return prev;

        const updatedCols = columns.map((col) => {
          if (col.id === toColumnId) {
            const filtered = col.cards.filter((c) => c.id !== cardId);
            const inserted = [
              ...filtered.slice(0, newPosition),
              { ...movingCard, column_id: toColumnId },
              ...filtered.slice(newPosition),
            ];
            return { ...col, cards: inserted };
          }
          return col;
        });

        return { ...prev, columns: updatedCols };
      });
    },
    []
  );

  return {
    board,
    loading,
    error,
    fetchBoard,
    createCard,
    updateCard,
    deleteCard,
    moveCard,
    optimisticMove,
  };
}
