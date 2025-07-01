import React, { useEffect } from 'react';
import { BlogPost } from '../types';
import { format } from 'date-fns';
import { ArrowLeft, Clock, Tag, Calendar } from 'lucide-react';

interface PostDetailProps {
  post: BlogPost;
  onBack: () => void;
}

export const PostDetail: React.FC<PostDetailProps> = ({ post, onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [post]);

  // Enhanced markdown-to-HTML conversion with better syntax highlighting
  const formatContent = (content: string) => {
    return content
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-vt323 text-terminal-green mb-4 animate-glow">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-vt323 text-terminal-green mb-3 mt-6">$2</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-vt323 text-terminal-green mb-2 mt-4">$3</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-terminal-green-bright font-semibold">$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="bg-code-bg text-code-text px-2 py-1 rounded font-mono text-sm border border-code-border">$1</code>')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const language = lang || 'text';
        return `<pre class="bg-code-bg border border-code-border rounded-lg p-4 overflow-x-auto my-6 shadow-lg"><div class="text-code-comment text-xs mb-2 font-mono">${language}</div><code class="font-mono text-sm text-code-text block leading-relaxed">${code.trim()}</code></pre>`;
      })
      .replace(/^\- (.*$)/gm, '<li class="text-terminal-green/90 mb-2 ml-4">• $1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li class="text-terminal-green/90 mb-2 ml-4">$1. $2</li>')
      .replace(/\n\n/g, '</p><p class="text-terminal-green/90 font-vt323 text-lg mb-4 leading-relaxed">')
      .replace(/^(?!<[h|l|p|c|d])/gm, '<p class="text-terminal-green/90 font-vt323 text-lg mb-4 leading-relaxed">')
      + '</p>';
  };

  return (
    <article className="animate-fade-in">
      {/* Header */}
      <div className="bg-terminal-black/90 backdrop-blur-sm border-b border-terminal-green/30 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-terminal-green hover-glow transition-colors font-vt323"
          >
            <ArrowLeft size={20} />
            <span>Back to posts</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Post Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-4 mb-4 text-terminal-green/70 terminal-accent text-sm">
            <div className="flex items-center space-x-2">
              <Calendar size={16} />
              <span>[{format(new Date(post.date), 'yyyy-MM-dd')}]</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock size={16} />
              <span>{post.readingTime} min read</span>
            </div>
            <div className="text-terminal-green/50">
              categories: {post.categories.join(', ')}
            </div>
            {post.featured && (
              <span className="bg-terminal-green text-terminal-black px-2 py-1 rounded text-xs font-semibold">
                FEATURED
              </span>
            )}
          </div>
          
          <h1 className="text-3xl md:text-5xl font-vt323 text-terminal-green mb-6 animate-pulse-glow leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center space-x-1 text-terminal-green/70 terminal-accent text-sm border border-terminal-green/40 rounded px-3 py-1 hover:border-terminal-green/60 transition-colors"
              >
                <Tag size={12} />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        </header>

        {/* Post Content */}
        <div 
          className="prose prose-terminal max-w-none"
          dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
        />

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-terminal-green/30">
          <div className="text-terminal-green/60 terminal-accent text-sm">
            End of post. Press 'Escape' or click 'Back to posts' to return.
          </div>
        </footer>
      </div>
    </article>
  );
};