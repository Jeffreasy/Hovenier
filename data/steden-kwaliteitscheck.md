# Steden Kwaliteitscheck

**Datum:** 2026-03-29
**Uitgevoerd door:** Data Steward

## Samenvatting

| Metriek | Waarde |
|---------|--------|
| Totaal bestanden | 1385 |
| Parse errors | 0 |
| Description > 160 tekens | 1384 |
| Slug mismatch | 0 |
| Ongeldige regio | 0 |
| aantalHoveniers = 0/null | 0 |
| Grondsoort ontbreekt | 1385 |
| Gemeente verdacht (= dorpsnaam) | 814 |
| Prioriteit verdacht (prio 2, <=2 hoveniers) | 814 |

## Kritieke problemen

### 1. Descriptions te lang (1384/1385)

Bijna alle descriptions overschrijden de 160-tekenlimiet. De huidige template is te lang:

> "Vind een hovenier in {naam}. Vergelijk {n} hoveniers op reviews en prijs. Tarieven in {naam} liggen gemiddeld op {prijs}. Vraag gratis offertes aan bij lokale hoveniers in {naam}."

Gemiddelde lengte: ~196 tekens. Langste: 253 tekens (westerhaar-vriezenveensewijk.json).

**Actie:** Descriptions verkort naar max 160 tekens.

### 2. Grondsoort ontbreekt overal (1385/1385)

Geen enkel bestand heeft het veld "grondsoort" ingevuld. Dit is een optioneel veld maar waardevol voor lokale SEO.

**Actie:** Verrijkingstaak nodig (Type 3 uit AGENTS.md).

## Waarschuwingen

### 3. Gemeente verdacht (814 bestanden)

814 bestanden hebben gemeente gelijk aan de plaatsnaam. Voor kleine dorpen is dit waarschijnlijk incorrect 
(bijv. "1e Exloermond" hoort bij gemeente "Borger-Odoorn").

**Actie:** Handmatige controle nodig per batch van 50.

### 4. Prioriteit verdacht (814 bestanden)

814 bestanden hebben prioriteit 2 (20-100k inwoners) maar slechts 1-2 hoveniers, 
wat eerder wijst op een klein dorp (prioriteit 3, <20k inwoners).

**Actie:** Controle tegen inwoneraantallen per batch.

### 5. Regio-inconsistenties

- **Overijssel:** 93 steden in "Oost-Nederland", 2 in "Overijssel" — inconsistent
- **Flevoland/Randstad:** 12 Flevoland-dorpen (o.a. Urk, Bant, Creil) staan als "Randstad". 
  Alleen Almere is verdedigbaar als Randstad.

**Actie:** Regio-toewijzing harmoniseren.

## Geen problemen gevonden

- Alle verplichte velden aanwezig in alle bestanden
- Geen slug/bestandsnaam mismatches
- Alle regio-waarden zijn geldig (uit de toegestane lijst)
- Alle aantalHoveniers zijn geldige getallen > 0
- Geen JSON parse errors

## Aanbevolen vervolgacties

1. **[GEDAAN]** Descriptions verkorten naar <=160 tekens
2. **[TODO]** Gemeente-namen corrigeren (batches van 50)
3. **[TODO]** Prioriteiten controleren tegen inwoneraantallen
4. **[TODO]** Regio-toewijzing Overijssel en Flevoland harmoniseren
5. **[TODO]** Grondsoort toevoegen (batches van 50)
6. **[TODO]** Descriptions uniek maken per stad (batches van 50)