# CODEBASE.md — Tuinplatform Technische Bijbel

> **AI-LEESWIJZER:** Dit bestand is de single source of truth voor AI-agents en ontwikkelaars.
> Lees dit bestand volledig voordat je code schrijft, refactort of debuggt.
> Alle architectuurbeslissingen, bestandsverantwoordelijkheden en dataflows staan hier gedocumenteerd.

---

## 1. Project Identiteit

| Eigenschap     | Waarde                                                  |
| -------------- | ------------------------------------------------------- |
| **Naam intern**| `tidal-tower` (package.json `name`)                     |
| **Public naam**| Tuinplatform                                            |
| **Versie**     | 0.0.1                                                   |
| **Domeinnaam** | `tuinplatform.nl`                                       |
| **Doel**       | Koppel huiseigenaren aan gecertificeerde hoveniers       |
| **Taal**       | Nederlands (UI + code comments in NL, variabelen in EN) |
| **Status**     | Actieve ontwikkeling — Fase 1 (10 steden)               |
| **Node.js**    | `>=24.0.0` (strikt vereist)                             |

### Exacte dependency versies (package.json)
| Package | Versie |
|---------|--------|
| `astro` | ^6.0.7 |
| `@astrojs/react` | ^5.0.1 |
| `@astrojs/vercel` | ^10.0.2 |
| `@astrojs/sitemap` | ^3.7.1 |
| `@clerk/astro` | ^3.0.6 |
| `@tailwindcss/vite` | ^4.2.2 |
| `tailwindcss` | ^4.2.2 |
| `convex` | ^1.34.0 |
| `react` / `react-dom` | ^19.2.4 |
| `typescript` | ^5.9.3 |

### NPM Scripts
```bash
npm run dev        # astro dev
npm run build      # astro check && astro build  (⚠️ type-check eerst!)
npm run preview    # astro preview
npm run type-check # astro check
```

### Core Business Flow

```
Bezoeker → Offerte aanvragen (multi-step formulier)
         → Lead opgeslagen in Convex (status: 'nieuw')
         → Automatisch gematcht met hovenier op postcode
         → Hovenier ziet lead in portal → status → 'contact' → 'gesloten'
```

---

## 2. Tech Stack & Beslissingen

### Infrastructuur (alle betaald)

| Service | Plan | Rol |
| ------- | ---- | --- |
| **Vercel** | Betaald | Primaire hosting (Edge Functions, CDN, Image Optimization) |
| **Convex** | Betaald | Realtime serverless database + HTTP endpoints |
| **Clerk**  | Betaald | Auth-as-a-service (JWT, middleware, user management) |
| **Render** | Betaald | Beschikbaar als alternatief voor Vercel indien nodig |

### Astro 6 (SSR)
- **Waarom:** Maximale SEO-controle (server-side rendering) + Islands Architecture voor minimale JS
- **Output mode:** `server` (geen static, geen hybrid) — elke route is een serverless functie op Vercel
- **Image service:** `passthroughImageService()` — Vercel CDN handelt image-optimalisatie af

### Convex
- **Waarom:** Realtime database zonder server-beheer; betaald plan voor productie SLA's
- **Realtime:** Hovenier portal gebruikt live queries (leads-updates zonder page refresh)
- **HTTP endpoints:** `convex/http.ts` exposeert een publiek REST endpoint (`POST /submit-lead`)

### Clerk
- **Waarom:** Auth-as-a-service, geen eigen user-tabel nodig; betaald plan voor productie volumes
- **Strategie:** Enkel `/portal/*` is beschermd; alle publieke pagina's zijn anoniem toegankelijk
- **Middleware:** `src/middleware.ts` — Clerk middleware blokkeert niet-ingelogde gebruikers op `/portal`
- **Koppeling:** `hoveniers.clerkId` koppelt de Convex-rij aan de Clerk-gebruiker

### Render (alternatief deploy platform)
- **Wanneer:** Als Vercel-limiten worden bereikt of als een persistente Node.js server nodig is
- **Configuratie:** Nog niet ingericht — beschikbaar als betaald account

### Tailwind CSS v4
- **Configuratie:** CSS-first via `@tailwindcss/vite` plugin; geen `tailwind.config.js` nodig
- **Import:** `import '../styles/global.css'` in BaseLayout — geldt voor de hele site

### Bundle Splitting (Vite)
Drie handmatige chunks voor optimale caching:
- `convex` → `node_modules/convex`
- `react` → `node_modules/react` + `react-dom`
- `clerk` → `node_modules/@clerk`

---

## 3. Bestandsstructuur — Volledig Overzicht

