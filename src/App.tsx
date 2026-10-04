import { useCallback, useEffect, useMemo, useState } from 'react';
import { Header } from './components/Header';
import { PostList } from './components/PostList';
import { PostDetail } from './components/PostDetail';
import { Footer } from './components/Footer';
import { StatusBar } from './components/StatusBar';
import { HelpOverlay } from './components/HelpOverlay';
import { AboutDialog } from './components/AboutDialog';
import CategoryBar from './components/CategoryBar';
import { useKeyboard, type KeyBinding } from './hooks/useKeyboard';
import { useSearch } from './hooks/useSearch';
import { useTheme } from './hooks/useTheme';
import { posts } from './data/posts';
import type { PostMeta } from './types';
import {
  revealElement,
  scrollBy,
  scrollToBottom,
  scrollToFraction,
  scrollToTop,
} from './utils/scroll';

const LINE_SCROLL = 96;

function App() {
  const { theme, toggleTheme } = useTheme();
  const {
    term,
    setTerm,
    results,
    isOpen: isSearchOpen,
    isFiltering,
    open: openSearch,
    close: closeSearch,
    reset: resetSearch,
  } = useSearch(posts);

  const [category, setCategory] = useState<string | null>(null);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [openPost, setOpenPost] = useState<PostMeta | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  /* ---------------------------------------------------------------- data -- */

  const visible = useMemo(
    () =>
      category === null
        ? results
        : results.filter((result) => result.item.categories.includes(category)),
    [results, category],
  );

  // Derived rather than synchronised with an effect: one fewer render pass and
  // the cursor can never point past the end of a filtered list.
  const safeCursor = visible.length === 0 ? 0 : Math.min(cursor, visible.length - 1);

  const hasFilters = category !== null || isFiltering;

  const clearFilters = useCallback(() => {
    setCategory(null);
    setIsCategoriesOpen(false);
    resetSearch();
  }, [resetSearch]);

  /* ------------------------------------------------------------ movement -- */

  const moveCursor = useCallback(
    (delta: number) =>
      setCursor((current) => {
        const total = visible.length;
        if (total === 0) return 0;
        const from = Math.min(current, total - 1);
        return (from + delta + total) % total;
      }),
    [visible.length],
  );

  const jumpCursor = useCallback(
    (position: 'first' | 'last') =>
      setCursor(() => (position === 'first' ? 0 : Math.max(0, visible.length - 1))),
    [visible.length],
  );

  const openPostDetail = useCallback((post: PostMeta) => {
    // The category bar is hidden while reading; leaving its flag set would make
    // `q`/Escape "close" an invisible panel instead of leaving the post.
    setIsCategoriesOpen(false);
    setOpenPost(post);
  }, []);

  const openCursorPost = useCallback(() => {
    const target = visible[safeCursor];
    if (target) openPostDetail(target.item);
  }, [openPostDetail, safeCursor, visible]);

  const revealCursor = useCallback((block: ScrollLogicalPosition) => {
    revealElement(document.querySelector<HTMLElement>('[data-cursor]'), block);
  }, []);

  /* -------------------------------------------------------------- layers -- */

  // Dismiss the topmost layer first: overlays, then drawers, then the post.
  const dismiss = useCallback(() => {
    if (isHelpOpen) return setIsHelpOpen(false);
    if (isAboutOpen) return setIsAboutOpen(false);
    if (isSearchOpen) return resetSearch();
    if (isCategoriesOpen) return setIsCategoriesOpen(false);
    if (openPost) return setOpenPost(null);
    if (isFiltering) resetSearch();
  }, [isAboutOpen, isCategoriesOpen, isFiltering, isHelpOpen, isSearchOpen, openPost, resetSearch]);

  const backToList = useCallback(() => {
    setOpenPost(null);
    scrollToTop();
  }, []);

  /* ------------------------------------------------------------ bindings -- */

  const bindings = useMemo<KeyBinding[]>(() => {
    const reading = openPost !== null;
    const list: KeyBinding[] = [
      {
        keys: 'Escape',
        group: 'global',
        description: 'close the topmost panel, or go back',
        primary: true,
        allowInInput: true,
        run: dismiss,
      },
      {
        keys: 'q',
        group: 'global',
        description: 'close the topmost panel, or go back',
        allowInInput: true,
        run: dismiss,
      },
      {
        keys: '?',
        group: 'global',
        description: 'toggle this help',
        primary: true,
        run: () => setIsHelpOpen((value) => !value),
      },
      {
        keys: 'd',
        group: 'global',
        description: 'toggle dark / light theme',
        primary: true,
        run: toggleTheme,
      },
      {
        keys: 'i',
        group: 'global',
        description: 'about this site',
        primary: true,
        run: () => setIsAboutOpen(true),
      },
      {
        keys: '/',
        group: 'search',
        description: 'search titles, excerpts and tags',
        primary: true,
        run: openSearch,
      },
      {
        keys: 'c',
        group: 'view',
        description: 'toggle the category panel',
        primary: true,
        run: () => setIsCategoriesOpen((value) => !value),
      },
      {
        keys: 'Ctrl-d',
        group: 'view',
        description: 'scroll down half a page',
        primary: true,
        run: () => scrollBy(window.innerHeight / 2),
      },
      {
        keys: 'Ctrl-u',
        group: 'view',
        description: 'scroll up half a page',
        primary: true,
        run: () => scrollBy(-window.innerHeight / 2),
      },
      {
        keys: 'L',
        group: 'view',
        description: 'jump to the bottom of the page',
        primary: true,
        run: scrollToBottom,
      },
    ];

    if (reading) {
      list.push(
        {
          keys: 'j',
          group: 'reading',
          description: 'scroll down a line',
          primary: true,
          run: () => scrollBy(LINE_SCROLL),
        },
        {
          keys: 'k',
          group: 'reading',
          description: 'scroll up a line',
          primary: true,
          run: () => scrollBy(-LINE_SCROLL),
        },
        {
          keys: 'H',
          group: 'reading',
          description: 'jump to the top of the page',
          primary: true,
          run: scrollToTop,
        },
      );
    } else {
      list.push(
        {
          keys: 'j',
          group: 'navigate',
          description: 'next post',
          primary: true,
          run: () => moveCursor(1),
        },
        {
          keys: 'ArrowDown',
          group: 'navigate',
          description: 'next post',
          run: () => moveCursor(1),
        },
        {
          keys: 'k',
          group: 'navigate',
          description: 'previous post',
          primary: true,
          run: () => moveCursor(-1),
        },
        {
          keys: 'ArrowUp',
          group: 'navigate',
          description: 'previous post',
          run: () => moveCursor(-1),
        },
        {
          keys: 'gg',
          group: 'navigate',
          description: 'first post',
          primary: true,
          run: () => jumpCursor('first'),
        },
        {
          keys: 'G',
          group: 'navigate',
          description: 'last post',
          primary: true,
          run: () => jumpCursor('last'),
        },
        {
          keys: 'Home',
          group: 'navigate',
          description: 'first post',
          run: () => jumpCursor('first'),
        },
        {
          keys: 'End',
          group: 'navigate',
          description: 'last post',
          run: () => jumpCursor('last'),
        },
        {
          keys: 'Enter',
          group: 'navigate',
          description: 'open the post under the cursor',
          primary: true,
          run: openCursorPost,
        },
        {
          keys: 'o',
          group: 'navigate',
          description: 'open the post under the cursor',
          run: openCursorPost,
        },
        {
          keys: 'zz',
          group: 'navigate',
          description: 'centre the post under the cursor',
          run: () => revealCursor('center'),
        },
        {
          keys: 'zt',
          group: 'navigate',
          description: 'put the cursor post at the top',
          run: () => revealCursor('start'),
        },
        {
          keys: 'zb',
          group: 'navigate',
          description: 'put the cursor post at the bottom',
          run: () => revealCursor('end'),
        },
        {
          keys: 'H',
          group: 'navigate',
          description: 'jump to the top of the page',
          run: scrollToTop,
        },
        {
          keys: 'M',
          group: 'navigate',
          description: 'jump to the middle of the page',
          run: () => scrollToFraction(0.5),
        },
      );
    }

    return list;
  }, [dismiss, jumpCursor, moveCursor, openCursorPost, openPost, openSearch, revealCursor, toggleTheme]);

  const { pending } = useKeyboard(bindings);

  /* --------------------------------------------------------------- title -- */

  useEffect(() => {
    document.title = openPost
      ? `${openPost.title} — andev0x`
      : 'andev0x — terminal tech blog';
  }, [openPost]);

  /* ---------------------------------------------------------------- view -- */

  const heading = isFiltering
    ? `results for “${term.trim()}”`
    : category
      ? category
      : 'latest writing';

  return (
    <div className="app-shell flex min-h-dvh flex-col pb-7">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:border focus:border-accent focus:bg-surface focus:px-3 focus:py-2 focus:font-mono focus:text-sm focus:text-accent"
      >
        Skip to content
      </a>

      <Header
        searchTerm={term}
        isSearchOpen={isSearchOpen}
        onSearchTermChange={setTerm}
        onSearchOpen={openSearch}
        onSearchClose={closeSearch}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {openPost === null && (
        <CategoryBar
          activeCategory={category}
          onSelectCategory={setCategory}
          isOpen={isCategoriesOpen}
          onToggle={() => setIsCategoriesOpen((value) => !value)}
          resultCount={visible.length}
          resultTotal={posts.length}
        />
      )}

      <main id="main" className="container flex-1 py-6">
        {openPost ? (
          <PostDetail post={openPost} onBack={backToList} />
        ) : (
          <>
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h1 className="font-display text-2xl text-fg sm:text-3xl">{heading}</h1>
              <p className="shrink-0 font-mono text-xs text-fg-subtle">
                {visible.length} post{visible.length === 1 ? '' : 's'}
              </p>
            </div>

            <PostList
              posts={visible}
              query={term}
              cursorIndex={safeCursor}
              onOpen={openPostDetail}
              onClearFilters={clearFilters}
              hasFilters={hasFilters}
            />
          </>
        )}
      </main>

      {openPost === null && <Footer />}

      <StatusBar
        mode={openPost ? 'READ' : 'NORMAL'}
        cursor={safeCursor}
        total={visible.length}
        category={category}
        searchTerm={term}
        pending={pending}
        theme={theme}
      />

      <HelpOverlay open={isHelpOpen} onClose={() => setIsHelpOpen(false)} bindings={bindings} />

      <AboutDialog open={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
}

export default App;
