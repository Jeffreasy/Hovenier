// @ts-check
import { defineConfig, passthroughImageService } from 'astro/config'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import sitemap from '@astrojs/sitemap'
import vercel from '@astrojs/vercel'
import clerk from '@clerk/astro'

// https://astro.build/config
export default defineConfig({
  // ── Deployment ──────────────────────────────────────────────────────────────
  site: 'https://www.tuinplatform.nl',
  output: 'server',
  adapter: vercel({
    webAnalytics:   { enabled: true },   // Gratis Vercel Analytics
    imageService:   true,                // Vercel Image Optimization (v3 API)
    isr: {
      // Blog, steden en FAQ: 1 uur cache (ISR), homepage: 30 min
      expiration: 3600,
    },
  }),

  // ── Image service ───────────────────────────────────────────────────────────
  image: {
    service: passthroughImageService(),  // Vercel doet image-resizing via CDN
  },

  // ── Build ───────────────────────────────────────────────────────────────────
  compressHTML: true,

  // ── Integrations ────────────────────────────────────────────────────────────
  integrations: [
    clerk({
      signInUrl:  '/inloggen',
      signUpUrl:  '/registreren',
    }),           // Clerk auth — must be first
    react(),
    sitemap(),
  ],

  // ── Vite ────────────────────────────────────────────────────────────────────
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Convex in eigen chunk — grote library, zelden veranderd
            if (id.includes('node_modules/convex')) return 'convex'
            // React ecosystem in eigen chunk
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'react'
            // Clerk auth in eigen chunk
            if (id.includes('node_modules/@clerk')) return 'clerk'
          },
        },
      },
      // Verhoog chunk warning threshold (Convex is groot)
      chunkSizeWarningLimit: 600,
    },
  },
})