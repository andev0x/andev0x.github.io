import React, { useMemo } from 'react';
import type { PostMeta } from '../types';
import { posts } from '../data/posts';
import { formatIsoDate } from '../utils/format';
import { relatedPosts } from '../utils/related';

/** Picks shown before the section gives up and renders nothing. */
const LIMIT = 3;

interface RelatedArticlesProps {
  /** The post being read. Also the exclusion: it never recommends itself. */
  post: PostMeta;
  onOpen: (post: PostMeta) => void;
}

/**
 * "Keep reading" trail under the article body.
 *
 * Rendered from the build-time manifest rather than a prop, so it costs nothing
 * to wire up and cannot go stale against a filtered list — relatedness is about
 * the post itself, not about what the visitor happens to have on screen.
 *
 * Every row states why it is there, and the wording matches the strength of the
 * match: chips naming shared tags for a real topical match, a muted "same
 * topic" line for the weaker category-only ones. A recommendation that cannot
 * say why it is recommending something is just a shuffle.
 */
export const RelatedArticles: React.FC<RelatedArticlesProps> = ({ post, onOpen }) => {
  const related = useMemo(() => relatedPosts(post, posts, LIMIT), [post]);

  // A post can share neither a tag nor a category with anything else in the
  // archive. An empty section would read as a bug, so the heading goes with it.
  if (related.length === 0) return null;

  return (
    <section className="mt-14" aria-labelledby="related-title">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 id="related-title" className="font-display text-2xl text-fg">
          related articles
        </h2>
        <p className="shrink-0 font-mono text-xs text-fg-subtle">
          {related.length} suggestion{related.length === 1 ? '' : 's'}
        </p>
      </div>

      <ul className="grid gap-2">
        {related.map(({ post: item, reason }) => (
          <li key={item.id}>
            {/* The row is one button rather than a div with a click handler:
                a real focus stop for keyboard and screen-reader users, and the
                whole surface is hit-testable without a pseudo-element. */}
            <button
              type="button"
              onClick={() => onOpen(item)}
              className="group flex w-full items-start gap-3 rounded-xl border border-border bg-surface p-4 text-left transition-[border-color,background-color] duration-200 ease-out hover:border-accent/50 hover:bg-accent/[0.04]"
            >
              <span className="mt-0.5 shrink-0 font-mono text-xs text-accent" aria-hidden="true">
                ❯
              </span>

              <span className="min-w-0 flex-1">
                <span className="block font-display text-lg leading-snug text-fg transition-colors duration-150 group-hover:text-accent">
                  {item.title}
                </span>

                <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.65rem] text-fg-subtle">
                  <time dateTime={item.date}>{formatIsoDate(item.date)}</time>
                  {item.categories.length > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{item.categories.join(' / ')}</span>
                    </>
                  )}
                  <span aria-hidden="true">·</span>
                  <span>{item.readingTime} min</span>
                </span>

                {reason.kind === 'tag' ? (
                  <span className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-fg-subtle/70">
                      shares
                    </span>
                    {reason.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded border border-accent/30 bg-accent/[0.08] px-1.5 py-0.5 font-mono text-[0.62rem] text-accent"
                      >
                        {tag}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-fg-subtle/70">
                      same topic
                    </span>
                    {reason.categories.map((name) => (
                      <span
                        key={name}
                        className="rounded border border-border bg-elevated px-1.5 py-0.5 font-mono text-[0.62rem] text-fg-muted"
                      >
                        {name}
                      </span>
                    ))}
                  </span>
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};