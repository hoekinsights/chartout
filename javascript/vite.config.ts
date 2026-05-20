import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      // @nick/resvg tries `import("node:zlib")` at runtime to pick between
      // the native zlib decompressor and its brocha.js WASM fallback.
      // Vite's __vitePreload transform intercepts the dynamic import and
      // can't resolve "node:zlib" in a browser bundle, causing a build error.
      // We short-circuit it here so the library immediately falls through to
      // the brocha.js path, which is the correct browser-side decompressor.
      name: 'resvg-no-node-zlib',
      transform(code, id) {
        if (id.includes('nick__resvg') || id.includes('@nick/resvg')) {
          return code.replace(
            /import\(["']node:zlib["']\)/g,
            'Promise.reject(new Error("node:zlib not available in browser"))',
          );
        }
      },
    },
  ],
  // @nick/resvg uses top-level await (TLA); all three esbuild targets must be
  // set to esnext — build, dev-server transforms, and dep pre-bundling.
  build: {
    target: 'esnext',
  },
  esbuild: {
    target: 'esnext',
  },
  optimizeDeps: {
    // Exclude @nick/resvg from esbuild pre-bundling so that our transform
    // plugin above can run on it. Pre-bundled deps bypass Vite plugin
    // transforms entirely, which prevented the node:zlib replacement from
    // taking effect (the pre-bundled chunk resolved node:zlib to an empty
    // stub instead of letting the brocha.js fallback run).
    exclude: ['@nick/resvg'],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  server: {
    port: 5174,
    hmr: {
      port: 5174,
    },
  },
});
