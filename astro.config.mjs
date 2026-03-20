// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import sitemap from '@astrojs/sitemap'
import vercel from '@astrojs/vercel'
import clerk from '@clerk/astro'

// https://astro.build/config
export default defineConfig({
  // ── Deployment ──────────────────────────────────────────────────────────────
  site: 'https://www.tuinplatform.nl',
  adapter: vercel(),

  // ── Integrations ────────────────────────────────────────────────────────────
  integrations: [
    clerk(),           // Clerk auth — must be first
    react(),
    sitemap(),
  ],

  // ── Vite ────────────────────────────────────────────────────────────────────
  vite: {
    plugins: [tailwindcss()],
  },
})