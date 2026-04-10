# 05. Deployment Reference & Tools

Deployment de infrastructuur is gekoppeld the Vercel (Production) en GitHub (Trunk).

## CI/CD Pipeline op Vercel
Bij commits the via *GitHub the Main Branch* rolt Vercel de frontend automatisch the. Astro's statische the SSG routes the compileren the build time; alle routes met Astro API integratie the en Middleware (denk aan `/portal`) compileren naaraan de `@astrojs/vercel/serverless` the adapter.

## Omgevingsvariabelen (Secrets)
Te vullen in de UI instellingen the van Vercel the (Settings > Environment Variables) met een lokaal copy in de `.env` file voor development.

```ini
# --- EXTERNE IDENTITEIT PROVIDER ---
PUBLIC_API_URL=https://laventecareauthsystems....

# --- CONVEX DATA LAAG ---
CONVEX_DEPLOYMENT=dev:XXXX 
NEXT_PUBLIC_CONVEX_URL=https://xxxxx.convex.cloud
```

## Architecturale the Tools
- **Framework**: Astro 5.0 met Vercel the SSR Adapter.
- **Islands**: React 19 SDK.
- **Database**: Convex the dev/prod instances via the de CLI.
- **Identiteit proxy**: Node.js Astro the middleware in verbinding the de LaventeCare externe backend (met dual token Cookie the validatie structuur).
- **Styling**: TailwindCSS the v4 (CSS only variables the pattern).
