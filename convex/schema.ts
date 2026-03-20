import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  // ── Leads (offerte-aanvragen) ──────────────────────────────────────────────
  leads: defineTable({
    // Aanvrager
    naam:     v.string(),
    email:    v.string(),
    telefoon: v.string(),
    postcode: v.string(),   // genormaliseerd: "1234 AB"

    // Tuin info
    dienst:  v.string(),    // ServiceType
    m2:      v.number(),
    budget:  v.string(),    // BudgetRange
    timing:  v.string(),    // StartTiming

    // Status & routing
    status:          v.union(v.literal('nieuw'), v.literal('contact'), v.literal('gesloten')),
    toegewezenAan:   v.optional(v.string()),  // Clerk userId van hovenier
    notities:        v.optional(v.string()),
  })
    .index('by_status',         ['status'])
    .index('by_hovenier',       ['toegewezenAan'])
    .index('by_hovenier_status',['toegewezenAan', 'status']),

  // ── Hoveniers ─────────────────────────────────────────────────────────────
  hoveniers: defineTable({
    clerkId:      v.string(),   // Clerk userId (uniek)
    naam:         v.string(),   // Bedrijfsnaam
    email:        v.string(),
    telefoon:     v.optional(v.string()),
    regio:        v.array(v.string()),  // postcodegebieden, bijv. ["10", "11", "12"]
    specialisaties: v.array(v.string()), // ServiceType[]
    actief:       v.boolean(),
  })
    .index('by_clerk_id', ['clerkId'])
    .index('by_actief',   ['actief']),
})
