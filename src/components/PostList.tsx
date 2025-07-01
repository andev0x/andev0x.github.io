import React from 'react';
import { BlogPost } from '../types';
import { PostCard } from './PostCard';

interface PostListProps {
  posts: BlogPost[];
  onPostClick: (post: BlogPost) => void;
}

export const PostList: React.FC<PostListProps> = ({ posts, onPostClick }) => {
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
    <div className="grid gap-6 md:gap-8">
      {posts.map((post, index) => (
        <div
          key={post.id}
          className="animate-slide-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <PostCard post={post} onClick={() => onPostClick(post)} />
        </div>
      ))}
    </div>
  );
};