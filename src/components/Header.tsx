import React from 'react';
import { Info, Keyboard, Mail, Moon, Search, Sun } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  onOpenHelp: () => void;
  onOpenAbout: () => void;
  onOpenContact: () => void;
}

const iconButton =
  'grid h-9 w-9 place-items-center rounded-md border border-transparent text-fg-muted transition-colors duration-150 hover:border-border hover:bg-elevated hover:text-fg';

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onOpenSearch,
  onOpenHelp,
  onOpenAbout,
  onOpenContact,
}) => {
  return (
    // Opaque rather than frosted: `backdrop-filter` forces the compositor to
    // re-snapshot and re-blur everything behind this bar on every scroll frame.
    // At 95% canvas the translucency it bought was barely visible anyway.
    <header className="sticky top-0 z-40 border-b border-border bg-canvas/95">
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
          {/*
            Contact leads the row: it was a ~250px form parked below the archive,
            so the one thing a reader actually came for was the easiest thing to
            miss. It is now a peer of About and Help — one key, no page furniture.
          */}
          <button
            type="button"
            onClick={onOpenContact}
            className={iconButton}
            aria-label="Get in touch"
            aria-keyshortcuts="m"
            title="Get in touch  m"
          >
            <Mail size={17} strokeWidth={1.75} />
          </button>

          {/*
            `/` opens the centred search popup. The button mirrors it rather than
            owning a second, separate search UI — the drawer this replaced had no
            result preview, so hitting `/` and the header button led to two
            different experiences.
          */}
          <button
            type="button"
            onClick={onOpenSearch}
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

      {/* Accent hairline */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
    </header>
  );
};