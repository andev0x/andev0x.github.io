import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { BlogPost } from '../types';

const fuseOptions = {
  keys: ['title', 'content', 'tags', 'category'],
  threshold: 0.3,
  includeScore: true,
};

export const useSearch = (posts: BlogPost[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  const fuse = useMemo(() => new Fuse(posts, fuseOptions), [posts]);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) {
      return posts;
    }
    return fuse.search(searchTerm).map(result => result.item);
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