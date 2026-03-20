import { useState, type FC } from 'react'
import type { ServiceType, QualityLevel } from '../lib/types'
import { calculateGardenCosts, QUALITY_OPTIONS, type CalculationResult } from '../lib/pricing'
import { formatRange } from '../lib/utils'

const GARDEN_SERVICES: { value: ServiceType; label: string; icon: string }[] = [
  { value: 'bestrating', label: 'Bestrating / terras', icon: '⬜' },
  { value: 'beplanting', label: 'Beplanting', icon: '🌿' },
  { value: 'tuinaanleg', label: 'Tuinaanleg',  icon: '🏡' },
  { value: 'schutting',  label: 'Schutting',   icon: '🪵' },
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

  return (
    <div className="calc-wrapper">
      {/* Progress */}
      <div className="calc-progress" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={4}>
        {[1, 2, 3].map((s) => (
          <div key={s} className={`prog-step ${step >= s ? 'prog-step--done' : ''} ${step === s ? 'prog-step--active' : ''}`}>
            <div className="prog-dot">{step > s ? '✓' : s}</div>
            <span className="prog-label">{['Tuingrootte', 'Werkzaamheden', 'Kwaliteit'][s - 1]}</span>
          </div>
        ))}
      </div>

      {/* Step 1 — m² */}
      {step === 1 && (
        <div className="calc-step">
          <h2 className="step-title">Hoe groot is jouw tuin?</h2>
          <div className="m2-display">
            <span className="m2-value">{m2}</span>
            <span className="m2-unit">m²</span>
          </div>
          <input
            type="range"
            min={10}
            max={500}
            step={5}
            value={m2}
            onChange={(e) => setM2(Number(e.target.value))}
            className="m2-slider"
            aria-label="Tuingrootte in m²"
          />
          <div className="m2-labels">
            <span>10 m²</span>
            <span>500 m²</span>
          </div>
          <button className="calc-next-btn" onClick={() => setStep(2)}>
            Volgende →
          </button>
        </div>
      )}

      {/* Step 2 — Services */}
      {step === 2 && (
        <div className="calc-step">
          <h2 className="step-title">Wat wil je laten doen?</h2>
          <p className="step-hint">Selecteer alles wat van toepassing is.</p>
          <div className="services-grid">
            {GARDEN_SERVICES.map((s) => (
              <button
                key={s.value}
                type="button"
                className={`service-btn ${services.includes(s.value) ? 'service-btn--selected' : ''}`}
                onClick={() => toggleService(s.value)}
                aria-pressed={services.includes(s.value)}
              >
                <span className="service-icon" aria-hidden="true">{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
          <div className="calc-nav">
            <button className="calc-back-btn" onClick={() => setStep(1)}>← Terug</button>
            <button
              className="calc-next-btn"
              onClick={() => setStep(3)}
              disabled={services.length === 0}
            >
              Volgende →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Quality */}
      {step === 3 && (
        <div className="calc-step">
          <h2 className="step-title">Welk kwaliteitsniveau?</h2>
          <div className="quality-grid">
            {(Object.entries(QUALITY_OPTIONS) as [QualityLevel, typeof QUALITY_OPTIONS[QualityLevel]][]).map(([k, v]) => (
              <button
                key={k}
                type="button"
                className={`quality-btn ${quality === k ? 'quality-btn--selected' : ''}`}
                onClick={() => setQuality(k)}
                aria-pressed={quality === k}
              >
                <strong>{v.label}</strong>
                <span>{v.description}</span>
              </button>
            ))}
          </div>
          <div className="calc-nav">
            <button className="calc-back-btn" onClick={() => setStep(2)}>← Terug</button>
            <button className="calc-next-btn" onClick={calculate}>
              Bereken mijn kosten →
            </button>
          </div>
        </div>
      )}

      {/* Step 4 — Result */}
      {step === 4 && result && (
        <div className="calc-result">
          <div className="result-badge">📊 Jouw indicatie</div>
          <div className="result-total">
            <span className="result-label">Geschatte totaalkosten</span>
            <strong className="result-price">{formatRange(result.min, result.max)}</strong>
          </div>

          <div className="result-breakdown">
            {result.breakdown.map((item) => (
              <div key={item.label} className="breakdown-row">
                <span>{item.label}</span>
                <span className="breakdown-amount">{formatRange(item.min, item.max)}</span>
              </div>
            ))}
          </div>

          <p className="result-disclaimer">
            Dit is een vrijblijvende indicatie op basis van gemiddelde markttarieven voor {m2} m² in kwaliteitsniveau "{QUALITY_OPTIONS[quality].label}".
          </p>

          <a href="/offerte" className="result-cta-btn">
            📬 Vraag gratis offertes aan op basis van deze berekening
          </a>

          <button className="calc-back-btn" onClick={() => setStep(1)} style={{ marginTop: '1rem', width: '100%' }}>
            Opnieuw berekenen
          </button>
        </div>
      )}

      <style>{`
        .calc-wrapper { font-family: 'Inter', sans-serif; color: #EDF2EC; }

        .calc-progress {
          display: flex;
          align-items: center;
          gap: 0;
          margin-bottom: 2rem;
          overflow: hidden;
        }

        .prog-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.375rem;
          flex: 1;
        }

        .prog-dot {
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          background: rgba(255,255,255,0.10);
          color: rgba(237,242,236,0.40);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
          transition: all 0.2s;
        }

        .prog-step--done .prog-dot  { background: #6E9E65; color: #EDF2EC; }
        .prog-step--active .prog-dot { background: #C4A96A; color: #1C1400; box-shadow: 0 0 0 4px rgba(196,169,106,0.20); }

        .prog-label {
          font-size: 0.7rem;
          color: rgba(237,242,236,0.35);
          text-align: center;
          white-space: nowrap;
        }

        .calc-step { display: flex; flex-direction: column; gap: 1.25rem; }

        .step-title { margin: 0; font-size: 1.25rem; color: #EDF2EC; }
        .step-hint  { margin: 0; font-size: 0.875rem; color: rgba(237,242,236,0.45); }

        /* m² slider */
        .m2-display {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
          justify-content: center;
          padding: 1.5rem;
          background: rgba(110,158,101,0.10);
          border: 1px solid rgba(110,158,101,0.20);
          border-radius: 12px;
        }

        .m2-value {
          font-size: 3.5rem;
          font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #C4A96A;
          line-height: 1;
        }

        .m2-unit { font-size: 1.5rem; color: rgba(196,169,106,0.70); font-weight: 600; }

        .m2-slider {
          width: 100%;
          accent-color: #C4A96A;
          cursor: pointer;
          height: 6px;
        }

        .m2-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: rgba(237,242,236,0.30);
        }

        /* Services */
        .services-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .service-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 12px;
          background: rgba(255,255,255,0.05);
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 600;
          transition: all 0.15s;
          text-align: center;
          color: rgba(237,242,236,0.60);
        }

        .service-btn:hover { border-color: rgba(196,169,106,0.35); background: rgba(255,255,255,0.08); color: #EDF2EC; }
        .service-btn--selected { border-color: rgba(110,158,101,0.50); background: rgba(110,158,101,0.12); color: #EDF2EC; }

        .service-icon { font-size: 1.5rem; }

        /* Quality */
        .quality-grid { display: flex; flex-direction: column; gap: 0.75rem; }

        .quality-btn {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.25rem;
          padding: 1rem 1.25rem;
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 12px;
          background: rgba(255,255,255,0.05);
          cursor: pointer;
          text-align: left;
          transition: all 0.15s;
        }

        .quality-btn strong { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1rem; color: rgba(237,242,236,0.80); }
        .quality-btn span   { font-size: 0.8rem; color: rgba(237,242,236,0.42); }
        .quality-btn:hover { border-color: rgba(196,169,106,0.35); background: rgba(255,255,255,0.08); }
        .quality-btn--selected { border-color: rgba(110,158,101,0.50); background: rgba(110,158,101,0.12); }
        .quality-btn--selected strong { color: #EDF2EC; }

        /* Navigation */
        .calc-nav {
          display: flex;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        .calc-next-btn {
          flex: 1;
          padding: 0.75rem 1.5rem;
          background: #C4A96A;
          color: #1C1400;
          border: none;
          border-radius: 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
          box-shadow: 0 2px 12px rgba(196,169,106,0.25);
        }

        .calc-next-btn:hover:not(:disabled) {
          background: #A88B4A;
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(196,169,106,0.35);
        }

        .calc-next-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .calc-back-btn {
          padding: 0.75rem 1rem;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 8px;
          color: rgba(237,242,236,0.45);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.15s;
        }

        .calc-back-btn:hover { border-color: rgba(196,169,106,0.35); color: rgba(237,242,236,0.80); }

        /* Result */
        .calc-result { display: flex; flex-direction: column; gap: 1.25rem; }

        .result-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: #C4A96A;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .result-total {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          background: rgba(110,158,101,0.10);
          border: 1px solid rgba(110,158,101,0.20);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .result-label { font-size: 0.875rem; color: rgba(237,242,236,0.45); }

        .result-price {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 2rem;
          font-weight: 700;
          color: #C4A96A;
        }

        .result-breakdown {
          display: flex;
          flex-direction: column;
          gap: 0;
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 8px;
          overflow: hidden;
        }

        .breakdown-row {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          color: rgba(237,242,236,0.65);
        }

        .breakdown-row:last-child { border-bottom: none; }
        .breakdown-amount { font-weight: 600; color: #C4A96A; }

        .result-disclaimer {
          font-size: 0.75rem;
          color: rgba(237,242,236,0.30);
          margin: 0;
          line-height: 1.5;
        }

        .result-cta-btn {
          display: block;
          width: 100%;
          padding: 0.875rem 1.5rem;
          background: #C4A96A;
          color: #1C1400;
          text-align: center;
          text-decoration: none;
          border-radius: 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          transition: all 0.15s;
          box-shadow: 0 2px 12px rgba(196,169,106,0.25);
        }

        .result-cta-btn:hover {
          background: #A88B4A;
          text-decoration: none;
          box-shadow: 0 4px 20px rgba(196,169,106,0.35);
        }
      `}</style>
    </div>
  )
}

export default TuinkostenCalculator
