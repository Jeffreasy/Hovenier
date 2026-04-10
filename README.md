# Tuinhub — The Master Handbook

<div align="center">

**Het landelijke lead- en matchingplatform voor Hoveniers**

[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)](https://tuinhub.nl)
[![Astro](https://img.shields.io/badge/Astro-5.x-orange?logo=astro)](https://astro.build)
[![Convex](https://img.shields.io/badge/Database-Convex-purple?logo=convex)](https://convex.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://typescriptlang.org)

</div>

---

## 🚀 TL;DR

Dit repository is de frontend en portal-applicatie voor Tuinhub. Het maakt gebruik van een 3-tier architectuur:

1. **Astro (Frontend)**: Server-Side Rendered (SSR) pagina's voor publieke directories en SEO, met React 19 Islands voor client-side state.
2. **Convex (Database)**: Serverless NoSQL datasource voor realtime verwerking van Leads, Hoveniersprofielen en de Google Places import-database.
3. **LaventeCare Auth (Identity)**: De externe Go-backend die alle SSO, registraties en sessie-validatie via HttpOnly cookies afhandelt.

---

## 📚 Documentatie Overzicht

Alle technische documentatie over de architectuur, schema's en workflows is opgedeeld in losse modules in de `docs/` folder:

1. **[01. Architecture & Data Model](./docs/01_architecture_data.md)**: Tabellen, Convex typings (`schema.ts`) en roadmap features.
2. **[02. Frontend & Design System](./docs/02_frontend_design.md)**: Astro Islands, layout structuur en componenten.
3. **[03. Portal & Target Operations](./docs/03_portal_operations.md)**: API contracten (`/auth/me`), fail-states en error handling.
4. **[04. Development & Testing Workflow](./docs/04_development_testing.md)**: Lokale opstart-instructies en CLI commando's.
5. **[05. Deployment & Tools Reference](./docs/05_deployment_reference.md)**: Vercel configuraties, image pipelines, security policies en rate limits.

---

## 🛠️ Lokale Ontwikkeling

### Vereisten
- Node.js 20.17+ (of 24+)
- Convex project (toegewezen via `npx convex dev`)
- Actief `.env` bestand met LaventeCare API-keys en toegewezen identiteit-tenant identifiers.

### Setup Process

```bash
npm install
npx convex dev
npm run dev
```

De lokale server luistert op `http://localhost:4321`.
