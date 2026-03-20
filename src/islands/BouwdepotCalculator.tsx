import type { FC } from 'react'
import { useState, type FormEvent } from 'react'
import { estimateBouwdepotGardenShare } from '../lib/pricing'
import { formatCurrency } from '../lib/utils'
import { sharedCalcStyles } from './SchuttingCalculator'

/**
 * BouwdepotCalculator — Fase 2 placeholder
 *
 * Helps homebuyers understand how much of their construction depot
 * (bouwdepot) they can use for garden work.
 *
 * TODO fase 2:
 * - Add bank-specific rules (ABN AMRO, Rabobank, ING differ)
 * - Add PDF export of calculation
 * - Add "send to mortgage advisor" functionality
 * - Add real estate value lookup by address
 */
const BouwdepotCalculator: FC = () => {
  const [depot,   setDepot]   = useState(30000)
  const [m2,      setM2]      = useState(60)
  const [waarde,  setWaarde]  = useState(350000)
  const [result,  setResult]  = useState<ReturnType<typeof estimateBouwdepotGardenShare> | null>(null)

  function calculate(e: { preventDefault(): void }) {
    e.preventDefault()
    setResult(estimateBouwdepotGardenShare(depot, m2, waarde))
  }

  return (
    <div className="calc-placeholder">
      {/* ── FASE 2 BANNER ── */}
      <div className="fase2-notice" role="note">
        <span>🚧</span>
        <div>
          <strong>Binnenkort beschikbaar</strong>
          <p>De bouwdepot calculator voor tuinaanleg wordt gelanceerd in fase 2.</p>
        </div>
      </div>

      <form onSubmit={calculate} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {[
          { id: 'bd-depot',  label: 'Totaal bouwdepot',          value: depot,  onChange: setDepot,  prefix: '€',   max: 200000 },
          { id: 'bd-m2',     label: 'Tuinoppervlak (m²)',         value: m2,     onChange: setM2,     prefix: '',    max: 1000 },
          { id: 'bd-waarde', label: 'Woningwaarde (bij aankoop)', value: waarde, onChange: setWaarde, prefix: '€',   max: 2000000 },
        ].map(({ id, label, value, onChange, prefix, max }) => (
          <div key={id} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label htmlFor={id} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem', fontWeight: 600, color: '#4A4A4A' }}>
              {label}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {prefix && <span style={{ fontSize: '1rem', fontWeight: 600, color: '#5B7553' }}>{prefix}</span>}
              <input
                id={id}
                type="number"
                min={0}
                max={max}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                style={{ flex: 1, padding: '0.75rem 1rem', border: '2px solid #E5E5E5', borderRadius: 8, fontSize: '1rem', background: '#F5F3EF', fontFamily: 'Inter, sans-serif' }}
              />
            </div>
          </div>
        ))}

        <button type="submit" className="calc-next-btn">
          Bereken mijn tuinbudget →
        </button>
      </form>

      {result && (
        <div className="calc-result" style={{ marginTop: '1.5rem' }}>
          <div className="result-total">
            <span className="result-label">Geschat inzetbaar voor tuinaanleg</span>
            <strong className="result-price">{formatCurrency(result.maxTuinBudget)}</strong>
            <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
              ≈ {result.percentageOfDepot}% van jouw bouwdepot
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: 0 }}>
            Dit is een indicatie. Raadpleeg je hypotheekadviseur voor bank-specifieke regels.
          </p>
          <a href="/offerte" className="result-cta-btn" style={{ marginTop: '0.75rem', display: 'block' }}>
            📬 Vraag offertes aan binnen dit budget
          </a>
        </div>
      )}

      <style>{sharedCalcStyles}</style>
    </div>
  )
}

export default BouwdepotCalculator
