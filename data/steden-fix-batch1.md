# Steden Data Fix — Batch 1

**Datum:** 2026-03-29
**Agent:** Data Steward
**Taak:** TUI-15

## 1. Regio-inconsistenties (14 bestanden gewijzigd)

### Overijssel → Oost-Nederland (2 bestanden)
| Bestand | Oud | Nieuw |
|---------|-----|-------|
| enschede.json | Overijssel | Oost-Nederland |
| zwolle.json | Overijssel | Oost-Nederland |

### Flevoland/Randstad → Midden-Nederland (12 bestanden)
| Bestand | Oud | Nieuw |
|---------|-----|-------|
| bant.json | Randstad | Midden-Nederland |
| biddinghuizen.json | Randstad | Midden-Nederland |
| creil.json | Randstad | Midden-Nederland |
| ens.json | Randstad | Midden-Nederland |
| espel.json | Randstad | Midden-Nederland |
| kraggenburg.json | Randstad | Midden-Nederland |
| luttelgeest.json | Randstad | Midden-Nederland |
| marknesse.json | Randstad | Midden-Nederland |
| nagele.json | Randstad | Midden-Nederland |
| rutten.json | Randstad | Midden-Nederland |
| tollebeek.json | Randstad | Midden-Nederland |
| urk.json | Randstad | Midden-Nederland |

### Regio-verificatie: niet-conforme waarden (602 bestanden)

Na de fixes hierboven zijn er nog 8 regio-waarden die NIET in de 5-waarden set (Randstad, Noord-Nederland, Oost-Nederland, Zuid-Nederland, Midden-Nederland) vallen:

| Huidige regio | Aantal | Voorgestelde mapping |
|---------------|--------|---------------------|
| Brabant & Zeeland | 254 | Zuid-Nederland |
| Gelderse Vallei & Rivierenland | 221 | Oost-Nederland / Midden-Nederland |
| Limburg | 104 | Zuid-Nederland |
| Flevoland | 11 | Midden-Nederland |
| Noord-Holland | 4 | Randstad |
| Brabant | 4 | Zuid-Nederland |
| Gelderland | 3 | Oost-Nederland |
| Utrecht | 1 | Midden-Nederland |

**Actie vereist:** Beslissing van Architect over volledige regio-migratie naar 5-waarden schema. Dit raakt 602 bestanden en vereist meerdere batches.

## 2. Gemeente-namen gecorrigeerd (34 van 50 bestanden)

Van de eerste 50 bestanden (alfabetisch: 1e-exloermond t/m apeldoorn) hadden 34 een onjuiste gemeente (dorpsnaam ipv gemeentenaam). 16 bestanden waren al correct.

### Gecorrigeerde bestanden

| Bestand | Oud (dorpsnaam) | Nieuw (gemeente) |
|---------|----------------|-----------------|
| 1e-exloermond.json | 1e Exloermond | Borger-Odoorn |
| aagtekerke.json | Aagtekerke | Veere |
| aalden.json | Aalden | Coevorden |
| aalst.json | Aalst | Zaltbommel |
| aarlanderveen.json | Aarlanderveen | Alphen aan den Rijn |
| aarle-rixtel.json | Aarle-Rixtel | Laarbeek |
| abbenbroek.json | Abbenbroek | Nissewaard |
| abcoude.json | Abcoude | De Ronde Venen |
| achterveld.json | Achterveld | Leusden |
| aerdt.json | Aerdt | Zevenaar |
| afferden.json | Afferden | Druten |
| agelo.json | Agelo | Dinkelland |
| akersloot.json | Akersloot | Castricum |
| akkrum.json | Akkrum | Heerenveen |
| albergen.json | Albergen | Tubbergen |
| aldtsjerk.json | Aldtsjerk | Tytsjerksteradiel |
| aldwald.json | Aldwald | Noardeast-Fryslan |
| almen.json | Almen | Lochem |
| almkerk.json | Almkerk | Altena |
| alphen.json | Alphen | Alphen-Chaam |
| alteveer.json | Alteveer | Stadskanaal |
| ambt-delden.json | Ambt Delden | Hof van Twente |
| america.json | America | Horst aan de Maas |
| amerongen.json | Amerongen | Utrechtse Heuvelrug |
| ammerzoden.json | Ammerzoden | Maasdriel |
| amstenrade.json | Amstenrade | Beekdaelen |
| andel.json | Andel | Altena |
| andelst.json | Andelst | Overbetuwe |
| andijk.json | Andijk | Medemblik |
| angeren.json | Angeren | Lingewaard |
| angerlo.json | Angerlo | Zevenaar |
| ankeveen.json | Ankeveen | Wijdemeren |
| anna-paulowna.json | Anna Paulowna | Hollands Kroon |
| annen.json | Annen | Aa en Hunze |

### Overgeslagen (gemeente was al correct)
aalsmeer, aalten, alblasserdam, alkmaar, almelo, almere (+ 5 deelgebieden), alphen-aan-den-rijn, amersfoort, amstelveen, amsterdam, apeldoorn

## Samenvatting

| Categorie | Gewijzigd | Overgeslagen |
|-----------|-----------|-------------|
| Regio-fix Overijssel | 2 | — |
| Regio-fix Flevoland | 12 | — |
| Gemeente-fix (batch 1) | 34 | 16 |
| **Totaal** | **48** | **16** |

## Openstaand voor volgende batches
- Regio-migratie naar 5-waarden schema (602 bestanden)
- Gemeente-correcties bestanden 51-864 (resterend ~780 bestanden)
- Flevoland-bestanden hebben ook gemeente=dorpsnaam (bant→Noordoostpolder, etc.)
