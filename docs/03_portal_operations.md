# 03. Portal & Lead Operations

Dit document dekt de afgeschermde werking van de portal omgeving en documenteert the LaventeCare legacy verhoudingen in de data-structuur.

## Authentificatie via LaventeCare Auth

> [!NOTE]
> De backend die authenticatie voor deze client verzorgt is **LaventeCare AuthSystem** (Een externe Go-gebaseerde identiteit provider). Er bevindt zich lokaal op dit domain geen authentificatie-provider infrastructuur anders dan sessie checks.

## De Access Control Loop (Middleware)

Toegang in the portaal staat onder de stringente begeleiding van `src/middleware.ts`. 

1. **Bezoekersstroom**: Een gebruiker komt aan op een route binnen `/portal/*`.
2. **Validatie**: De middleware leest het eventuele `access_token` `HttpOnly` koekje.
3. **API Ping**: Wordt gelanceerd (via een interne `fetch()`) aan `https://laventecareauthsystems.onrender.com/api/v1/auth/me`.

### Het `/auth/me` API Contract
Indien de token succesvol doorkomt, antwoordt de LaventeCare Go API met een HTTP 200 Profile structuur met volgend JSON contract:

```json
{
  "user": {
    "id": "e83b879c-c081-432d-... ",
    "email": "hovenier@domein.nl",
    "full_name": "Naam Achternaam",
    "role": "user" // Role Based op the Tenant Assignment
  }
}
```

De Astro Middleware normaliseert dit in `Astro.locals.user`, waarbij in dit specifieke project de key `full_name` naar `Astro.locals.user.name` gecast is.

### Timeout en Foutafhandeling

*   **Pings Snelheid**: De LaventeCare `/auth/me` is verbonden aan de edge routing van Render, dus de fetch reactietijd bepaalt in dit project wezenlijk de SSR return tijd naar de eindgebruiker voor de pagina's onder `/portal`.
*   **Fail-State**: Als LaventeCare niet beschikbaar is (timeout op the fetch), een HTTP 403 terugwerpt, of de cookie verouderd blijkt, nullt the middleware de the `Astro.locals.user`.
*   **Fallback**: Omdat de User `null` terugkeert, dwingt de middleware een locale HTTP 302 Redirect af (`return redirect('/inloggen')`). Er treedt **geen harde crash** op van de applicatie, maar operaties in the `/portal` bevriezen totdat LaventeCare terug reageert en authenticeert.

---

## Leads Funneling 

1. `nieuw`: Aanvraag is zojuist binnengekomen in the database.
2. `klant_gesproken`: Concierge update.
3. `gematcht`: Database record veld `toegewezenAan` bevat een string equivalent met de ingelogde (LaventeCare) UserID en is in te zien in het respectievelijke portaalvenster.

## Het Claim Systeem

Tijdens de registratieflow of via portaal navigatie krijgt een hovenier de optie hun bedrijf uit meer dan 5000 Google Places geïmporteerde records (de `bedrijven` tabel) te koppelen. 

Als the frontend validatie toelaat: wordt the LaventeCare UserID (als `claimedByUserId`) als match vastgeclipt aan het bedrijf node en hiermee de write-rechten gevalideerd binnen the Convex engine.