```
Hovenier/
├── astro.config.mjs         # Astro + Vite configuratie (Clerk, Tailwind, Sitemap, Vercel)
├── package.json             # Dependencies + npm scripts
├── tsconfig.json            # TypeScript config
├── vercel.json              # Vercel routing rules
├── .env.example             # Template voor omgevingsvariabelen
│
├── convex/                  # Backend (Convex serverless database)
│   ├── schema.ts            # Database schema (leads, hoveniers tabellen + indexen)
│   ├── leads.ts             # Lead mutations & queries
│   ├── hoveniers.ts         # Hovenier mutations & queries
│   ├── http.ts              # REST endpoint: POST /submit-lead
│   └── _generated/          # Auto-gegenereerd door Convex CLI (niet handmatig aanpassen)
│
└── src/
    ├── content.config.ts    # Astro Content Collections (blog, faq, steden, subsidies)
    ├── middleware.ts         # Clerk auth guard voor /portal routes
    ├── env.d.ts             # TypeScript env-declaraties
    │
    ├── lib/                 # Pure business logic — geen Astro/React imports
    │   ├── types.ts         # Alle TypeScript types & interfaces (single source of truth)
    │   ├── constants.ts     # SERVICES, BUDGET_OPTIONS, TIMING_OPTIONS, NAV_LINKS, SITE
    │   ├── pricing.ts       # Prijsberekening: COST_PER_M2, calculateGardenCosts, etc.
    │   ├── seo.ts           # JSON-LD schema generators (Article, FAQ, LocalBusiness, etc.)
    │   └── utils.ts         # Hulpfuncties: slugify, formatCurrency, formatRange, etc.
    │
    ├── layouts/             # Pagina-wrappers (wrappen altijd <BaseLayout>)
    │   ├── BaseLayout.astro # Hoofd-layout: SEO meta, OG tags, fonts, ambient orbs, Header/Footer
    │   ├── ArticleLayout.astro # Blog-artikelen (breadcrumbs, reading time, schema)
    │   ├── LocalLayout.astro   # Steden-pagina's (LocalBusiness schema)
    │   └── ToolLayout.astro    # Tools/calculators (minimalistische wrapper)
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Header.astro # Navigatie (sticky, glassmorphism, mobiel hamburger)
    │   │   └── Footer.astro # Footer met links, social, contact
    │   └── ui/              # Gedeelde UI-componenten
    │       ├── Button.astro    # Knop component (variant: primary/secondary/ghost, size: sm/md/lg)
    │       ├── Card.astro      # Kaart component (wrapper met glassmorphism, href optioneel)
    │       ├── Badge.astro     # Badge/tag component (variant: primary/secondary)
    │       ├── CTABlock.astro  # Call-to-action blok (variant: 'inline' | 'banner')
    │       └── Accordion.astro # Collapsible FAQ item
    │
    ├── islands/             # React Islands (client-side interactiviteit)
    │   ├── OfferteFormulier.tsx     # Multi-step offerte formulier → POST /submit-lead
    │   ├── TuinkostenCalculator.tsx # Tuinkosten calculator (services × m² × kwaliteit)
    │   ├── SchuttingCalculator.tsx  # Schutting calculator (meter × materiaal × hoogte)
    │   ├── BouwdepotCalculator.tsx  # Bouwdepot tuin-inschatting
    │   ├── SubsidieCheck.tsx        # Subsidie checker op postcode
    │   └── Zoekbalk.tsx             # Postcode zoekbalk (redirect naar /offerte?postcode=)
    │
    ├── pages/               # Astro file-based routing
    │   ├── index.astro          # Homepage (hero, search card, stats, stappen, calculators, blog preview)
    │   ├── contact.astro        # Contactpagina
    │   ├── over-ons.astro       # Over ons pagina
    │   ├── inloggen.astro       # Clerk SignIn (Standalone HTML, noindex)
    │   ├── registreren.astro    # Clerk SignUp (Standalone HTML, noindex)
    │   ├── blog/                # Blog (index + [slug] dynamisch, prerender: true)
    │   ├── faq/                 # FAQ (index + [slug] dynamisch)
    │   ├── offerte/             # index.astro — OfferteFormulier island
    │   ├── steden/              # [stad].astro — gegenereerd uit content/steden/*.json (prerender: true)
    │   ├── tools/               # tuinkosten-calculator.astro (ToolLayout + island)
    │   └── portal/              # 🔒 Beschermd via Clerk middleware
    │       ├── index.astro      # Lead overzicht voor hovenier
    │       ├── profiel.astro    # Hovenier profiel beheer
    │       └── leads/           # [id].astro — lead detail pagina
    │
    ├── content/             # Astro Content Collections
    │   ├── blog/            # *.md — blogartikelen
    │   ├── faq/             # *.md — FAQ items
    │   ├── steden/          # *.json — stad profielen (naam, slug, provincie, etc.)
    │   └── subsidies/       # *.md — subsidie informatie per gemeente
    │
    └── styles/
        └── global.css       # Globale CSS: Tailwind directives, custom properties, animaties
```

---

## 4. Convex Database Schema

### Tabel: `leads`

Slaat offerte-aanvragen op van bezoekers.

| Veld            | Type                                    | Beschrijving                              |
| --------------- | --------------------------------------- | ----------------------------------------- |
| `naam`          | `string`                                | Volledige naam aanvrager                  |
| `email`         | `string`                                | E-mailadres                               |
| `telefoon`      | `string`                                | Telefoonnummer                            |
| `postcode`      | `string`                                | Genormaliseerd: `"1234 AB"` formaat       |
| `dienst`        | `string` (ServiceType)                  | Gevraagde dienst                          |
| `m2`            | `number`                                | Oppervlakte tuin in m²                    |
| `budget`        | `string` (BudgetRange)                  | Budget-range (bijv. `"2500-5000"`)        |
| `timing`        | `string` (StartTiming)                  | Starttijdstip (`"asap"` / `"geen-haast"`) |
| `status`        | `'nieuw' \| 'contact' \| 'gesloten'`   | Lead lifecycle status                     |
| `toegewezenAan` | `string?` (Clerk userId)               | Hovenier die de lead heeft ontvangen      |
| `notities`      | `string?`                               | Interne notities van hovenier             |

**Indexen:**
- `by_status` → `['status']`
- `by_hovenier` → `['toegewezenAan']`
- `by_hovenier_status` → `['toegewezenAan', 'status']`

---

### Tabel: `hoveniers`

Profiel van geregistreerde hoveniers (gekoppeld aan Clerk account).

| Veld            | Type           | Beschrijving                                      |
| --------------- | -------------- | ------------------------------------------------- |
| `clerkId`       | `string`       | Clerk `userId` (primaire koppeling)               |
| `naam`          | `string`       | Bedrijfsnaam                                      |
| `email`         | `string`       | Zakelijk e-mailadres                              |
| `telefoon`      | `string?`      | Optioneel telefoonnummer                          |
| `regio`         | `string[]`     | Postcode prefixen (eerste 2 cijfers), bijv. `["10","11","12"]` |
| `specialisaties`| `string[]`     | Array van `ServiceType` waarden                   |
| `actief`        | `boolean`      | `false` = hovenier ontvangt geen nieuwe leads     |

**Indexen:**
- `by_clerk_id` → `['clerkId']`
- `by_actief` → `['actief']`

---

## 5. Convex API — Functies

### `convex/leads.ts`

| Functie            | Type       | Beschrijving                                                    |
| ------------------ | ---------- | --------------------------------------------------------------- |
| `submitLead`       | `mutation` | Publieke mutatie. Normaliseert postcode, matcht hovenier op regio-prefix, slaat lead op. Returnt `{ leadId, matched }` |
| `getMyLeads`       | `query`    | Live query. Alle leads voor een hovenier-`clerkId`, optioneel gefilterd op `status` |
| `getLeadById`      | `query`    | Einzelne lead ophalen. Beveiligingscheck: `toegewezenAan === clerkId` |
| `updateLeadStatus` | `mutation` | Status + optionele notities bijwerken. Gooit error als hovenier niet de eigenaar is |

