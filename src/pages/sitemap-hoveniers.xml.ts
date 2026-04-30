import type { APIRoute } from 'astro'

// Sitemap voor alle hovenier-profielpagina's. Endpoint-route i.p.v. .astro
// zodat we een correcte `Content-Type: application/xml` header kunnen zetten;
// de `.astro`-variant werd anders door Astro's HTML-pipeline gerenderd
// (wat XML escape en `text/html` opleverde — onbruikbaar als sitemap).

export const prerender = true

const CONVEX_URL = import.meta.env.PUBLIC_CONVEX_URL ?? ''
const SITE_URL   = import.meta.env.SITE ?? 'https://www.tuinhub.nl'

interface BedrijvenSlugsPage {
  slugs: string[]
  continueCursor: string
  isDone: boolean
}

async function fetchAllSlugs(): Promise<string[]> {
  if (!CONVEX_URL) return []

  const slugs: string[] = []
  let cursor: string | null = null
  let isDone = false

  while (!isDone) {
    try {
      const res = await fetch(`${CONVEX_URL}/api/query`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path:   'bedrijven:getAllSlugs',
          args:   { cursor: cursor ?? undefined },
          format: 'json',
        }),
        signal: AbortSignal.timeout(10_000),
      })
      const data = await res.json() as { value: BedrijvenSlugsPage }
      slugs.push(...data.value.slugs)
      cursor = data.value.continueCursor
      isDone = data.value.isDone
    } catch {
      break
    }
  }

  return slugs
}

export const GET: APIRoute = async () => {
  const slugs = await fetchAllSlugs()

  const urls = slugs.map((slug) => `  <url>
    <loc>${SITE_URL}/hoveniers/${slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type':  'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
