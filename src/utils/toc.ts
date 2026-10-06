export interface TocEntry {
  id: string;
  text: string;
  depth: number;
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
 * Extract h2–h4 headings from raw Markdown. h1 is the post title itself, so
 * it is excluded from the returned entries — but it still participates in
 * dedup counting so suffixes match `Markdown`, which slugs every level into
 * one shared scope (`overview`, `overview-1`, …).
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

  for (const line of lines) {
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

    const id = uniqueSlug(base, seen);
    if (depth < 2) continue;

    entries.push({ id, text, depth });
  }

  return entries;
};
