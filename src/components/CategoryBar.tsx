import React from 'react';
import { ChevronDown } from 'lucide-react';
import { categories, posts } from '../data/posts';

interface CategoryBarProps {
  activeCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  isOpen: boolean;
  onToggle: () => void;
  /** Counts shown next to each chip reflect the current result set. */
  resultCount: number;
  resultTotal: number;
}

const chip = (active: boolean): string =>
  [
    'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-xs',
    'transition-colors duration-150',
    active
      ? 'border-accent bg-accent text-on-accent'
      : 'border-border text-fg-muted hover:border-accent/50 hover:bg-accent/10 hover:text-fg',
  ].join(' ');

export const CategoryBar: React.FC<CategoryBarProps> = ({
  activeCategory,
  onSelectCategory,
  isOpen,
  onToggle,
  resultCount,
  resultTotal,
}) => {
  const filtered = Boolean(activeCategory);

  return (
    <div className="border-b border-border bg-canvas/60">
      <div className="container flex items-center gap-3 py-2">
        {/* Status line */}
        <p className="flex min-w-0 flex-1 items-baseline gap-2 overflow-hidden font-mono text-[0.7rem] text-fg-subtle">
          <span className="shrink-0 text-accent">cat:</span>
          <span className={`shrink-0 ${filtered ? 'text-fg' : ''}`}>
            {activeCategory ?? 'all'}
          </span>
          <span className="truncate">
            {resultCount !== resultTotal && `${resultCount}/${resultTotal}`}
          </span>
        </p>

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls="category-panel"
          aria-keyshortcuts="c"
          className="flex shrink-0 items-center gap-1.5 rounded-md border border-border px-2 py-1 font-mono text-[0.7rem] text-fg-muted transition-colors duration-150 hover:border-accent/50 hover:text-fg"
        >
          categories
          <ChevronDown
            size={13}
            strokeWidth={2}
            className={`transition-transform duration-200 ease-out ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Panel: grid-rows animation, no JS height measurement. */}
      <div
        id="category-panel"
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="container pb-3">
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => onSelectCategory(null)}
                className={chip(activeCategory === null)}
                aria-pressed={activeCategory === null}
              >
                all <span className="opacity-60">{posts.length}</span>
              </button>

              {categories.map(({ name, count }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => onSelectCategory(name)}
                  className={chip(activeCategory === name)}
                  aria-pressed={activeCategory === name}
                >
                  {name} <span className="opacity-60">{count}</span>
                </button>
              ))}
            </div>

            <p className="mt-2 font-mono text-[0.65rem] text-fg-subtle">
              <span className="kbd">c</span> toggle · <span className="kbd">Esc</span> close
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;
