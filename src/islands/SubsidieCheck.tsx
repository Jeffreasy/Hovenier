import type { FC } from 'react'
import { useState } from 'react'
import { isValidPostcode } from '../lib/utils'

export interface SubsidieData {
  gemeente:    string
  naam:        string
  bedrag:      string
  aanvraagUrl: string
  body:        string
}

interface Props {
  subsidies: SubsidieData[]
}

// ─── Postcode → gemeente mapping ─────────────────────────────────────────────

const POSTCODE_GEMEENTE: Array<{ prefixes: string[]; gemeente: string }> = [
  { gemeente: 'Dronten',          prefixes: ['8250', '8251', '8252', '8253', '8254', '8255', '8256', '8257', '8258', '8259'] },
  { gemeente: 'Noordoostpolder',  prefixes: ['8300', '8301', '8302', '8310', '8313', '8314', '8315', '8316', '8317', '8318', '8319', '8320', '8321', '8322', '8323', '8324', '8325', '8326', '8327', '8328', '8329'] },
  { gemeente: 'Zeewolde',         prefixes: ['3890', '3891', '3892', '3893'] },
  { gemeente: 'Almere',           prefixes: ['13', '14'] },
  { gemeente: 'Lelystad',         prefixes: ['82', '83'] },
  { gemeente: 'Amsterdam',       prefixes: ['10', '11', '12'] },
  { gemeente: 'Zaandam',         prefixes: ['15', '16'] },
  { gemeente: 'Haarlem',         prefixes: ['20', '21'] },
  { gemeente: 'Alkmaar',         prefixes: ['18', '19'] },
  { gemeente: 'Leiden',          prefixes: ['23', '24'] },
  { gemeente: 'Den Haag',        prefixes: ['25', '26', '27', '28'] },
  { gemeente: 'Rotterdam',       prefixes: ['30', '31', '32'] },
  { gemeente: 'Dordrecht',       prefixes: ['33', '34'] },
  { gemeente: 'Utrecht',         prefixes: ['35', '36'] },
  { gemeente: 'Amersfoort',      prefixes: ['37', '38', '39'] },
  { gemeente: 'Tilburg',         prefixes: ['50', '51'] },
  { gemeente: "'s-Hertogenbosch", prefixes: ['52', '53'] },
  { gemeente: 'Breda',           prefixes: ['47', '48', '49'] },
  { gemeente: 'Eindhoven',       prefixes: ['56', '57', '58'] },
  { gemeente: 'Nijmegen',        prefixes: ['65', '66'] },
  { gemeente: 'Arnhem',          prefixes: ['68', '69'] },
  { gemeente: 'Apeldoorn',       prefixes: ['73', '74'] },
  { gemeente: 'Zwolle',          prefixes: ['80', '81'] },
  { gemeente: 'Enschede',        prefixes: ['75', '76', '77'] },
  { gemeente: 'Deventer',        prefixes: ['74'] },
  { gemeente: 'Groningen',       prefixes: ['97', '98'] },
  { gemeente: 'Emmen',           prefixes: ['78', '79'] },
  { gemeente: 'Assen',           prefixes: ['94'] },
  { gemeente: 'Leeuwarden',      prefixes: ['89', '90'] },
  { gemeente: 'Venlo',           prefixes: ['59', '60'] },
  { gemeente: 'Maastricht',      prefixes: ['62'] },
  { gemeente: 'Middelburg',      prefixes: ['43', '44'] },
]

