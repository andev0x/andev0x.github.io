import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Header } from './components/Header';
import { PostList } from './components/PostList';
import { PostDetail } from './components/PostDetail';
import { Footer } from './components/Footer';
import { StatusBar } from './components/StatusBar';
import { HelpOverlay } from './components/HelpOverlay';
import { AboutDialog } from './components/AboutDialog';
import { SearchDialog } from './components/SearchDialog';
import { ContactDialog } from './components/ContactDialog';
import CategoryBar from './components/CategoryBar';
import { useKeyboard, type KeyBinding } from './hooks/useKeyboard';
import { useSearch } from './hooks/useSearch';
import { useTheme } from './hooks/useTheme';
import { findPostById, posts } from './data/posts';
import type { PostMeta, SearchResult } from './types';
import {
  revealElement,
  scrollBy,
  scrollToBottom,
  scrollToTop,
} from './utils/scroll';
import { postFragment, postUrl, routeFromHash } from './utils/postUrl';

const LINE_SCROLL = 96;

/**
 * Featured is a shelf, not an index: three picks is a curated set you can
 * actually take in. Everything past the third — further featured posts included —
 * falls through to All Articles, so capping the shelf never drops a post.
 */
const FEATURED_LIMIT = 3;

/** Cards shown in All Articles before the rest fold away behind the control. */
const COLLAPSED_COUNT = 5;

