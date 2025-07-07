import React, { useState, useEffect } from 'react';
import { Comment } from '../types';
import { fetchComments, postComment } from '../utils/api';

interface CommentSectionProps {
  postId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch comments on component mount
  useEffect(() => {
    const loadComments = async () => {
      try {
        setLoading(true);
        const fetchedComments = await fetchComments(postId);
        setComments(fetchedComments);
      } catch (err) {
        setError('Failed to load comments');
        console.error('Error loading comments:', err);
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [postId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !content.trim() || rating == null) return;
    try {
      setLoading(true);
      setError(null);
      // Send rating with comment
      const newComment = await postComment(postId, {
        author: author.trim(),
        content: content.trim(),
        rating,
      });
      setComments([newComment, ...comments]);
      setAuthor('');
      setContent('');
      setRating(null);
    } catch (err) {
      setError('Failed to post comment');
      console.error('Error posting comment:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-500/40 rounded text-red-400 font-vt323 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleAddComment} className="mb-6">
        <div className="flex flex-col md:flex-row gap-2 mb-2">
          <input
            type="text"
            className="bg-transparent border border-terminal-green/40 rounded px-3 py-2 text-terminal-green placeholder-terminal-green/60 font-vt323 flex-1"
            placeholder="Your name"
            value={author}
            onChange={e => setAuthor(e.target.value)}
            required
          />
        </div>
        {/* Star rating selector */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-vt323 text-terminal-green/70">Your rating:</span>
          {[1,2,3,4,5].map(star => (
            <button
              type="button"
              key={star}
              className={`text-2xl ${rating && rating >= star ? 'text-terminal-green' : 'text-terminal-green/30'}`}
              onClick={() => setRating(star)}
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              ★
            </button>
          ))}
        </div>
        <textarea
          className="bg-transparent border border-terminal-green/40 rounded px-3 py-2 text-terminal-green placeholder-terminal-green/60 font-vt323 w-full mb-2"
          placeholder="Add a comment..."
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={3}
          required
        />
        <button
          type="submit"
          className="bg-terminal-green text-terminal-black font-vt323 px-4 py-1 rounded hover-glow transition-colors border border-terminal-green/60 mt-2 text-sm w-auto"
          disabled={loading || rating == null}
        >
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
      </form>
      <div>
        {comments.length === 0 ? (
          <div className="text-terminal-green/40 font-vt323 text-sm">No comments yet. Be the first!</div>
        ) : (
          <ul className="space-y-4">
            {comments.map(comment => (
              <li key={comment.id} className="border border-terminal-green/20 rounded p-4 bg-terminal-black/60">
                <div className="flex items-center mb-1">
                  <span className="font-vt323 text-terminal-green text-base mr-2">{comment.author}</span>
                  <span className="text-terminal-green/40 text-xs mr-2">{new Date(comment.createdAt).toLocaleString()}</span>
                  {/* Show rating if present */}
                  {comment.rating && (
                    <span className="ml-2 text-terminal-green/80 text-lg">
                      {[1,2,3,4,5].map(star => (
                        <span key={star}>
                          {comment.rating >= star ? '★' : '☆'}
                        </span>
                      ))}
                    </span>
                  )}
                </div>
                <div className="text-terminal-green/80 font-vt323 text-sm whitespace-pre-line">{comment.content}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}; 