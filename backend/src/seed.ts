import { db } from './db';
import { v4 as uuidv4 } from 'uuid';

interface SeedCard {
  title: string;
  type: 'module' | 'feature' | 'bug' | 'release' | 'milestone';
  priority?: 'critical' | 'high' | 'medium' | 'low';
  green_score?: number;
  repo_link?: string;
  tags?: string[];
  description?: string;
}

export function runSeed(): void {
  console.log('Running seed...');

  const boardId = 'main';
  const backlogId = uuidv4();
  const inProgressId = uuidv4();
  const doneId = uuidv4();
  const releasedId = uuidv4();

  const insertBoard = db.prepare(`
    INSERT INTO boards (id, name) VALUES (?, ?)
  `);
  const insertColumn = db.prepare(`
    INSERT INTO columns (id, board_id, name, position, color) VALUES (?, ?, ?, ?, ?)
  `);
  const insertCard = db.prepare(`
    INSERT INTO cards (id, column_id, title, description, type, green_score, repo_link, tags, priority, position)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const seedAll = db.transaction(() => {
    insertBoard.run(boardId, 'MonadicWorkspace');

    insertColumn.run(backlogId,    boardId, '📋 Backlog',      0, '#1f2937');
    insertColumn.run(inProgressId, boardId, '🔨 In Progress',  1, '#1e3a5f');
    insertColumn.run(doneId,       boardId, '✅ Done',          2, '#14532d');
    insertColumn.run(releasedId,   boardId, '🚀 Released',     3, '#4a1d96');

    const backlogCards: SeedCard[] = [
      { title: 'MonadicDashboard',      type: 'module',    priority: 'high',     repo_link: 'Danny4897/MonadicWorkspace' },
      { title: 'MonadicPlanner',        type: 'module',    priority: 'high',     repo_link: 'Danny4897/MonadicWorkspace' },
      { title: 'MonadicAgent CLI',      type: 'module',    priority: 'medium',   repo_link: 'Danny4897/MonadicWorkspace' },
      { title: 'MonadicStudio IDE',     type: 'module',    priority: 'medium',   repo_link: 'Danny4897/MonadicWorkspace' },
      { title: 'MonadicLeaf SaaS MVP',  type: 'milestone', priority: 'critical', tags: ['saas', 'stripe', 'react'] },
      { title: 'PromptFoo Integration', type: 'feature',   priority: 'medium' },
      { title: 'VS Code Extension',     type: 'feature',   priority: 'low' },
      { title: 'Video Pipeline',        type: 'feature',   priority: 'low',     tags: ['deferred'] },
    ];

    backlogCards.forEach((c, i) => {
      insertCard.run(
        uuidv4(), backlogId, c.title, c.description ?? null,
        c.type, c.green_score ?? null, c.repo_link ?? null,
        c.tags ? JSON.stringify(c.tags) : null,
        c.priority ?? 'medium', i
      );
    });

    const releasedCards: SeedCard[] = [
      { title: 'MonadicSharp core v1.4.0', type: 'release',   green_score: 95 },
      { title: 'MonadicSharp.Framework',   type: 'release',   green_score: 92 },
      { title: 'MonadicSharp.Azure',       type: 'release',   green_score: 90 },
      { title: 'MonadicLeaf CLI v0.3.0',   type: 'release',   green_score: 87 },
      { title: 'MCP Server (21 tools)',    type: 'release',   green_score: 88 },
      { title: 'OpenCode Integration',     type: 'release' },
      { title: 'GitHub Pages live',        type: 'milestone' },
      { title: 'Dev.to article published', type: 'feature' },
    ];

    releasedCards.forEach((c, i) => {
      insertCard.run(
        uuidv4(), releasedId, c.title, c.description ?? null,
        c.type, c.green_score ?? null, c.repo_link ?? null,
        c.tags ? JSON.stringify(c.tags) : null,
        c.priority ?? 'medium', i
      );
    });
  });

  seedAll();
  console.log('Seed complete.');
}
