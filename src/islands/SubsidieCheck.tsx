import type { FC } from 'react'
import { useState } from 'react'
import { sharedCalcStyles } from './SchuttingCalculator'
import { isValidPostcode } from '../lib/utils'

/**
 * SubsidieCheck — Volledig geïmplementeerd
 *
 * Data wordt via props meegegeven vanuit de Astro page (getCollection('subsidies')).
 * Postcode-naar-gemeente mapping op basis van 4-cijferig prefix.
 */

export interface SubsidieData {
  gemeente:    string
  naam:        string
  bedrag:      string
  aanvraagUrl: string
  body:        string   // Markdown body (als plain text samenvatting)
}

interface Props {
  subsidies: SubsidieData[]
}

// ─── Postcode → gemeente mapping ─────────────────────────────────────────────
// prefixes: 2-cijferige ÓÓÓF 4-cijferige postcode prefix (4-digit heeft prioriteit)
// Volgorde = prioriteit bij overlap binnen hetzelfde aantal cijfers.

const POSTCODE_GEMEENTE: Array<{ prefixes: string[]; gemeente: string }> = [
  // ── Flevoland (specifieke 4-digit voor overlappende prefixes) ──────────────
  { gemeente: 'Dronten',          prefixes: ['8250', '8251', '8252', '8253', '8254', '8255', '8256', '8257', '8258', '8259'] },
  { gemeente: 'Noordoostpolder',  prefixes: ['8300', '8301', '8302', '8310', '8313', '8314', '8315', '8316', '8317', '8318', '8319', '8320', '8321', '8322', '8323', '8324', '8325', '8326', '8327', '8328', '8329'] },
  { gemeente: 'Zeewolde',         prefixes: ['3890', '3891', '3892', '3893'] },
  { gemeente: 'Almere',           prefixes: ['13', '14'] },
  { gemeente: 'Lelystad',         prefixes: ['82', '83'] },

  // ── Noord-Holland ──────────────────────────────────────────────────────────
  { gemeente: 'Amsterdam',       prefixes: ['10', '11', '12'] },
  { gemeente: 'Zaandam',         prefixes: ['15', '16'] },
  { gemeente: 'Haarlem',         prefixes: ['20', '21'] },
  { gemeente: 'Alkmaar',         prefixes: ['18', '19'] },

  // ── Zuid-Holland ───────────────────────────────────────────────────────────
  { gemeente: 'Leiden',          prefixes: ['23', '24'] },
  { gemeente: 'Den Haag',        prefixes: ['25', '26', '27', '28'] },
  { gemeente: 'Rotterdam',       prefixes: ['30', '31', '32'] },
  { gemeente: 'Dordrecht',       prefixes: ['33', '34'] },

  // ── Utrecht ────────────────────────────────────────────────────────────────
  { gemeente: 'Utrecht',         prefixes: ['35', '36'] },
  { gemeente: 'Amersfoort',      prefixes: ['37', '38', '39'] },

  // ── Noord-Brabant ──────────────────────────────────────────────────────────
  { gemeente: 'Tilburg',         prefixes: ['50', '51'] },
  { gemeente: "'s-Hertogenbosch", prefixes: ['52', '53'] },
  { gemeente: 'Breda',           prefixes: ['47', '48', '49'] },
  { gemeente: 'Eindhoven',       prefixes: ['56', '57', '58'] },

  // ── Gelderland ─────────────────────────────────────────────────────────────
  { gemeente: 'Nijmegen',        prefixes: ['65', '66'] },
  { gemeente: 'Arnhem',          prefixes: ['68', '69'] },
  { gemeente: 'Apeldoorn',       prefixes: ['73', '74'] },

  // ── Overijssel ─────────────────────────────────────────────────────────────
  { gemeente: 'Zwolle',          prefixes: ['80', '81'] },
  { gemeente: 'Enschede',        prefixes: ['75', '76', '77'] },
  { gemeente: 'Deventer',        prefixes: ['74'] },

  // ── Groningen ──────────────────────────────────────────────────────────────
  { gemeente: 'Groningen',       prefixes: ['97', '98'] },

  // ── Drenthe ────────────────────────────────────────────────────────────────
  { gemeente: 'Emmen',           prefixes: ['78', '79'] },
  { gemeente: 'Assen',           prefixes: ['94'] },

  // ── Friesland ──────────────────────────────────────────────────────────────
  { gemeente: 'Leeuwarden',      prefixes: ['89', '90'] },

  // ── Limburg ───────────────────────────────────────────────────────────────
  { gemeente: 'Venlo',           prefixes: ['59', '60'] },
  { gemeente: 'Maastricht',      prefixes: ['62'] },

  // ── Zeeland ───────────────────────────────────────────────────────────────
  { gemeente: 'Middelburg',      prefixes: ['43', '44'] },
]


