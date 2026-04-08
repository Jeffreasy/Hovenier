import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

// ── Stad-aliassen: normaliseert PDOK woonplaatsnamen naar Convex stad-veld ─────
const STAD_ALIASSEN: Record<string, string> = {
  "'s-gravenhage":       'Den Haag',
  "'s gravenhage":       'Den Haag',
  'den haag':            'Den Haag',
  'the hague':           'Den Haag',
  "'s-hertogenbosch":    'Den Bosch',
  "'s hertogenbosch":    'Den Bosch',
  'den bosch':           'Den Bosch',
  'hertogenbosch':       'Den Bosch',
  'zwijndrecht (zh)':    'Zwijndrecht',
  'bergen op zoom':      'Bergen op Zoom',
  'hoek van holland':    'Hoek van Holland',
}

export function normaliseerStad(naam: string): string {
  const lower = naam.toLowerCase().trim()
  return STAD_ALIASSEN[lower] ?? naam
}

// ── Uitgebreide categoriefilter — alle relevante hovenier (sub)categorieën ────
const HOVENIER_CATEGORIEEN = new Set([
  'Tuin',
  'Tuin- en landschapaannemer',
  'Tuin- en landschapsaannemer',
  'Hoveniersbedrijf',
  'Hovenier',
  'Landschapsarchitect',
  'Landschapsarchitectuurbureau',
  'Boomverzorging',
  'Boomverzorgingsdienst',
  'Boomchirurg',
  'Tuinaannemer',
  'Tuinonderhoud',
  'Tuinaanleg',
  'Tuinontwerp',
  'Gazonverzorging',
  'Gazonservice',
  'Beplanting',
  'Groenonderhoud',
  'Groenvoorziening',
  'Groenstrook',
  'Sierplanten',
  'Tuincentrum',           // sommige doen ook onderhoud
  'Tuinarchtect',
  'Schuttingbedrijf',
  'Bestrating',
  'Bestratingsbedrijf',
  'Vijvers',
  'Vijververzorging',
  'Daktuinen',
  'Buitenruimte',
  'Groendak',
  'Buitenverlichting',
  'Tuin- en landschapsarchitect',
  'Tuinman',
  'Tuinarchitect',
])

/** Straatnaam-detectie: bedrijven waarvan naam -> een adres is */
function isStraatnaam(naam: string): boolean {
  return /^[\w\s]*(weg|straat|laan|plein|dijk|kade|singel|gracht|allee|boulevard|dreef|pad|steeg|hof)\b/i.test(naam)
}

// ── Batch seed ────────────────────────────────────────────────────────────────

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
      if (bedrijf.googlePlaceId) {
        const bestaand = await ctx.db
          .query('bedrijven')
          .withIndex('by_googlePlaceId', (q) =>
            q.eq('googlePlaceId', bedrijf.googlePlaceId)
          )
          .first()
        if (bestaand) continue
      }
      await ctx.db.insert('bedrijven', bedrijf)
    }
  },
})

// ── Bedrijven per stad — gesorteerd op Google score ───────────────────────────

export const getByStad = query({
  args: {
    stad:  v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { stad, limit }) => {
    // Normaliseer stad voor aliassen
    const normStad = normaliseerStad(stad)

    const results = await ctx.db
      .query('bedrijven')
      .withIndex('by_stad', (q) => q.eq('stad', normStad))
      .filter((q) => q.eq(q.field('isActief'), true))
      .collect()

    const gefilterd = results
      .filter((b) => {
        if (isStraatnaam(b.naam)) return false
        if (!b.hoofdCategorie) return true
        return HOVENIER_CATEGORIEEN.has(b.hoofdCategorie)
      })
      .sort((a, b) => {
        const scoreDiff = (b.googleScore ?? 0) - (a.googleScore ?? 0)
        if (scoreDiff !== 0) return scoreDiff
        return (b.aantalReviews ?? 0) - (a.aantalReviews ?? 0)
      })

    return limit ? gefilterd.slice(0, limit) : gefilterd
  },
})

// ── Top bedrijven nationaal — fallback als geen stad bekend is ────────────────

export const getTopBedrijven = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit }) => {
    // Bekende grote steden als fallback (gedistribueerde representatie)
    const stedenFallback = ['Amsterdam', 'Rotterdam', 'Utrecht', 'Den Haag', 'Eindhoven', 'Groningen', 'Almere', 'Breda', 'Nijmegen', 'Tilburg', 'Haarlem', 'Arnhem']
    const perStad = 3
    const resultaten: Array<Record<string, unknown>> = []

    for (const stad of stedenFallback) {
      const docs = await ctx.db
        .query('bedrijven')
        .withIndex('by_stad', (q) => q.eq('stad', stad))
        .filter((q) => q.eq(q.field('isActief'), true))
        .take(20)

      const filtered = docs
        .filter((b) => !isStraatnaam(b.naam) && (b.googleScore ?? 0) >= 4.5)
        .sort((a, b) => (b.googleScore ?? 0) - (a.googleScore ?? 0))
        .slice(0, perStad)

      resultaten.push(...filtered)
    }

    // Sorteer alles op score
    resultaten.sort((a, b) => ((b.googleScore as number) ?? 0) - ((a.googleScore as number) ?? 0))
    return resultaten.slice(0, limit ?? 12)
  },
})

// ── Bedrijven per provincie ───────────────────────────────────────────────────