### `convex/hoveniers.ts`

| Functie          | Type       | Beschrijving                                                    |
| ---------------- | ---------- | --------------------------------------------------------------- |
| `getMe`          | `query`    | Hovenier profiel ophalen op `clerkId`                          |
| `upsertHovenier` | `mutation` | Profiel aanmaken of bijwerken (insert + patch in één functie)  |

### `convex/http.ts` — REST Endpoints

| Method | Path            | Auth    | Beschrijving                                              |
| ------ | --------------- | ------- | --------------------------------------------------------- |
| `POST` | `/submit-lead`  | Geen    | Ontvangt offerte-data, valideert velden, roept `leads.submitLead` aan |
| `OPTIONS` | `/submit-lead` | Geen | CORS preflight handler                                    |

**CORS:** Alle origins toegestaan (`Access-Control-Allow-Origin: *`) — bewuste keuze voor publiek formulier.

---

## 6. Content Collections

Beheerd via `src/content.config.ts` met Astro Content Collections v5.

| Collectie    | Locatie               | Format | Beschrijving                                           |
| ------------ | --------------------- | ------ | ------------------------------------------------------ |
| `blog`       | `src/content/blog/`   | `.md`  | Tuingids artikelen. Velden: title, description, publishDate, category, image, featured, draft |
| `faq`        | `src/content/faq/`    | `.md`  | FAQ items. Velden: question, category, publishDate, draft |
| `steden`     | `src/content/steden/` | `.json`| Stad profielen. Velden: naam, slug, regio, provincie, gemeente, prioriteit, aantalHoveniers, gemiddeldePrijs, description |
| `subsidies`  | `src/content/subsidies/` | `.md` | Subsidie-info per gemeente. Velden: naam, gemeente, provincie, type, bedrag, aanvraagUrl, geldigTot, actief |

**Blog categorieën:** `tuinaanleg | onderhoud | bestrating | beplanting | schutting | kosten | tips | subsidies`

---

## 7. React Islands — Gedetailleerde API

Alle islands gebruiken `client:load` tenzij anders vermeld.

### `OfferteFormulier.tsx`
- **Doel:** Multi-step formulier voor offerte-aanvragen (**5 stappen**)
- **Stappen:** (1) Dienst kiezen → (2) Tuingrootte (m², number input) → (3) Budget → (4) Timing → (5) Contactgegevens
- **Dataflow:** `fetch()` naar Convex HTTP endpoint `POST /submit-lead` via `import.meta.env.PUBLIC_CONVEX_URL`
- **Validatie:** Client-side per stap; postcode via `isValidPostcode()` uit `src/lib/utils.ts`
- **Na submit:** Bevestigingscherm (email-adres, 48 uur belofte — geen `leadId` getoond)
- **Dependencies:** `src/lib/constants.ts` (SERVICE_OPTIONS, BUDGET_OPTIONS, TIMING_OPTIONS), `src/lib/types.ts`, `src/lib/utils.ts`

### `TuinkostenCalculator.tsx`
- **Doel:** Schat tuinkosten in op basis van m², diensten en kwaliteit (**4 stappen incl. resultaatscherm**)
- **Input:** m² (range slider, 10–500), ServiceType[] (buttons, 4 opties), QualityLevel (buttons)
- **Let op:** Gebruikt een **eigen lokale `GARDEN_SERVICES` array** (4 diensten: bestrating, beplanting, tuinaanleg, schutting) — NIET de `SERVICE_OPTIONS` uit `constants.ts`
- **Berekening:** `calculateGardenCosts()` uit `src/lib/pricing.ts`
- **Output:** Min–max range met uitsplitsing per dienst
- **CTA:** "Vraag gratis offertes aan" link → `/offerte`
- **Dependencies:** `src/lib/types.ts`, `src/lib/pricing.ts` (calculateGardenCosts, QUALITY_OPTIONS), `src/lib/utils.ts` (formatRange)

### `SchuttingCalculator.tsx`
- **Status: 🚧 Fase 2 placeholder** — toont "Binnenkort beschikbaar" banner
- **Doel:** Berekent schuttingkosten op strekkende meter (werkend skelet, maar niet productie-klaar)
- **Input:** Meters (range 1–100), materiaal (buttons uit `SCHUTTING_MATERIALS`), hoogte (select: 1.2/1.5/1.8/2.0m)
- **Berekening:** `calculateSchuttingCosts()` uit `src/lib/pricing.ts` (berekening werkt al)
- **Output:** Totaalprijs + uitsplitsing (materiaal + fundering)
- **Exporteert:** `sharedCalcStyles` — gedeelde CSS string die ook door `BouwdepotCalculator` en `SubsidieCheck` wordt geïmporteerd

### `BouwdepotCalculator.tsx`
- **Status: 🚧 Fase 2 placeholder** — toont "Binnenkort beschikbaar" banner
- **Doel:** Inschatting hoeveel van een bouwdepot voor tuin gebruikt kan worden
- **Input:** Totaal depot (€), tuin-m², woningwaarde (€) — via number inputs in een `<form>`
- **Berekening:** `estimateBouwdepotGardenShare()` uit `src/lib/pricing.ts`
- **Output:** Max tuin budget (€) + percentage van depot
- **Dependencies:** `src/lib/pricing.ts`, `src/lib/utils.ts` (formatCurrency), `./SchuttingCalculator` (sharedCalcStyles)

### `SubsidieCheck.tsx`
- **Status: 🚧 Fase 2 placeholder** — toont "Beperkte beschikbaarheid" banner
- **Doel:** Toont beschikbare subsidies op basis van postcode
- **Input:** Postcode (text input, min 6 tekens)
- **Logica:** Gebruikt **hardgecodeerde `DEMO_SUBSIDIES` array** (Amsterdam demo-data) — GEEN koppeling met `GemeenteSubsidies` type of `content/subsidies/` collection
- **Validatie:** Geen `isValidPostcode()` — alleen `postcode.length < 6` check
- **Data fase 2:** Real API call naar `/api/subsidies?postcode=...` (TODO comment aanwezig)
- **Dependencies:** `./SchuttingCalculator` (sharedCalcStyles)

