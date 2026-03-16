import React, { useState } from 'react';
import { blogPosts } from '../data/posts';

interface CategoryBarProps {
  onSelectCategory: (category: string | null) => void;
  activeCategory: string | null;
  isOpen?: boolean;
  onToggle?: () => void;
}

const CategoryBar: React.FC<CategoryBarProps> = ({
  onSelectCategory,
  activeCategory,
  isOpen: controlledOpen,
  onToggle,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);

  // Support both controlled (from App via keyboard) and uncontrolled (click only)
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const handleToggle = onToggle ?? (() => setInternalOpen(o => !o));

  const allCategories = blogPosts.flatMap(post => post.categories);
  const categoryCounts = allCategories.reduce((acc, category) => {
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryCounts).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  const handleSelect = (category: string | null) => {
    onSelectCategory(category);
    // Collapse after selecting a category
    if (onToggle) {
      if (isOpen) onToggle();
    } else {
      setInternalOpen(false);
    }
  };

  return (
    <div className="border-b border-terminal-green/20">
      {/* Toggle bar */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-2">
          {/* Left: active filter breadcrumb */}
          <span className="terminal-accent text-terminal-green/50 text-xs tracking-widest">
            {activeCategory ? `cat: ${activeCategory}` : 'cat: all'}
          </span>

          {/* Right: hamburger button */}
          <button
            onClick={handleToggle}
            aria-label={isOpen ? 'Hide categories' : 'Show categories'}
            aria-expanded={isOpen}
            className="flex flex-col justify-center items-center gap-[5px] w-8 h-8 text-terminal-green hover-glow transition-colors group focus:outline-none"
          >
            {/* Three-line icon that morphs to X when open */}
            <span
              className={`block h-[2px] bg-terminal-green transition-all duration-200 origin-center
                ${isOpen ? 'w-5 rotate-45 translate-y-[7px]' : 'w-5'}`}
            />
            <span
              className={`block h-[2px] bg-terminal-green transition-all duration-200
                ${isOpen ? 'w-0 opacity-0' : 'w-5'}`}
            />
            <span
              className={`block h-[2px] bg-terminal-green transition-all duration-200 origin-center
                ${isOpen ? 'w-5 -rotate-45 -translate-y-[7px]' : 'w-5'}`}
            />
          </button>
        </div>
      </div>

      {/* Collapsible category panel */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out
          ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="container mx-auto px-4 pb-4 pt-1">
          {/* Prompt-style header */}
          <div className="terminal-accent text-terminal-green/40 text-xs mb-3 tracking-widest">
            -- CATEGORIES --
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSelect(null)}
              className={`px-4 py-1 font-vt323 text-lg border transition-colors duration-150
                ${activeCategory === null
                  ? 'border-terminal-green bg-terminal-green text-black'
                  : 'border-terminal-green/50 text-terminal-green hover:border-terminal-green hover:bg-terminal-green/10'
                }`}
            >
              all ({blogPosts.length})
            </button>

            {sortedCategories.map(([category, count]) => (
              <button
                key={category}
                onClick={() => handleSelect(category)}
                className={`px-4 py-1 font-vt323 text-lg border transition-colors duration-150
                  ${activeCategory === category
                    ? 'border-terminal-green bg-terminal-green text-black'
                    : 'border-terminal-green/50 text-terminal-green hover:border-terminal-green hover:bg-terminal-green/10'
                  }`}
              >
                {category} ({count})
              </button>
            ))}
          </div>

          {/* Keyboard hint */}
          <div className="terminal-accent text-terminal-green/30 text-xs mt-3">
            [c] toggle &nbsp; [Enter] select &nbsp; [Esc] close
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;
