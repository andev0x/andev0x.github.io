import React, { useEffect, useRef, useState } from 'react';
import { CornerDownLeft, Search, X } from 'lucide-react';
import type { PostMeta, SearchResult } from '../types';
import { formatIsoDate } from '../utils/format';
import { Modal } from './Modal';
import { highlight } from '../utils/highlight';

/** Rows shown at once; the rest stay reachable by typing a narrower query. */
const MAX_ROWS = 8;

/**
 * Fixed row height in px, and the height the result area is locked to.
 *
 * The area used to be `max-h-*`, i.e. content-height, so the panel grew and
 * shrank on every keystroke that changed the match count — with Fuse results
 * arriving on a deferred render, the box visibly pumped between 0 and MAX_ROWS
 * rows while you typed. Reserving the full MAX_ROWS height up front pins the
 * dialog: the row count only changes what is drawn inside the box, never the
 * box itself.
 *
 * ROW_H is sized to the row's own content (20px title + 2px gap + ~15px meta +
 * 16px padding), so MAX_ROWS rows fill the box without a scrollbar. The trailing
 * `1rem` is the area's `p-2`: `height` is border-box, so it is inside the lock
 * rather than on top of it. The vh clamp only engages on short viewports — at
 * 448px the panel is under half of a 900px-tall screen, so the lock is worth
 * more than the scrollbar it would otherwise save.
 */
const ROW_H = 54;
const LIST_HEIGHT = `min(calc(${MAX_ROWS * ROW_H}px + 1rem), 62vh)`;

interface SearchDialogProps {
  open: boolean;
  term: string;
  onTermChange: (term: string) => void;
  results: SearchResult[];
  onSelect: (post: PostMeta) => void;
  onClose: () => void;
}

/**
 * Centred Spotlight-style search.
 *
 * The header drawer this replaced had no result preview and no way to pick a hit
 * without re-typing the title into the field, which made `/` a filter rather
 * than a jump. Arrow keys and `Enter` are handled on the input and stopped from
 * propagating, so they act on the row list instead of reaching the global Vim
 * layer underneath (where `Enter` would open whatever the list cursor pointed
 * at). `Escape` is deliberately left to the global layer.
 */
export const SearchDialog: React.FC<SearchDialogProps> = ({
  open,
  term,
  onTermChange,
  results,
  onSelect,
  onClose,
}) => {
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fuse results are served from a deferred render, so the row count can lag the
  // field. Clamp instead of resetting, or the highlight jumps backwards mid-type.
  const rows = results.slice(0, MAX_ROWS);
  const safeCursor = rows.length === 0 ? 0 : Math.min(cursor, rows.length - 1);

  useEffect(() => {
    if (!open) setCursor(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }, [open]);

  // Keep the highlighted row visible while arrowing through a long result set.
  useEffect(() => {
    if (!open) return;
    const node = document.getElementById('search-row-active');
    node?.scrollIntoView({ block: 'nearest' });
  }, [open, safeCursor]);

  const commit = (result: SearchResult | undefined) => {
    if (!result) return;
    onSelect(result.item);
    onTermChange('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        event.stopPropagation();
        setCursor((current) => (rows.length === 0 ? 0 : (current + 1) % rows.length));
        return;
      case 'ArrowUp':
        event.preventDefault();
        event.stopPropagation();
        setCursor((current) =>
          rows.length === 0 ? 0 : (current - 1 + rows.length) % rows.length,
        );
        return;
      case 'Enter':
        event.preventDefault();
        event.stopPropagation();
        commit(rows[safeCursor]);
        return;
      default:
    }
  };

  const searching = term.trim().length > 0;

  return (
    <Modal open={open} onClose={onClose} labelledBy="search-title">
      <h2 id="search-title" className="sr-only">
        Search posts
      </h2>

      {/* Field */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Search size={16} className="shrink-0 text-fg-subtle" strokeWidth={1.75} aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          value={term}
          onChange={(event) => onTermChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search title, excerpt, tags…"
          aria-label="Search posts"
          aria-keyshortcuts="/"
          role="combobox"
          aria-expanded={rows.length > 0}
          aria-controls="search-results"
          aria-activedescendant={rows[safeCursor] ? `search-row-${safeCursor}` : undefined}
          autoComplete="off"
          spellCheck={false}
          className="w-full bg-transparent font-mono text-sm text-fg outline-none placeholder:text-fg-subtle"
        />
        {term && (
          <button
            type="button"
            onClick={() => onTermChange('')}
            className="shrink-0 text-fg-subtle transition-colors hover:text-fg"
            aria-label="Clear search"
          >
            <X size={15} strokeWidth={1.75} />
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="kbd shrink-0 transition-colors duration-150 hover:border-accent/60 hover:text-accent"
        >
          esc
        </button>
      </div>

      {/* Rows */}
      <div
        id="search-results"
        role="listbox"
        aria-label="Search results"
        className="overflow-y-auto p-2"
        style={{ height: LIST_HEIGHT }}
      >
        {rows.length === 0 ? (
          <p className="flex h-full items-center justify-center px-3 py-6 text-center font-mono text-xs text-fg-subtle">
            {searching ? 'no posts match that query' : 'type to filter by title, excerpt, tag or category'}
          </p>
        ) : (
          rows.map((result, index) => {
            const active = index === safeCursor;
            return (
              <div
                key={result.item.id}
                id={`search-row-${index}`}
                role="option"
                aria-selected={active}
                style={{ height: ROW_H }}
                className={[
                  'flex cursor-pointer items-baseline gap-3 rounded-lg px-3 py-2 transition-colors duration-100',
                  active ? 'bg-accent/10 text-fg' : 'text-fg-muted hover:bg-elevated',
                ].join(' ')}
                onMouseEnter={() => setCursor(index)}
                onClick={() => commit(result)}
              >
                <span
                  className={`shrink-0 font-mono text-[0.6rem] ${active ? 'text-accent' : 'text-fg-subtle'}`}
                  aria-hidden="true"
                >
                  {active ? '❯' : ' '}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {highlight(result.item.title, term)}
                  </span>
                  <span className="mt-0.5 flex items-center gap-2 font-mono text-[0.62rem] text-fg-subtle">
                    <time dateTime={result.item.date}>{formatIsoDate(result.item.date)}</time>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{result.item.categories.join(' / ')}</span>
                    <span aria-hidden="true">·</span>
                    <span className="shrink-0">{result.item.readingTime} min</span>
                  </span>
                </span>
                {result.item.featured && (
                  <span className="shrink-0 rounded border border-accent/40 px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-accent">
                    featured
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Hints */}
      <div className="flex items-center gap-3 border-t border-border px-4 py-2 font-mono text-[0.62rem] text-fg-subtle">
        <span className="inline-flex items-center gap-1">
          <span className="kbd">↑</span>
          <span className="kbd">↓</span>
          move
        </span>
        <span className="inline-flex items-center gap-1">
          <CornerDownLeft size={11} strokeWidth={2} aria-hidden="true" />
          open
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="kbd">esc</span>
          dismiss
        </span>
        <span className="ml-auto">{searching ? `${results.length} match${results.length === 1 ? '' : 'es'}` : `${results.length} posts`}</span>
      </div>
    </Modal>
  );
};