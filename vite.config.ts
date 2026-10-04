import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { postsPlugin } from './build/postsPlugin';

export default defineConfig({
  plugins: [react(), postsPlugin()],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        // Keep React in its own long-lived chunk so content changes do not
        // invalidate the framework bundle.
        manualChunks(id) {
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'react-vendor';
          }
          return undefined;
        },
      },
    },
  },
});
