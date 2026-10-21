import { useCallback, useMemo, useState } from 'react';
import type { PostMeta, SearchResult } from '../types';
import { buildIndex, searchPosts } from '../utils/search';

/**
 * Fuzzy search over post *metadata* only.
 *
 * The previous implementation indexed every post body, which meant the whole
 * corpus sat in a Fuse index in memory and was rescanned on each keystroke.
 * Titles, excerpts, tags and categories cover the same user intent for a
 * fraction of the cost, and the index is now built once from the build-time
 * manifest.
 *
 * Matching is exact-ish rather than bitap-fuzzy: see `utils/search.ts` for
 * the scoring and why the ranking it produces is the one readers expect.
 * Highlighting is exact — see `PostCard`.
 */
const ALL: SearchResult[] = [];

export const useSearch = (posts: PostMeta[]) => {
  const [term, setTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // The index is built once per corpus, not once per keystroke.
  const index = useMemo(() => buildIndex(posts), [posts]);

  // The corpus is small enough to score synchronously, so the result list
  // never lags the field and no second (deferred) render pass is needed.
  const results = useMemo<SearchResult[]>(() => searchPosts(index, term), [index, term]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const reset = useCallback(() => {
    setTerm('');
    setIsOpen(false);
  }, []);

  return {
    term,
    setTerm,
    results,
    isOpen,
    isFiltering: term.trim().length > 0,
    open,
    close,
    reset,
    matchCount: term.trim() ? results.length : ALL.length,
  };
};
