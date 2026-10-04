import React from 'react';

interface StatusBarProps {
  /** Vim-style mode label, e.g. `NORMAL`. */
  mode: string;
  cursor: number;
  total: number;
  category: string | null;
  searchTerm: string;
  /** In-flight chord prefix (`g`, `z`, …). */
  pending: string;
  theme: 'light' | 'dark';
}

const cell = 'px-2 py-1 font-mono text-[0.65rem] leading-none';

/**
 * Fixed status line. Rendered as plain DOM so it costs nothing per keypress
 * beyond the handful of text nodes that actually change.
 */
export const StatusBar: React.FC<StatusBarProps> = ({
  mode,
  cursor,
  total,
  category,
  searchTerm,
  pending,
  theme,
}) => {
  const searching = searchTerm.trim().length > 0;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-canvas/90 backdrop-blur-md">
      <div className="container flex h-7 items-center gap-1">
        {/* Mode */}
        <span className={`${cell} border-r border-border font-medium uppercase tracking-wider text-accent`}>
          {pending ? `${pending}…` : mode}
        </span>

        {/* Position */}
        <span className={`${cell} hidden border-r border-border text-fg-muted sm:inline`}>
          {String(Math.min(cursor + 1, total)).padStart(2, '0')}/{String(total).padStart(2, '0')}
        </span>

        {/* Filters */}
        <span className={`${cell} min-w-0 truncate border-r border-border text-fg-muted`}>
          {searching ? (
            <span className="text-accent">/</span>
          ) : (
            <span className="text-fg-subtle">cat:</span>
          )}
          {searching ? searchTerm.trim() : category ?? 'all'}
        </span>

        {/* Right side */}
        <span className="ml-auto flex items-center">
          <span className={`${cell} hidden text-fg-subtle md:inline`}>? shortcuts</span>
          <span className={`${cell} border-l border-border text-fg-subtle`}>{theme}</span>
        </span>
      </div>
    </div>
  );
};
