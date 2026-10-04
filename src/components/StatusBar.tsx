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
  /**
   * Transient confirmation of a key action (`link copied`). Shown in the mode
   * cell, which is the one piece of the status line Vim itself borrows for
   * exactly this.
   */
  notice: string;
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
  notice,
  theme,
}) => {
  const searching = searchTerm.trim().length > 0;

  return (
    // See the header: `backdrop-filter` here meant a full backdrop blur on every
    // scroll frame, for a bar that is opaque enough not to need it.
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-canvas/95">
      <div className="container flex h-7 items-center gap-1">
        {/* Mode. `aria-live` because a keypress that copies a link has no other
            visible result — without it the confirmation is silent for anyone not
            looking at the corner of the screen. */}
        <span
          role="status"
          aria-live="polite"
          className={`${cell} border-r border-border font-medium uppercase tracking-wider text-accent`}
        >
          {pending ? `${pending}…` : notice || mode}
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
