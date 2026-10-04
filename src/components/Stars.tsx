import React from 'react';

interface StarInputProps {
  value: number | null;
  onChange: (value: number) => void;
  size?: number;
  idPrefix?: string;
}

const Star: React.FC<{ filled: boolean; size: number }> = ({ filled, size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    aria-hidden="true"
    className={filled ? 'text-accent' : 'text-border-strong'}
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path d="M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.5L12 17.5l-5.8 3.05 1.1-6.5-4.7-4.6 6.5-.95z" />
  </svg>
);

/** Shared star control: used both for picking a rating and showing one. */
export const StarInput: React.FC<StarInputProps> = ({ value, onChange, size = 20, idPrefix }) => {
  return (
    <div className="flex items-center gap-0.5" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const selected = value !== null && star <= value;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            id={idPrefix ? `${idPrefix}-${star}` : undefined}
            onClick={() => onChange(star)}
            onMouseEnter={(event) => event.currentTarget.focus()}
            className="rounded p-0.5 transition-transform duration-150 hover:scale-110 focus-visible:outline-none"
          >
            <Star filled={selected} size={size} />
          </button>
        );
      })}
    </div>
  );
};

/** Read-only star display. */
export const Stars: React.FC<{ value: number; size?: number }> = ({ value, size = 14 }) => (
  <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Star key={star} filled={star <= value} size={size} />
    ))}
  </span>
);
