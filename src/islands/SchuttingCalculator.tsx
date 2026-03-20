import type { FC } from 'react'
import {
  SCHUTTING_MATERIALS,
  QUALITY_OPTIONS,
  calculateSchuttingCosts,
  type SchuttingMaterial,
} from '../lib/pricing'
import type { QualityLevel } from '../lib/types'
import { formatRange } from '../lib/utils'
import { useState } from 'react'

/**
 * SchuttingCalculator — Fase 2 placeholder
 *
 * TODO fase 2:
 * - Add neighbor cost-sharing feature (share via WhatsApp)
 * - Add permit check (vergunning nodig > 2m)
 * - Add photo upload for site estimation
 */
const SchuttingCalculator: FC = () => {
  const [meters,   setMeters]   = useState(10)
  const [hoogte,   setHoogte]   = useState(1.8)
  const [material, setMaterial] = useState<SchuttingMaterial>(SCHUTTING_MATERIALS[0]!)
  const [quality,  setQuality]  = useState<QualityLevel>('midden')
  const [step,     setStep]     = useState<1 | 2 | 3>(1)

  const result = calculateSchuttingCosts(meters, material, hoogte)

  return (
    <div className="calc-placeholder">
      {/* ── FASE 2 BANNER ── */}
      <div className="fase2-notice" role="note">
        <span>🚧</span>
        <div>
          <strong>Binnenkort beschikbaar</strong>
          <p>De schutting calculator is in ontwikkeling en wordt binnenkort gelanceerd.</p>
        </div>
      </div>

      {/* Skeleton UI — shows the intended interface */}
      {step === 1 && (
        <div className="calc-step">
          <h2 className="step-title">Hoeveel strekkende meter schutting?</h2>
          <div className="m2-display">
            <span className="m2-value">{meters}</span>
            <span className="m2-unit">meter</span>
          </div>
          <input
            type="range" min={1} max={100} step={1} value={meters}
            onChange={(e) => setMeters(Number(e.target.value))}
            className="m2-slider"
            aria-label="Lengte in strekkende meters"
          />
          <div className="m2-labels"><span>1 m</span><span>100 m</span></div>
          <div style={{ marginTop: '1rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.875rem', display: 'block', marginBottom: '0.375rem' }}>
              Hoogte schutting
            </label>
            <select
              value={hoogte}
              onChange={(e) => setHoogte(Number(e.target.value))}
              className="m2-slider"
              style={{ height: 'auto', padding: '0.75rem', borderRadius: 8, border: '2px solid #E5E5E5', width: '100%', fontSize: '1rem', background: '#F5F3EF' }}
              aria-label="Hoogte schutting"
            >
              <option value={1.2}>1,2 meter</option>
              <option value={1.5}>1,5 meter</option>
              <option value={1.8}>1,8 meter (standaard)</option>
              <option value={2.0}>2,0 meter</option>
            </select>
          </div>
          <button className="calc-next-btn" onClick={() => setStep(2)} style={{ marginTop: '1rem' }}>
            Volgende →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="calc-step">
          <h2 className="step-title">Welk materiaal?</h2>
          <div className="quality-grid">
            {SCHUTTING_MATERIALS.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`quality-btn ${material.id === m.id ? 'quality-btn--selected' : ''}`}
                onClick={() => setMaterial(m)}
                aria-pressed={material.id === m.id}
              >
                <strong>{m.label}</strong>
                <span>€{m.min}–€{m.max} / m</span>
              </button>
            ))}
          </div>
          <div className="calc-nav" style={{ marginTop: '1rem' }}>
            <button className="calc-back-btn" onClick={() => setStep(1)}>← Terug</button>
            <button className="calc-next-btn" onClick={() => setStep(3)}>Bereken →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="calc-result">
          <div className="result-badge">📊 Jouw indicatie</div>
          <div className="result-total">
            <span className="result-label">{meters} meter {material.label}</span>
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
          <a href="/offerte" className="result-cta-btn" style={{ marginTop: '1rem', display: 'block' }}>
            📬 Vraag gratis offertes aan
          </a>
          <button className="calc-back-btn" onClick={() => setStep(1)} style={{ marginTop: '0.75rem', width: '100%' }}>
            Opnieuw berekenen
          </button>
        </div>
      )}

      <style>{sharedCalcStyles}</style>
    </div>
  )
}

