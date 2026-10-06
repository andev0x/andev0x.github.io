import React, { useMemo, useState } from 'react';
import { ChevronDown, ListTree } from 'lucide-react';
import { extractHeadings } from '../utils/toc';
import { scrollToId } from '../utils/scroll';

interface TableOfContentsProps {
  content: string;
}

/**
 * Collapsible table of contents for the article body. Parses h2–h4 headings
 * from the raw Markdown (ids match `Markdown` via the shared slugger) and
 * renders anchor links, so readers get a quick overview of the main points.
 * Hidden when the post has fewer than two sections — a one-item TOC adds
 * chrome without orientation value.
 */
export const TableOfContents: React.FC<TableOfContentsProps> = ({ content }) => {
  const [isOpen, setIsOpen] = useState(true);

  const headings = useMemo(() => extractHeadings(content), [content]);

  if (headings.length < 2) return null;

  const panelId = 'article-toc';

  return (
    <nav
      aria-label="Table of contents"
      className="mb-8 overflow-hidden rounded-xl border border-border bg-surface"
    >
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left font-mono text-xs text-fg-muted transition-colors duration-150 hover:text-fg"
      >
        <ListTree size={14} strokeWidth={2} aria-hidden="true" className="shrink-0 text-accent" />
        <span className="flex-1">
          contents <span className="text-fg-subtle">· {headings.length}</span>
        </span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          aria-hidden="true"
          className={`shrink-0 transition-transform duration-200 ease-out ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Panel: grid-rows animation, no JS height measurement. */}
      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <ol className="border-t border-border px-4 py-3">
            {headings.map(({ id, text, depth }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={(event) => {
                    // Keep the `#/post/<id>` route intact — a native fragment
                    // jump would replace it and break share/reload/back.
                    event.preventDefault();
                    scrollToId(id);
                  }}
                  className={`block rounded px-2 py-1 font-mono text-xs leading-relaxed text-fg-muted transition-colors duration-150 hover:bg-accent/10 hover:text-fg ${
                    depth === 3 ? 'pl-6' : depth === 4 ? 'pl-10' : 'pl-2'
                  }`}
                >
                  <span aria-hidden="true" className="mr-1.5 text-accent/60">
                    {depth === 2 ? '›' : depth === 3 ? '··›' : '····›'}
                  </span>
                  {text}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </nav>
  );
};

export default TableOfContents;
