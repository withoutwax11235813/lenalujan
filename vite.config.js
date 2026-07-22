import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Manual PWA setup (manifest.json + public/sw.js) instead of an
// auto-generating plugin, so caching behavior stays explicit and
// easy to debug -- same approach used across the rest of the stack.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 }
});
