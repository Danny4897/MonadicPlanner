# MonadicPlanner

**Tool 2 of 4 — MonadicWorkspace**

A project-aware Kanban board for the MonadicSharp ecosystem. Cards are not simple tasks: they are modules, features, and milestones with development status, green score, and repository links.

## Stack

- **Backend**: Node.js + Express + TypeScript + SQLite (better-sqlite3) — port 3002
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + @dnd-kit — port 5174

## Quick Start

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5174](http://localhost:5174).

## Features

- **4 columns**: Backlog, In Progress, Done, Released
- **5 card types**: module, feature, bug, release, milestone — each with icon
- **Priority badges**: critical / high / medium / low
- **Green Score**: 0–100 quality indicator (red < 70, yellow 70–89, green ≥ 90)
- **GitHub link**: direct link to repo from card
- **Drag-and-drop**: between and within columns via @dnd-kit, persisted with history
- **CardModal**: create/edit/delete cards, tag management, move history
- **Search + filters**: real-time filter by title, type, priority
- **Auto-seed**: on first run, board is seeded with MonadicSharp ecosystem data

## API Endpoints

```
GET    /api/boards
POST   /api/boards
GET    /api/boards/:id            ← board + columns + cards
DELETE /api/boards/:id
GET    /api/boards/:id/columns
POST   /api/boards/:id/columns
PUT    /api/columns/:id
DELETE /api/columns/:id
GET    /api/columns/:id/cards
POST   /api/columns/:id/cards
GET    /api/cards/:id
PUT    /api/cards/:id
DELETE /api/cards/:id
POST   /api/cards/:id/move
GET    /api/cards/:id/history
```

## Design System

| Token | Value |
|-------|-------|
| Background | `#0d1117` |
| Surface | `#161b22` |
| Border | `#30363d` |
| Accent | `#00ff88` |
| Warning | `#f97316` |
| Error | `#ef4444` |
| Text | `#e6edf3` |
| Muted | `#8b949e` |
