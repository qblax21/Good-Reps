import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// BASE_PATH lets the same build run at "/" (Vercel/Netlify) or "/repo-name/" (GitHub Pages).
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  // Shown in feedback notes so a report can be matched to the exact build.
  define: { __APP_VERSION__: JSON.stringify(process.env.GITHUB_SHA?.slice(0, 7) ?? 'dev') },
  build: { chunkSizeWarningLimit: 900 }, // one bundle is fine: it is precached for offline use
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // We write our own service worker (src/sw.ts) so it can also handle push notifications.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      injectRegister: false, // registered manually in src/lib/pwa.ts
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,webmanifest,json}'],
        // Splash screens are only used at launch by iOS; no need to precache them.
        globIgnores: ['splash/**'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      manifest: {
        // Name/colours mirror src/theme/config.ts — keep them in sync when re-skinning.
        name: 'Good Reps',
        short_name: 'Good Reps',
        description: 'A cheerful little workout buddy.',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#FFF9EC',
        theme_color: '#FFF9EC',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
});
