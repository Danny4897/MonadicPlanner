import { Router, Request, Response } from 'express';
import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/boards
router.get('/boards', (_req: Request, res: Response) => {
  const boards = db.prepare('SELECT * FROM boards ORDER BY created_at ASC').all();
  res.json(boards);
});

// POST /api/boards
router.post('/boards', (req: Request, res: Response) => {
  const { name } = req.body as { name?: string };
  if (!name) {
    res.status(400).json({ error: 'name is required' });
    return;
  }
  const id = uuidv4();
  db.prepare('INSERT INTO boards (id, name) VALUES (?, ?)').run(id, name);
  const board = db.prepare('SELECT * FROM boards WHERE id = ?').get(id);
  res.status(201).json(board);
});

// GET /api/boards/:id — board with columns and cards
router.get('/boards/:id', (req: Request, res: Response) => {
  const board = db.prepare('SELECT * FROM boards WHERE id = ?').get(req.params.id);
  if (!board) {
    res.status(404).json({ error: 'Board not found' });
    return;
  }

  const columns = db
    .prepare('SELECT * FROM columns WHERE board_id = ? ORDER BY position ASC')
    .all(req.params.id) as Array<{ id: string; board_id: string; name: string; position: number; color: string }>;

  const columnsWithCards = columns.map((col) => {
    const cards = db
      .prepare('SELECT * FROM cards WHERE column_id = ? ORDER BY position ASC')
      .all(col.id);
    return { ...col, cards };
  });

  res.json({ ...board, columns: columnsWithCards });
});

// DELETE /api/boards/:id
router.delete('/boards/:id', (req: Request, res: Response) => {
  const result = db.prepare('DELETE FROM boards WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Board not found' });
    return;
  }
  res.status(204).send();
});

// GET /api/boards/:id/columns
router.get('/boards/:id/columns', (req: Request, res: Response) => {
  const board = db.prepare('SELECT id FROM boards WHERE id = ?').get(req.params.id);
  if (!board) {
    res.status(404).json({ error: 'Board not found' });
    return;
  }
  const columns = db
    .prepare('SELECT * FROM columns WHERE board_id = ? ORDER BY position ASC')
    .all(req.params.id);
  res.json(columns);
});

// POST /api/boards/:id/columns
router.post('/boards/:id/columns', (req: Request, res: Response) => {
  const board = db.prepare('SELECT id FROM boards WHERE id = ?').get(req.params.id);
  if (!board) {
    res.status(404).json({ error: 'Board not found' });
    return;
  }
  const { name, color } = req.body as { name?: string; color?: string };
  if (!name) {
    res.status(400).json({ error: 'name is required' });
    return;
  }
  const maxPos = db
    .prepare('SELECT COALESCE(MAX(position), -1) as maxPos FROM columns WHERE board_id = ?')
    .get(req.params.id) as { maxPos: number };
  const id = uuidv4();
  db.prepare(
    'INSERT INTO columns (id, board_id, name, position, color) VALUES (?, ?, ?, ?, ?)'
  ).run(id, req.params.id, name, maxPos.maxPos + 1, color ?? '#1f2937');
  const column = db.prepare('SELECT * FROM columns WHERE id = ?').get(id);
  res.status(201).json(column);
});

export default router;