### `Zoekbalk.tsx`
- **Doel:** Postcode + dienst formulier dat doorverwijst naar offerte-flow
- **Redirect:** `window.location.href = /offerte?postcode=<waarde>&dienst=<waarde>` (stuurt **ook dienst mee**)
- **Validatie:** Inline regex `/^\d{4}\s?[A-Za-z]{2}$/` — NIET via `isValidPostcode()` uit utils
- **Let op:** Heeft een **eigen lokale `SERVICE_OPTIONS` array** met emoji (niet geïmporteerd uit `constants.ts`)
- **Gebruik:** Homepage hero, sidebar, CTA-secties
- **Dependencies:** `src/lib/types.ts` (ServiceType)

---

## 8. Layouts

### `BaseLayout.astro`
**De fundament-layout. Elke publieke pagina erft hiervan (direct of via sub-layout).**

Props:
```typescript
interface Props {
  seo: SEOMeta    // title, description, canonical, ogImage, ogType, noindex
  schema?: string // JSON-LD string (gerenderd in <script type="application/ld+json">)
  bodyClass?: string
}
```

Bevat:
- Volledige `<head>` (meta, OG, Twitter Card, canonical, favicon)
- `lang="nl"` attribuut op `<html>`
- Google Fonts: Plus Jakarta Sans (600,700) + Inter (400,500)
- 3× Ambient Orb `<div>` elementen (decoratieve achtergrond-animaties, `pointer-events: none`)
- `<Header />` + `<Footer />`
- Scroll-reveal IntersectionObserver (activeert `.reveal`, `.reveal-up`, `.reveal-fade`, `.reveal-scale` classes)

### `ArticleLayout.astro`
Extends BaseLayout voor blogartikelen. Props:
- `seo`, `title`, `description`, `publishDate`, `updatedDate?`, `category`, `readingTime?`, `image?`, `imageAlt?`, `relatedPosts?`

Voegt toe:
- Eigen `Article` JSON-LD schema (inline in de layout zelf, NIET via `src/lib/seo.ts`)
- Artikel header (categorie badge, titel, beschrijving, auteur byline, publicatiedatum)
- Named slot `toc` — TOC sidebar (zichtbaar op ≥1024px)
- Named slot `reading-time` — leestijd (gevuld via `getReadingTime()` in `blog/[slug].astro`)
- Default slot — artikel body content (`<Content />` component)
- `CTABlock` component (inline + banner variant) vanuit `src/components/ui/CTABlock.astro`
- Auteur-blok ("Tuinplatform Redactie")
- Gerelateerde artikelen grid (via `relatedPosts` prop)

### `src/components/ui/`

#### `Button.astro`
Herbruikbare knop/link. Props: `href?` (string), `variant?` (`primary`|`secondary`|`ghost`, default: `primary`), `size?` (`sm`|`md`|`lg`, default: `md`).
Gebruikt in `index.astro` (homepage hero CTA, blog "Alle artikelen" link).

#### `Card.astro`
Glassmorphism kaart wrapper. Props: `href?` (string — maakt de kaart klikbaar als link), `class?`.
Gebruikt in `index.astro` voor de calculators-grid en blog-preview grid.

#### `Badge.astro`
Kleine label/tag. Props: `label` (string), `variant?` (`primary`|`secondary`, default: `primary`).
Gebruikt in `index.astro` voor blog-kaart categorie.

#### `CTABlock.astro`
Gedeelde call-to-action blok. Props: `title`, `description`, `href`, `cta`, `variant?` (`'inline'` | `'banner'`, default: `'inline'`)
- **inline**: Groene links border-left, groen tintje, gebruikt in `ArticleLayout` na artikelbody
- **banner**: Glassmorphism achtergrond, gouden border-top, zware schaduw — gebruikt in `ArticleLayout` (bottom) en `ToolLayout` (bottom)
- Icoon: `📊` als variant=inline, `🌿` als variant=banner (automatisch)

#### `Accordion.astro`
Collapsible FAQ item. Props: `question` (string), `answer` (string).
Gebruikt door `LocalLayout` en `ToolLayout` voor hun FAQ-secties.

### `LocalLayout.astro`
Extends BaseLayout voor stad-pagina's (`/steden/[stad]`). Props:
- `seo`, `stad` (Stad), `aantalHoveniers?` (default: 12), `gemiddeldePrijs?` (default: '€45 – €75 per uur'), `faqs?` (FAQItem[])

Voegt toe:
- **LocalBusiness** JSON-LD + **FAQPage** JSON-LD gecombineerd in één schema
- Breadcrumb: Home / Steden / {stad.naam}
- Hero met 3 stat-blokjes (aantalHoveniers, gemiddeldePrijs, "Gratis")
- Named slot `offerte-form` (glass card wrapper met h2 + intro tekst)
- Named slot `content` + Named slot `sidebar` — 2-koloms grid op ≥1024px (1fr + 300px)
- FAQ sectie via `Accordion.astro` (alleen als `faqs` aanwezig)
- **Importeert:** `Accordion` uit `src/components/ui/Accordion.astro`

### `ToolLayout.astro`
Extends BaseLayout voor calculators/tools (`/tools/*`). Props:
- `seo`, `title`, `intro`, `faqs?` (FAQItem[])

Voegt toe:
- **FAQPage** JSON-LD (alleen als `faqs` aanwezig)
- Tool header: `h1` titel + intro tekst (max-width: 600px)
- Named slot `tool` — glassmorphism card (blur(20px), max-width: 760px) voor React island
- Named slot `result-cta` — optionele CTA na berekening
- Named slot `explainer` — SEO-tekst in `.prose` container
- FAQ sectie via `Accordion.astro`
- Hardcoded bottom `CTABlock` (variant="banner") → `/offerte`
- **Importeert:** `CTABlock`, `Accordion` uit `src/components/ui/`

---

## 9. Routing — Alle Pagina's

