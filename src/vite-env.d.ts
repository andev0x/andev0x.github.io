/// <reference types="vite/client" />

declare module 'virtual:posts-manifest' {
  import type { PostMeta } from './types';

  export const posts: PostMeta[];
  export const loaders: Record<string, () => Promise<string>>;
  export function loadPostContent(id: string): Promise<string>;
  export default posts;
}
