# 01. Architecture & Data Model

## Hybride Topologie

Tuinhub maakt gebruik van Server-Side Rendering (SSR) via **Astro** in combinatie met **React Islands**, waarbij database-transacties op **Convex** draaien en identiteitsvalidatie beheerd wordt door de **LaventeCare** backend API.

De keten:
1.  **Frontend SSR**: Pagina's en views worden op de Vercel proxy gepre-rendered.
2.  **Islands**: Op formulieren en Portal-Dashboards hydreren React 19 componenten die directe (websocket) RPC-verbindingen met Convex opzetten.
3.  **Backchannel Auth**: Routering via beveiligde modules (zoals `/portal/**`) wordt onderschept in de Astro middleware die de sessie-cookie asynchroon via de LaventeCare `/auth/me` checkt.

---

## Cookie-Based Middleware Validatie

Er wordt binnen het portaal strikt vertrouwd op het LaventeCare model gekoppeld aan SSR validatie:
*   De cliënt bezit louter een `access_token` in een in-memory `HttpOnly; Secure` cookie en bezit lokale applicatie state in `Astro.locals.user`. Er zijn géén lokale JWT's opgeslagen.
*   Bij ontbreken van sessie volgt verplicht een 302 redirect naar `/inloggen`. *(zie [03. Portal Operations](03_portal_operations.md) voor error afhandeling en timeouts).*

---

## Convex Database Schema

Tuinhub is gefundeerd op de configuratie in `convex/schema.ts`. Onderstaand de datastructuur en expliciete Index-paden van de vier kerntabellen:

### 1. `leads` (Offerte-aanvragen)
```typescript
leads: defineTable({
  naam: v.string(),
  email: v.string(),
  telefoon: v.string(),
  postcode: v.string(),
  dienst: v.string(),
  m2: v.number(),
  budget: v.string(),
  timing: v.string(),
  status: v.union(v.literal('nieuw'), v.literal('klant_gesproken'), v.literal('gematcht'), v.literal('vervallen')),
  toegewezenAan: v.optional(v.string()), // LaventeCare Hovenier UUID
  notities: v.optional(v.string()),
  
  // Roadmap MVP placeholders
  admin_notes: v.optional(v.string()),
  matched_bedrijf_id: v.optional(v.id('bedrijven')),
  bedrijf_naam: v.optional(v.string()),
})
.index('by_status', ['status'])
.index('by_hovenier', ['toegewezenAan'])
.index('by_hovenier_status', ['toegewezenAan', 'status'])
```

### 2. `bedrijven` (Geïmporteerde Google Places Dataset)
Onze passieve directory (>5000 entries).
```typescript
bedrijven: defineTable({
  naam: v.string(),
  straat: v.optional(v.string()),
  stad: v.optional(v.string()),
  googleMapsUrl: v.string(),
  googleScore: v.optional(v.float64()),
  aantalReviews: v.optional(v.number()),
  hoofdCategorie: v.optional(v.string()), // etc...
  
  slug: v.string(),
  isActief: v.boolean(),
  importedAt: v.number(),
  
  // Portaal authenticatie sleutel:
  claimedByClerkId: v.optional(v.string()), // Legacy sleutelveld (zie docs 03)
})
.index('by_provincie_score', ['provincie', 'googleScore'])
.index('by_stad_score', ['stad', 'googleScore'])
```

### 3. `hoveniers` (Ingezet in Fase 2)
```typescript
hoveniers: defineTable({
  clerkId: v.string(), // Legacy sleutelveld, gemapt naar LaventeCare ID
  naam: v.string(),
  email: v.string(),
  regio: v.array(v.string()),
  specialisaties: v.array(v.string()),
  actief: v.boolean(),
})
```

---

## 🗺️ Roadmap & Planned Architecture

Om te definiëren wat "huidig" is versus wat gebaseerd is op "verwachte uitrol":

1. **[PLANNED] Concierge Validatie**: In de toekomst (`leads.admin_notes`) zal een medewerker via een dashboard in de portal de match handmatig koppelen alvorens de hovenier de lead ziet. (Nog niet gebouwd - data velden zijn reeds voorzien in Convex).
2. **[PLANNED] Geo-Radius Matching**: Lat/Lng arrays uit het database schema van de `bedrijven` worden in latere iteraties gebruikt om prospects op basis van nabijheidsberekeningen (Haversine formule) te kruisen met de array in `hoveniers` regio-beperkingen. Dit is nu nog niet operationeel op niveau van berekening.
