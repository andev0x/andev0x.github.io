import React, { useEffect, useRef } from 'react';
import { Info, Keyboard, Moon, Search, Sun, X } from 'lucide-react';

interface HeaderProps {
  searchTerm: string;
  isSearchOpen: boolean;
  onSearchTermChange: (term: string) => void;
  onSearchOpen: () => void;
  onSearchClose: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenHelp: () => void;
  onOpenAbout: () => void;
}

const iconButton =
  'grid h-9 w-9 place-items-center rounded-md border border-transparent text-fg-muted transition-colors duration-150 hover:border-border hover:bg-elevated hover:text-fg';

export const Header: React.FC<HeaderProps> = ({
  searchTerm,
  isSearchOpen,
  onSearchTermChange,
  onSearchOpen,
  onSearchClose,
  theme,
  onToggleTheme,
  onOpenHelp,
  onOpenAbout,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isSearchOpen) return;
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    // Put the caret after any existing query.
    input.setSelectionRange(input.value.length, input.value.length);
  }, [isSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) return;
    // Never leave focus on the collapsed drawer: a focused text field would
    // swallow every subsequent shortcut, so the site would look "dead".
    const active = document.activeElement;
    if (active instanceof HTMLElement && active.closest('[data-search-drawer]')) {
      active.blur();
    }
  }, [isSearchOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-canvas/80 backdrop-blur-md">
      <div className="container flex h-14 items-center gap-3">
        {/* Brand */}
        <div className="flex min-w-0 items-baseline gap-3">
          <a
            href="#main"
            onClick={(event) => {
              event.preventDefault();
              window.scrollTo({ top: 0, behavior: 'auto' });
            }}
            className="font-display text-2xl leading-none text-fg transition-colors duration-150 hover:text-accent sm:text-3xl"
          >
            andev0x
          </a>
          <span className="hidden truncate font-display text-base text-accent/80 sm:inline">
            【アン】
          </span>
          <span className="hidden truncate text-[0.7rem] text-fg-subtle lg:inline">
            a shadow never rests
          </span>
        </div>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={onSearchOpen}
            className={iconButton}
            aria-label="Search posts"
            aria-keyshortcuts="/"
            title="Search  /"
          >
            <Search size={17} strokeWidth={1.75} />
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            className={iconButton}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            aria-keyshortcuts="d"
            title="Toggle theme  d"
          >
            {theme === 'dark' ? (
              <Sun size={17} strokeWidth={1.75} />
            ) : (
              <Moon size={17} strokeWidth={1.75} />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenHelp}
            className={`${iconButton} hidden sm:grid`}
            aria-label="Keyboard shortcuts"
            aria-keyshortcuts="?"
            title="Shortcuts  ?"
          >
            <Keyboard size={17} strokeWidth={1.75} />
          </button>

          <button
            type="button"
            onClick={onOpenAbout}
            className={iconButton}
            aria-label="About"
            aria-keyshortcuts="i"
            title="About  i"
          >
            <Info size={17} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Search drawer: animates via grid-rows, which does not force layout
          thrash the way animating max-height does. */}
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          isSearchOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
        aria-hidden={!isSearchOpen}
      >
        <div className="overflow-hidden" data-search-drawer>
          <div className="container pb-3">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 focus-within:border-accent/60">
              <Search size={15} className="shrink-0 text-fg-subtle" strokeWidth={1.75} />
              <input
                ref={inputRef}
                type="search"
                value={searchTerm}
                onChange={(event) => onSearchTermChange(event.target.value)}
                placeholder="Search title, excerpt, tags…"
                aria-label="Search posts"
                tabIndex={isSearchOpen ? 0 : -1}
                className="w-full bg-transparent text-sm text-fg outline-none placeholder:text-fg-subtle [&::-webkit-search-cancel-button]:hidden"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => onSearchTermChange('')}
                  className="shrink-0 text-fg-subtle transition-colors hover:text-fg"
                  aria-label="Clear search"
                  tabIndex={isSearchOpen ? 0 : -1}
                >
                  <X size={15} strokeWidth={1.75} />
                </button>
              )}
              <button
                type="button"
                onClick={onSearchClose}
                tabIndex={isSearchOpen ? 0 : -1}
                className="kbd shrink-0 transition-colors duration-150 hover:border-accent/60 hover:text-accent"
              >
                esc
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Accent hairline */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
    </header>
  );
};