export const getByProvincie = query({
  args: {
    provincie: v.string(),
    limit:     v.optional(v.number()),
  },
  handler: async (ctx, { provincie, limit }) => {
    const results = await ctx.db
      .query('bedrijven')
      .withIndex('by_provincie', (q) => q.eq('provincie', provincie))
      .filter((q) => q.eq(q.field('isActief'), true))
      .take(limit ?? 50)

    return results.filter((b) => !isStraatnaam(b.naam))
  },
})

// ── Bedrijf ophalen op slug ───────────────────────────────────────────────────

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return ctx.db
      .query('bedrijven')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .first()
  },
})

// ── Aantal hoveniers per stad (live, voor stadspagina's) ─────────────────────

export const countByStad = query({
  args: { stad: v.string() },
  handler: async (ctx, { stad }) => {
    const normStad = normaliseerStad(stad)
    const results = await ctx.db
      .query('bedrijven')
      .withIndex('by_stad', (q) => q.eq('stad', normStad))
      .filter((q) => q.eq(q.field('isActief'), true))
      .collect()
    return results.filter((b) => !isStraatnaam(b.naam)).length
  },
})

// ── Zoeken op stad ────────────────────────────────────────────────────────────

export const zoekBedrijven = query({
  args: {
    stad:  v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { stad, limit }) => {
    if (!stad) return []

    const normStad = normaliseerStad(stad)

    const results = await ctx.db
      .query('bedrijven')
      .withIndex('by_stad', (q) => q.eq('stad', normStad))
      .filter((q) => q.eq(q.field('isActief'), true))
      .collect()

    return results
      .filter((b) => {
        if (isStraatnaam(b.naam)) return false
        if (!b.hoofdCategorie) return true
        return HOVENIER_CATEGORIEEN.has(b.hoofdCategorie)
      })
      .sort((a, b) => {
        const scoreDiff = (b.googleScore ?? 0) - (a.googleScore ?? 0)
        if (scoreDiff !== 0) return scoreDiff
        return (b.aantalReviews ?? 0) - (a.aantalReviews ?? 0)
      })
      .slice(0, limit ?? 20)
  },
})

// ── Alle slugs ophalen (voor sitemap) ────────────────────────────────────────

export const getAllSlugs = query({
  args: { cursor: v.optional(v.string()) },
  handler: async (ctx, { cursor }) => {
    const page = await ctx.db
      .query('bedrijven')
      .filter((q) => q.eq(q.field('isActief'), true))
      .paginate({ numItems: 500, cursor: cursor ?? null })

    return {
      slugs:          page.page.map((b) => b.slug),
      continueCursor: page.continueCursor,
      isDone:         page.isDone,
    }
  },
})

// ══════════════════════════════════════════════════════════════════════════════
// PORTAL: Hovenier ↔ Bedrijf koppeling
// ══════════════════════════════════════════════════════════════════════════════

// Haal het bedrijf op dat de ingelogde hovenier heeft geclaimd
export const getMyBedrijf = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const bedrijf = await ctx.db
      .query('bedrijven')
      .withIndex('by_clerk_id', (q) => q.eq('claimedByClerkId', identity.subject))
      .unique()

    return bedrijf
  },
})

// Zoek ongeclaimde bedrijven op naam (voor de claim-flow)
export const searchUnclaimedBedrijven = query({
  args: { zoekterm: v.string() },
  handler: async (ctx, { zoekterm }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const term = zoekterm.toLowerCase().trim()
    if (term.length < 2) return []

    // Haal alle actieve bedrijven en filter client-side op naam
    // (Convex heeft geen full-text search, maar bij 5K records is dit acceptabel)
    const alle = await ctx.db
      .query('bedrijven')
      .filter((q) => q.eq(q.field('isActief'), true))
      .collect()

    return alle
      .filter((b) =>
        !b.claimedByClerkId &&
        b.naam.toLowerCase().includes(term)
      )
      .slice(0, 10)
      .map((b) => ({
        _id:            b._id,
        naam:           b.naam,
        stad:           b.stad,
        provincie:      b.provincie,
        googleScore:    b.googleScore,
        aantalReviews:  b.aantalReviews,
        hoofdCategorie: b.hoofdCategorie,
        postcode:       b.postcode,
      }))
  },
})

// Claim een bedrijf — koppelt Clerk userId aan bedrijf
export const claimBedrijf = mutation({
  args: { bedrijfId: v.id('bedrijven') },
  handler: async (ctx, { bedrijfId }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Niet ingelogd')

    const clerkId = identity.subject

    // Check: heeft deze user al een bedrijf geclaimd?
    const existing = await ctx.db
      .query('bedrijven')
      .withIndex('by_clerk_id', (q) => q.eq('claimedByClerkId', clerkId))
      .unique()

    if (existing) {
      throw new Error('Je hebt al een bedrijf geclaimd. Neem contact op om te wisselen.')
    }

    // Check: is dit bedrijf al geclaimd door iemand anders?
    const bedrijf = await ctx.db.get(bedrijfId)
    if (!bedrijf) throw new Error('Bedrijf niet gevonden')
    if (bedrijf.claimedByClerkId) {
      throw new Error('Dit bedrijf is al geclaimd door een andere gebruiker.')
    }

    await ctx.db.patch(bedrijfId, { claimedByClerkId: clerkId })
    return { success: true, naam: bedrijf.naam }
  },
})

