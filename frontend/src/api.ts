import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export interface Board {
  id: string;
  name: string;
  created_at: string;
  columns: Column[];
}

export interface Column {
  id: string;
  board_id: string;
  name: string;
  position: number;
  color: string;
  cards: Card[];
}

export interface Card {
  id: string;
  column_id: string;
  title: string;
  description: string | null;
  type: 'module' | 'feature' | 'bug' | 'release' | 'milestone';
  green_score: number | null;
  repo_link: string | null;
  file_paths: string | null;
  tags: string | null;
  priority: 'critical' | 'high' | 'medium' | 'low';
  position: number;
  created_at: string;
  updated_at: string;
}

export interface HistoryEntry {
  id: string;
  card_id: string;
  from_column_id: string | null;
  to_column_id: string;
  from_column_name: string | null;
  to_column_name: string;
  moved_at: string;
}

export type CardPayload = Partial<
  Omit<Card, 'id' | 'created_at' | 'updated_at' | 'column_id' | 'file_paths' | 'tags'> & {
    column_id: string;
    file_paths: string[];
    tags: string[];
  }
>;

export const boardsApi = {
  getAll: () => api.get<Board[]>('/boards').then((r) => r.data),
  get: (id: string) => api.get<Board>(`/boards/${id}`).then((r) => r.data),
  create: (name: string) => api.post<Board>('/boards', { name }).then((r) => r.data),
  delete: (id: string) => api.delete(`/boards/${id}`),
  getColumns: (id: string) => api.get<Column[]>(`/boards/${id}/columns`).then((r) => r.data),
  createColumn: (id: string, name: string, color?: string) =>
    api.post<Column>(`/boards/${id}/columns`, { name, color }).then((r) => r.data),
};

export const columnsApi = {
  update: (id: string, data: Partial<Column>) =>
    api.put<Column>(`/columns/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/columns/${id}`),
  getCards: (id: string) => api.get<Card[]>(`/columns/${id}/cards`).then((r) => r.data),
  createCard: (id: string, data: CardPayload) =>
    api.post<Card>(`/columns/${id}/cards`, data).then((r) => r.data),
};

export const cardsApi = {
  get: (id: string) => api.get<Card>(`/cards/${id}`).then((r) => r.data),
  update: (id: string, data: CardPayload) =>
    api.put<Card>(`/cards/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/cards/${id}`),
  move: (id: string, columnId: string, position: number) =>
    api.post<Card>(`/cards/${id}/move`, { columnId, position }).then((r) => r.data),
  getHistory: (id: string) =>
    api.get<HistoryEntry[]>(`/cards/${id}/history`).then((r) => r.data),
};
