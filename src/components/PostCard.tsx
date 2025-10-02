import React from 'react';
import { BlogPost } from '../types';
import { format } from 'date-fns';
import { Clock, Tag } from 'lucide-react';
import Fuse from 'fuse.js';

interface PostCardProps {
  post: BlogPost;
  matches?: Fuse.FuseResultMatch[];
  onClick: () => void;
}

const highlight = (text: string, matches?: Fuse.FuseResultMatch[], key?: string) => {
  if (!matches || !key) {
    return text;
  }

  const relevantMatches = matches.filter(m => m.key === key);
  if (relevantMatches.length === 0) {
    return text;
  }

  const result: (string | JSX.Element)[] = [];
  let lastIndex = 0;

  relevantMatches.forEach(match => {
    match.indices.forEach(([start, end]) => {
      if (start > lastIndex) {
        result.push(text.substring(lastIndex, start));
      }
      result.push(
        <span key={`${start}-${end}`} className="bg-terminal-green text-terminal-black">
          {text.substring(start, end + 1)}
        </span>
      );
      lastIndex = end + 1;
    });
  });


  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex));
  }

  return result;
};

export const PostCard: React.FC<PostCardProps> = ({ post, matches, onClick }) => {
  return (
    <article
      onClick={onClick}
      className="border border-terminal-green/30 rounded-lg p-6 hover:border-terminal-green/60 transition-all duration-300 hover:shadow-lg hover:shadow-terminal-green/20 cursor-pointer animate-fade-in group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2 text-terminal-green/60 terminal-accent text-xs">
          <span>[{format(new Date(post.date), 'yyyy-MM-dd')}]</span>
          {post.featured && (
            <span className="bg-terminal-green text-terminal-black px-2 py-1 rounded text-xs">
              FEATURED
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1 text-terminal-green/60 terminal-accent text-xs">
          <Clock size={12} />
          <span>{post.readingTime}min</span>
        </div>
      </div>
      
      <h2 className="text-xl md:text-2xl font-vt323 text-terminal-green mb-3 group-hover:animate-glow">
        {highlight(post.title, matches, 'title')}
      </h2>
      
      <p className="text-terminal-green/80 font-vt323 text-lg mb-4 line-clamp-3">
        {highlight(post.excerpt, matches, 'content')}
      </p>
      
      <div className="flex flex-wrap gap-2 mb-3">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center space-x-1 text-terminal-green/60 terminal-accent text-xs border border-terminal-green/30 rounded px-2 py-1"
          >
            <Tag size={10} />
            <span>{tag}</span>
          </span>
        ))}
      </div>
      
      <div className="text-terminal-green/60 terminal-accent text-xs">
        categories: {post.categories.join(', ')}
      </div>
    </article>
  );
};