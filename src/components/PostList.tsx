import React, { useState } from 'react';
import { BlogPost } from '../types';
import { PostCard } from './PostCard';

interface PostListProps {
  posts: BlogPost[];
  onPostClick: (post: BlogPost) => void;
}

export const PostList: React.FC<PostListProps> = ({ posts, onPostClick }) => {
  const [showAll, setShowAll] = useState(false);
  const visiblePosts = showAll ? posts : posts.slice(0, 3);

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-terminal-green/60 font-vt323 text-xl">
          No posts found
        </div>
        <div className="text-terminal-green/40 terminal-accent text-sm mt-2">
          Try adjusting your search or category filter
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:gap-8">
        {visiblePosts.map((post, index) => (
          <div
            key={post.id}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <PostCard post={post} onClick={() => onPostClick(post)} />
          </div>
        ))}
      </div>
      {posts.length > 3 && !showAll && (
        <div className="flex justify-center mt-8">
          <button
            className="px-6 py-2 rounded bg-terminal-green text-terminal-black font-vt323 text-lg hover-glow transition-colors border border-terminal-green/60"
            onClick={() => setShowAll(true)}
          >
            See More
          </button>
        </div>
      )}
      {showAll && posts.length > 3 && (
        <div className="flex justify-center mt-4">
          <button
            className="px-6 py-2 rounded bg-terminal-black text-terminal-green font-vt323 text-lg hover-glow transition-colors border border-terminal-green/60"
            onClick={() => setShowAll(false)}
          >
            Show Less
          </button>
        </div>
      )}
    </>
  );
};