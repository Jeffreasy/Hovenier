import { useState, type FC } from 'react'
import type { ServiceType, QualityLevel } from '../lib/types'
import { calculateGardenCosts, QUALITY_OPTIONS, type CalculationResult } from '../lib/pricing'
import { formatRange } from '../lib/utils'

const GARDEN_SERVICES: { value: ServiceType; label: string }[] = [
  { value: 'bestrating', label: 'Bestrating / terras' },
  { value: 'beplanting', label: 'Beplanting' },
  { value: 'tuinaanleg', label: 'Tuinaanleg' },
  { value: 'schutting',  label: 'Schutting' },
]

const TuinkostenCalculator: FC = () => {
  const [step, setStep]       = useState<1 | 2 | 3 | 4>(1)
  const [m2, setM2]           = useState(50)
  const [services, setServices] = useState<ServiceType[]>(['bestrating'])
  const [quality, setQuality] = useState<QualityLevel>('midden')
  const [result, setResult]   = useState<CalculationResult | null>(null)

  function toggleService(s: ServiceType) {
    setServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    )
  }

  function calculate() {
    const r = calculateGardenCosts(m2, services, quality)
    setResult(r)
    setStep(4)
  }

  const STEPS = ['Tuingrootte', 'Werkzaamheden', 'Kwaliteit']

  return (
    <div className="font-body text-charcoal">
      {/* Progress */}
      <div className="flex items-center mb-8" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={4}>
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-col items-center flex-1 gap-1.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200
              ${step > i + 1 ? 'bg-primary-500 text-white' : ''}
              ${step === i + 1 ? 'bg-primary-500 text-white ring-4 ring-primary-100' : ''}
              ${step <= i ? 'bg-canvas-muted text-charcoal-muted' : ''}
            `}>
              {step > i + 1 ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              ) : i + 1}
            </div>
            <span className={`text-[0.7rem] text-center font-medium whitespace-nowrap
              ${step === i + 1 ? 'text-primary-500' : ''}
              ${step > i + 1 ? 'text-primary-500' : ''}
              ${step <= i ? 'text-charcoal-muted' : ''}
            `}>{label}</span>
          </div>
        ))}
      </div>

      {/* Step 1 — m² */}
      {step === 1 && (
        <div className="flex flex-col gap-5">
          <h2 className="m-0 text-xl font-heading font-bold text-charcoal">Hoe groot is jouw tuin?</h2>
          <div className="flex items-baseline gap-1 justify-center py-6 bg-primary-50 border border-primary-200 rounded-lg">
            <span className="text-[3.5rem] font-bold font-heading text-primary-500 leading-none">{m2}</span>
            <span className="text-2xl text-primary-300 font-semibold">m²</span>
          </div>
          <input
            type="range" min={10} max={500} step={5} value={m2}
            onChange={(e) => setM2(Number(e.target.value))}
            className="w-full accent-primary-500 cursor-pointer h-1.5"
            aria-label="Tuingrootte in m²"
          />
          <div className="flex justify-between text-xs text-charcoal-muted"><span>10 m²</span><span>500 m²</span></div>
          <button className="py-3 px-6 bg-primary-500 text-white border-none rounded-md font-heading text-base font-bold cursor-pointer transition-colors duration-150 hover:bg-primary-600" onClick={() => setStep(2)}>
            Volgende
          </button>
        </div>
      )}

      {/* Step 2 — Services */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <h2 className="m-0 text-xl font-heading font-bold text-charcoal">Wat wil je laten doen?</h2>
          <p className="m-0 text-sm text-charcoal-muted">Selecteer alles wat van toepassing is.</p>
          <div className="grid grid-cols-2 gap-3">
            {GARDEN_SERVICES.map((s) => (
              <button
                key={s.value}
                type="button"
                className={`flex flex-col items-center gap-2 py-4 px-3 border rounded-lg cursor-pointer text-sm font-semibold text-center transition-colors duration-150
                  ${services.includes(s.value)
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-border bg-white text-charcoal-light hover:border-primary-300 hover:bg-primary-50/50'
                  }`}
                onClick={() => toggleService(s.value)}
                aria-pressed={services.includes(s.value)}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex gap-3 mt-1">
            <button className="py-3 px-4 bg-transparent border border-border rounded-md text-sm text-charcoal-muted cursor-pointer transition-colors duration-150 hover:border-border-hover hover:text-charcoal" onClick={() => setStep(1)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Terug
            </button>
            <button
              className="flex-1 py-3 px-6 bg-primary-500 text-white border-none rounded-md font-heading text-base font-bold cursor-pointer transition-colors duration-150 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => setStep(3)}
              disabled={services.length === 0}
            >
              Volgende
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Quality */}
      {step === 3 && (
        <div className="flex flex-col gap-4">
          <h2 className="m-0 text-xl font-heading font-bold text-charcoal">Welk kwaliteitsniveau?</h2>
          <div className="flex flex-col gap-3">
            {(Object.entries(QUALITY_OPTIONS) as [QualityLevel, typeof QUALITY_OPTIONS[QualityLevel]][]).map(([k, v]) => (
              <button
                key={k}
                type="button"
                className={`flex flex-col items-start gap-1 py-4 px-5 border rounded-lg cursor-pointer text-left w-full transition-colors duration-150
                  ${quality === k
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-border bg-white hover:border-primary-300 hover:bg-primary-50/50'
                  }`}
                onClick={() => setQuality(k)}
                aria-pressed={quality === k}
              >
                <strong className={`font-heading text-base ${quality === k ? 'text-primary-700' : 'text-charcoal'}`}>{v.label}</strong>
                <span className="text-xs text-charcoal-muted">{v.description}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-3 mt-1">
            <button className="py-3 px-4 bg-transparent border border-border rounded-md text-sm text-charcoal-muted cursor-pointer transition-colors duration-150 hover:border-border-hover hover:text-charcoal" onClick={() => setStep(2)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Terug
            </button>
            <button className="flex-1 py-3 px-6 bg-primary-500 text-white border-none rounded-md font-heading text-base font-bold cursor-pointer transition-colors duration-150 hover:bg-primary-600" onClick={calculate}>
              Bereken mijn kosten
            </button>
          </div>
        </div>
      )}

      {/* Step 4 — Result */}
      {step === 4 && result && (
        <div className="flex flex-col gap-4">
          <span className="text-xs font-semibold text-primary-500 uppercase tracking-wide">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
            Jouw indicatie
          </span>

          <div className="flex flex-col gap-1 bg-primary-50 border border-primary-200 rounded-lg p-6">
            <span className="text-sm text-charcoal-muted">Geschatte totaalkosten</span>
            <strong className="font-heading text-[2rem] font-bold text-primary-500">{formatRange(result.min, result.max)}</strong>
          </div>

          <div className="flex flex-col border border-border rounded-md overflow-hidden">
            {result.breakdown.map((item) => (
              <div key={item.label} className="flex justify-between py-3 px-4 text-sm border-b border-border last:border-b-0 text-charcoal-light">
                <span>{item.label}</span>
                <span className="font-semibold text-charcoal">{formatRange(item.min, item.max)}</span>
              </div>
            ))}
          </div>

          <p className="text-[0.75rem] text-charcoal-muted m-0 leading-relaxed">
            Dit is een vrijblijvende indicatie op basis van gemiddelde markttarieven voor {m2} m² in kwaliteitsniveau "{QUALITY_OPTIONS[quality].label}".
          </p>

          <a href="/offerte" className="block w-full py-3.5 px-6 bg-primary-500 text-white text-center no-underline rounded-md font-heading text-base font-bold transition-colors duration-150 hover:bg-primary-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            Vraag gratis offertes aan op basis van deze berekening
          </a>

          <button className="w-full py-3 px-4 bg-transparent border border-border rounded-md text-sm text-charcoal-muted cursor-pointer transition-colors duration-150 hover:border-border-hover hover:text-charcoal" onClick={() => setStep(1)}>
            Opnieuw berekenen
          </button>
        </div>
      )}
    </div>
  )
}

export default TuinkostenCalculator
