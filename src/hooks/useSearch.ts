import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { BlogPost } from '../types';

const fuseOptions = {
  keys: ['title', 'content', 'tags', 'category'],
  threshold: 0.4, // Looser threshold
  includeScore: true,
  includeMatches: true, // Include match details
  minMatchCharLength: 2,
};

export const useSearch = (posts: BlogPost[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  const fuse = useMemo(() => new Fuse(posts, fuseOptions), [posts]);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) {
      // When no search term, return all posts without matches
      return posts.map(post => ({ item: post, matches: [] }));
    }
    // When searching, return Fuse search results
    return fuse.search(searchTerm);
  }, [searchTerm, fuse, posts]);

  const activateSearch = () => {
    setIsSearchActive(true);
  };

  const deactivateSearch = () => {
    setIsSearchActive(false);
    setSearchTerm('');
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearchActive,
    activateSearch,
    deactivateSearch,
    clearSearch,
  };
};