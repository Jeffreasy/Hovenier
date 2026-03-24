import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

const EMAIL_RE   = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const POSTCODE_RE = /^\d{4}\s?[A-Za-z]{2}$/
const VALID_DIENSTEN = ['tuinaanleg', 'onderhoud', 'bestrating', 'beplanting', 'schutting', 'overig']

// ── Submit een nieuwe lead (publiek, geen auth vereist) ───────────────────────

export const submitLead = mutation({
  args: {
    naam:     v.string(),
    email:    v.string(),
    telefoon: v.string(),
    postcode: v.string(),
    dienst:   v.string(),
    m2:       v.number(),
    budget:   v.string(),
    timing:   v.string(),
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

    // Zoek beschikbare hovenier in postcodegebied (simpele matching op eerste 2 cijfers)
    const prefix   = postcode.slice(0, 2)
    const hoveniers = await ctx.db
      .query('hoveniers')
      .withIndex('by_actief', (q) => q.eq('actief', true))
      .collect()

    const match = hoveniers.find((h) => h.regio.includes(prefix))

    const leadId = await ctx.db.insert('leads', {
      ...args,
      postcode,
      status:        'nieuw',
      toegewezenAan: match?.clerkId,
    })

    return { leadId, matched: !!match }
  },
})

// ── Leads voor ingelogde hovenier ────────────────────────────────────────────

export const getMyLeads = query({
  args: {
    status: v.optional(v.union(v.literal('nieuw'), v.literal('contact'), v.literal('gesloten'))),
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
    status:   v.union(v.literal('nieuw'), v.literal('contact'), v.literal('gesloten')),
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
