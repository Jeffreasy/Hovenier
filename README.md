# Tuinplatform — Hovenier Matchmaking Platform

**Tuinplatform** (`tuinplatform.nl`) koppelt huiseigenaren aan gecertificeerde hoveniers in hun regio. Bezoekers vragen gratis offertes aan via een multi-step formulier; hoveniers beheren leads via een besloten portal.

---

## Tech Stack

| Laag      | Technologie                                           |
| --------- | ----------------------------------------------------- |
| Framework | [Astro 6](https://astro.build) — SSR via Vercel adapter |
| UI        | React 19 Islands + Tailwind CSS v4                    |
| Auth      | [Clerk](https://clerk.com) (JWT, middleware, betaald)   |
| Database  | [Convex](https://convex.dev) (real-time, serverless, betaald) |
| Deploy    | [Vercel](https://vercel.com) (Edge Functions, betaald)  |
| Alternatief | [Render](https://render.com) (betaald, alternatief voor Vercel) |
| Fonts     | Plus Jakarta Sans (headings) + Inter (body)           |
| Node      | ≥ 24.0.0                                             |

---

## Lokale Ontwikkeling

### Vereisten

- Node.js ≥ 24
- Een Clerk account (betaalde tier)
- Een Convex account (betaalde tier)

### Setup

```bash
# 1. Clone & installeer
git clone <repo-url>
cd Hovenier
npm install

# 2. Omgevingsvariabelen instellen
cp .env.example .env.local
# Vul CLERK_* en PUBLIC_CONVEX_URL in (zie .env.example)

# 3. Start Convex (backend, apart terminal venster)
npx convex dev

# 4. Start Astro dev server
npm run dev
# → http://localhost:4321
```

### Beschikbare Commands

| Command                | Actie                                         |
| ---------------------- | --------------------------------------------- |
| `npm run dev`        | Start dev server op `localhost:4321`        |
| `npm run build`      | Type-check + productie build naar `./dist/` |
| `npm run preview`    | Preview van de productie build                |
| `npm run type-check` | Alleen TypeScript validatie (geen build)      |
| `npx convex dev`     | Start Convex realtime backend                 |

---

## Omgevingsvariabelen

Zie [`.env.example`](.env.example) voor alle variabelen met instructies.

| Variabele                        | Verplicht | Beschrijving                        |
| -------------------------------- | --------- | ----------------------------------- |
| `PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅        | Clerk publieke sleutel              |
| `CLERK_SECRET_KEY`             | ✅        | Clerk geheime sleutel (server-only) |
| `PUBLIC_CONVEX_URL`            | ✅        | Convex deployment URL               |

---

## Deployment (Vercel)

1. Verbind de repository met Vercel
2. Voeg alle omgevingsvariabelen toe in het Vercel dashboard
3. Vercel detecteert automatisch het Astro framework
4. Elke push naar `main` triggert een automatische deploy

> **Let op:** Convex draait apart van Vercel. Zorg dat `npx convex deploy` is uitgevoerd en de productie-URL matcht met `PUBLIC_CONVEX_URL`.

---

## Projectstructuur (overzicht)

```
src/
├── components/layout/   # Header, Footer
├── content/             # Blog, FAQ, Steden, Subsidies (Markdown/JSON)
├── islands/             # React Islands (calculators, formulieren)
├── layouts/             # BaseLayout, ArticleLayout, LocalLayout, ToolLayout
├── lib/                 # Business logic (types, constants, pricing, seo, utils)
├── pages/               # Astro routes
└── styles/              # global.css

convex/
├── schema.ts            # Database schema (leads, hoveniers)
├── leads.ts             # Lead mutations & queries
├── hoveniers.ts         # Hovenier mutations & queries
└── http.ts              # HTTP endpoints (POST /submit-lead)
```

> **Technische documentatie** → zie [`CODEBASE.md`](CODEBASE.md)
