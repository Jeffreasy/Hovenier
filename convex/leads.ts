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

    // Stap 1: Als een bedrijfsnaam gekozen is → zoek dat specifieke bedrijf
    let match = null
    const alleBedrijven = await ctx.db
      .query('bedrijven')
      .filter((q) => q.eq(q.field('isActief'), true))
      .collect()

    if (args.bedrijf_naam) {
      const naamLower = args.bedrijf_naam.toLowerCase().trim()
      match = alleBedrijven.find((b) => b.naam.toLowerCase() === naamLower) ?? null
    }

    // Stap 2: Fallback — matcht op postcode-prefix als geen bedrijf gevonden
    if (!match) {
      const prefix = postcode.slice(0, 2)
      match = alleBedrijven
        .filter((b) => b.postcode?.startsWith(prefix))
        .sort((a, b) => (b.googleScore ?? 0) - (a.googleScore ?? 0))[0] ?? null
    }

    const leadId = await ctx.db.insert('leads', {
      ...args,
      postcode,
      status:             'nieuw',
      matched_bedrijf_id: match?._id,
      bedrijf_naam:       args.bedrijf_naam ?? undefined,
      toegewezenAan:      match?.claimedByUserId ?? undefined,
    })

    return { leadId, matched: !!match }
  },
})

// ── Leads voor ingelogde hovenier ────────────────────────────────────────────
// Auth is verified server-side by Astro middleware — userId passed as argument

export const getMyLeads = query({
  args: {
    userId: v.string(),
    status: v.optional(v.union(v.literal('nieuw'), v.literal('klant_gesproken'), v.literal('gematcht'), v.literal('vervallen'))),
  },
  handler: async (ctx, { userId, status }) => {
    if (!userId) return []

    const leads = await ctx.db
      .query('leads')
      .withIndex('by_hovenier', (q) => q.eq('toegewezenAan', userId))
      .order('desc')
      .collect()

    return status ? leads.filter((l) => l.status === status) : leads
  },
})

// ── Eén lead ophalen ─────────────────────────────────────────────────────────

export const getLeadById = query({
  args: {
    id: v.id('leads'),
    userId: v.string(),
  },
  handler: async (ctx, { id, userId }) => {
    if (!userId) return null

    const lead = await ctx.db.get(id)

    // Security: hovenier mag alleen eigen leads zien (IDOR preventie)
    if (!lead || lead.toegewezenAan !== userId) return null
    return lead
  },
})

// ── Status wijzigen ───────────────────────────────────────────────────────────

export const updateLeadStatus = mutation({
  args: {
    id:       v.id('leads'),
    userId:   v.string(),
    status:   v.union(v.literal('nieuw'), v.literal('klant_gesproken'), v.literal('gematcht'), v.literal('vervallen')),
    notities: v.optional(v.string()),
  },
  handler: async (ctx, { id, userId, status, notities }) => {
    if (!userId) throw new Error('Niet ingelogd')

    const lead = await ctx.db.get(id)

    if (!lead || lead.toegewezenAan !== userId) {
      throw new Error('Niet geautoriseerd')
    }

    await ctx.db.patch(id, { status, ...(notities !== undefined ? { notities } : {}) })
  },
})

// ── Admin: alle leads ophalen ─────────────────────────────────────────────────
// Auth verified via email-whitelist (admin emails)

const ADMIN_EMAILS = ['jeffrey@laventecare.nl', 'info@tuinhub.nl']

export const getAllLeads = query({
  args: {
    userEmail: v.string(),
  },
  handler: async (ctx, { userEmail }) => {
    if (!userEmail) return []

    // Admin check op email
    if (!ADMIN_EMAILS.includes(userEmail.toLowerCase())) return []

    return await ctx.db
      .query('leads')
      .order('desc')
      .collect()
  },
})

// ── Beurs (Marketplace) ────────────────────────────────────────────────────────

export const getOpenLeads = query({
  args: {
    userId: v.string(), // Ter info, we kunnen later op regio filteren
  },
  handler: async (ctx, { userId }) => {
    if (!userId) return []

    // Haal alle leads op waar toegewezenAan niet gezet is (en status = nieuw of vervallen mag ook meedoen later, nu checken we undefined bypass)
    const allLeads = await ctx.db
      .query('leads')
      .order('desc')
      .collect()

    // Filter leads die nog ongeclaimed zijn
    return allLeads.filter(l => !l.toegewezenAan)
  },
})

export const claimLeadWithCredit = mutation({
  args: {
    leadId: v.id('leads'),
    userId: v.string(),
  },
  handler: async (ctx, { leadId, userId }) => {
    if (!userId) throw new Error('Niet ingelogd')

    const hovenier = await ctx.db
      .query('hoveniers')
      .withIndex('by_user_id', (q) => q.eq('userId', userId))
      .unique()

    if (!hovenier) {
      throw new Error('Profiel niet gevonden')
    }

    const currentCredits = hovenier.credits || 0
    if (currentCredits < 1) {
      throw new Error('Onvoldoende credits. Waardeer eerst je saldo op.')
    }

    const lead = await ctx.db.get(leadId)
    if (!lead) throw new Error('Lead niet gevonden')

    if (lead.toegewezenAan) {
      throw new Error('Helaas, deze lead is zojuist geclaimd door een andere hovenier.')
    }

    // 1. Schrijf credit af
    await ctx.db.patch(hovenier._id, {
      credits: currentCredits - 1
    })

    // 2. Wijs lead toe
    await ctx.db.patch(leadId, {
      toegewezenAan: userId,
      status: 'gematcht'
    })

    return { success: true, remainingCredits: currentCredits - 1 }
  },
})