| Route                         | Auth | Layout              | Beschrijving                              |
| ----------------------------- | ---- | ------------------- | ----------------------------------------- |
| `/`                           | ❌   | BaseLayout          | Homepage: hero (search card), stats, 3 stappen, calculators-grid, blog preview, CTA banner |
| `/over-ons`                   | ❌   | BaseLayout          | Over het platform pagina                  |
| `/contact`                    | ❌   | BaseLayout          | Contactformulier                          |
| `/inloggen`                   | ❌   | **Standalone HTML** | Clerk `<SignIn>` — `noindex`, eigen canvas achtergrond, max-width 480px |
| `/registreren`                | ❌   | **Standalone HTML** | Clerk `<SignUp>` — `noindex`, identieke stijl als inloggen |
| `/offerte`                    | ❌   | BaseLayout          | `OfferteFormulier` island (5 stappen)     |
| `/blog`                       | ❌   | BaseLayout          | Blog overzicht                            |
| `/blog/[slug]`                | ❌   | ArticleLayout       | Blog artikel — `prerender: true`, slots: `toc`, `reading-time`, default (Content) |
| `/faq`                        | ❌   | BaseLayout          | FAQ overzicht                             |
| `/faq/[slug]`                 | ❌   | BaseLayout          | Enkel FAQ item                            |
| `/steden/[stad]`              | ❌   | LocalLayout         | Stad-specifieke landing page — `prerender: true`, `getStaticPaths()` uit `content/steden/` |
| `/tools/tuinkosten-calculator`| ❌   | ToolLayout          | `TuinkostenCalculator` island (fase 1 volledig) |
| `/tools/schutting-kosten-calculator` | ❌ | ToolLayout?   | **Gelinkt vanuit homepage** maar pagina bestaat nog niet (fase 2 placeholder) |
| `/tools/subsidie-check`       | ❌   | ToolLayout?         | **Gelinkt vanuit homepage** maar pagina bestaat nog niet (fase 2 placeholder) |
| `/portal`                     | ✅   | **Standalone HTML** | Lead overzicht — Convex REST query `leads:getMyLeads` via `<script define:vars>` |
| `/portal/profiel`             | ✅   | **Standalone HTML** | Profiel formulier — `hoveniers:getMe` (load) + `hoveniers:upsertHovenier` (submit) |
| `/portal/leads/[id]`          | ✅   | **Standalone HTML** | Lead detail — `leads:getLeadById` + `leads:updateLeadStatus`; toont `lead.notities` |

> **Auth guard:** `src/middleware.ts` redirect `/portal/*` naar `/inloggen` als niet ingelogd.
> **Portal + Auth layout:** Al deze pagina's gebruiken **GEEN** `BaseLayout.astro`. Ze hebben eigen inline HTML met `noindex, nofollow` en eigen stijling.
> **Convex REST patroon (portal):** `fetch(convexUrl + '/api/query', { body: { path, args, format: 'json' }})` voor queries; `/api/mutation` voor mutations.
> **Steden:** `/steden/[stad]` gebruikt `prerender: true` — wordt gebuild als statische HTML. De slot `offerte-form` krijgt een gewone link (`/offerte?stad=...`) in plaats van het `OfferteFormulier` island.

---

## 10. TypeScript Types — Overzicht

Alle types in `src/lib/types.ts` (single source of truth).

```typescript
// Diensten
type ServiceType = 'tuinaanleg' | 'onderhoud' | 'bestrating' | 'beplanting' | 'schutting' | 'overig'
type QualityLevel = 'basis' | 'midden' | 'premium'
type BudgetRange = '<2500' | '2500-5000' | '5000-10000' | '10000-25000' | '>25000'
type StartTiming = 'asap' | 'binnen-3-maanden' | 'geen-haast'

// Data interfaces
interface OfferteData         // Volledig offerte payload
interface Stad {
  naam: string
  slug: string
  provincie: string
  regio: string           // ← GEBRUIKT in steden/[stad].astro (tarief tekst)
  description: string
  aantalHoveniers?: number
  gemiddeldePrijs?: string
}
interface Subsidie            // Enkelvoudige subsidie
interface GemeenteSubsidies   // Subsidies per gemeente (met postcode4Prefixes) — NIET in gebruik (fase 2)
interface BlogPost            // Blog artikel interface
interface FAQItem             // FAQ item met schema flag
interface TuinkostenInput     // Calculator invoer
interface TuinkostenOutput    // Calculator uitvoer (min, max, breakdown)
interface SEOMeta             // BaseLayout SEO props
```

---

## 11. `src/lib` — Business Logic

### `constants.ts`
Single source of truth voor alle dropdown-waarden en site-configuratie.

- `SERVICES` — Map van ServiceType naar `{ label, icon }`
- `SERVICE_OPTIONS` — Array voor `<select>` elementen
- `BUDGET_OPTIONS` — Budget ranges voor formulier
- `TIMING_OPTIONS` — Timingsopties voor formulier
- `FASE1_STEDEN` — De 10 steden van Fase 1 development
- `NAV_LINKS` — Hoofd-navigatie links
- `SOCIAL_PROOF` — Marketing getallen (offertes, hoveniers, rating, reviews)
- `SITE` — Sitebrede instellingen (`name`, `tagline`, `description`, `url`, `email`)

### `pricing.ts`
Alle prijsberekeningen — enige plek waar prijzen worden gedefinieerd.

- `COST_PER_M2` — Kosten per m² per ServiceType (Dutch market averages 2025)
- `SCHUTTING_MATERIALS` — 6 materialen met min/max per strekkende meter
- `QUALITY_OPTIONS` — Kwaliteitsmultipliers (basis: 0.8×, midden: 1.0×, premium: 1.45×)
- `calculateGardenCosts(m2, services, quality)` → `CalculationResult`
- `calculateSchuttingCosts(meters, material, hoogte)` → `CalculationResult`
- `estimateBouwdepotGardenShare(depot, m2, woningWaarde)` → max tuin budget

### `seo.ts`
JSON-LD schema generators. Importeer resultaat in BaseLayout `schema` prop.

- `articleSchema(props)` → Schema.org `Article`
- `faqSchema(items)` → Schema.org `FAQPage`
- `localBusinessSchema(props)` → Schema.org `LocalBusiness`
- `howToSchema(props)` → Schema.org `HowTo`
- `breadcrumbSchema(items)` → Schema.org `BreadcrumbList`
- `websiteSchema()` → Schema.org `WebSite` (voor homepage)

### `utils.ts`
Pure hulpfuncties, geen externe dependencies.

