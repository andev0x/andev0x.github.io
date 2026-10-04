import type { PostMeta } from '../types';

/**
 * Tag comparison key: lowercase, punctuation dropped.
 *
 * This exists because of a concrete miss in the real corpus, not as general
 * tidiness: two posts both said "open source" and matched nothing, because one
 * wrote `opensource` and the other `open-source`. Collapsing to alphanumerics
 * makes those two agree.
 *
 * Deliberately *only* case and punctuation. The obvious next step — treating
 * tags that contain one another as equal — is wrong here: `neovim`/`vim`,
 * `git`/`github`, `linux`/`arch-linux` and `developer`/`developer-tools` are
 * four pairs in the current vocabulary that are related without being
 * synonyms, and substring matching would silently fuse all of them.
 */
const tagKey = (tag: string): string => tag.toLowerCase().replace(/[^a-z0-9]+/g, '');

/**
 * Tags two posts share. Returns the *current* post's spelling, so a label shown
 * to the reader is always one they have actually seen on the page they are on.
 */
export const sharedTags = (post: PostMeta, other: PostMeta): string[] => {
  const keys = new Set(other.tags.map(tagKey));
  return post.tags.filter((tag) => keys.has(tagKey(tag)));
};

const sharedCategories = (post: PostMeta, other: PostMeta): string[] =>
  post.categories.filter((name) => other.categories.includes(name));

/** Weights, in units of "one shared tag". */
const TAG_WEIGHT = 3;
const CATEGORY_WEIGHT = 1.5;
/** How far reading times can drift before the bonus is gone, in minutes. */
const READING_SPREAD = 12;
const READING_BONUS = 0.8;
const RECENCY_BONUS = 0.7;

/**
 * Recency is scored against the whole corpus rather than "days ago", so the
 * bonus means the same thing in a blog with three posts and one with three
 * hundred — and it stays a tiebreaker-scale nudge rather than a ranking signal.
 */
const recencyRamp = (all: PostMeta[]): ((post: PostMeta) => number) => {
  const times = all.map((post) => Date.parse(post.date)).filter(Number.isFinite);
  if (times.length === 0) return () => 0;
  const oldest = Math.min(...times);
  const span = Math.max(1, Math.max(...times) - oldest);
  return (post) => {
    const at = Date.parse(post.date);
    return Number.isFinite(at) ? (at - oldest) / span : 0;
  };
};

/** Similarity of one candidate to the post being read, or null if unrelated. */
const affinity = (
  post: PostMeta,
  other: PostMeta,
  recency: (candidate: PostMeta) => number,
): number | null => {
  const tags = sharedTags(post, other).length;
  const categories = sharedCategories(post, other).length;

  // A post that shares neither a tag nor a category is not related, however
  // similar its prose reads. Returning null drops it instead of ranking it.
  if (tags === 0 && categories === 0) return null;

  const reading =
    1 - Math.min(1, Math.abs(post.readingTime - other.readingTime) / READING_SPREAD);

  return (
    tags * TAG_WEIGHT +
    categories * CATEGORY_WEIGHT +
    reading * READING_BONUS +
    recency(other) * RECENCY_BONUS
  );
};

/**
 * Penalty applied per tag that a candidate shares with something already picked.
 *
 * Set to exactly one tag's worth of signal: a suggestion that repeats a tag the
 * previous suggestion already showed is worth one genuine shared tag less. That
 * makes it a tiebreaker between close candidates rather than a thumb on the
 * scale — on the current corpus it changes 4 of 11 pick sets and removes 2 of 9
 * near-duplicate pairs, which is the point: three picks on the same topic is one
 * pick and two filler rows.
 */
const REDUNDANCY_PENALTY = TAG_WEIGHT;

export interface Recommendation {
  post: PostMeta;
  /** How this post qualified, so the UI can state a reason instead of implying one. */
  reason:
    | { kind: 'tag'; tags: string[] }
    | { kind: 'category'; categories: string[] };
}

/** Why `other` is being recommended for `post`. Callers rely on this being total. */
export const reasonFor = (post: PostMeta, other: PostMeta): Recommendation['reason'] => {
  const tags = sharedTags(post, other);
  if (tags.length > 0) return { kind: 'tag', tags };
  return { kind: 'category', categories: sharedCategories(post, other) };
};

/**
 * Posts related to `post`, strongest first, each with the reason it qualified.
 *
 * Deliberately not Fuse. The signal available here is metadata the post already
 * declares about itself, so an exact overlap beats a fuzzy title score — and the
 * result stays deterministic, where a Fuse index reshuffles as the corpus grows.
 *
 * Two signals were measured against the real corpus and rejected rather than
 * added on instinct:
 *
 *  - Normalising tag overlap (Jaccard) to stop posts with many tags winning by
 *    volume changed the ordering of 0 of 990 candidate pairs. It is
 *    unmeasurable here, so it is not here.
 *  - Matching on title/excerpt words actively hurt: the overlapping terms were
 *    `code`, `guide`, `control` and `understanding`, which link unrelated posts.
 *    Tags are doing this job properly; prose matching would only add noise.
 *
 * Selection is greedy rather than a plain sort: each pick is scored against what
 * is already on screen and discounted for repeating it, so a set of three is
 * three different articles instead of the single best match plus two of its
 * neighbours.
 */
export const relatedPosts = (
  post: PostMeta,
  all: PostMeta[],
  limit = 3,
): Recommendation[] => {
  const recency = recencyRamp(all);

  const pool = all
    .filter((other) => other.id !== post.id)
    .map((other) => ({ other, affinity: affinity(post, other, recency) }))
    .filter((entry): entry is { other: PostMeta; affinity: number } => entry.affinity !== null);

  const picked: PostMeta[] = [];

  while (picked.length < limit && pool.length > 0) {
    let bestIndex = 0;
    let bestScore = -Infinity;

    for (let i = 0; i < pool.length; i++) {
      const candidate = pool[i];
      const repeated = picked.reduce(
        (worst, chosen) => Math.max(worst, sharedTags(chosen, candidate.other).length),
        0,
      );
      const score = candidate.affinity - repeated * REDUNDANCY_PENALTY;
      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    const [chosen] = pool.splice(bestIndex, 1);
    picked.push(chosen.other);
  }

  // Re-sort for display so the strongest recommendation leads, even though
  // selection order was decided by the greedy pass.
  return picked
    .map((other) => ({ post: other, reason: reasonFor(post, other) }))
    .sort((a, b) => affinity(post, b.post, recency)! - affinity(post, a.post, recency)!);
};