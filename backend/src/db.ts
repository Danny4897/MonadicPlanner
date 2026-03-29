import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'planner.db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const db = new Database(DB_PATH);

export function initDb(): void {
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS boards (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS columns (
      id TEXT PRIMARY KEY,
      board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      position INTEGER NOT NULL,
      color TEXT DEFAULT '#1f2937'
    );

    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      column_id TEXT NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT CHECK(type IN ('module','feature','bug','release','milestone')) DEFAULT 'feature',
      green_score INTEGER CHECK(green_score BETWEEN 0 AND 100),
      repo_link TEXT,
      file_paths TEXT,
      tags TEXT,
      priority TEXT CHECK(priority IN ('critical','high','medium','low')) DEFAULT 'medium',
      position INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS card_history (
      id TEXT PRIMARY KEY,
      card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
      from_column_id TEXT,
      to_column_id TEXT NOT NULL,
      moved_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export function isDbEmpty(): boolean {
  const row = db.prepare('SELECT COUNT(*) as count FROM boards').get() as { count: number };
  return row.count === 0;
}
