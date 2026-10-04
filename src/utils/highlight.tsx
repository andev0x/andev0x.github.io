import type React from 'react';

/**
 * Highlight the search terms in a field.
 *
 * Highlighting is deliberately *exact* rather than reusing Fuse's fuzzy match
 * ranges: bitap reports scattered low-confidence fragments for a long query
 * ("Un", "erst", "ent" for "kubernetes"), which shredded the title. Fuse is
 * still what decides ranking and recall — the marks only confirm to the reader
 * where the literal term sits. Multi-word queries highlight each word, which is
 * what people expect.
 *
 * Shared by `PostCard` and the search popup so both mark a hit identically.
 */
export const highlight = (text: string, query: string): React.ReactNode => {
  const terms = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length >= 2);
  if (terms.length === 0) return text;

  const haystack = text.toLowerCase();
  const ranges: Array<[number, number]> = [];

  for (const term of terms) {
    let from = haystack.indexOf(term);
    while (from !== -1) {
      ranges.push([from, from + term.length - 1]);
      from = haystack.indexOf(term, from + term.length);
    }
  }
  if (ranges.length === 0) return text;

  ranges.sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [];
  for (const [start, end] of ranges) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  merged.forEach(([start, end], i) => {
    if (start > cursor) parts.push(text.slice(cursor, start));
    parts.push(
      <mark
        key={`${start}-${i}`}
        className="rounded-[2px] bg-accent/25 px-0.5 text-fg [box-shadow:inset_0_-1px_0_rgb(var(--c-accent)/0.5)]"
      >
        {text.slice(start, end + 1)}
      </mark>,
    );
    cursor = end + 1;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));

  return parts;
};