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
        // Type guard: if ratings is an array, aggregate manually
        if (Array.isArray(ratings)) {
          const values = ratings.map((r: any) => r.value || r.rating || 0);
          const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
          setAverageRating(avg);
          setTotalRatings(values.length);
        } else {
          setAverageRating(ratings.average ?? 0);
          setTotalRatings(ratings.count ?? 0);
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
      if (Array.isArray(ratings)) {
        const values = ratings.map((r: any) => r.value || r.rating || 0);
        const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
        setAverageRating(avg);
        setTotalRatings(values.length);
      } else {
        setAverageRating(ratings.average ?? 0);
        setTotalRatings(ratings.count ?? 0);
      }
    } catch (err) {
      setError('Failed to submit rating');
      console.error('Error posting rating:', err);
    }
  };

  // Render average as stars
  const roundedAverage = Math.round(averageRating * 2) / 2; // for half-stars if needed

  return (
    <div className="space-y-2">
      {/* Average stars display */}
      <div className="flex items-center mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={
            roundedAverage >= star
              ? 'text-terminal-green text-2xl'
              : 'text-terminal-green/30 text-2xl'
          }>
            ★
          </span>
        ))}
        <span className="ml-2 text-terminal-green/60 font-vt323 text-base">
          {averageRating.toFixed(1)}/5
        </span>
      </div>
      {/* Error message */}
      {error && (
        <div className="p-2 bg-red-900/20 border border-red-500/40 rounded text-red-400 font-vt323 text-sm">
          {error}
        </div>
      )}
      {/* Rating buttons */}
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