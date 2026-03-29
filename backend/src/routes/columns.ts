import { Router, Request, Response } from 'express';
import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// PUT /api/columns/:id
router.put('/columns/:id', (req: Request, res: Response) => {
  const col = db.prepare('SELECT * FROM columns WHERE id = ?').get(req.params.id);
  if (!col) {
    res.status(404).json({ error: 'Column not found' });
    return;
  }
  const { name, color, position } = req.body as {
    name?: string;
    color?: string;
    position?: number;
  };
  db.prepare(
    `UPDATE columns SET
      name = COALESCE(?, name),
      color = COALESCE(?, color),
      position = COALESCE(?, position)
     WHERE id = ?`
  ).run(name ?? null, color ?? null, position ?? null, req.params.id);
  const updated = db.prepare('SELECT * FROM columns WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/columns/:id
router.delete('/columns/:id', (req: Request, res: Response) => {
  const result = db.prepare('DELETE FROM columns WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Column not found' });
    return;
  }
  res.status(204).send();
});

// GET /api/columns/:id/cards
router.get('/columns/:id/cards', (req: Request, res: Response) => {
  const col = db.prepare('SELECT id FROM columns WHERE id = ?').get(req.params.id);
  if (!col) {
    res.status(404).json({ error: 'Column not found' });
    return;
  }
  const cards = db
    .prepare('SELECT * FROM cards WHERE column_id = ? ORDER BY position ASC')
    .all(req.params.id);
  res.json(cards);
});

// POST /api/columns/:id/cards
router.post('/columns/:id/cards', (req: Request, res: Response) => {
  const col = db.prepare('SELECT id FROM columns WHERE id = ?').get(req.params.id);
  if (!col) {
    res.status(404).json({ error: 'Column not found' });
    return;
  }
  const { title, description, type, green_score, repo_link, file_paths, tags, priority } =
    req.body as {
      title?: string;
      description?: string;
      type?: string;
      green_score?: number;
      repo_link?: string;
      file_paths?: string[];
      tags?: string[];
      priority?: string;
    };

  if (!title) {
    res.status(400).json({ error: 'title is required' });
    return;
  }

  const maxPos = db
    .prepare('SELECT COALESCE(MAX(position), -1) as maxPos FROM cards WHERE column_id = ?')
    .get(req.params.id) as { maxPos: number };

  const id = uuidv4();
  db.prepare(
    `INSERT INTO cards (id, column_id, title, description, type, green_score, repo_link, file_paths, tags, priority, position)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    req.params.id,
    title,
    description ?? null,
    type ?? 'feature',
    green_score ?? null,
    repo_link ?? null,
    file_paths ? JSON.stringify(file_paths) : null,
    tags ? JSON.stringify(tags) : null,
    priority ?? 'medium',
    maxPos.maxPos + 1
  );

  const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(id);
  res.status(201).json(card);
});

export default router;
