import React, { useCallback, useEffect, useState } from 'react';
import type { Comment } from '../types';
import { fetchComments, postComment } from '../utils/api';
import { formatTimestamp } from '../utils/format';
import { StarInput, Stars } from './Stars';

interface CommentSectionProps {
  postId: string;
}

/**
 * Notes on this component:
 * - `fetchComments` resolves the backend availability once (cached in api.ts),
 *   so the previous extra `/test` round trip per action is gone.
 * - A generation token guards every `setState` after an await, so switching
 *   posts mid-flight can no longer write the previous post's comments into
 *   state.
 */
export const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchComments(postId)
      .then((loaded) => {
        if (active) setComments(loaded);
      })
      .catch(() => {
        if (active) setError('could not load comments');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [postId]);

  const canSubmit = author.trim().length > 0 && content.trim().length > 0 && rating !== null;

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!canSubmit || pending) return;

      setPending(true);
      setError(null);
      try {
        const created = await postComment(postId, {
          author: author.trim(),
          content: content.trim(),
          rating: rating ?? undefined,
        });
        setComments((current) => [created, ...current]);
        setContent('');
        setRating(null);
      } catch {
        setError('could not post your comment');
      } finally {
        setPending(false);
      }
    },
    [author, canSubmit, content, pending, postId, rating],
  );

  return (
    <div className="panel rounded-xl p-4 sm:p-5">
      {error && (
        <p role="alert" className="mb-4 rounded-md border border-border bg-elevated px-3 py-2 font-mono text-xs text-fg-muted">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex-1">
            <span className="sr-only">Your name</span>
            <input
              type="text"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              placeholder="your name"
              maxLength={60}
              autoComplete="name"
              className="w-full rounded-md border border-border bg-canvas px-3 py-2 font-mono text-sm text-fg outline-none transition-colors duration-150 placeholder:text-fg-subtle focus:border-accent/60"
            />
          </label>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-fg-subtle">rating</span>
            <StarInput value={rating} onChange={setRating} idPrefix={`rate-${postId}`} />
          </div>
        </div>

        <label className="block">
          <span className="sr-only">Your comment</span>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="add a comment…"
            rows={3}
            maxLength={2000}
            className="w-full resize-y rounded-md border border-border bg-canvas px-3 py-2 font-mono text-sm leading-relaxed text-fg outline-none transition-colors duration-150 placeholder:text-fg-subtle focus:border-accent/60"
          />
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!canSubmit || pending}
            className="rounded-md border border-accent bg-accent px-4 py-2 font-mono text-xs font-medium text-on-accent transition-opacity duration-150 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pending ? 'posting…' : 'post comment'}
          </button>
          {rating === null && (
            <span className="font-mono text-[0.68rem] text-fg-subtle">pick a rating first</span>
          )}
        </div>
      </form>

      <div className="mt-6 border-t border-border pt-4">
        {loading ? (
          <p className="font-mono text-xs text-fg-subtle">loading comments…</p>
        ) : comments.length === 0 ? (
          <p className="font-mono text-xs text-fg-subtle">
            no comments yet — be the first
          </p>
        ) : (
          <ul className="space-y-3">
            {comments.map((comment) => (
              <li key={comment.id} className="rounded-lg border border-border bg-canvas p-3">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-mono text-sm text-fg">{comment.author}</span>
                  {typeof comment.rating === 'number' && <Stars value={comment.rating} />}
                  <time
                    dateTime={comment.createdAt}
                    className="ml-auto font-mono text-[0.65rem] text-fg-subtle"
                  >
                    {formatTimestamp(comment.createdAt)}
                  </time>
                </div>
                <p className="mt-1.5 whitespace-pre-line break-words font-mono text-sm leading-relaxed text-fg-muted">
                  {comment.content}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
