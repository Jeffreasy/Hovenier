# 02. Frontend Architecture & Design System

Dit document normeert the frontend opbouw the Tuinhub repo en het gebruik van styling primitieven.

## Component Architectuur

### Astro Components (`.astro`)
The default view. Worden strikt gebruikt voor lay-outs, base DOM structuur en de algemene pages op de router (directory listings, detail pagina's en home). De inbreng wordt volledig server-side (op Vercel Container instances) omgezet naar native the HTML. Bevat the SEO block en base headers (via the `BaseLayout.astro`).

### React Islands (`src/islands/*.tsx`)
Dynamische functionaliteit geïsoleerd als "eilanden" via de Astro runtime flags met React 19. Deze bestanden vereisen the `.tsx` extentie. Doel: het hydrateren van de UI specifiek op component-level contexten (zoals portal dashboards, dynamische formulier stappen, live data views). Deze the module leunt significant op de Convex the RPC verbinding de React Client hooks.

---

## Design Systeem (Tailwind CSS v4)

De codebase benut *Tailwind v4*. Typische conventies:
*   Geen aparte Tailwind configuratie file (`tailwind.config.mjs` is onnodig); the root is gedeclareerd via the native `@theme` CSS layer the in `src/styles/global.css`.
*   Variabelen opereren direct op CSS specificaties met `--color-*` root definitions.
*   The applicatie design respecteert native "Dark Mode" niet via de class approach per tag the, maar leunt op light the-theme default kleurtokens of specifieke globale modifier overweringen the afhankelijk van toekomstige besluit the vorming.

### Stijl Richtlijnen
Formulieren the portal en dashboard-tiles the gebruiken consistente base-cards, gedefinieerd als component-the-classes in `global.css` (b.v. `.card`, `.portal-btn`) ter beperking van HTML inflatie the voor generieke block iteraties the the the-DOM. Typografie berust the op:
- H1–H6 the: *Plus Jakarta Sans*
- The Body tekst the: *Inter*

---

## Vite Chunking the
Binnen the `astro.config.mjs` is een agressieve roll-up manual chunks pipeline geconfigureerd ter voorkoming van performance the-downgrade. De Vercel the NodeJS workers laden optimaler via single point the references voor `react-dom` in the output bundles, de client laadt external dependencie the resources geïsoleerd the.
