import type { FC } from 'react'
import { useState } from 'react'
import { estimateBouwdepotGardenShare } from '../lib/pricing'
import { formatCurrency } from '../lib/utils'

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
    <div className="font-body text-charcoal">
      {/* FASE 2 BANNER */}
      <div className="flex items-start gap-3 py-3.5 px-4 bg-warning-light border border-warning/20 rounded-md text-sm text-charcoal-light mb-6" role="note">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-warning shrink-0 mt-0.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <div>
          <strong className="text-charcoal block mb-0.5">Binnenkort beschikbaar</strong>
          <p className="m-0 leading-snug">De bouwdepot calculator voor tuinaanleg wordt gelanceerd in fase 2.</p>
        </div>
      </div>

      <form onSubmit={calculate} noValidate className="flex flex-col gap-5">
        {[
          { id: 'bd-depot',  label: 'Totaal bouwdepot',          value: depot,  onChange: setDepot,  prefix: '\u20AC', max: 200000 },
          { id: 'bd-m2',     label: 'Tuinoppervlak (m\u00B2)',   value: m2,     onChange: setM2,     prefix: '',       max: 1000 },
          { id: 'bd-waarde', label: 'Woningwaarde (bij aankoop)', value: waarde, onChange: setWaarde, prefix: '\u20AC', max: 2000000 },
        ].map(({ id, label, value, onChange, prefix, max }) => (
          <div key={id} className="flex flex-col gap-1.5">
            <label htmlFor={id} className="font-heading text-sm font-semibold text-charcoal-light">
              {label}
            </label>
            <div className="flex items-center gap-2">
              {prefix && <span className="text-base font-semibold text-primary-500">{prefix}</span>}
              <input
                id={id}
                type="number"
                min={0}
                max={max}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="flex-1 px-4 py-3 border border-border rounded-md text-base bg-white text-charcoal font-body transition-colors duration-150 focus:outline-none focus:border-primary-500 focus:ring-3 focus:ring-primary-100"
              />
            </div>
          </div>
        ))}

        <button type="submit" className="py-3 px-6 bg-primary-500 text-white border-none rounded-md font-heading text-base font-bold cursor-pointer transition-colors duration-150 hover:bg-primary-600">
          Bereken mijn tuinbudget
        </button>
      </form>

      {result && (
        <div className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 bg-primary-50 border border-primary-200 rounded-lg p-6">
            <span className="text-sm text-charcoal-muted">Geschat inzetbaar voor tuinaanleg</span>
            <strong className="font-heading text-[2rem] font-bold text-primary-500">{formatCurrency(result.maxTuinBudget)}</strong>
            <span className="text-xs text-charcoal-muted">
              {'\u2248'} {result.percentageOfDepot}% van jouw bouwdepot
            </span>
          </div>
          <p className="text-xs text-charcoal-muted m-0">
            Dit is een indicatie. Raadpleeg je hypotheekadviseur voor bank-specifieke regels.
          </p>
          <a href="/offerte" className="block w-full py-3.5 px-6 bg-primary-500 text-white text-center no-underline rounded-md font-heading text-base font-bold transition-colors duration-150 hover:bg-primary-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            Vraag offertes aan binnen dit budget
          </a>
        </div>
      )}
    </div>
  )
}

export default BouwdepotCalculator
