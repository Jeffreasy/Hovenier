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
    status:          v.union(v.literal('nieuw'), v.literal('klant_gesproken'), v.literal('gematcht'), v.literal('vervallen')),
    toegewezenAan:   v.optional(v.string()),  // Clerk userId van hovenier
    notities:        v.optional(v.string()),

    // Concierge MVP
    admin_notes:        v.optional(v.string()),   // belnotities
    matched_bedrijf_id: v.optional(v.id('bedrijven')),  // referentie naar gescrapete bedrijven
  })
    .index('by_status',         ['status'])
    .index('by_hovenier',       ['toegewezenAan'])
    .index('by_hovenier_status',['toegewezenAan', 'status']),

  // ── Hoveniers (TOEKOMSTIG — ingelogde hovenier-accounts via Clerk) ──────────
  // Momenteel niet actief. Alle zoek/matching verloopt via `bedrijven` tabel.
  hoveniers: defineTable({
    clerkId:        v.string(),   // Clerk userId (uniek)
    naam:           v.string(),   // Bedrijfsnaam
    email:          v.string(),
    telefoon:       v.optional(v.string()),
    regio:          v.array(v.string()),       // postcodegebieden, bijv. ["10", "11", "12"]
    specialisaties: v.array(v.string()),       // ServiceType[]
    actief:         v.boolean(),
  })
    .index('by_clerk_id', ['clerkId'])
    .index('by_actief',   ['actief']),

  // ── Bedrijven (Google Places dataset — 5067 hoveniersbedrijven) ────────────
  // Gebruikt voor: lokale landingspagina's, matching, zoekresultaten
  bedrijven: defineTable({
    // Uit Google Places
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

    // Gegenereerd bij import
    slug:           v.string(),
    specialisaties: v.array(v.string()),
    isActief:       v.boolean(),
    importedAt:     v.number(),   // ms timestamp

    // Fase 2
    postcode:       v.optional(v.string()),
    lat:            v.optional(v.float64()),
    lng:            v.optional(v.float64()),
    beschrijving:   v.optional(v.string()),
  })
    .index('by_provincie',       ['provincie'])
    .index('by_stad',            ['stad'])
    .index('by_stad_score',      ['stad', 'googleScore'])
    .index('by_slug',            ['slug'])
    .index('by_googlePlaceId',   ['googlePlaceId'])
    .index('by_provincie_score', ['provincie', 'googleScore']),

  // ── Steden (voor dynamische content op lokale landingspagina's) ────────────
  steden: defineTable({
    naam:           v.string(),
    provincie:      v.string(),
    slug:           v.string(),
    aantalHoveniers: v.number(),
    prioriteit:     v.number(),
    gemiddeldePrijs: v.optional(v.string()),
  })
    .index('by_slug',      ['slug'])
    .index('by_provincie', ['provincie']),
})
