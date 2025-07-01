import React from 'react';

interface NavigationProps {
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <nav className="bg-terminal-black/50 backdrop-blur-sm border-b border-terminal-green/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-terminal-green/60 terminal-accent">
            [CATEGORIES]
          </span>
          
          <button
            onClick={() => onCategoryChange(null)}
            className={`px-3 py-1 rounded transition-colors font-vt323 ${
              selectedCategory === null
                ? 'bg-terminal-green text-terminal-black'
                : 'text-terminal-green hover-glow border border-terminal-green/50'
            }`}
          >
            all
          </button>
          
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`px-3 py-1 rounded transition-colors font-vt323 ${
                selectedCategory === category
                  ? 'bg-terminal-green text-terminal-black'
                  : 'text-terminal-green hover-glow border border-terminal-green/50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        
        <div className="mt-2 text-terminal-green/40 terminal-accent text-xs">
          Navigation: j/k=scroll, g/G=top/bottom, /=search, esc=close
        </div>
      </div>
    </nav>
  );
};