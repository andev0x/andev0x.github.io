import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { postsPlugin } from './build/postsPlugin';
import { githubPagesPlugin } from './build/githubPagesPlugin';

/**
 * Split the dependencies that dominate the bundle into their own long-lived
 * chunks. Content changes then invalidate only the small app/post chunks while
 * React, the markdown pipeline and Prism stay cached in the browser.
 */
const vendorChunk = (id: string): string | undefined => {
  const path = id.replace(/\\/g, '/');

  // Vite's runtime preload helper and Rollup's CommonJS interop helpers are
  // shared by every dynamic import. Leave them out of the content chunks below,
  // otherwise the entry reaches a vendor chunk through a helper import and the
  // browser preloads the whole markdown/Prism payload on first paint.
  if (
    path.includes('vite/preload-helper') ||
    path.includes('vite/modulepreload-polyfill') ||
    path.includes('commonjsHelpers')
  ) {
    return 'vite-helper';
  }

  if (!path.includes('/node_modules/')) return undefined;

  if (/\/node_modules\/(?:react|react-dom|scheduler)\//.test(path)) {
    return 'react-vendor';
  }

  if (
    /\/node_modules\/(?:react-markdown|remark-[^/]+|rehype-[^/]+|micromark[^/]*|mdast-[^/]+|hast-[^/]+|unified|unist-[^/]+|vfile[^/]*|devlop|bail|trough|ccount|markdown-table|longest-streak|zwitch|property-information|space-separated-tokens|comma-separated-tokens|decode-named-character-reference|character-entities[^/]*|character-reference-invalid|html-url-attributes|trim-lines|style-to-object|inline-style-parser|web-namespaces|html-void-elements|parse-entities|is-alphanumerical|is-decimal|is-hexadecimal|escape-string-regexp|extend)\//.test(
      path,
    ) ||
    /\/node_modules\/prismjs\//.test(path)
  ) {
    // Markdown and Prism share Rollup's generated interop helpers. Splitting
    // them into two manual chunks creates a circular dependency, which makes
    // the entry import (and the browser preload) both chunks on first paint.
    // One lazily-imported content chunk keeps the payload out of the initial
    // load while still separating it from app code.
    return 'content-vendor';
  }

  return undefined;
};

export default defineConfig({
  plugins: [react(), postsPlugin(), githubPagesPlugin()],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
  },
  server: {
    watch: {
      // The legacy Go backend is a nested repository, and its objects, SQLite
      // files and compiled binary are not part of the frontend graph. Watching
      // them is what drove Chokidar's memory use up in development.
      ignored: [
        '**/go-blog/**',
        '**/dist/**',
        '**/dist-dev/**',
        '**/.git/**',
        '**/node_modules/**',
        '**/*.db',
        '**/*.db-*',
        '**/*.tsbuildinfo',
        '**/.DS_Store',
      ],
    },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: vendorChunk,
        // Without this, Rollup hoists the lazily-imported content chunk into the
        // entry as a side-effect import, so GitHub Pages preloads the entire
        // markdown + Prism payload before a post is ever opened.
        hoistTransitiveImports: false,
      },
    },
  },
});
