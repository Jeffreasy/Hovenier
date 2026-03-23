import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

// ── Batch seed (aangeroepen door seed_bedrijven.mjs) ──────────────────────────

export const seedBatch = mutation({
  args: {
    bedrijven: v.array(
      v.object({
        naam:           v.string(),
        straat:         v.optional(v.string()),
        stad:           v.optional(v.string()),
        provincie:      v.optional(v.string()),
        website:        v.optional(v.string()),
        telefoon:       v.optional(v.string()),
        googleMapsUrl:  v.string(),
        googleScore:    v.optional(v.float64()),
        aantalReviews:  v.optional(v.number()),
        categorieen:    v.array(v.string()),
        hoofdCategorie: v.optional(v.string()),
        googlePlaceId:  v.optional(v.string()),
        slug:           v.string(),
        specialisaties: v.array(v.string()),
        isActief:       v.boolean(),
        importedAt:     v.number(),
        postcode:       v.optional(v.string()),
        lat:            v.optional(v.float64()),
        lng:            v.optional(v.float64()),
        beschrijving:   v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const bedrijf of args.bedrijven) {
      // Deduplicatie op googlePlaceId
      if (bedrijf.googlePlaceId) {
        const bestaand = await ctx.db
          .query('bedrijven')
          .withIndex('by_googlePlaceId', (q) =>
            q.eq('googlePlaceId', bedrijf.googlePlaceId)
          )
          .first()
        if (bestaand) continue
      }

      await ctx.db.insert('bedrijven', {
        naam:           bedrijf.naam,
        straat:         bedrijf.straat,
        stad:           bedrijf.stad,
        provincie:      bedrijf.provincie,
        website:        bedrijf.website,
        telefoon:       bedrijf.telefoon,
        googleMapsUrl:  bedrijf.googleMapsUrl,
        googleScore:    bedrijf.googleScore,
        aantalReviews:  bedrijf.aantalReviews,
        categorieen:    bedrijf.categorieen,
        hoofdCategorie: bedrijf.hoofdCategorie,
        googlePlaceId:  bedrijf.googlePlaceId,
        slug:           bedrijf.slug,
        specialisaties: bedrijf.specialisaties,
        isActief:       bedrijf.isActief,
        importedAt:     bedrijf.importedAt,
        postcode:       bedrijf.postcode,
        lat:            bedrijf.lat,
        lng:            bedrijf.lng,
        beschrijving:   bedrijf.beschrijving,
      })
    }
  },
})

// ── Bedrijven per stad ophalen (voor lokale landingspagina's) ─────────────────

export const getByStad = query({
  args: {
    stad:  v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { stad, limit }) => {
    const q = ctx.db
      .query('bedrijven')
      .withIndex('by_stad', (q) => q.eq('stad', stad))
      .filter((q) => q.eq(q.field('isActief'), true))
      .order('desc')

    return limit ? await q.take(limit) : await q.collect()
  },
})

// ── Bedrijven per provincie ophalen ───────────────────────────────────────────

export const getByProvincie = query({
  args: {
    provincie: v.string(),
    limit:     v.optional(v.number()),
  },
  handler: async (ctx, { provincie, limit }) => {
    const q = ctx.db
      .query('bedrijven')
      .withIndex('by_provincie', (q) => q.eq('provincie', provincie))
      .filter((q) => q.eq(q.field('isActief'), true))

    return limit ? await q.take(limit) : await q.collect()
  },
})

// ── Bedrijf ophalen op slug (voor toekomstige profielpagina's) ────────────────

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return ctx.db
      .query('bedrijven')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .first()
  },
})

// ── Totaal aantal bedrijven per stad (voor aantalHoveniers op stadspagina's) ──

export const countByStad = query({
  args: { stad: v.string() },
  handler: async (ctx, { stad }) => {
    const results = await ctx.db
      .query('bedrijven')
      .withIndex('by_stad', (q) => q.eq('stad', stad))
      .filter((q) => q.eq(q.field('isActief'), true))
      .collect()
    return results.length
  },
})
