import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import type { PostMeta, SearchResult } from '../types';

/**
 * Fuzzy search over post *metadata* only.
 *
 * The previous implementation indexed every post body, which meant the whole
 * corpus sat in a Fuse index in memory and was rescanned on each keystroke.
 * Titles, excerpts, tags and categories cover the same user intent for a
 * fraction of the cost, and the index is now built once from the build-time
 * manifest.
 *
 * `includeMatches` is deliberately off: nothing consumed the fuzzy ranges, and
 * computing them is pure per-keystroke overhead. Highlighting is exact — see
 * `PostCard`.
 */
const FUSE_OPTIONS = {
  keys: [
    { name: 'title', weight: 3 },
    { name: 'excerpt', weight: 1.5 },
    { name: 'tags', weight: 2 },
    { name: 'categories', weight: 1 },
  ],
  threshold: 0.32,
  ignoreLocation: true,
  minMatchCharLength: 2,
  shouldSort: true,
};

const ALL: SearchResult[] = [];

export const useSearch = (posts: PostMeta[]) => {
  const [term, setTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  // Keep typing responsive: the list updates on a low-priority render.
  const deferredTerm = useDeferredValue(term);

  const fuse = useMemo(() => new Fuse(posts, FUSE_OPTIONS), [posts]);

  const results = useMemo<SearchResult[]>(() => {
    const query = deferredTerm.trim();
    if (!query) return posts.map((item) => ({ item }));
    return fuse.search(query);
  }, [deferredTerm, fuse, posts]);

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
    matchCount: deferredTerm.trim() ? results.length : ALL.length,
  };
};
