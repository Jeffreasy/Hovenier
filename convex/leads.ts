import { mutation, query, internalQuery } from './_generated/server'
import { v } from 'convex/values'

const EMAIL_RE   = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const POSTCODE_RE = /^\d{4}\s?[A-Za-z]{2}$/
const VALID_DIENSTEN = ['tuinaanleg', 'onderhoud', 'bestrating', 'beplanting', 'schutting', 'overig']

// ── Internal: lead ophalen voor achtergrond-actions ─────────────────────────

export const getLead = internalQuery({
  args: { leadId: v.id('leads') },
  handler: async (ctx, { leadId }) => {
    return await ctx.db.get(leadId)
  },
})

// ── Submit een nieuwe lead (publiek, geen auth vereist) ───────────────────────
// Matching gebeurt op de `bedrijven` tabel (Google Places dataset).
// Email-notificaties verlopen via LaventeCare (frontend-side).

export const submitLead = mutation({
  args: {
    naam:         v.string(),
    email:        v.string(),
    telefoon:     v.string(),
    postcode:     v.string(),
    dienst:       v.string(),
    m2:           v.number(),
    budget:       v.string(),
    timing:       v.string(),
    bedrijf_naam: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Server-side validatie — client kan omzeild worden
    if (!EMAIL_RE.test(args.email.trim())) {
      throw new Error('Ongeldig e-mailadres')
    }
    if (!POSTCODE_RE.test(args.postcode.trim())) {
      throw new Error('Ongeldige postcode (verwacht: 1234 AB)')
    }
    if (args.m2 < 1 || args.m2 > 10000) {
      throw new Error('Ongeldige tuingrootte')
    }
    if (!VALID_DIENSTEN.includes(args.dienst)) {
      throw new Error('Ongeldige dienst')
    }

    // Normaliseer postcode naar "1234 AB" formaat
    const postcode = args.postcode.trim().toUpperCase().replace(/(\d{4})\s*([A-Z]{2})/, '$1 $2')

    // Zoek best-matchend bedrijf in de bedrijven tabel (postcode-prefix matching)
    const prefix = postcode.slice(0, 2)
    const kandidaten = await ctx.db
      .query('bedrijven')
      .filter((q) => q.eq(q.field('isActief'), true))
      .collect()

    // Filter op postcode-prefix match, sorteer op Google score
    const match = kandidaten
      .filter((b) => b.postcode?.startsWith(prefix))
      .sort((a, b) => (b.googleScore ?? 0) - (a.googleScore ?? 0))[0]

    const leadId = await ctx.db.insert('leads', {
      ...args,
      postcode,
      status:             'nieuw',
      matched_bedrijf_id: match?._id,
      bedrijf_naam:       args.bedrijf_naam ?? undefined,
      toegewezenAan:      match?.claimedByClerkId ?? undefined,
    })

    return { leadId, matched: !!match }
  },
})

// ── Leads voor ingelogde hovenier ────────────────────────────────────────────

export const getMyLeads = query({
  args: {
    status: v.optional(v.union(v.literal('nieuw'), v.literal('klant_gesproken'), v.literal('gematcht'), v.literal('vervallen'))),
  },
  handler: async (ctx, { status }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const clerkId = identity.subject

    const leads = await ctx.db
      .query('leads')
      .withIndex('by_hovenier', (q) => q.eq('toegewezenAan', clerkId))
      .order('desc')
      .collect()

    return status ? leads.filter((l) => l.status === status) : leads
  },
})

// ── Eén lead ophalen ─────────────────────────────────────────────────────────

export const getLeadById = query({
  args: { id: v.id('leads') },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const clerkId = identity.subject
    const lead = await ctx.db.get(id)

    // Security: hovenier mag alleen eigen leads zien (IDOR preventie)
    if (!lead || lead.toegewezenAan !== clerkId) return null
    return lead
  },
})

// ── Status wijzigen ───────────────────────────────────────────────────────────

export const updateLeadStatus = mutation({
  args: {
    id:       v.id('leads'),
    status:   v.union(v.literal('nieuw'), v.literal('klant_gesproken'), v.literal('gematcht'), v.literal('vervallen')),
    notities: v.optional(v.string()),
  },
  handler: async (ctx, { id, status, notities }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Niet ingelogd')

    const clerkId = identity.subject
    const lead = await ctx.db.get(id)

    if (!lead || lead.toegewezenAan !== clerkId) {
      throw new Error('Niet geautoriseerd')
    }

    await ctx.db.patch(id, { status, ...(notities !== undefined ? { notities } : {}) })
  },
})
