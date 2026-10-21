import manifest, { loadPostContent } from 'virtual:posts-manifest';
import type { CategoryCount, PostMeta } from '../types';

/**
 * Post metadata, newest first, resolved at build time by `build/postsPlugin.ts`.
 * Only the front matter lives in the initial bundle — post bodies are separate
 * chunks (see `loadPostContent`).
 */
export const posts: PostMeta[] = manifest;

/** Lazily load the markdown body of a single post. */
export { loadPostContent };

/**
 * Look up a post by id.
 *
 * Returns `null` for a miss: a shared URL can name a post that no longer
 * exists, and that has to be distinguishable from a real result.
 */
export const findPostById = (id: string): PostMeta | null =>
  posts.find((post) => post.id === id) ?? null;

/**
 * Category -> post count, sorted by name. Computed once at module scope so it
 * costs nothing per render.
 */
export const categories: CategoryCount[] = (() => {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const category of post.categories) {
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
})();
