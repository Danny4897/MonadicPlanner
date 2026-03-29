import { useState, useEffect, useRef } from 'react';
import { Card, Column, CardPayload, cardsApi, HistoryEntry } from '../api';

interface CardModalProps {
  card: Card | null;
  columns: Column[];
  defaultColumnId: string;
  onSave: (columnId: string, data: CardPayload) => Promise<void>;
  onDelete?: (cardId: string) => Promise<void>;
  onClose: () => void;
}

function formatHistoryDate(iso: string): string {
  return new Date(iso).toLocaleString('it-IT', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CardModal({
  card,
  columns,
  defaultColumnId,
  onSave,
  onDelete,
  onClose,
}: CardModalProps) {
  const isEdit = card !== null;

  const [title, setTitle] = useState(card?.title ?? '');
  const [description, setDescription] = useState(card?.description ?? '');
  const [type, setType] = useState<CardPayload['type']>(card?.type ?? 'feature');
  const [priority, setPriority] = useState<CardPayload['priority']>(card?.priority ?? 'medium');
  const [greenScore, setGreenScore] = useState<string>(
    card?.green_score !== null && card?.green_score !== undefined ? String(card.green_score) : ''
  );
  const [repoLink, setRepoLink] = useState(card?.repo_link ?? '');
  const [columnId, setColumnId] = useState(defaultColumnId);
  const [tags, setTags] = useState<string[]>(() => {
    if (!card?.tags) return [];
    try {
      return JSON.parse(card.tags) as string[];
    } catch {
      return [];
    }
  });
  const [tagInput, setTagInput] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [saving, setSaving] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
    if (isEdit && card) {
      void cardsApi.getHistory(card.id).then(setHistory);
    }
  }, [isEdit, card]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const gs = greenScore !== '' ? parseInt(greenScore, 10) : null;
    await onSave(columnId, {
      title: title.trim(),
      description: description || undefined,
      type,
      priority,
      green_score: gs ?? undefined,
      repo_link: repoLink || undefined,
      tags,
    });
    setSaving(false);
  };

  const handleDelete = async () => {
    if (card && onDelete) {
      if (confirm('Delete this card?')) {
        await onDelete(card.id);
      }
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-surface border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-text font-semibold text-base">
            {isEdit ? 'Edit Card' : 'New Card'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-text transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="block text-xs text-muted mb-1 uppercase tracking-wide">
              Title <span className="text-error">*</span>
            </label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Card title..."
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text text-sm focus:outline-none focus:border-accent/70 placeholder-muted"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-muted mb-1 uppercase tracking-wide">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this card..."
              rows={3}
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text text-sm focus:outline-none focus:border-accent/70 placeholder-muted resize-none"
            />
          </div>

          {/* Type + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted mb-1 uppercase tracking-wide">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CardPayload['type'])}
                className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text text-sm focus:outline-none focus:border-accent/70"
              >
                <option value="module">🧩 Module</option>
                <option value="feature">⚡ Feature</option>
                <option value="bug">🐛 Bug</option>
                <option value="release">🚀 Release</option>
                <option value="milestone">🏁 Milestone</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1 uppercase tracking-wide">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as CardPayload['priority'])}
                className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text text-sm focus:outline-none focus:border-accent/70"
              >
                <option value="critical">🔴 Critical</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">⚪ Low</option>
              </select>
            </div>
          </div>

          {/* Green Score + Column */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted mb-1 uppercase tracking-wide">
                Green Score (0–100)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={greenScore}
                onChange={(e) => setGreenScore(e.target.value)}
                placeholder="Optional"
                className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text text-sm focus:outline-none focus:border-accent/70 placeholder-muted"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1 uppercase tracking-wide">Column</label>
              <select
                value={columnId}
                onChange={(e) => setColumnId(e.target.value)}
                className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text text-sm focus:outline-none focus:border-accent/70"
              >
                {columns.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Repo Link */}
          <div>
            <label className="block text-xs text-muted mb-1 uppercase tracking-wide">
              Repo Link
            </label>
            <input
              type="text"
              value={repoLink}
              onChange={(e) => setRepoLink(e.target.value)}
              placeholder="e.g. Danny4897/MonadicSharp"
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text text-sm focus:outline-none focus:border-accent/70 placeholder-muted"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs text-muted mb-1 uppercase tracking-wide">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-xs px-2 py-0.5 bg-bg border border-border rounded text-muted"
                >
                  🏷 {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-muted hover:text-error transition-colors leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={addTag}
              placeholder="Type tag + Enter"
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text text-sm focus:outline-none focus:border-accent/70 placeholder-muted"
            />
          </div>

          {/* Move History */}
          {isEdit && history.length > 0 && (
            <div>
              <label className="block text-xs text-muted mb-2 uppercase tracking-wide">
                Move History
              </label>
              <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="text-xs text-muted bg-bg border border-border rounded px-2.5 py-1.5"
                  >
                    {entry.from_column_name ? (
                      <>
                        Spostata da{' '}
                        <span className="text-text">{entry.from_column_name}</span> a{' '}
                        <span className="text-text">{entry.to_column_name}</span>
                      </>
                    ) : (
                      <>
                        Creata in <span className="text-text">{entry.to_column_name}</span>
                      </>
                    )}
                    {' — '}
                    <span>{formatHistoryDate(entry.moved_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-border">
          <div>
            {isEdit && onDelete && (
              <button
                onClick={() => void handleDelete()}
                className="px-3 py-1.5 text-sm text-error border border-error/40 rounded-lg hover:bg-error/10 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-muted border border-border rounded-lg hover:text-text hover:border-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => void handleSave()}
              disabled={!title.trim() || saving}
              className="px-4 py-1.5 text-sm font-medium bg-accent/10 text-accent border border-accent/40 rounded-lg hover:bg-accent/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
