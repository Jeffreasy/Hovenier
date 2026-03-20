import type { FC } from 'react'
import { useState } from 'react'
import { sharedCalcStyles } from './SchuttingCalculator'

/**
 * SubsidieCheck — Fase 2 placeholder
 *
 * TODO fase 2:
 * - Connect to src/content/subsidies/ collection (Astro endpoint)
 * - Add real municipality lookup via postcode API
 * - Add subsidy eligibility calculator
 * - Add email functionality to send results to user
 */

interface SubsidieResult {
  gemeente:   string
  naam:       string
  bedrag:     string
  voorwaarde: string
  url:        string
}

// Demo data — wordt vervangen door content/subsidies/ collection in fase 2
const DEMO_SUBSIDIES: SubsidieResult[] = [
  {
    gemeente:   'Amsterdam',
    naam:       'Groene Daken Subsidie',
    bedrag:     '€25 per m²',
    voorwaarde: 'Minimaal 6 m² groen dak',
    url:       'https://www.amsterdam.nl',
  },
  {
    gemeente:   'Amsterdam',
    naam:       'Tegels Eruit — Planten Erin',
    bedrag:     'Tot €250',
    voorwaarde: 'Min. 10 m² verharding verwijderd',
    url:       'https://www.amsterdam.nl',
  },
]

const SubsidieCheck: FC = () => {
  const [postcode, setPostcode] = useState('')
  const [results,  setResults]  = useState<SubsidieResult[] | null>(null)
  const [loading,  setLoading]  = useState(false)

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    // TODO fase 2: real API call to /api/subsidies?postcode=...
    await new Promise((r) => setTimeout(r, 800))
    setResults(DEMO_SUBSIDIES)
    setLoading(false)
  }

  return (
    <div className="calc-placeholder">
      {/* ── FASE 2 BANNER ── */}
      <div className="fase2-notice" role="note">
        <span>🚧</span>
        <div>
          <strong>Beperkte beschikbaarheid</strong>
          <p>Subsidiedata is momenteel beschikbaar voor Amsterdam. Meer gemeenten volgen in fase 2.</p>
        </div>
      </div>

      <form onSubmit={handleCheck} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label htmlFor="sc-postcode" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem', fontWeight: 600, color: '#4A4A4A' }}>
              Jouw postcode
            </label>
            <input
              id="sc-postcode"
              type="text"
              placeholder="bijv. 1234 AB"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              maxLength={7}
              style={{ padding: '0.75rem 1rem', border: '2px solid #E5E5E5', borderRadius: 8, fontSize: '1rem', background: '#F5F3EF', fontFamily: 'Inter, sans-serif' }}
              aria-required="true"
            />
          </div>

          <button
            type="submit"
            className="calc-next-btn"
            disabled={loading || postcode.length < 6}
            style={{ opacity: postcode.length < 6 ? 0.5 : 1 }}
          >
            {loading ? 'Subsidies zoeken...' : 'Zoek subsidies in jouw gemeente →'}
          </button>
        </div>
      </form>

      {results !== null && (
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {results.length === 0 ? (
            <p style={{ color: '#6B7280', textAlign: 'center', padding: '1.5rem' }}>
              Geen subsidies gevonden voor jouw postcode.
            </p>
          ) : (
            results.map((r) => (
              <div key={r.naam} style={{ border: '1px solid #E5E5E5', borderRadius: 8, padding: '1rem', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <strong style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.9375rem' }}>{r.naam}</strong>
                  <span style={{ background: '#E8F0E4', color: '#3D5438', fontWeight: 700, fontSize: '0.875rem', padding: '0.2rem 0.6rem', borderRadius: 99, whiteSpace: 'nowrap' }}>
                    {r.bedrag}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280' }}>✓ {r.voorwaarde}</p>
                <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#5B7553', marginTop: '0.5rem', display: 'inline-block' }}>
                  Meer informatie →
                </a>
              </div>
            ))
          )}
        </div>
      )}

      <style>{sharedCalcStyles}</style>
    </div>
  )
}

export default SubsidieCheck
