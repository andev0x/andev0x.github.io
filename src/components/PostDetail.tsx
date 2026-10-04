import React, { Suspense, lazy, useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Clock, Folder, Tag } from 'lucide-react';
import type { PostMeta } from '../types';
import { formatLongDate } from '../utils/format';
import { scrollToTop } from '../utils/scroll';
import { loadPostContent } from '../data/posts';
import { CommentSection } from './CommentSection';
import { RelatedArticles } from './RelatedArticles';

/**
 * react-markdown plus the Prism grammars live in their own chunk, fetched the
 * first time a post is opened.
 */
const Markdown = lazy(() => import('./Markdown'));

const ArticleSkeleton = () => (
  <div className="space-y-3" aria-hidden="true">
    {[92, 100, 78, 96, 60, 88, 70, 94].map((width, i) => (
      <div
        key={i}
        className="h-3 animate-pulse rounded bg-border/60"
        style={{ width: `${width}%`, animationDelay: `${i * 60}ms` }}
      />
    ))}
  </div>
);

interface PostDetailProps {
  post: PostMeta;
  onBack: () => void;
  /** Opens another post in place — used by the related articles trail. */
  onOpenPost: (post: PostMeta) => void;
}

export const PostDetail: React.FC<PostDetailProps> = ({ post, onBack, onOpenPost }) => {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setContent(null);
    setError(null);
    scrollToTop();

    loadPostContent(post.id)
      .then((markdown) => {
        if (active) setContent(markdown);
      })
      .catch(() => {
        if (active) setError('Could not load this post.');
      });

    return () => {
      active = false;
    };
  }, [post.id]);

  return (
    <article className="animate-enter pb-10">
      {/* Toolbar */}
      <div className="sticky top-14 z-30 border-b border-border bg-canvas/85 backdrop-blur-md">
        <div className="container flex h-11 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-keyshortcuts="q"
            className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1 font-mono text-xs text-fg-muted transition-colors duration-150 hover:border-accent/50 hover:text-fg"
          >
            <ArrowLeft size={13} strokeWidth={2} aria-hidden="true" />
            posts
            <span className="kbd ml-0.5">q</span>
          </button>
          <span className="truncate font-mono text-[0.7rem] text-fg-subtle">{post.title}</span>
        </div>
      </div>

      <div className="container max-w-3xl pt-8">
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[0.7rem] text-fg-subtle">
            <span className="inline-flex items-center gap-1">
              <Calendar size={11} strokeWidth={1.75} aria-hidden="true" />
              <time dateTime={post.date}>{formatLongDate(post.date)}</time>
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={11} strokeWidth={1.75} aria-hidden="true" />
              {post.readingTime} min read
            </span>
            {post.categories.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <Folder size={11} strokeWidth={1.75} aria-hidden="true" />
                {post.categories.join(' / ')}
              </span>
            )}
            {post.featured && (
              <span className="rounded border border-accent/40 px-1.5 py-0.5 text-[0.6rem] uppercase tracking-[0.12em] text-accent">
                featured
              </span>
            )}
          </div>

          <h1 className="mt-3 font-display text-4xl leading-[1.1] text-fg sm:text-5xl">
            {post.title}
          </h1>

          <p className="mt-3 border-l-2 border-accent/50 pl-3 text-sm leading-relaxed text-fg-muted">
            {post.excerpt}
          </p>

          {post.tags.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <li
                  key={tag}
                  className="inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 font-mono text-[0.65rem] text-fg-subtle"
                >
                  <Tag size={9} strokeWidth={2} aria-hidden="true" />
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </header>

        {/* Body */}
        {error ? (
          <p className="rounded-lg border border-border bg-surface px-4 py-6 text-center font-mono text-sm text-fg-muted">
            {error}
          </p>
        ) : content === null ? (
          <ArticleSkeleton />
        ) : (
          <Suspense fallback={<ArticleSkeleton />}>
            <Markdown content={content} />
          </Suspense>
        )}

        {/* Before the comment section, not after it: this is still part of
            reading the post, where the visitor wants somewhere to go next. */}
        <RelatedArticles post={post} onOpen={onOpenPost} />

        <section className="mt-14">
          <h2 className="mb-3 font-display text-2xl text-fg">rate &amp; comment</h2>
          <CommentSection postId={post.id} />
        </section>

        <footer className="mt-12 border-t border-border pt-6">
          <button
            type="button"
            onClick={onBack}
            className="font-mono text-xs text-fg-subtle transition-colors hover:text-accent"
          >
            ← back to all posts
          </button>
        </footer>
      </div>
    </article>
  );
};
