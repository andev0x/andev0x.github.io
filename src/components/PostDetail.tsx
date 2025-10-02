import React, { useEffect } from 'react';
import { BlogPost } from '../types';
import { format } from 'date-fns';
import { ArrowLeft, Clock, Tag, Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CommentSection } from './CommentSection';

interface PostDetailProps {
  post: BlogPost;
  onBack: () => void;
}

export const PostDetail: React.FC<PostDetailProps> = ({ post, onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [post]);

  return (
    <article className="animate-fade-in">
      {/* Header */}
      <div className="backdrop-blur-sm sticky top-0 z-40">
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
        <div className="rounded-lg p-6">
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
            className="prose prose-invert max-w-none
              prose-h1:text-4xl
              prose-h2:text-3xl
              prose-h3:text-2xl
              prose-headings:font-vt323
              prose-headings:text-terminal-green
              prose-headings:bg-transparent
              prose-p:text-base
              prose-p:bg-transparent
              prose-code:bg-transparent
            "
          >
            <ReactMarkdown
              remarkPlugins={[remarkMath, remarkGfm]}
              rehypePlugins={[rehypeKatex]}
              components={{
                a: ({ ...props }) => (
                  <a
                    {...props}
                    className="text-[#88FFCC] underline underline-offset-4 hover:text-[#A2FFD8] transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
                code({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={atomDark}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{
                        borderRadius: '0.5rem',
                        margin: '1.5rem 0',
                        fontSize: '0.9rem',
                        padding: '1rem',
                        background: 'transparent',
                        color: '#F8F8F2',
                      }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code
                      className="bg-transparent text-[#FFD580] px-2 py-1 rounded font-mono text-[0.95rem] border border-[#333]"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                em: ({ ...props }) => (
                  <em className="text-[#FFC57A] italic" {...props} />
                ),
                strong: ({ ...props }) => (
                  <strong className="text-[#FFDF80] font-bold" {...props} />
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>


          {/* Rating & Comments Section */}
          <section className="mt-12 mb-8">
            <div>
              <h2 className="font-vt323 text-terminal-green text-2xl mb-2">Rate & Comment</h2>
              <CommentSection postId={post.id} />
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-12 pt-8 border-t border-terminal-green/30">
            <div className="text-terminal-green/60 terminal-accent text-sm">
              End of post. Press 'Escape' or click 'Back to posts' to return.
            </div>
          </footer>
        </div>
      </div>
    </article>
  );
};