// ─── Shared styles (reused across all calculators) ────────────────────────────

export const sharedCalcStyles = `
  .fase2-notice {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    background: #FFF3CD;
    border: 1px solid #FFC107;
    border-radius: 8px;
    padding: 0.875rem 1rem;
    margin-bottom: 1.5rem;
    font-size: 0.875rem;
  }
  .fase2-notice span { font-size: 1.25rem; flex-shrink: 0; }
  .fase2-notice strong { display: block; margin-bottom: 0.125rem; }
  .fase2-notice p { margin: 0; color: #6B7280; }

  .calc-placeholder { font-family: 'Inter', sans-serif; }
  .calc-step { display: flex; flex-direction: column; gap: 1rem; }
  .step-title { margin: 0; font-size: 1.25rem; font-family: 'Plus Jakarta Sans', sans-serif; }
  .m2-display { display: flex; align-items: baseline; gap: 0.25rem; justify-content: center; padding: 1.5rem; background: #E8F0E4; border-radius: 12px; }
  .m2-value { font-size: 3.5rem; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; color: #3D5438; line-height: 1; }
  .m2-unit { font-size: 1.5rem; color: #5B7553; font-weight: 600; }
  .m2-slider { width: 100%; accent-color: #5B7553; cursor: pointer; height: 6px; }
  .m2-labels { display: flex; justify-content: space-between; font-size: 0.75rem; color: #9CA3AF; }
  .quality-grid { display: flex; flex-direction: column; gap: 0.5rem; }
  .quality-btn { display: flex; flex-direction: column; align-items: flex-start; gap: 0.25rem; padding: 0.875rem 1.25rem; border: 2px solid #E5E5E5; border-radius: 8px; background: white; cursor: pointer; text-align: left; transition: all 0.15s; }
  .quality-btn strong { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.9375rem; color: #2D2D2D; }
  .quality-btn span { font-size: 0.8rem; color: #6B7280; }
  .quality-btn:hover { border-color: #5B7553; background: #E8F0E4; }
  .quality-btn--selected { border-color: #5B7553; background: #E8F0E4; }
  .quality-btn--selected strong { color: #3D5438; }
  .calc-nav { display: flex; gap: 0.75rem; }
  .calc-next-btn { flex: 1; padding: 0.75rem 1.5rem; background: #C4A96A; color: #2D2D2D; border: none; border-radius: 8px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.15s; }
  .calc-next-btn:hover { background: #A88B4A; }
  .calc-back-btn { padding: 0.75rem 1rem; background: transparent; border: 2px solid #E5E5E5; border-radius: 8px; color: #6B7280; font-size: 0.875rem; cursor: pointer; transition: all 0.15s; }
  .calc-back-btn:hover { border-color: #5B7553; color: #5B7553; }
  .calc-result { display: flex; flex-direction: column; gap: 1rem; }
  .result-badge { font-size: 0.8rem; font-weight: 600; color: #5B7553; text-transform: uppercase; letter-spacing: 0.05em; }
  .result-total { display: flex; flex-direction: column; gap: 0.25rem; background: #E8F0E4; border-radius: 12px; padding: 1.5rem; }
  .result-label { font-size: 0.875rem; color: #6B7280; }
  .result-price { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 2rem; font-weight: 700; color: #3D5438; }
  .result-breakdown { display: flex; flex-direction: column; border: 1px solid #E5E5E5; border-radius: 8px; overflow: hidden; }
  .breakdown-row { display: flex; justify-content: space-between; padding: 0.75rem 1rem; font-size: 0.875rem; border-bottom: 1px solid #E5E5E5; }
  .breakdown-row:last-child { border-bottom: none; }
  .breakdown-amount { font-weight: 600; color: #3D5438; }
  .result-cta-btn { width: 100%; padding: 0.875rem 1.5rem; background: #C4A96A; color: #2D2D2D; text-align: center; text-decoration: none; border-radius: 8px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1rem; font-weight: 700; transition: all 0.15s; }
  .result-cta-btn:hover { background: #A88B4A; text-decoration: none; }
`

export default SchuttingCalculator