function findGemeente(postcode: string): string | null {
  const digits  = postcode.replace(/\s/g, '').slice(0, 4)
  const prefix2 = digits.slice(0, 2)

  // 4-digit matching heeft prioriteit (voor nauwkeurige Flevoland-gemeenten)
  const match4 = POSTCODE_GEMEENTE.find((m) =>
    m.prefixes.some((p) => p.length === 4 && digits === p)
  )
  if (match4) return match4.gemeente

  // Fallback naar 2-digit prefix
  const match2 = POSTCODE_GEMEENTE.find((m) =>
    m.prefixes.some((p) => p.length === 2 && prefix2 === p)
  )
  return match2?.gemeente ?? null
}

function validatePostcode(value: string): boolean {
  return isValidPostcode(value.trim())
}

const SubsidieCheck: FC<Props> = ({ subsidies }) => {
  const [postcode,  setPostcode]  = useState('')
  const [gemeente,  setGemeente]  = useState<string | null>(null)
  const [results,   setResults]   = useState<SubsidieData[] | null>(null)
  const [error,     setError]     = useState<string | null>(null)
  const [searched,  setSearched]  = useState(false)

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setError(null)

    if (!validatePostcode(postcode)) {
      setError('Voer een geldige postcode in (bijv. 1234 AB)')
      return
    }

    const gevondenGemeente = findGemeente(postcode)
    setGemeente(gevondenGemeente)
    setSearched(true)

    if (!gevondenGemeente) {
      setResults([])
      return
    }

    const matches = subsidies.filter(
      (s) => s.gemeente.toLowerCase() === gevondenGemeente.toLowerCase()
    )
    setResults(matches)
  }

  return (
    <div className="calc-placeholder">

      <form onSubmit={handleSubmit} noValidate>
        <div className="calc-step">
          <h2 className="step-title" style={{ marginBottom: '0.25rem' }}>Wat is je postcode?</h2>
          <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: 'rgba(237,242,236,0.50)' }}>
            We zoeken automatisch de subsidies die beschikbaar zijn in jouw gemeente.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              id="sc-postcode"
              type="text"
              placeholder="bijv. 1234 AB"
              value={postcode}
              onChange={(e) => { setPostcode(e.target.value); setError(null) }}
              maxLength={7}
              style={{
                flex: 1,
                minWidth: '160px',
                padding: '0.75rem 1rem',
                border: `1px solid ${error ? 'rgba(248,113,113,0.50)' : 'rgba(255,255,255,0.12)'}`,
                borderRadius: 8,
                fontSize: '1.125rem',
                background: 'rgba(255,255,255,0.06)',
                color: '#EDF2EC',
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '0.06em',
              }}
              aria-required="true"
              aria-invalid={!!error}
              aria-describedby={error ? 'sc-error' : undefined}
            />
            <button
              type="submit"
              className="calc-next-btn"
              style={{ flex: '0 0 auto' }}
            >
              Zoek subsidies →
            </button>
          </div>

          {error && (
            <p id="sc-error" role="alert" style={{ margin: '0.375rem 0 0', fontSize: '0.8rem', color: '#F87171' }}>
              {error}
            </p>
          )}
        </div>
      </form>

      {/* ── Results ── */}
      {searched && results !== null && (
        <div style={{ marginTop: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

          {gemeente && (
            <div className="gemeente-header">
              <span className="gemeente-icon">📍</span>
              <div>
                <strong>{gemeente}</strong>
                <span>{results.length === 0 ? ' — geen subsidies gevonden' : ` — ${results.length} subsidie${results.length !== 1 ? 's' : ''} beschikbaar`}</span>
              </div>
            </div>
          )}

          {results.length === 0 && (
            <div className="no-results">
              <p className="no-results-title">
                {gemeente
                  ? `Geen subsidies bekend voor ${gemeente}`
                  : 'Uw postcode valt buiten onze Fase 1 steden'
                }
              </p>
              <p className="no-results-sub">
                {gemeente
                  ? 'Jouw gemeente biedt mogelijk wel subsidies aan — check de gemeentewebsite.'
                  : 'We ondersteunen momenteel: Amsterdam, Rotterdam, Den Haag, Utrecht, Eindhoven, Tilburg, Groningen, Almere, Breda en Nijmegen. Meer steden volgen.'
                }
              </p>
              <a
                href={gemeente
                  ? `https://www.google.nl/search?q=subsidie+tuinvergroening+${encodeURIComponent(gemeente || 'gemeente')}`
                  : 'https://www.rvo.nl/subsidies-financiering'
                }
                target="_blank"
                rel="noopener noreferrer"
                className="no-results-link"
              >
                {gemeente ? `Zoek subsidies ${gemeente} →` : 'Landelijk subsidie-overzicht →'}
              </a>
            </div>
          )}

          {results.map((sub) => (
            <div key={sub.naam} className="subsidie-card">
              <div className="subsidie-card-header">
                <strong className="subsidie-naam">{sub.naam}</strong>
                <span className="subsidie-bedrag">{sub.bedrag}</span>
              </div>
              <p className="subsidie-body">{sub.body}</p>
              <a
                href={sub.aanvraagUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="subsidie-link"
              >
                Aanvragen via {sub.gemeente.toLowerCase()}.nl →
              </a>
            </div>
          ))}

          {results.length > 0 && (
            <div className="subsidie-tip">
              <span>💡</span>
              <p>Vraag eerst subsidie aan <em>vóór</em> u begint met de werkzaamheden — dit is bij de meeste gemeenten verplicht.</p>
            </div>
          )}
        </div>
      )}

      <style>{subsidieStyles}</style>
    </div>
  )
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const subsidieStyles = sharedCalcStyles + `
  .gemeente-header {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.875rem 1rem;
    background: rgba(110,158,101,0.10);
    border: 1px solid rgba(110,158,101,0.22);
    border-radius: 8px;
    font-size: 0.9rem;
    color: rgba(237,242,236,0.70);
  }
  .gemeente-icon { font-size: 1.1rem; }
  .gemeente-header strong { color: #EDF2EC; }

  .no-results {
    padding: 2rem;
    text-align: center;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    align-items: center;
  }
  .no-results-title { margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600; font-size: 1rem; color: rgba(237,242,236,0.75); }
  .no-results-sub { margin: 0; font-size: 0.875rem; color: rgba(237,242,236,0.40); max-width: 380px; line-height: 1.6; }
  .no-results-link { font-size: 0.875rem; font-weight: 600; color: #C4A96A; text-decoration: none; transition: opacity 0.15s; }
  .no-results-link:hover { opacity: 0.75; text-decoration: underline; }

  .subsidie-card {
    background: rgba(255,255,255,0.05);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 12px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    transition: border-color 0.15s;
  }
  .subsidie-card:hover { border-color: rgba(196,169,106,0.30); }

  .subsidie-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  .subsidie-naam {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.9375rem;
    font-weight: 700;
    color: #EDF2EC;
    flex: 1;
    min-width: 0;
  }
  .subsidie-bedrag {
    flex-shrink: 0;
    background: rgba(110,158,101,0.15);
    color: #86C97D;
    font-weight: 700;
    font-size: 0.875rem;
    padding: 0.2rem 0.7rem;
    border-radius: 99px;
    white-space: nowrap;
    border: 1px solid rgba(110,158,101,0.25);
  }
  .subsidie-body {
    margin: 0;
    font-size: 0.85rem;
    color: rgba(237,242,236,0.52);
    line-height: 1.6;
  }
  .subsidie-link {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #C4A96A;
    text-decoration: none;
    transition: opacity 0.15s;
    align-self: flex-start;
  }
  .subsidie-link:hover { opacity: 0.75; text-decoration: underline; }

  .subsidie-tip {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    background: rgba(196,169,106,0.07);
    border: 1px solid rgba(196,169,106,0.18);
    border-radius: 8px;
    padding: 0.875rem 1rem;
    font-size: 0.85rem;
    color: rgba(237,242,236,0.55);
  }
  .subsidie-tip span { font-size: 1rem; flex-shrink: 0; margin-top: 0.1rem; }
  .subsidie-tip p { margin: 0; line-height: 1.55; }
  .subsidie-tip em { font-style: normal; color: #C4A96A; font-weight: 600; }
`

export default SubsidieCheck
