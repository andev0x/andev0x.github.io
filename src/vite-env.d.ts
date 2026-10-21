/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Formspree form id backing the contact form. See `ContactDialog`. */
  readonly VITE_FORMSPREE_ID?: string;

  /** Giscus / GitHub Discussions configuration. See `Comments.tsx`. */
  readonly VITE_GISCUS_REPO?: string;
  readonly VITE_GISCUS_REPO_ID?: string;
  readonly VITE_GISCUS_CATEGORY?: string;
  readonly VITE_GISCUS_CATEGORY_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'virtual:posts-manifest' {
  import type { PostMeta } from './types';

  export const posts: PostMeta[];
  export function loadPostContent(id: string): Promise<string>;
  export default posts;
}
