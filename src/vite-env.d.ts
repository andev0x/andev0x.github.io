/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Formspree form id backing the contact form. See `ContactSection`. */
  readonly VITE_FORMSPREE_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'virtual:posts-manifest' {
  import type { PostMeta } from './types';

  export const posts: PostMeta[];
  export const loaders: Record<string, () => Promise<string>>;
  export function loadPostContent(id: string): Promise<string>;
  export default posts;
}
