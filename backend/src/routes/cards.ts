import { Router, Request, Response } from 'express';
import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/cards/:id
router.get('/cards/:id', (req: Request, res: Response) => {
  const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(req.params.id);
  if (!card) {
    res.status(404).json({ error: 'Card not found' });
    return;
  }
  res.json(card);
});

// PUT /api/cards/:id
router.put('/cards/:id', (req: Request, res: Response) => {
  const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(req.params.id);
  if (!card) {
    res.status(404).json({ error: 'Card not found' });
    return;
  }

  const { title, description, type, green_score, repo_link, file_paths, tags, priority, column_id } =
    req.body as {
      title?: string;
      description?: string;
      type?: string;
      green_score?: number | null;
      repo_link?: string;
      file_paths?: string[];
      tags?: string[];
      priority?: string;
      column_id?: string;
    };

  // Handle column change from modal
  const existingCard = card as { column_id: string };
  if (column_id && column_id !== existingCard.column_id) {
    const historyId = uuidv4();
    db.prepare(
      'INSERT INTO card_history (id, card_id, from_column_id, to_column_id) VALUES (?, ?, ?, ?)'
    ).run(historyId, req.params.id, existingCard.column_id, column_id);
  }

  db.prepare(
    `UPDATE cards SET
      title = COALESCE(?, title),
      description = ?,
      type = COALESCE(?, type),
      green_score = ?,
      repo_link = ?,
      file_paths = ?,
      tags = ?,
      priority = COALESCE(?, priority),
      column_id = COALESCE(?, column_id),
      updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).run(
    title ?? null,
    description !== undefined ? description : null,
    type ?? null,
    green_score !== undefined ? green_score : null,
    repo_link !== undefined ? repo_link : null,
    file_paths !== undefined ? JSON.stringify(file_paths) : null,
    tags !== undefined ? JSON.stringify(tags) : null,
    priority ?? null,
    column_id ?? null,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM cards WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/cards/:id
router.delete('/cards/:id', (req: Request, res: Response) => {
  const result = db.prepare('DELETE FROM cards WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Card not found' });
    return;
  }
  res.status(204).send();
});

// POST /api/cards/:id/move
router.post('/cards/:id/move', (req: Request, res: Response) => {
  const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(req.params.id) as
    | { id: string; column_id: string; position: number }
    | undefined;

  if (!card) {
    res.status(404).json({ error: 'Card not found' });
    return;
  }

  const { columnId, position } = req.body as { columnId?: string; position?: number };
  if (!columnId || position === undefined) {
    res.status(400).json({ error: 'columnId and position are required' });
    return;
  }

  const targetCol = db.prepare('SELECT id FROM columns WHERE id = ?').get(columnId);
  if (!targetCol) {
    res.status(404).json({ error: 'Target column not found' });
    return;
  }

  const moveTransaction = db.transaction(() => {
    // Record history if column changed
    if (card.column_id !== columnId) {
      const historyId = uuidv4();
      db.prepare(
        'INSERT INTO card_history (id, card_id, from_column_id, to_column_id) VALUES (?, ?, ?, ?)'
      ).run(historyId, req.params.id, card.column_id, columnId);
    }

    // Shift cards in the target column to make room
    db.prepare(
      'UPDATE cards SET position = position + 1 WHERE column_id = ? AND position >= ? AND id != ?'
    ).run(columnId, position, req.params.id);

    // Update card
    db.prepare(
      'UPDATE cards SET column_id = ?, position = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(columnId, position, req.params.id);
  });

  moveTransaction();
  const updated = db.prepare('SELECT * FROM cards WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// GET /api/cards/:id/history
router.get('/cards/:id/history', (req: Request, res: Response) => {
  const card = db.prepare('SELECT id FROM cards WHERE id = ?').get(req.params.id);
  if (!card) {
    res.status(404).json({ error: 'Card not found' });
    return;
  }

  const history = db
    .prepare(
      `SELECT h.*, fc.name as from_column_name, tc.name as to_column_name
       FROM card_history h
       LEFT JOIN columns fc ON h.from_column_id = fc.id
       JOIN columns tc ON h.to_column_id = tc.id
       WHERE h.card_id = ?
       ORDER BY h.moved_at DESC`
    )
    .all(req.params.id);

  res.json(history);
});

export default router;
