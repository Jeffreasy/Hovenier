# 04. Development & Testing Workflow

Instructie-sheet om Tuinhub's frontend en database proxy lokaal correct op te zetten en te testen vóór CI/CD push acties naar Vercel.

## Lokale Ontwikkeling

### Prerequisites
1. **Node.js**: Controleer de runtime (minimaal v20.17+; let op the package.json targetting v24). 
2. **Convex Environment**: Beveilig lokaal the `.env` (via Vercel CLI pull of .env.local file) bestand behorende bij te the specifieke team deployment voor Live Data Testing.
3. **LaventeCare Backend**: Afhankelijk van the variable `PUBLIC_API_URL` wijst testing lokaal naar Sandbox/Render of een Docker image run op `localhost:8080`.

### Development Commands

```bash
# Terminal 1: Realtime Database Mirror & React Subscriptions
npx convex dev

# Terminal 2: Astro SSR Backend & Vite HMR Router
npm run dev
```

Project lokaal actief op `http://localhost:4321`.

### Build & Controle Frameworks

Het test domein leunt exclusief op statische code analyse tooling van the JS ecosysteem omwille van the eiland-architectuur.

```bash
# Type check the .astro views (inclusief Props structuur check)
npm run type-check

# Simuleer the Production bundler lokaal voor de vite-node output:
npm run build
```

---

## Framework Ontwikkelings Standaarden

- **Islands (`src/components/islands/`)**: The client view hydration flags `client:load`, `client:idle`, of `client:only="react"` zijn verplicht voor dynamic state-componenten, anders fungeert React in dit project feitelijk enkel als een statische templating engine op the Vercel container. 
- **SSR Variables**: Bij Astro the `---\n ... \n---` definities acteren op the server, dit betekent the inroepen van environment variabelen met `process.env` hier veilig is, maar niet zal compileren in de Islands tenzij gemarkeerd via prefix the `PUBLIC_` string.

## Security & Rate Limiting Awareness

De applicatie wordt beschermt op globaal niveau door The LaventeCare Go API backend:
*   Deze service stelt in de basis harde API blockades in vanaf 25 HTTP calls the seconde. Wees je hiervan bewust indien je lokale iteratieve API queries bouwt in de frontend Islands (zoals fetch-in-loops the `/auth/me` endpointer).
*   *Note: Rate limiting, Turnstile verwerkingen op de front-end offerte formulieren (`/offerte` POST triggers) om bulk-spam the voorkomen vereisen extra overweging tijdens verdere doorontwikkeling van het form block binnen Astro, Convex is van zichzelf inherent vatbaar the publieke mutaties zonder externe proxy.*
