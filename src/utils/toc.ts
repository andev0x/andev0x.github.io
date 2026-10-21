export interface TocEntry {
  id: string;
  text: string;
  depth: number;
  /**
   * 1-based line of the heading in the source markdown.
   *
   * The renderer looks the anchor id up by this line, so the id on the
   * heading and the id in the table of contents come from the same entry and
   * cannot drift apart.
   */
  line: number;
}

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * Strip inline Markdown formatting so a heading like
 * `## Fix the \`auth\` flow` yields plain text `Fix the auth flow`.
 */
const stripFormatting = (value: string): string =>
  value
    .replace(/`/g, '')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_~]{1,3}([^ *_~]+)[*_~]{1,3}/g, '$1')
    .replace(/<[^>]+>/g, '')
    .trim();

/**
 * Assign unique slugs within one document: the second `overview` becomes
 * `overview-1`, the third `overview-2`, and so on. Shared with `Markdown`
 * so TOC links always match the rendered heading ids.
 */
export const uniqueSlug = (base: string, seen: Map<string, number>): string => {
  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);
  return count === 0 ? base : `${base}-${count}`;
};

/**
 * Extract the headings from raw Markdown, in document order.
 *
 * h1 is the post title itself, so the table of contents leaves it out — but it
 * still participates in dedup counting, so suffixes match the rendered
 * headings (`overview`, `overview-1`, …).
 *
 * This is the single source of truth for anchor ids: the table of contents
 * renders these entries, and the Markdown renderer looks the same ids up by
 * line number. Deriving the ids in one place is what keeps a TOC link from
 * pointing at an id that is not on the page — a class of bug that a
 * render-order slugger cannot avoid, because the order it sees depends on
 * whether React re-renders the tree or starts from scratch.
 *
 * Fenced code blocks are tracked with CommonMark rules (backtick *and* tilde
 * fences, info strings, closing fence must be the same character, at least as
 * long as the opener, with nothing but whitespace after it) so `# comment`
 * lines inside examples never leak into the TOC. A naive "toggle on every
 * ``` line" breaks on nested fences — e.g. a ```bash block shown *inside* a
 * ```markdown example — and every heading after that point gets the wrong id,
 * which is exactly a TOC entry that goes nowhere when clicked.
 */
export const extractHeadings = (content: string): TocEntry[] => {
  const entries: TocEntry[] = [];
  const seen = new Map<string, number>();
  const lines = content.split('\n');
  let fenceChar = '';
  let fenceLen = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fence = /^( {0,3})(`{3,}|~{3,})(.*)$/.exec(line);
    if (fence) {
      const run = fence[2];
      const rest = fence[3];
      const char = run[0];
      if (!fenceChar) {
        // Opening fence. A backtick info string must not contain backticks —
        // such a line is plain content, not a fence.
        if (!(char === '`' && rest.includes('`'))) {
          fenceChar = char;
          fenceLen = run.length;
        }
      } else if (char === fenceChar && run.length >= fenceLen && /^\s*$/.test(rest)) {
        fenceChar = '';
        fenceLen = 0;
      }
      continue;
    }
    if (fenceChar) continue;

    const match = /^( {0,3})(#{1,4})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;

    const depth = match[2].length;
    const text = stripFormatting(match[3]);
    if (!text) continue;

    const base = slugify(text);
    if (!base) continue;

    entries.push({ id: uniqueSlug(base, seen), text, depth, line: i + 1 });
  }

  return entries;
};

/**
 * The table of contents itself: everything below the post title.
 */
export const tableOfContents = (headings: TocEntry[]): TocEntry[] =>
  headings.filter((entry) => entry.depth >= 2);
