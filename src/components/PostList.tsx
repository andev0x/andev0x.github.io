import React, { useEffect, useRef } from 'react';
import type { PostMeta, SearchResult } from '../types';
import { PostCard } from './PostCard';
import { revealElement } from '../utils/scroll';

interface PostListProps {
  posts: SearchResult[];
  query: string;
  cursorIndex: number;
  onOpen: (post: PostMeta) => void;
  onClearFilters: () => void;
  hasFilters: boolean;
}

/**
 * The full result set is rendered — the previous build capped the list at three
 * entries behind a "See more" button, which also made the `j`/`k` cursor
 * unreachable for most of the archive.
 */
export const PostList: React.FC<PostListProps> = ({
  posts,
  query,
  cursorIndex,
  onOpen,
  onClearFilters,
  hasFilters,
}) => {
  const listRef = useRef<HTMLUListElement>(null);

  // Keep the cursor card in view as it moves, scoped to this list rather than
  // querying the whole document.
  useEffect(() => {
    revealElement(listRef.current?.querySelector<HTMLElement>('[data-cursor]') ?? null, 'center');
  }, [cursorIndex]);

  if (posts.length === 0) {
    return (
      <div className="panel rounded-xl px-6 py-12 text-center">
        <p className="font-display text-2xl text-fg">no posts found</p>
        <p className="mt-1 font-mono text-xs text-fg-subtle">
          nothing matches the current search or filter
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-4 rounded-md border border-accent/50 px-3 py-1.5 font-mono text-xs text-accent transition-colors hover:bg-accent/10"
          >
            reset filters
          </button>
        )}
      </div>
    );
  }

  return (
    <ul ref={listRef} className="space-y-3">
      {posts.map((result, index) => (
        <li key={result.item.id}>
          <PostCard
            post={result.item}
            index={index}
            query={query}
            isCursor={index === cursorIndex}
            onOpen={onOpen}
          />
        </li>
      ))}
    </ul>
  );
};