- `slugify(text)` — URL-veilige slug (diacritics verwijderd)
- `capitalize(text)` — Eerste letter hoofdletter
- `formatCurrency(amount)` — `€ 1.500` (nl-NL locale)
- `formatRange(min, max)` — `€ 1.500 – € 3.000`
- `getReadingTime(text)` — Geschatte leestijd in minuten (220 wpm)
- `formatDate(date)` — `15 maart 2025` (nl-NL locale)
- `isValidPostcode(postcode)` — Regex validatie `1234 AB`
- `normalizePostcode(postcode)` — Trim + uppercase
- `getPostcodePrefix(postcode)` — Eerste 4 cijfers voor regio-matching
- `buildTitle(pageTitle)` → `"Pagina | Tuinplatform"`
- `buildCanonical(path)` → Volledige canonical URL
- `cn(...classes)` — Conditional className helper

---

## 12. Auth & Security

### Clerk Middleware (`src/middleware.ts`)
```
/portal/*  → Vereist ingelogde gebruiker → redirect naar /inloggen
/_astro/*  → Bypass (Astro internals)
/_isr/*    → Bypass (Vercel ISR)
/fonts/*   → Bypass (statische assets)
```

### Convex Security
- `getLeadById` → controleert `lead.toegewezenAan === clerkId` (IDOR-preventie)
- `updateLeadStatus` → gooit `Error('Niet geautoriseerd')` als hovenier niet de lead-eigenaar is
- HTTP `POST /submit-lead` → publiek (geen auth) — bewuste keuze voor publiek offerte formulier

---

## 13. SEO Strategie

### Aanpak
- **Server-side rendering** voor alle publieke pagina's (maximale crawlability)
- **Canonicals** via `buildCanonical()` in elke page
- **JSON-LD schema markup** via `src/lib/seo.ts` generators
- **Sitemap** auto-gegenereerd door `@astrojs/sitemap`
- **Locale:** `<html lang="nl">`, OG locale `nl_NL`

### Schema per pagina-type
| Pagina-type | Schema |
| ----------- | ------ |
| Homepage   | `WebSite` + `SearchAction` |
| Blog        | `Article` + `BreadcrumbList` |
| FAQ         | `FAQPage` |
| Steden      | `LocalBusiness` + `AggregateRating` |
| Tools       | `HowTo` (optioneel) |

---

## 14. Bestandsafhankelijkheden

> **Regel:** Als je een bestand aanpast, update ook alle afhankelijke bestanden.