/** A titled block of the landing page (Featured, All Articles). */
const Section: React.FC<{
  title: string;
  count: number;
  id?: string;
  children: ReactNode;
}> = ({ title, count, id, children }) => (
  <section className="mb-12 last:mb-0">
    <div className="mb-4 flex items-baseline justify-between gap-4">
      <h2 className="font-display text-2xl text-fg sm:text-3xl">{title}</h2>
      <p className="shrink-0 font-mono text-xs text-fg-subtle">
        {count} post{count === 1 ? '' : 's'}
      </p>
    </div>
    {/* The fold control lives inside the section, so the region it controls is
        the list itself rather than the wrapper. */}
    <div id={id}>{children}</div>
  </section>
);

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
  const [allExpanded, setAllExpanded] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [openPost, setOpenPost] = useState<PostMeta | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  /** Transient confirmation for a key action; see `sharePost`. */
  const [notice, setNotice] = useState('');

  /* ---------------------------------------------------------- deep links -- */

  /**
   * The open post lives in the URL fragment, which is what makes a post
   * shareable, reload-proof and back-button-able.
   *
   * `hashchange` is the only writer of `openPost`. Both the keyboard and the
   * browser's back button only ever change the fragment, so routing every open
   * and close through here keeps one source of truth — the two writing to
   * `openPost` directly is how a URL and the page end up disagreeing, where the
   * back button closes a post that was never opened or the address bar keeps
   * naming a post that is no longer on screen.
   */
  useEffect(() => {
    const syncFromHash = () => {
      const route = routeFromHash(window.location.hash);
      // An in-page anchor (`#installation`, the `#main` skip link) is not a
      // navigation intent. Leaving the post open is the only safe reading.
      if (route.kind === 'other') return;
      setOpenPost(route.kind === 'post' ? findPostById(route.id) : null);
    };

    // A shared link or a reload lands here with a fragment already set, and no
    // `hashchange` will fire for it.
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const openPostById = useCallback((id: string) => {
    window.location.hash = postFragment(id);
  }, []);

  const closePost = useCallback(() => {
    // Assigning an empty fragment clears it outright rather than leaving a bare
    // `#` behind, and still fires `hashchange` for the listener above.
    window.location.hash = '';
  }, []);

  /* ---------------------------------------------------------------- data -- */

  const filtered = useMemo(
    () =>
      category === null
        ? results
        : results.filter((result) => result.item.categories.includes(category)),
    [results, category],
  );

  /**
   * Curated picks come out of the *filtered* set, not the raw corpus, so a
   * category or a search query never surfaces a featured post that the active
   * filter excluded. Capped at three — see `FEATURED_LIMIT`.
   */
  const featuredResults = useMemo(
    () => filtered.filter((result) => result.item.featured).slice(0, FEATURED_LIMIT),
    [filtered],
  );

  /**
   * Everything the Featured shelf did not claim, in its existing order (newest
   * first, or Fuse rank while searching). Featured posts ranked fourth and
   * beyond land here, which is what keeps "every post appears exactly once" true
   * once the shelf is capped.
   */
  const articleResults = useMemo(() => {
    const onShelf = new Set(featuredResults.map((result) => result.item.id));
    return filtered.filter((result) => !onShelf.has(result.item.id));
  }, [filtered, featuredResults]);

  // The two-block layout only makes sense while browsing the whole archive; once
  // a query or category is active the visitor wants the matching set as one
  // ranked list, so the split collapses.
  const isExploring = category === null && !isFiltering;

  /**
   * The list the cursor walks, in visual order. Featured first, then the rest —
   * which is also the order the two sections render in, so `j`/`k`, `gg`/`G` and
   * the numbered badges stay aligned with what is on screen.
   */
  const visible = useMemo<SearchResult[]>(
    () => (isExploring ? [...featuredResults, ...articleResults] : filtered),
    [articleResults, featuredResults, filtered, isExploring],
  );

  // Derived rather than synchronised with an effect: one fewer render pass and
  // the cursor can never point past the end of a filtered list.
  const safeCursor = visible.length === 0 ? 0 : Math.min(cursor, visible.length - 1);

  const hasFilters = category !== null || isFiltering;

  // The landing page folds All Articles down to `COLLAPSED_COUNT`. The cursor
  // still walks the *whole* archive, so the fold has to yield whenever a cursor
  // motion would land on a card that is not on screen — otherwise `G` silently
  // means "last visible card" instead of "last post".
  const isAllExpanded = isExploring && allExpanded;
  const revealedArticles = useMemo(
    () => (isAllExpanded ? articleResults : articleResults.slice(0, COLLAPSED_COUNT)),
    [articleResults, isAllExpanded],
  );
  const hiddenArticleCount = articleResults.length - revealedArticles.length;

  // Leaving the landing view (search, category filter) resets the fold, so
  // coming back lands on the compact default rather than a fully expanded
  // archive. Adjusting state during render rather than in an effect avoids a
  // commit where the stale `allExpanded` paints against the new view.
  const [wasExploring, setWasExploring] = useState(isExploring);
  if (wasExploring !== isExploring) {
    setWasExploring(isExploring);
    if (!isExploring) setAllExpanded(false);
  }

  // Index of the last card that is actually rendered, i.e. where the fold begins.
  const lastRenderedIndex = featuredResults.length + revealedArticles.length - 1;

  // Where the cursor has to land once All Articles is folded. Computed from the
  // collapsed length, not `lastRenderedIndex` — clamping to the expanded bound
  // would leave the cursor pointing at a card that no longer exists.
  const lastCollapsedIndex = featuredResults.length + COLLAPSED_COUNT - 1;

  const clearFilters = useCallback(() => {
    setCategory(null);
    setIsCategoriesOpen(false);
    resetSearch();
  }, [resetSearch]);

  /* ------------------------------------------------------------ movement -- */

  /**
   * Unfold All Articles if the cursor is about to point past the fold. Called
   * from the motion handlers rather than from an effect on `cursor`, so the fold
   * opens in the same commit as the move and `zz`/`zt`/`zb` always have a card
   * to scroll to.
   */
  const ensureRevealed = useCallback(
    (index: number) => {
      if (index > lastRenderedIndex) setAllExpanded(true);
    },
    [lastRenderedIndex],
  );

  const moveCursor = useCallback(
    (delta: number) => {
      const total = visible.length;
      const from = total === 0 ? 0 : Math.min(cursor, total - 1);
      const next = total === 0 ? 0 : (from + delta + total) % total;
      ensureRevealed(next);
      setCursor(next);
    },
    [cursor, ensureRevealed, visible.length],
  );

  const jumpCursor = useCallback(
    (position: 'first' | 'last') => {
      const next = position === 'first' ? 0 : Math.max(0, visible.length - 1);
      ensureRevealed(next);
      setCursor(next);
    },
    [ensureRevealed, visible.length],
  );

  /**
   * `gg`/`G` and their Home/End aliases: move the cursor to an end of the list
   * *and* take the viewport with it.
   *
   * The scroll has to be driven from here rather than by revealing the cursor,
   * because the cursor row is committed by React after this handler returns —
   * querying `[data-cursor]` now would still find the row the cursor is leaving.
   * Top and bottom of the document need no DOM read, are exact, and are what
   * these keys have always meant in Vim.
   */
  const jumpToEnd = useCallback(
    (position: 'first' | 'last') => {
      jumpCursor(position);
      if (position === 'first') scrollToTop();
      else scrollToBottom();
    },
    [jumpCursor],
  );

  const toggleAllExpanded = useCallback(() => {
    if (isAllExpanded) {
      setAllExpanded(false);
      // Folding must not strand the cursor on a card that no longer exists.
      setCursor((current) => Math.min(current, Math.max(0, lastCollapsedIndex)));
    } else {
      setAllExpanded(true);
    }
  }, [isAllExpanded, lastCollapsedIndex]);

  const openPostDetail = useCallback(
    (post: PostMeta) => {
      // The category bar is hidden while reading; leaving its flag set would make
      // `q`/Escape "close" an invisible panel instead of leaving the post.
      setIsCategoriesOpen(false);
      openPostById(post.id);
    },
    [openPostById],
  );

  const openCursorPost = useCallback(() => {
    const target = visible[safeCursor];
    if (target) openPostDetail(target.item);
  }, [openPostDetail, safeCursor, visible]);

  const openFromSearch = useCallback(
    (post: PostMeta) => {
      closeSearch();
      openPostDetail(post);
    },
    [closeSearch, openPostDetail],
  );

  const revealCursor = useCallback(
    (block: ScrollLogicalPosition) => {
      ensureRevealed(safeCursor);
      revealElement(document.querySelector<HTMLElement>('[data-cursor]'), block);
    },
    [ensureRevealed, safeCursor],
  );

  /* -------------------------------------------------------------- layers -- */

  // Dismiss the topmost layer first: overlays, then drawers, then the post.
  const dismiss = useCallback(() => {
    if (isHelpOpen) return setIsHelpOpen(false);
    if (isAboutOpen) return setIsAboutOpen(false);
    if (isContactOpen) return setIsContactOpen(false);
    if (isSearchOpen) return resetSearch();
    if (isCategoriesOpen) return setIsCategoriesOpen(false);
    if (openPost) return closePost();
    if (isFiltering) resetSearch();
  }, [
    isAboutOpen,
    isCategoriesOpen,
    isContactOpen,
    isFiltering,
    isHelpOpen,
    isSearchOpen,
    openPost,
    resetSearch,
    closePost,
  ]);

  const backToList = useCallback(() => {
    closePost();
    scrollToTop();
  }, [closePost]);

  /* ------------------------------------------------------------- sharing -- */

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 1600);
    return () => clearTimeout(timer);
  }, [notice]);

  /**
   * `yy` — copy a link to the post. The point of the fragment route is that a
   * reader can hand someone the exact article, and this is the only key that
   * gets the URL out of the browser.
   *
   * Failure is reported rather than swallowed. The clipboard is unavailable over
   * plain http and can be denied by permissions or a hostile embedder, and
   * `CodeBlock` can afford to ignore that because its button is visibly still
   * there to press again — a keypress leaves no such trace, so a silent no-op
   * would look exactly like success.
   */
  const sharePost = useCallback(async (post: PostMeta) => {
    try {
      await navigator.clipboard.writeText(postUrl(post.id));
      setNotice('link copied');
    } catch {
      setNotice('copy blocked');
    }
  }, []);

  const shareCursorPost = useCallback(() => {
    const target = visible[safeCursor];
    if (target) void sharePost(target.item);
  }, [safeCursor, sharePost, visible]);

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
        primary: true,
        // Deliberately not `allowInInput`: with it, `q` was swallowed by every
        // text field on the site — it could not be typed into search, a comment
        // or the contact form. Escape still works from inside a field.
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
        keys: 'm',
        group: 'global',
        description: 'get in touch',
        primary: true,
        run: () => setIsContactOpen(true),
      },
      {
        keys: '/',
        group: 'search',
        description: 'open the search popup',
        primary: true,
        run: openSearch,
      },
    ];

    // One vocabulary per direction, and it is `j`/`k` plus `gg`/`G` alone.
    //
    // These bindings used to carry a second, overlapping set: `Ctrl-d`/`Ctrl-u`
    // scrolled half a page and `H`/`M`/`L` jumped to the top, middle and bottom
    // of the page. They duplicated movement `j`/`k` already did, and `H` in
    // particular collided with reading mode, where it meant "top of the post"
    // while `G` meant "end of the post" — so the same letter moved the reader in
    // two different directions depending on what was open. Page scrolling is now
    // reachable from the keyboard through the cursor itself: `gg`/`G` move the
    // cursor to the first/last post *and* take the viewport with them (below).

    if (!reading) {
      list.push({
        keys: 'c',
        group: 'view',
        description: 'toggle the category panel',
        primary: true,
        run: () => setIsCategoriesOpen((value) => !value),
      });
    }

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
          // Reading mode had no `gg` at all: `g` matched no binding, the chord
          // was dropped, and a post could only be escaped upward one line at a
          // time. `gg`/`G` are now top and bottom of the post, mirroring the
          // pair that already exists in the list.
          keys: 'gg',
          group: 'reading',
          description: 'jump to the top of the post',
          primary: true,
          run: scrollToTop,
        },
        {
          keys: 'G',
          group: 'reading',
          description: 'jump to the end of the post',
          primary: true,
          run: scrollToBottom,
        },
        {
          keys: 'yy',
          group: 'reading',
          description: 'copy a link to this post',
          primary: true,
          run: () => {
            if (openPost) void sharePost(openPost);
          },
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
          description: 'first post, top of page',
          primary: true,
          run: () => jumpToEnd('first'),
        },
        {
          keys: 'G',
          group: 'navigate',
          description: 'last post, bottom of page',
          primary: true,
          run: () => jumpToEnd('last'),
        },
        {
          keys: 'Home',
          group: 'navigate',
          description: 'first post, top of page',
          run: () => jumpToEnd('first'),
        },
        {
          keys: 'End',
          group: 'navigate',
          description: 'last post, bottom of page',
          run: () => jumpToEnd('last'),
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
          // Same chord as in reading mode, aimed at whatever the cursor is on:
          // a link worth sharing is usually found while browsing, not only after
          // opening the post.
          keys: 'yy',
          group: 'navigate',
          description: 'copy a link to the post under the cursor',
          run: shareCursorPost,
        },
      );
    }

    return list;
  }, [
    dismiss,
    jumpToEnd,
    moveCursor,
    openCursorPost,
    openPost,
    openSearch,
    revealCursor,
    shareCursorPost,
    sharePost,
    toggleTheme,
  ]);

  /**
   * While a dialog owns the screen, the layer underneath must go quiet. Help,
   * About and Search all focus their panel rather than a text field, so the
   * typing guard in `useKeyboard` never engaged for them: `Enter` opened a post
   * behind the dialog, `c`/`d`/`j`/`k` fired against the page behind it.
   */
  const isOverlayOpen = isHelpOpen || isAboutOpen || isSearchOpen || isContactOpen;

  const overlayBindings = useMemo<KeyBinding[]>(() => {
    const list: KeyBinding[] = [
      {
        keys: 'Escape',
        group: 'global',
        description: 'close the dialog',
        primary: true,
        allowInInput: true,
        run: dismiss,
      },
      {
        keys: 'q',
        group: 'global',
        description: 'close the dialog',
        primary: true,
        run: dismiss,
      },
    ];

    // Only close the help overlay with `?`; opening it on top of About would
    // stack two modals with a single keypress.
    if (isHelpOpen) {
      list.push({
        keys: '?',
        group: 'global',
        description: 'close this help',
        primary: true,
        run: () => setIsHelpOpen(false),
      });
    }

    return list;
  }, [dismiss, isHelpOpen]);

  // The help overlay always renders the *full* table, including the bindings it
  // has just disabled, so it stays a reference rather than a snapshot.
  const { pending } = useKeyboard(isOverlayOpen ? overlayBindings : bindings);

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

  const showSections = isExploring && visible.length > 0;

  return (
    <div className="app-shell flex min-h-dvh flex-col pb-7">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:border focus:border-accent focus:bg-surface focus:px-3 focus:py-2 focus:font-mono focus:text-sm focus:text-accent"
      >
        Skip to content
      </a>

      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenSearch={openSearch}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
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
          <PostDetail post={openPost} onBack={backToList} onOpenPost={openPostDetail} />
        ) : (
          <>
            <div className="mb-6 flex items-baseline justify-between gap-4">
              <h1 className="font-display text-2xl text-fg sm:text-3xl">{heading}</h1>
              <p className="shrink-0 font-mono text-xs text-fg-subtle">
                {visible.length} post{visible.length === 1 ? '' : 's'}
              </p>
            </div>

            {showSections ? (
              <>
                {featuredResults.length > 0 && (
                  <Section title="Featured" count={featuredResults.length}>
                    <PostList
                      posts={featuredResults}
                      query={term}
                      cursorIndex={safeCursor}
                      cursorStart={0}
                      onOpen={openPostDetail}
                      onClearFilters={clearFilters}
                      hasFilters={hasFilters}
                    />
                  </Section>
                )}

                {articleResults.length > 0 && (
                  <Section
                    id="all-articles"
                    title="All Articles"
                    count={articleResults.length}
                  >
                    <PostList
                      posts={revealedArticles}
                      query={term}
                      cursorIndex={safeCursor}
                      cursorStart={featuredResults.length}
                      onOpen={openPostDetail}
                      onClearFilters={clearFilters}
                      hasFilters={hasFilters}
                    />

                    {/* Always rendered once there is something to unfold, so
                        expanding is not a one-way trip down a very long page. */}
                    {articleResults.length > COLLAPSED_COUNT && (
                      <button
                        type="button"
                        onClick={toggleAllExpanded}
                        aria-expanded={isAllExpanded}
                        aria-controls="all-articles"
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 font-mono text-xs text-fg-subtle transition-colors duration-150 hover:border-accent/50 hover:bg-accent/5 hover:text-accent"
                      >
                        <ChevronDown
                          size={13}
                          strokeWidth={2}
                          aria-hidden="true"
                          className={`transition-transform duration-200 ${
                            isAllExpanded ? 'rotate-180' : ''
                          }`}
                        />
                        {isAllExpanded
                          ? 'collapse'
                          : `expand · ${hiddenArticleCount} more`}
                      </button>
                    )}
                  </Section>
                )}
              </>
            ) : (
              // Filtered, searching, or nothing to show — `PostList` owns the
              // empty state, including the reset-filters affordance.
              <PostList
                posts={visible}
                query={term}
                cursorIndex={safeCursor}
                onOpen={openPostDetail}
                onClearFilters={clearFilters}
                hasFilters={hasFilters}
              />
            )}
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
        notice={notice}
        theme={theme}
      />

      <HelpOverlay open={isHelpOpen} onClose={() => setIsHelpOpen(false)} bindings={bindings} />

      <AboutDialog open={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      <ContactDialog open={isContactOpen} onClose={() => setIsContactOpen(false)} />

      <SearchDialog
        open={isSearchOpen}
        term={term}
        onTermChange={setTerm}
        results={filtered}
        onSelect={openFromSearch}
        onClose={closeSearch}
      />
    </div>
  );
}

export default App;