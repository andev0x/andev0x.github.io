import React, { memo } from 'react';
import type { PostMeta } from '../types';
import { formatIsoDate } from '../utils/format';
import { Calendar, Clock, Folder, Tag } from 'lucide-react';

/**
 * Highlight the search terms in a field.
 *
 * Highlighting is deliberately *exact* rather than reusing Fuse's fuzzy match
 * ranges: bitap reports scattered low-confidence fragments for a long query
 * ("Un", "erst", "ent" for "kubernetes"), which shredded the title. Fuse is
 * still what decides ranking and recall — the marks only confirm to the reader
 * where the literal term sits. Multi-word queries highlight each word, which is
 * what people expect.
 */
const highlight = (text: string, query: string): React.ReactNode => {
  const terms = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length >= 2);
  if (terms.length === 0) return text;

  const haystack = text.toLowerCase();
  const ranges: Array<[number, number]> = [];

  for (const term of terms) {
    let from = haystack.indexOf(term);
    while (from !== -1) {
      ranges.push([from, from + term.length - 1]);
      from = haystack.indexOf(term, from + term.length);
    }
  }
  if (ranges.length === 0) return text;

  ranges.sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [];
  for (const [start, end] of ranges) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  merged.forEach(([start, end], i) => {
    if (start > cursor) parts.push(text.slice(cursor, start));
    parts.push(
      <mark
        key={`${start}-${i}`}
        className="rounded-[2px] bg-accent/25 px-0.5 text-fg [box-shadow:inset_0_-1px_0_rgb(var(--c-accent)/0.5)]"
      >
        {text.slice(start, end + 1)}
      </mark>,
    );
    cursor = end + 1;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));

  return parts;
};

interface PostCardProps {
  post: PostMeta;
  index: number;
  /** Raw search query; empty when no search is active. */
  query: string;
  isCursor: boolean;
  onOpen: (post: PostMeta) => void;
}

const PostCardBase: React.FC<PostCardProps> = ({ post, index, query, isCursor, onOpen }) => (
  <article
      data-cursor={isCursor || undefined}
      aria-current={isCursor ? 'true' : undefined}
      className={[
        'defer-paint group relative rounded-xl border bg-surface p-4 sm:p-5',
        'transition-[border-color,background-color,transform,box-shadow] duration-200 ease-out',
        'hover:-translate-y-px hover:shadow-panel',
        isCursor
          ? 'border-accent/70 bg-accent/[0.07] shadow-panel'
          : 'border-border hover:border-accent/40',
      ].join(' ')}
    >
      {/* Cursor rail — the visual equivalent of Neovim's current-line bar. */}
      <span
        aria-hidden="true"
        className={`absolute inset-y-3 left-0 w-0.5 rounded-full bg-accent transition-opacity duration-200 ${
          isCursor ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.68rem] text-fg-subtle">
        <span className="tabular-nums text-accent/70">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="inline-flex items-center gap-1">
          <Calendar size={11} strokeWidth={1.75} aria-hidden="true" />
          <time dateTime={post.date}>{formatIsoDate(post.date)}</time>
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock size={11} strokeWidth={1.75} aria-hidden="true" />
          {post.readingTime} min
        </span>
        {post.categories.length > 0 && (
          <span className="inline-flex min-w-0 items-center gap-1">
            <Folder size={11} strokeWidth={1.75} aria-hidden="true" />
            <span className="truncate">{post.categories.join(' / ')}</span>
          </span>
        )}
        {post.featured && (
          <span className="ml-auto rounded border border-accent/40 px-1.5 py-0.5 text-[0.6rem] uppercase tracking-[0.12em] text-accent">
            featured
          </span>
        )}
      </div>

      {/* The heading button is the single focusable target; its ::after covers
          the card so the whole surface is clickable and screen readers get a
          real link/button instead of a click handler on a div. */}
      <h2 className="mt-2 font-display text-xl leading-tight text-fg sm:text-2xl">
        <button
          type="button"
          onClick={() => onOpen(post)}
          className="text-left transition-colors duration-150 after:absolute after:inset-0 after:content-[''] hover:text-accent"
        >
          {highlight(post.title, query)}
        </button>
      </h2>

      <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-fg-muted">
        {highlight(post.excerpt, query)}
      </p>

      {post.tags.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
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
    </article>
  );

/** Re-renders only when this card's own data or cursor state changes. */
export const PostCard = memo(PostCardBase);

export type { PostCardProps };
