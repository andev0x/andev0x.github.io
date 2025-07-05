import React, { useState, useEffect } from 'react';
import { fetchRatings, postRating } from '../utils/api';

interface StarRatingProps {
  postId: string;
}

export const StarRating: React.FC<StarRatingProps> = ({ postId }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Fetch ratings on component mount
  useEffect(() => {
    const loadRatings = async () => {
      try {
        const ratings = await fetchRatings(postId);
        if (ratings.average !== undefined) {
          setAverageRating(ratings.average);
        }
        if (ratings.total !== undefined) {
          setTotalRatings(ratings.total);
        }
      } catch (err) {
        console.error('Error loading ratings:', err);
      }
    };

    loadRatings();
  }, [postId]);

  const handleClick = async (value: number) => {
    try {
      setError(null);
      
      await postRating(postId, { value });
      setSelected(value);
      
      // Refresh ratings after posting
      const ratings = await fetchRatings(postId);
      if (ratings.average !== undefined) {
        setAverageRating(ratings.average);
      }
      if (ratings.total !== undefined) {
        setTotalRatings(ratings.total);
      }
    } catch (err) {
      setError('Failed to submit rating');
      console.error('Error posting rating:', err);
    }
  };

  return (
    <div className="space-y-2">
      {error && (
        <div className="p-2 bg-red-900/20 border border-red-500/40 rounded text-red-400 font-vt323 text-sm">
          {error}
        </div>
      )}
      <div className="flex items-center space-x-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`text-2xl transition-colors ${
            (hovered ?? selected ?? 0) >= star
              ? 'text-terminal-green'
              : 'text-terminal-green/30'
          }`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => handleClick(star)}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
      {typeof selected === 'number' && (
        <span className="ml-2 text-terminal-green/70 text-sm font-vt323">You rated {selected}/5</span>
      )}
      </div>
      {totalRatings > 0 && (
        <div className="text-terminal-green/60 text-sm font-vt323">
          Average: {averageRating.toFixed(1)}/5 ({totalRatings} rating{totalRatings !== 1 ? 's' : ''})
        </div>
      )}
    </div>
  );
}; 