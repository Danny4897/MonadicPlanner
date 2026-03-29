interface ToolbarProps {
  boardName: string;
  searchQuery: string;
  onSearchChange: (v: string) => void;
  filterType: string;
  onFilterTypeChange: (v: string) => void;
  filterPriority: string;
  onFilterPriorityChange: (v: string) => void;
  onNewCard: () => void;
}

export default function Toolbar({
  boardName,
  searchQuery,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  filterPriority,
  onFilterPriorityChange,
  onNewCard,
}: ToolbarProps) {
  return (
    <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface flex-shrink-0">
      {/* Board name */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-accent font-bold text-lg">◆</span>
        <span className="text-text font-semibold text-base">{boardName}</span>
      </div>

      <div className="flex-1 flex items-center gap-2 justify-center">
        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search cards..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-bg border border-border rounded-lg text-text text-sm placeholder-muted focus:outline-none focus:border-accent/70 w-48"
          />
        </div>

        {/* Type filter */}
        <select
          value={filterType}
          onChange={(e) => onFilterTypeChange(e.target.value)}
          className="px-2 py-1.5 bg-bg border border-border rounded-lg text-sm text-text focus:outline-none focus:border-accent/70"
        >
          <option value="">All Types</option>
          <option value="module">🧩 Module</option>
          <option value="feature">⚡ Feature</option>
          <option value="bug">🐛 Bug</option>
          <option value="release">🚀 Release</option>
          <option value="milestone">🏁 Milestone</option>
        </select>

        {/* Priority filter */}
        <select
          value={filterPriority}
          onChange={(e) => onFilterPriorityChange(e.target.value)}
          className="px-2 py-1.5 bg-bg border border-border rounded-lg text-sm text-text focus:outline-none focus:border-accent/70"
        >
          <option value="">All Priorities</option>
          <option value="critical">🔴 Critical</option>
          <option value="high">🟠 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">⚪ Low</option>
        </select>
      </div>

      {/* New Card button */}
      <button
        onClick={onNewCard}
        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/40 text-accent rounded-lg text-sm font-medium hover:bg-accent/20 transition-colors"
      >
        <span className="text-base leading-none">+</span>
        New Card
      </button>
    </header>
  );
}
