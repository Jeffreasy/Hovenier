import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

// ── Submit een nieuwe lead (publiek) ─────────────────────────────────────────

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
    clerkId: v.string(),
    status:  v.optional(v.union(v.literal('nieuw'), v.literal('contact'), v.literal('gesloten'))),
  },
  handler: async (ctx, { clerkId, status }) => {
    const q = ctx.db
      .query('leads')
      .withIndex('by_hovenier', (q) => q.eq('toegewezenAan', clerkId))

    const leads = await q.order('desc').collect()

    return status ? leads.filter((l) => l.status === status) : leads
  },
})

// ── Eén lead ophalen ─────────────────────────────────────────────────────────

export const getLeadById = query({
  args: { id: v.id('leads'), clerkId: v.string() },
  handler: async (ctx, { id, clerkId }) => {
    const lead = await ctx.db.get(id)
    // Security: hovenier mag alleen eigen leads zien
    if (!lead || lead.toegewezenAan !== clerkId) return null
    return lead
  },
})

// ── Status wijzigen ───────────────────────────────────────────────────────────

export const updateLeadStatus = mutation({
  args: {
    id:      v.id('leads'),
    clerkId: v.string(),
    status:  v.union(v.literal('nieuw'), v.literal('contact'), v.literal('gesloten')),
    notities: v.optional(v.string()),
  },
  handler: async (ctx, { id, clerkId, status, notities }) => {
    const lead = await ctx.db.get(id)
    if (!lead || lead.toegewezenAan !== clerkId) {
      throw new Error('Niet geautoriseerd')
    }
    await ctx.db.patch(id, { status, ...(notities !== undefined ? { notities } : {}) })
  },
})