| Bestand                  | Wordt gebruikt door                                          |
| ------------------------ | ------------------------------------------------------------ |
| `lib/types.ts`           | lib/constants.ts, lib/pricing.ts, lib/seo.ts, lib/utils.ts, alle islands, alle layouts |
| `lib/constants.ts`       | lib/seo.ts, alle islands (OfferteFormulier, calculators), Header.astro |
| `lib/pricing.ts`         | TuinkostenCalculator.tsx, SchuttingCalculator.tsx, BouwdepotCalculator.tsx |
| `lib/seo.ts`             | Alle pagina's die JSON-LD schema injecteren                  |
| `lib/utils.ts`           | BaseLayout.astro, Zoekbalk.tsx, SubsidieCheck.tsx, blog/[slug].astro |
| `convex/schema.ts`       | convex/leads.ts, convex/hoveniers.ts, convex/_generated/    |
| `convex/leads.ts`        | convex/http.ts, pages/portal/*.astro                         |
| `convex/hoveniers.ts`    | pages/portal/profiel.astro                                   |
| `content.config.ts`      | pages/blog/[slug].astro, pages/steden/[stad].astro, pages/faq/[slug].astro |
| `layouts/BaseLayout.astro`| Alle andere layouts, alle pages die BaseLayout direct gebruiken |

---

## 15. Development Richtlijnen

### Nieuwe Island Toevoegen
1. Maak `src/islands/NieuweIsland.tsx`
2. Business logic → `src/lib/pricing.ts` of `src/lib/utils.ts` (niet in de island zelf)
3. Importeer in de betreffende Astro page met `client:load`
4. Update dit bestand (sectie 7 + sectie 14)

### Nieuw Convex Endpoint
1. Voeg functie toe aan `convex/leads.ts` of `convex/hoveniers.ts`
2. Voor HTTP: voeg route toe aan `convex/http.ts`
3. `npx convex dev` herstart automatisch
4. Update sectie 5 in dit bestand

### Nieuwe Content Collection
1. Voeg schema toe in `src/content.config.ts`
2. Maak folder `src/content/<naam>/`
3. Voeg dynamische route toe in `src/pages/<naam>/[slug].astro`
4. Update sectie 6 + sectie 9 in dit bestand

### Nieuwe Stad Toevoegen (Fase 1 → 2)
1. Voeg JSON bestand toe aan `src/content/steden/<stad>.json`
2. Stad-pagina wordt automatisch gegenereerd via `[stad].astro`
3. Voeg stad toe aan `FASE1_STEDEN` in `constants.ts` indien relevant

---

## 16. Bekende Limitaties & Fase 2 TODO

| Limitatie                                           | Fase |
| --------------------------------------------------- | ---- |
| Postcode-matching op eerste 2 cijfers (beperkte precisie)  | 2    |
| Subsidiedata is statisch (geen CMS koppeling)       | 2    |
| BouwdepotCalculator zonder bank-API                 | 2    |
| Geen e-mail notificatie bij nieuwe lead             | 2    |
| Steden-data in JSON (migreren naar CMS als >30)     | 2    |
| Geen admin panel voor platform-beheer               | 3    |

---

## 17. Design System — `src/styles/global.css`

> **Thema naam:** *Dark Nature Glass*
> **Canvas:** Deep Forest Night · **Glass:** Frosted Sage · **Accent:** Warm Sand
> Technologie: Tailwind CSS v4 `@theme` block (CSS-first) — **geen** `tailwind.config.js`

### 17.1 Kleurpalet (`@theme`)

#### Canvas (achtergrondlagen)
| Token | Waarde | Gebruik |
|-------|--------|---------|
| `--color-canvas` | `#0D1F12` | Primair canvas (diep nachtgroen) |
| `--color-canvas-mid` | `#142619` | Middelste laag (portal body, select options) |
| `--color-canvas-light` | `#1C3421` | Lichtste donkere laag |

#### Glassmorphism
| Token | Waarde |
|-------|--------|
| `--color-glass-10` | `rgba(255,255,255,0.04)` |
| `--color-glass-20` | `rgba(255,255,255,0.08)` |
| `--color-glass-40` | `rgba(255,255,255,0.13)` |
| `--color-glass-border` | `rgba(255,255,255,0.10)` |
| `--color-glass-border-bright` | `rgba(255,255,255,0.22)` |

#### Brand
| Token | Waarde | Gebruik |
|-------|--------|---------|
| `--color-primary` | `#6E9E65` | Groen — primaire merk kleur, interactie states |
| `--color-primary-dark` | `#4A7043` | Hover-state groen |
| `--color-primary-light` | `rgba(110,158,101,0.15)` | Subtiele groen achtergrond |
| `--color-primary-glow` | `rgba(110,158,101,0.30)` | Glow-effecten |
| `--color-secondary` | `#C4A96A` | Warm sand — CTA's, accenten, prijzen |
| `--color-secondary-dark` | `#A88B4A` | Hover-state sand |
| `--color-secondary-light` | `rgba(196,169,106,0.15)` | Subtiele sand achtergrond |
| `--color-secondary-glow` | `rgba(196,169,106,0.35)` | Glow bij CTA's |

#### Tekst
| Token | Waarde | Gebruik |
|-------|--------|---------|
| `--color-text-primary` | `#EDF2EC` | Hoofdtekst (bijna-wit met warmte) |
| `--color-text-secondary` | `rgba(237,242,236,0.65)` | Subtekst |
| `--color-text-muted` | `rgba(237,242,236,0.40)` | Meta, disclaimers |

#### Status
| Token | Kleur | Gebruik |
|-------|-------|---------|
| `--color-success` | `#34D399` | Succes indicators |
| `--color-warning` | `#FBBF24` | Waarschuwingen |
| `--color-error` | `#F87171` | Foutmeldingen, rode tekst |

---

### 17.2 Typografie

| Token | Waarde |
|-------|--------|
| `--font-heading` | `"Plus Jakarta Sans", sans-serif` |
| `--font-body` | `"Inter", sans-serif` |

**Heading grootes (clamp voor responsief):**
- `h1` → `clamp(2rem, 5vw, 3rem)`
- `h2` → `clamp(1.5rem, 3vw, 2.25rem)`
- `h3` → `clamp(1.25rem, 2.5vw, 1.5rem)` (font-weight: 600)
- `h4` → `1.125rem` (font-weight: 600)

**Alle headings:** `font-family: --font-heading`, `font-weight: 700`, `line-height: 1.2`, `color: --color-text-primary`

**Body:** `font-size: 16px`, `line-height: 1.7`, `color: --color-text-secondary`

**Links:** `color: --color-secondary`, `text-decoration: none`, hover → `--color-secondary-dark` + underline

---

### 17.3 Spacing — 8-point grid

| Token | Waarde |
|-------|--------|
| `--spacing-1` | `0.25rem` (4px) |
| `--spacing-2` | `0.5rem` (8px) |
| `--spacing-4` | `1rem` (16px) |
| `--spacing-6` | `1.5rem` (24px) |
| `--spacing-8` | `2rem` (32px) |
| `--spacing-12` | `3rem` (48px) |
| `--spacing-16` | `4rem` (64px) |
| `--spacing-24` | `6rem` (96px) |

---

### 17.4 Border Radius

| Token | Waarde | Gebruik |
|-------|--------|---------|
| `--radius-sm` | `6px` | Kleine elementen |
| `--radius-md` | `10px` | Buttons, inputs, nav links |
| `--radius-lg` | `14px` | Standaard cards |
| `--radius-xl` | `20px` | Grote cards, glass containers |
| `--radius-2xl` | `28px` | Hero elementen |
| `--radius-full` | `9999px` | Badges, pills |

---

### 17.5 Schaduwen

| Token | Waarde |
|-------|--------|
| `--shadow-sm` | `0 2px 8px 0 rgba(0,0,0,0.25)` |
| `--shadow-md` | `0 4px 24px 0 rgba(0,0,0,0.35), 0 1px 4px rgba(0,0,0,0.25)` |
| `--shadow-lg` | `0 12px 40px 0 rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.30)` |
| `--shadow-xl` | `0 24px 64px 0 rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.30)` |
| `--shadow-glow-gold` | `0 0 32px rgba(196,169,106,0.20), 0 0 8px rgba(196,169,106,0.10)` |
| `--shadow-glow-green` | `0 0 32px rgba(110,158,101,0.20)` |

---

### 17.6 Transitties

| Token | Waarde | Gebruik |
|-------|--------|---------|
| `--transition-fast` | `150ms ease-out` | Hover states, micro-interacties |
| `--transition-base` | `250ms ease-out` | Standaard transities |
| `--transition-slow` | `400ms cubic-bezier(0.22, 1, 0.36, 1)` | Scroll-reveal, complexe animaties |

---

### 17.7 Layout Containers

| Token | Waarde | Gebruik |
|-------|--------|---------|
| `--container-content` | `720px` | Prose/blog-content |
| `--container-wide` | `1200px` | Standaard `.container` class |
| `--container-full` | `1440px` | Full-width secties |

**`.container` class:** `width: 100%`, `max-width: 1200px`, `margin: auto`, `padding: 0 1.25rem` (mobiel) / `0 2rem` (≥768px)

**`.section-gap` class:** `padding: 4rem 0` (mobiel) / `6rem 0` (≥768px), `z-index: 1`

---

### 17.8 Glassmorphism Utility Classes

#### `.glass`
```css
background: rgba(255,255,255,0.08);
backdrop-filter: blur(16px) saturate(140%);
border: 1px solid rgba(255,255,255,0.10);
border-radius: 14px;  /* --radius-lg */
```

#### `.glass-sm`
Lichter: `blur(8px)`, `rgba(255,255,255,0.04)`, `border-radius: 10px`

#### `.glass-card` (+ hover)
Meest gebruikt. `blur(20px) saturate(150%)`, `border-radius: 20px`, `box-shadow: --shadow-md`.
Hover: `translateY(-4px)`, groene glow (`0 0 32px rgba(110,158,101,0.16)`)

#### `.glass-card--gold`
Gouden accentlijn bovenaan (`border-top: 2px solid #C4A96A`), goud glow.

