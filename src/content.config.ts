import { z, defineCollection } from 'astro:content'
import { glob, file } from 'astro/loaders'

// ─── Blog ─────────────────────────────────────────────────────────────────────

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title:       z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category:    z.enum(['tuinaanleg','onderhoud','bestrating','beplanting','schutting','kosten','tips','subsidies']),
    image:       z.string().optional(),
    imageAlt:    z.string().optional(),
    featured:    z.boolean().default(false),
    draft:       z.boolean().default(false),
  }),
})

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const faqCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/faq' }),
  schema: z.object({
    question:    z.string(),
    category:    z.string(),
    publishDate: z.coerce.date(),
    draft:       z.boolean().default(false),
  }),
})

// ─── Steden ──────────────────────────────────────────────────────────────────

const stedenCollection = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/steden' }),
  schema: z.object({
    naam:             z.string(),
    slug:             z.string(),
    regio:            z.string(),
    provincie:        z.string(),
    gemeente:         z.string(),
    prioriteit:       z.number().min(1).max(3),
    aantalHoveniers:  z.number().optional(),
    gemiddeldePrijs:  z.string().optional(),
    description:      z.string(),
  }),
})

export const collections = {
  blog:   blogCollection,
  faq:    faqCollection,
  steden: stedenCollection,
}