function findGemeente(postcode: string): string | null {
  const digits  = postcode.replace(/\s/g, '').slice(0, 4)
  const prefix2 = digits.slice(0, 2)

  const match4 = POSTCODE_GEMEENTE.find((m) =>
    m.prefixes.some((p) => p.length === 4 && digits === p)
  )
  if (match4) return match4.gemeente

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
    <div className="font-body text-charcoal">

      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-4">
          <h2 className="m-0 text-xl font-heading font-bold text-charcoal">Wat is je postcode?</h2>
          <p className="m-0 text-sm text-charcoal-muted">
            We zoeken automatisch de subsidies die beschikbaar zijn in jouw gemeente.
          </p>

          <div className="flex gap-3 flex-wrap">
            <input
              id="sc-postcode"
              type="text"
              placeholder="bijv. 1234 AB"
              value={postcode}
              onChange={(e) => { setPostcode(e.target.value); setError(null) }}
              maxLength={7}
              className={`flex-1 min-w-[160px] px-4 py-3 border rounded-md text-lg bg-white text-charcoal tracking-wide font-body placeholder:text-charcoal-muted/40 transition-colors duration-150 focus:outline-none focus:border-primary-500 focus:ring-3 focus:ring-primary-100
                ${error ? 'border-error' : 'border-border'}`}
              aria-required="true"
              aria-invalid={!!error}
              aria-describedby={error ? 'sc-error' : undefined}
            />
            <button
              type="submit"
              className="shrink-0 py-3 px-6 bg-primary-500 text-white border-none rounded-md font-heading text-base font-bold cursor-pointer transition-colors duration-150 hover:bg-primary-600"
            >
              Zoek subsidies
            </button>
          </div>

          {error && (
            <p id="sc-error" role="alert" className="m-0 text-xs text-error">
              {error}
            </p>
          )}
        </div>
      </form>

      {/* Results */}
      {searched && results !== null && (
        <div className="mt-7 flex flex-col gap-3">

          {gemeente && (
            <div className="flex items-center gap-2.5 py-3.5 px-4 bg-primary-50 border border-primary-200 rounded-md text-sm text-charcoal-light">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500 shrink-0">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <div>
                <strong className="text-charcoal">{gemeente}</strong>
                <span>{results.length === 0 ? ': geen subsidies gevonden' : `: ${results.length} subsidie${results.length !== 1 ? 's' : ''} beschikbaar`}</span>
              </div>
            </div>
          )}

          {results.length === 0 && (
            <div className="py-8 px-6 text-center bg-canvas-alt border border-border rounded-lg flex flex-col gap-2.5 items-center">
              <p className="m-0 font-heading font-semibold text-base text-charcoal">
                {gemeente
                  ? `Geen subsidies bekend voor ${gemeente}`
                  : 'Uw postcode valt buiten onze Fase 1 steden'
                }
              </p>
              <p className="m-0 text-sm text-charcoal-muted max-w-[380px] leading-relaxed">
                {gemeente
                  ? 'Jouw gemeente biedt mogelijk wel subsidies aan. Check de gemeentewebsite.'
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
                className="text-sm font-semibold text-primary-600 no-underline transition-colors duration-150 hover:text-primary-500 hover:underline"
              >
                {gemeente ? `Zoek subsidies ${gemeente}` : 'Landelijk subsidie-overzicht'}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline ml-1"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
              </a>
            </div>
          )}

          {results.map((sub) => (
            <div key={sub.naam} className="bg-white border border-border rounded-lg p-5 flex flex-col gap-2.5 transition-colors duration-150 hover:border-border-hover">
              <div className="flex justify-between items-start gap-3 flex-wrap">
                <strong className="font-heading text-[0.9375rem] font-bold text-charcoal flex-1 min-w-0">{sub.naam}</strong>
                <span className="shrink-0 bg-primary-50 text-primary-700 font-bold text-sm py-0.5 px-3 rounded-full whitespace-nowrap border border-primary-200">{sub.bedrag}</span>
              </div>
              <p className="m-0 text-[0.85rem] text-charcoal-light leading-relaxed">{sub.body}</p>
              <a
                href={sub.aanvraagUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="self-start text-[0.8125rem] font-semibold text-primary-600 no-underline transition-colors duration-150 hover:text-primary-500 hover:underline"
              >
                Aanvragen via {sub.gemeente.toLowerCase()}.nl
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline ml-1"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
              </a>
            </div>
          ))}

          {results.length > 0 && (
            <div className="flex gap-3 items-start bg-warning-light border border-warning/20 rounded-md py-3.5 px-4 text-[0.85rem] text-charcoal-light">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-warning shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <p className="m-0 leading-snug">Vraag eerst subsidie aan <em className="not-italic text-charcoal font-semibold">voor</em> u begint met de werkzaamheden. Dit is bij de meeste gemeenten verplicht.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SubsidieCheck
