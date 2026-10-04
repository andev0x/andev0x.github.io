/** Front-matter only. The markdown body is fetched separately, on demand. */
export interface PostMeta {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** ISO date string from front matter. */
  date: string;
  tags: string[];
  categories: string[];
  readingTime: number;
  featured: boolean;
}

/** A post whose markdown body has been loaded. */
export interface Post extends PostMeta {
  content: string;
}

/**
 * A search hit. Deliberately carries no fuzzy match ranges — highlighting is
 * done from the raw query (see `PostCard`), so Fuse never has to compute them.
 */
export interface SearchResult {
  item: PostMeta;
  score?: number;
}

export interface CategoryCount {
  name: string;
  count: number;
}

export type Theme = 'light' | 'dark';

export interface Comment {
  id: string;
  postId: string;
  author: string;
  content: string;
  createdAt: string;
  rating?: number;
}