#### `.glass-card--shimmer`
Animated gradient border (shimmer rotatie via `shimmer-border` keyframe, 4s infinite). Mask-techniek voor border-only effect.

---

### 17.9 Utility Classes

| Class | Beschrijving |
|-------|-------------|
| `.badge` | Pill-vormige label — goud, uppercase, 0.75rem, glow box-shadow |
| `.section-label` | Kleine uppercase sectie-label — goud, letter-spacing, text-shadow |
| `.divider` | Horizontale gradient lijn (transparent → wit → transparent) |
| `.prose` | Artikel typografie: max-width 720px, font-size 1.125rem, line-height 1.8 |
| `.nav-link-glow` | Nav-link met gold underline animatie (width 0 → 100% on hover) |
| `.btn-primary` | CTA knop: translateY(-2px) + goud glow hover, press scale(0.97) |
| `.animate-pulse-green` | Box-shadow pulse animatie (groen, 4s infinite) |
| `.animate-pulse-gold` | Box-shadow pulse animatie (goud, 3.5s infinite) |
| `.animate-float` | Verticale float (−8px, 6s infinite) |
| `.animate-float-slow` | Langzame float met subtiele rotatie (8s infinite) |
| `.animate-fade-up` | Eenmalig fade-in van onder (0.6s, cubic-bezier) |

---

### 17.10 Achtergrond — Canvas Effect

**Body gradient** (twee radiale ellipsen + canvas kleur):
```css
background:
  radial-gradient(ellipse 80% 60% at 20% -10%, rgba(70,110,60,0.18) 0%, transparent 60%),
  radial-gradient(ellipse 60% 40% at 85% 90%,  rgba(40,80,35,0.14) 0%, transparent 50%),
  #0D1F12;
```

**Grain texture overlay** (`body::before`): SVG fractal noise via data-URI, `opacity: 0.035`, `fixed`, `pointer-events: none`. Geeft analoog/naturalistic gevoel aan het donkere canvas.

**Ambient Orbs** (in `BaseLayout.astro`): 3× `<div class="ambient-orb">` elementen, `position: fixed`, `z-index: 0`, `border-radius: 50%`. Geanimeerd via `orb-drift-1/2/3` keyframes (24–30s infinite loops met scale en translate).

---

### 17.11 Animatie Keyframes — Overzicht

| Keyframe | Duur typisch | Gebruik |
|----------|-------------|---------|
| `orb-drift-1/2/3` | 24–30s | Ambient orb beweging (BaseLayout) |
| `pulse-glow-green` | 4s | Groene glow pulse op cards/elements |
| `pulse-glow-gold` | 3.5s | Gouden glow pulse op CTA's |
| `pulse-glow` | Legacy | Identiek aan gold variant, backwards compat |
| `shimmer-border` | 4s | Roterende gradient border (`.glass-card--shimmer`) |
| `shimmer` | — | Horizontale shimmer (loading states) |
| `fade-up` | 0.6s | Eenmalige entree animatie van onder |
| `fade-in` | — | Opacity-only fade in |
| `scale-in` | — | Scale 0.94 → 1 + fade in |
| `slide-up` | — | 40px omhoog + fade in |
| `float` | 6s | Verticaal zweven (−8px) |
| `float-slow` | 8s | Langzaam zweven + micro-rotatie |
| `btn-press` | — | Knop-press feedback (scale 0.96) |
| `number-punch` | — | Stat counter verschijning (scale punch) |
| `pulse-dot` | — | Badge pulserende status-dot |

**Motion accessibility:** `@media (prefers-reduced-motion: reduce)` → alle animaties op `0.01ms` gezet.

---

### 17.12 Scroll-Reveal Systeem

Geactiveerd via IntersectionObserver in `BaseLayout.astro` (client-side JavaScript). Voegt `.visible` class toe zodra element in viewport komt.

| Class | Effect |
|-------|--------|
| `.reveal` | `translateY(28px)` → `translateY(0)` + fade in (`--transition-slow`) |
| `.reveal-up` | `translateY(32px)` → `0` + fade in (0.55s cubic-bezier) |
| `.reveal-fade` | Opacity-only 0 → 1 (0.5s ease-out) |
| `.reveal-scale` | `scale(0.94)` → `scale(1)` + fade in (0.45s) |

**Staggering:** `.delay-100` t/m `.delay-700` (100ms–700ms `transition-delay`) voor getrapt onthullen van elementen in een rij.

---

### 17.13 Input Focus State (globaal)

Alle `input`, `select`, `textarea` elementen krijgen bij focus:
```css
outline: none;
border-color: rgba(110,158,101,0.50) !important;
box-shadow: 0 0 0 3px rgba(110,158,101,0.12), 0 0 16px rgba(110,158,101,0.10) !important;
```
Zorgt voor consistente groene focus-ring in alle islands (OfferteFormulier, calculators, Zoekbalk).

**Accessibility:** `:focus-visible` outline: `2px solid #C4A96A` (goud) met `outline-offset: 3px`.

---

### 17.14 Header Styling

`Header.astro` is een `position: sticky; top: 0; z-index: 50` bar met:
- Glassmorphism: `background: rgba(13,31,18,0.55)`, `backdrop-filter: blur(20px) saturate(160%)`
- Scroll-state: `window.scrollY > 20` → `.header-scrolled` class → `background: rgba(13,31,18,0.85)` + `box-shadow`
- Hoogte: `4rem` (64px)
- Desktop (≥768px): nav links, login ghost button, CTA button
- Mobiel (<768px): hamburger toggle → slide-down menu met eigen nav + CTA
- Nav link hover: gouden underline animate van links naar rechts (`scaleX(0 → 1)`)
- CTA hover: `translateY(-2px) scale(1.02)` + goud glow shadow

### 17.15 Footer Styling

`Footer.astro` is een 4-koloms grid (`2fr 1fr 1fr 1fr` op ≥1024px):
- Kolommen: Brand (logo + tagline + beschrijving), Platform nav, Tools nav, Contact/Legal
- Decoratief: `footer-glow-line` — goud gradient horizontale streep op top border
- `background: rgba(8,18,10,0.85)` (iets donkerder dan canvas)
- Bottom bar: copyright + disclaimer tekst (`rgba(237,242,236,0.28)`)
- Portal link in footer is goud gekleurd (`rgba(196,169,106,0.55)`)
