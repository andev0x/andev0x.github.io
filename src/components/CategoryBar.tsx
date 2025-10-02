import React from 'react';
import { blogPosts } from '../data/posts';

interface CategoryBarProps {
  onSelectCategory: (category: string | null) => void;
  activeCategory: string | null;
}

const CategoryBar: React.FC<CategoryBarProps> = ({ onSelectCategory, activeCategory }) => {
  const allCategories = blogPosts.flatMap(post => post.categories);
  const categoryCounts = allCategories.reduce((acc, category) => {
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryCounts).sort(([catA], [catB]) => catA.localeCompare(catB));

  return (
    <div className="category-bar flex flex-wrap justify-center gap-2 p-4 mb-6">
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-4 py-2 rounded-full text-lg font-vt323 transition-colors duration-200 border border-terminal-green
          ${activeCategory === null ? 'bg-terminal-green text-black' : 'bg-transparent text-terminal-green hover:bg-terminal-green/20'}`}
      >
        All ({blogPosts.length})
      </button>
      {sortedCategories.map(([category, count]) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`px-4 py-2 rounded-full text-lg font-vt323 transition-colors duration-200 border border-terminal-green
            ${activeCategory === category ? 'bg-terminal-green text-black' : 'bg-transparent text-terminal-green hover:bg-terminal-green/20'}`}
        >
          {category} ({count})
        </button>
      ))}
    </div>
  );
};

export default CategoryBar;
