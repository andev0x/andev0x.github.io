import type { PostMeta, SearchResult } from '../types';

/**
 * Fuzzy search over post *metadata*.
 *
 * This replaces `fuse.js`. Fuse builds a bitap index of every document and
 * every key, keeps it alive for the lifetime of the page, and ships ~12 kB of
 * machinery to do it. The corpus here is a few dozen posts of front matter,
 * so the index cost more than the searching it enabled.
 *
 * The scoring below is the same model Fuse uses, so the results a reader gets
 * are the results they got before:
 *
 *  - a query matches a field when the field contains the query with at most
 *    `threshold * query.length` edits (substitutions, insertions, deletions);
 *  - the field's score is `edits / query.length`, so fewer edits rank higher;
 *  - the field's score is raised to the power `weight * norm`, where `norm`
 *    discounts long fields (a match in a long excerpt counts for less than
 *    the same match in a short title);
 *  - a post's score is the product over the fields that matched, and the
 *    posts are ordered by it.
 *
 * Matching is an approximate *substring* match, not a loose subsequence: the
 * query has to appear in the field, near enough. A subsequence match would
 * find "docker" scattered across a paragraph, which is noise rather than a
 * result.
 */

/**
 * Field weights, in units of "one perfect match on a title".
 *
 * A title hit is worth more than a tag hit, a tag hit more than an excerpt
 * hit, and a category hit least — the same ranking the old index used.
 */
const WEIGHTS = {
  title: 3,
  tags: 2,
  excerpt: 1.5,
  categories: 1,
} as const;

/** How many edits a match may cost, as a fraction of the query length. */
const THRESHOLD = 0.32;

/** Shortest run that counts as a match. A one-character query matches nothing. */
const MIN_MATCH_LENGTH = 2;

/** One searchable string of a post, with the weight and norm it is scored by. */
interface Field {
  /** Lowercased. */
  value: string;
  /** Field-length discount: the shorter the field, the closer to 1. */
  norm: number;
  weight: number;
}

interface IndexedPost {
  post: PostMeta;
  fields: Field[];
}

/**
 * The field-length discount, `1 / sqrt(tokens)`, rounded to three decimals.
 *
 * A title of six words scores at ~0.41, an excerpt of thirty at ~0.18, so the
 * same number of edits is worth less in the long field.
 */
const fieldNorm = (value: string): number => {
  const tokens = value.split(' ').filter(Boolean).length;
  if (tokens === 0) return 0;
  const norm = 1 / Math.pow(tokens, 0.5);
  return Math.round(norm * 1000) / 1000;
};

/**
 * Lowercased copies of the searchable fields.
 *
 * Built once per corpus and kept: lowercasing 24 posts on every keystroke
 * would allocate more than the search itself.
 */
export const buildIndex = (posts: PostMeta[]): IndexedPost[] =>
  posts.map((post) => {
    const fields: Field[] = [];

    const add = (value: string, weight: number): void => {
      if (!value.trim()) return;
      fields.push({ value: value.toLowerCase(), norm: fieldNorm(value), weight });
    };
    add(post.title, WEIGHTS.title);
    add(post.excerpt, WEIGHTS.excerpt);
    // Tags and categories are lists: each entry is scored on its own, so a
    // match in one tag is not diluted by the length of the others.
    for (const tag of post.tags) add(tag, WEIGHTS.tags);
    for (const category of post.categories) add(category, WEIGHTS.categories);

    return { post, fields };
  });

/**
 * Scratch buffers for the edit-distance rows.
 *
 * Reused across every field and every keystroke: allocating two arrays per
 * field per keystroke is exactly the kind of churn the old index avoided.
 */
let previousRow: number[] = [];
let currentRow: number[] = [];

/**
 * Smallest number of edits that turns some substring of `text` into
 * `pattern`, or `Infinity` when that costs more than `maxDistance`.
 *
 * `previousRow[j]` holds the best cost of matching the pattern so far
 * against a substring of the text that ends at `j`.
 */
const editDistance = (text: string, pattern: string, maxDistance: number): number => {
  const patternLength = pattern.length;
  const textLength = text.length;
  if (patternLength === 0) return 0;
  if (textLength === 0) return patternLength;

  if (previousRow.length < textLength + 1) {
    previousRow = new Array<number>(textLength + 1).fill(0);
    currentRow = new Array<number>(textLength + 1).fill(0);
  }

  // Row 0: the empty pattern matches an empty substring anywhere, for free.
  previousRow.fill(0, 0, textLength + 1);

  for (let i = 1; i <= patternLength; i++) {
    currentRow[0] = i;
    // The best cost in this row is never below the best cost of the row
    // before it, so once it passes the budget no later row can recover.
    let best = i;
    const expected = pattern[i - 1];

    for (let j = 1; j <= textLength; j++) {
      const cost =
        expected === text[j - 1]
          ? 0
          : 1;
      const value = Math.min(
        previousRow[j] + 1, // drop a pattern character
        currentRow[j - 1] + 1, // skip a text character
        previousRow[j - 1] + cost, // match or substitute
      );
      currentRow[j] = value;
      if (value < best) best = value;
    }

    if (best > maxDistance) return Infinity;

    const swap = previousRow;
    previousRow = currentRow;
    currentRow = swap;
  }

  let best = Infinity;
  for (let j = 0; j <= textLength; j++) {
    if (previousRow[j] < best) best = previousRow[j];
  }
  return best;
};

/**
 * The score of `pattern` against one field, or `null` when it does not match.
 *
 * Three cases, in the order the old index distinguished them:
 *
 *  - the field *is* the query: an exact match, scored 0;
 *  - the field *contains* the query: still an exact match as far as the
 *    reader is concerned, but scored 0.001 so that a whole-field hit still
 *    outranks a hit inside a long field;
 *  - the field is close to the query: scored by the number of edits.
 */
const fieldScore = (value: string, pattern: string, maxDistance: number): number | null => {
  if (value === pattern) return 0;

  // A one-character query cannot be a match on its own: the run it would
  // produce is too short to count.
  if (pattern.length < MIN_MATCH_LENGTH) return null;

  const distance = value.includes(pattern) ? 0 : editDistance(value, pattern, maxDistance);
  if (distance > maxDistance) return null;

  return Math.max(0.001, distance / pattern.length);
};

/**
 * Posts matching `query`, best first.
 *
 * With no query, the corpus comes back in its own order.
 */
export const searchPosts = (index: IndexedPost[], query: string): SearchResult[] => {
  const pattern = query.trim().toLowerCase();
  if (!pattern) return index.map((entry) => ({ item: entry.post }));

  const maxDistance = Math.floor(THRESHOLD * pattern.length);

  const scored: SearchResult[] = [];
  for (const entry of index) {
    let score = 1;
    let matched = false;

    for (const field of entry.fields) {
      const value = fieldScore(field.value, pattern, maxDistance);
      if (value === null) continue;

      matched = true;
      // A whole-field hit is worth more than any fuzzy one, by a wide margin.
      const base = value === 0 ? Number.EPSILON : value;
      score *= Math.pow(base, field.weight * field.norm);
    }

    if (matched) scored.push({ item: entry.post, score });
  }

  // Lower is better. `Array.prototype.sort` is stable, so posts with the same
  // score keep the manifest order (newest first) instead of shuffling between
  // keystrokes.
  scored.sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
  return scored;
};
