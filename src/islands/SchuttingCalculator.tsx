import type { FC } from 'react'
import {
  SCHUTTING_MATERIALS,
  calculateSchuttingCosts,
  type SchuttingMaterial,
} from '../lib/pricing'
import { formatRange } from '../lib/utils'
import { useState } from 'react'

/**
 * SchuttingCalculator — Volledig geïmplementeerd
 *
 * Features:
 * - 4-staps flow met progress bar: lengte → hoogte/buurman → materiaal → resultaat
 * - Materiaal details: levensduur, onderhoud, duurzaamheid
 * - Buurman cost-split berekening (art. 5:49 BW)
 * - WhatsApp-deelfunctie voor buurman
 * - Vergunningswaarschuwing bij hoogte ≥ 2.0m
 * - Fundering + materiaalkosten in breakdown
 */

// Extended material data met extra context voor de gebruiker
interface MaterialInfo {
  id:            string
  icon:          string
  levensduur:    string
  onderhoud:     string
  duurzaamheid:  string
}

const MATERIAL_INFO: Record<string, MaterialInfo> = {
  vuren:       { id: 'vuren',       icon: '🪵', levensduur: '10–20 jaar', onderhoud: 'Jaarlijks behandelen', duurzaamheid: 'Laag' },
  hardhout:    { id: 'hardhout',    icon: '🌳', levensduur: '20–30 jaar', onderhoud: '2× per 5 jaar oliën', duurzaamheid: 'Middel' },
  composiet:   { id: 'composiet',   icon: '♻️', levensduur: '25–40 jaar', onderhoud: 'Nauwelijks onderhoud', duurzaamheid: 'Hoog' },
  beton:       { id: 'beton',       icon: '🏗️', levensduur: '30–50 jaar', onderhoud: 'Praktisch onderhoudsvr.', duurzaamheid: 'Hoog' },
  metaal:      { id: 'metaal',      icon: '⚙️', levensduur: '40–60 jaar', onderhoud: 'Geen — roest mooi', duurzaamheid: 'Hoog' },
  toogplanken: { id: 'toogplanken', icon: '🪜', levensduur: '10–15 jaar', onderhoud: 'Jaarlijks behandelen', duurzaamheid: 'Laag' },
}

const HOOGTE_OPTIONS = [
  { value: 1.2, label: '1,2 meter', desc: 'Lage erfscheiding' },
  { value: 1.5, label: '1,5 meter', desc: 'Standaard laag' },
  { value: 1.8, label: '1,8 meter', desc: 'Standaard hoog' },
  { value: 2.0, label: '2,0 meter', desc: 'Maximum vrij bouw ⚠️' },
]

const SchuttingCalculator: FC = () => {
  const [step,          setStep]         = useState<1 | 2 | 3 | 4>(1)
  const [meters,        setMeters]       = useState(10)
  const [hoogte,        setHoogte]       = useState(1.8)
  const [buurman,       setBuurman]      = useState(false)
  const [material,      setMaterial]     = useState<SchuttingMaterial>(SCHUTTING_MATERIALS[0]!)

  const result        = calculateSchuttingCosts(meters, material, hoogte)
  const needsPermit   = hoogte >= 2.0
  const buurmanAandeel = buurman ? Math.round(result.min / 2) : null

  function shareWhatsApp() {
    const splitTekst = buurman
      ? `\n🤝 Jouw aandeel (50%): ${formatRange(Math.round(result.min / 2), Math.round(result.max / 2))}`
      : ''
    const text = encodeURIComponent(
      `🏡 Schutting kostenberekening — TuinHub.nl\n\n` +
      `📏 ${meters} meter ${material.label} (${String(hoogte).replace('.', ',')}m hoog)\n` +
      `💰 Totaal: ${formatRange(result.min, result.max)}${splitTekst}\n\n` +
      `📋 Specificatie:\n` +
      result.breakdown.map(b => `  • ${b.label}: ${formatRange(b.min, b.max)}`).join('\n') +
      `\n\n🔗 Bereken zelf: tuinhub.nl/tools/schutting-kosten-calculator`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  const STEPS = ['Lengte', 'Hoogte & buurman', 'Materiaal', 'Resultaat']

  return (
    <div className="calc-wrapper">

      {/* ── Progress bar ── */}
      <div className="calc-progress" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={4}>
        {STEPS.map((label, i) => (
          <div key={label} className={`prog-step ${step > i + 1 ? 'prog-step--done' : ''} ${step === i + 1 ? 'prog-step--active' : ''}`}>
            <div className="prog-dot">{step > i + 1 ? '✓' : i + 1}</div>
            <span className="prog-label">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Step 1 — Lengte ── */}
      {step === 1 && (
        <div className="calc-step">
          <h2 className="step-title">Hoeveel strekkende meter schutting?</h2>
          <p className="step-hint">Tip: meet de totale grenslengte inclusief eventuele zijkanten.</p>
          <div className="m2-display">
            <span className="m2-value">{meters}</span>
            <span className="m2-unit">meter</span>
          </div>
          <input
            type="range" min={2} max={100} step={1} value={meters}
            onChange={(e) => setMeters(Number(e.target.value))}
            className="m2-slider"
            aria-label="Lengte in strekkende meters"
          />
          <div className="m2-labels"><span>2 m</span><span>50 m</span><span>100 m</span></div>
          <button type="button" className="calc-next-btn" onClick={() => setStep(2)} style={{ marginTop: '1.25rem' }}>
            Volgende →
          </button>
        </div>
      )}

      {/* ── Step 2 — Hoogte + buurman ── */}
      {step === 2 && (
        <div className="calc-step">
          <h2 className="step-title">Hoogte & kostenverdeling</h2>

          <div>
            <p className="field-label">Gewenste hoogte</p>
            <div className="hoogte-grid">
              {HOOGTE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`hoogte-btn ${hoogte === opt.value ? 'hoogte-btn--selected' : ''}`}
                  onClick={() => setHoogte(opt.value)}
                  aria-pressed={hoogte === opt.value}
                >
                  <strong>{opt.label}</strong>
                  <span>{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {needsPermit && (
            <div className="permit-warning" role="alert">
              <span>⚠️</span>
              <p>Bij 2,0 meter is in veel gemeenten een <strong>omgevingsvergunning</strong> vereist. Controleer dit bij uw gemeente vóór aanvang.</p>
            </div>
          )}

          <div className="buurman-toggle">
            <label className="toggle-label" htmlFor="sc-buurman">
              <span className="toggle-icon">🤝</span>
              <div>
                <strong>Kosten delen met buurman</strong>
                <p>Wettelijk recht op kostensplitsing (art. 5:49 BW) bij grensmuur</p>
              </div>
              <div className="toggle-switch-wrap">
                <input
                  type="checkbox"
                  id="sc-buurman"
                  checked={buurman}
                  onChange={(e) => setBuurman(e.target.checked)}
                  className="toggle-input"
                />
                <span className={`toggle-switch ${buurman ? 'toggle-switch--on' : ''}`} aria-hidden="true" />
              </div>
            </label>
          </div>

          <div className="calc-nav" style={{ marginTop: '1.25rem' }}>
            <button className="calc-back-btn" onClick={() => setStep(1)}>← Terug</button>
            <button className="calc-next-btn" onClick={() => setStep(3)}>Kies materiaal →</button>
          </div>
        </div>
      )}

      {/* ── Step 3 — Materiaal ── */}
      {step === 3 && (
        <div className="calc-step">
          <h2 className="step-title">Welk materiaal?</h2>
          <p className="step-hint">Kies het materiaal dat past bij uw budget en wensen.</p>
          <div className="material-grid">
            {SCHUTTING_MATERIALS.map((m) => {
              const info = MATERIAL_INFO[m.id]!
              return (
                <button
                  key={m.id}
                  type="button"
                  className={`material-btn ${material.id === m.id ? 'material-btn--selected' : ''}`}
                  onClick={() => setMaterial(m)}
                  aria-pressed={material.id === m.id}
                >
                  <div className="material-header">
                    <span className="material-icon" aria-hidden="true">{info.icon}</span>
                    <div>
                      <strong className="material-name">{m.label}</strong>
                      <span className="material-price">€{m.min}–€{m.max} / m</span>
                    </div>
                  </div>
                  <div className="material-meta">
                    <span>⏱ {info.levensduur}</span>
                    <span>🔧 {info.onderhoud}</span>
                  </div>
                </button>
              )
            })}
          </div>
          <div className="calc-nav" style={{ marginTop: '1.25rem' }}>
            <button className="calc-back-btn" onClick={() => setStep(2)}>← Terug</button>
            <button className="calc-next-btn" onClick={() => setStep(4)}>Bereken kosten →</button>
          </div>
        </div>
      )}

      {/* ── Step 4 — Resultaat ── */}
      {step === 4 && (
        <div className="calc-result">
          <div className="result-badge">📊 Jouw schutting indicatie</div>

          <div className="result-total">
            <span className="result-label">{meters} meter {material.label} — hoogte {String(hoogte).replace('.', ',')}m</span>
            <strong className="result-price">{formatRange(result.min, result.max)}</strong>
            {buurman && (
              <span className="result-split">
                🤝 Jouw aandeel (50%): <strong>{formatRange(Math.round(result.min / 2), Math.round(result.max / 2))}</strong>
              </span>
            )}
          </div>

          {needsPermit && (
            <div className="permit-warning" role="note">
              <span>⚠️</span>
              <p>Vergeet de <strong>omgevingsvergunning</strong> niet aan te vragen voor schuttingen van 2m+.</p>
            </div>
          )}

          <div className="result-breakdown">
            {result.breakdown.map((item) => (
              <div key={item.label} className="breakdown-row">
                <span>{item.label}</span>
                <span className="breakdown-amount">{formatRange(item.min, item.max)}</span>
              </div>
            ))}
            {buurman && (
              <div className="breakdown-row breakdown-row--split">
                <span>🤝 Buurman aandeel (50%)</span>
                <span className="breakdown-amount">−{formatRange(Math.round(result.min / 2), Math.round(result.max / 2))}</span>
              </div>
            )}
            <div className="breakdown-row breakdown-row--total">
              <strong>{buurman ? 'Jouw kosten (50%)' : 'Totaal indicatie'}</strong>
              <strong className="breakdown-amount">
                {buurman
                  ? formatRange(Math.round(result.min / 2), Math.round(result.max / 2))
                  : formatRange(result.min, result.max)
                }
              </strong>
            </div>
          </div>

          <p className="result-disclaimer">
            Inclusief plaatsing en fundering. Excl. sloopreis oud scherm, vergunningskosten en grondwerkzaamheden.
            Tarieven 2025, excl. btw.
          </p>

          {/* WhatsApp delen */}
          <div className="whatsapp-section">
            <p className="whatsapp-label">
              {buurman ? '📤 Stuur de berekening naar uw buurman' : '📤 Deel de berekening via WhatsApp'}
            </p>
            <button type="button" className="whatsapp-btn" onClick={shareWhatsApp} aria-label="Deel via WhatsApp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {buurman ? 'Stuur naar buurman via WhatsApp' : 'Deel via WhatsApp'}
            </button>
          </div>

          <a href="/offerte" className="result-cta-btn">
            📬 Vraag gratis offertes aan
          </a>
          <button className="calc-back-btn" onClick={() => setStep(1)} style={{ marginTop: '0.75rem', width: '100%' }}>
            Opnieuw berekenen
          </button>
        </div>
      )}

      <style>{schuttingStyles}</style>
    </div>
  )
}

// ─── Shared styles (exported for SubsidieCheck + BouwdepotCalculator) ─────────

export const sharedCalcStyles = `
  .calc-placeholder { font-family: 'Inter', sans-serif; color: #EDF2EC; }
  .calc-step { display: flex; flex-direction: column; gap: 1rem; }
  .step-title { margin: 0; font-size: 1.25rem; font-family: 'Plus Jakarta Sans', sans-serif; color: #EDF2EC; }
  .step-hint { margin: 0; font-size: 0.85rem; color: rgba(237,242,236,0.42); }
  .m2-display { display: flex; align-items: baseline; gap: 0.25rem; justify-content: center; padding: 1.5rem; background: rgba(110,158,101,0.10); border: 1px solid rgba(110,158,101,0.20); border-radius: 12px; }
  .m2-value { font-size: 3.5rem; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; color: #C4A96A; line-height: 1; }
  .m2-unit { font-size: 1.5rem; color: rgba(196,169,106,0.70); font-weight: 600; }
  .m2-slider { width: 100%; accent-color: #C4A96A; cursor: pointer; height: 6px; }
  .m2-labels { display: flex; justify-content: space-between; font-size: 0.75rem; color: rgba(237,242,236,0.30); }
  .quality-grid { display: flex; flex-direction: column; gap: 0.5rem; }
  .quality-btn { display: flex; flex-direction: column; align-items: flex-start; gap: 0.25rem; padding: 0.875rem 1.25rem; border: 1px solid rgba(255,255,255,0.10); border-radius: 8px; background: rgba(255,255,255,0.05); cursor: pointer; text-align: left; transition: border-color 0.15s ease-out, background-color 0.15s ease-out; width: 100%; }
  .quality-btn strong { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.9375rem; color: rgba(237,242,236,0.80); }
  .quality-btn span { font-size: 0.8rem; color: rgba(237,242,236,0.42); }
  .quality-btn:hover { border-color: rgba(196,169,106,0.35); background: rgba(255,255,255,0.08); }
  .quality-btn--selected { border-color: rgba(110,158,101,0.50); background: rgba(110,158,101,0.12); }
  .quality-btn--selected strong { color: #EDF2EC; }
  .calc-nav { display: flex; gap: 0.75rem; }
  .calc-next-btn { flex: 1; padding: 0.75rem 1.5rem; background: #C4A96A; color: #1C1400; border: none; border-radius: 8px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1rem; font-weight: 700; cursor: pointer; transition: background-color 0.15s ease-out, box-shadow 0.15s ease-out, transform 0.15s ease-out; box-shadow: 0 2px 12px rgba(196,169,106,0.25); }
  .calc-next-btn:hover { background: #A88B4A; box-shadow: 0 4px 20px rgba(196,169,106,0.35); transform: translateY(-1px); }
  .calc-back-btn { padding: 0.75rem 1rem; background: transparent; border: 1px solid rgba(255,255,255,0.10); border-radius: 8px; color: rgba(237,242,236,0.45); font-size: 0.875rem; cursor: pointer; transition: border-color 0.15s ease-out, color 0.15s ease-out; font-family: 'Inter', sans-serif; }
  .calc-back-btn:hover { border-color: rgba(196,169,106,0.35); color: rgba(237,242,236,0.80); }
  .calc-result { display: flex; flex-direction: column; gap: 1rem; }
  .result-badge { font-size: 0.8rem; font-weight: 600; color: #C4A96A; text-transform: uppercase; letter-spacing: 0.05em; }
  .result-total { display: flex; flex-direction: column; gap: 0.375rem; background: rgba(110,158,101,0.10); border: 1px solid rgba(110,158,101,0.20); border-radius: 12px; padding: 1.5rem; }
  .result-label { font-size: 0.875rem; color: rgba(237,242,236,0.45); }
  .result-price { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 2rem; font-weight: 700; color: #C4A96A; }
  .result-breakdown { display: flex; flex-direction: column; border: 1px solid rgba(255,255,255,0.09); border-radius: 8px; overflow: hidden; }
  .breakdown-row { display: flex; justify-content: space-between; padding: 0.75rem 1rem; font-size: 0.875rem; border-bottom: 1px solid rgba(255,255,255,0.07); color: rgba(237,242,236,0.65); }
  .breakdown-row:last-child { border-bottom: none; }
  .breakdown-row--total { background: rgba(255,255,255,0.04); }
  .breakdown-row--total strong { color: #EDF2EC; }
  .breakdown-amount { font-weight: 600; color: #C4A96A; }
  .result-cta-btn { width: 100%; padding: 0.875rem 1.5rem; background: #C4A96A; color: #1C1400; text-align: center; text-decoration: none; border-radius: 8px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1rem; font-weight: 700; transition: all 0.15s; box-shadow: 0 2px 12px rgba(196,169,106,0.25); display: block; }
  .result-cta-btn:hover { background: #A88B4A; text-decoration: none; box-shadow: 0 4px 20px rgba(196,169,106,0.35); }
`

// ─── Component-specific styles ─────────────────────────────────────────────

const schuttingStyles = `
  .calc-wrapper { font-family: 'Inter', sans-serif; color: #EDF2EC; }
  .calc-step { display: flex; flex-direction: column; gap: 1.125rem; }
  .step-title { margin: 0; font-size: 1.25rem; font-family: 'Plus Jakarta Sans', sans-serif; color: #EDF2EC; }
  .step-hint { margin: 0; font-size: 0.85rem; color: rgba(237,242,236,0.40); }
  .field-label { margin: 0 0 0.625rem; font-size: 0.875rem; font-weight: 600; color: rgba(237,242,236,0.65); font-family: 'Plus Jakarta Sans', sans-serif; }

  .calc-progress {
    display: flex;
    align-items: center;
    gap: 0;
    margin-bottom: 2rem;
    overflow: hidden;
  }
  .prog-step { display: flex; flex-direction: column; align-items: center; gap: 0.375rem; flex: 1; }
  .prog-dot { width: 2rem; height: 2rem; border-radius: 50%; background: rgba(255,255,255,0.10); color: rgba(237,242,236,0.40); display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; transition: all 0.2s; }
  .prog-step--done .prog-dot  { background: #6E9E65; color: #EDF2EC; }
  .prog-step--active .prog-dot { background: #C4A96A; color: #1C1400; box-shadow: 0 0 0 4px rgba(196,169,106,0.20); }
  .prog-label { font-size: 0.7rem; color: rgba(237,242,236,0.35); text-align: center; font-weight: 500; }
  .prog-step--active .prog-label { color: #C4A96A; }
  .prog-step--done .prog-label  { color: #6E9E65; }

  .m2-display { display: flex; align-items: baseline; gap: 0.25rem; justify-content: center; padding: 1.5rem; background: rgba(110,158,101,0.10); border: 1px solid rgba(110,158,101,0.20); border-radius: 12px; }
  .m2-value { font-size: 3.5rem; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; color: #C4A96A; line-height: 1; }
  .m2-unit { font-size: 1.5rem; color: rgba(196,169,106,0.70); font-weight: 600; }
  .m2-slider { width: 100%; accent-color: #C4A96A; cursor: pointer; height: 6px; }
  .m2-labels { display: flex; justify-content: space-between; font-size: 0.75rem; color: rgba(237,242,236,0.30); }

  .hoogte-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
  .hoogte-btn { display: flex; flex-direction: column; align-items: flex-start; gap: 0.125rem; padding: 0.75rem 1rem; border: 1px solid rgba(255,255,255,0.10); border-radius: 8px; background: rgba(255,255,255,0.04); cursor: pointer; text-align: left; transition: all 0.15s; width: 100%; }
  .hoogte-btn strong { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.9rem; color: rgba(237,242,236,0.80); }
  .hoogte-btn span { font-size: 0.75rem; color: rgba(237,242,236,0.38); }
  .hoogte-btn:hover { border-color: rgba(196,169,106,0.30); background: rgba(255,255,255,0.07); }
  .hoogte-btn--selected { border-color: rgba(196,169,106,0.55); background: rgba(196,169,106,0.10); }
  .hoogte-btn--selected strong { color: #C4A96A; }

  .buurman-toggle { background: rgba(110,158,101,0.07); border: 1px solid rgba(110,158,101,0.18); border-radius: 12px; padding: 1rem; }
  .toggle-label { display: flex; align-items: center; gap: 0.875rem; cursor: pointer; }
  .toggle-icon { font-size: 1.5rem; flex-shrink: 0; }
  .toggle-label > div { flex: 1; }
  .toggle-label strong { display: block; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.9375rem; color: #EDF2EC; margin-bottom: 0.125rem; }
  .toggle-label p { margin: 0; font-size: 0.775rem; color: rgba(237,242,236,0.42); line-height: 1.5; }
  .toggle-switch-wrap { flex-shrink: 0; }
  .toggle-input { position: absolute; opacity: 0; width: 0; height: 0; }
  .toggle-switch { display: block; width: 42px; height: 24px; border-radius: 99px; background: rgba(255,255,255,0.15); position: relative; transition: background 0.2s; cursor: pointer; }
  .toggle-switch::after { content: ''; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: white; transition: transform 0.2s; }
  .toggle-switch--on { background: #6E9E65; }
  .toggle-switch--on::after { transform: translateX(18px); }

  .material-grid { display: flex; flex-direction: column; gap: 0.5rem; }
  .material-btn { display: flex; flex-direction: column; gap: 0.625rem; padding: 1rem 1.125rem; border: 1px solid rgba(255,255,255,0.10); border-radius: 10px; background: rgba(255,255,255,0.04); cursor: pointer; text-align: left; transition: all 0.15s; width: 100%; }
  .material-btn:hover { border-color: rgba(196,169,106,0.30); background: rgba(255,255,255,0.07); }
  .material-btn--selected { border-color: rgba(110,158,101,0.50); background: rgba(110,158,101,0.10); }
  .material-header { display: flex; align-items: center; gap: 0.75rem; }
  .material-icon { font-size: 1.375rem; flex-shrink: 0; }
  .material-name { display: block; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.9375rem; font-weight: 700; color: rgba(237,242,236,0.85); }
  .material-btn--selected .material-name { color: #EDF2EC; }
  .material-price { font-size: 0.8rem; color: rgba(237,242,236,0.42); }
  .material-meta { display: flex; gap: 1rem; font-size: 0.775rem; color: rgba(237,242,236,0.38); padding-top: 0.25rem; border-top: 1px solid rgba(255,255,255,0.06); }

  .calc-nav { display: flex; gap: 0.75rem; }
  .calc-next-btn { flex: 1; padding: 0.75rem 1.5rem; background: #C4A96A; color: #1C1400; border: none; border-radius: 8px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1rem; font-weight: 700; cursor: pointer; transition: background-color 0.15s ease-out, box-shadow 0.15s ease-out, transform 0.15s ease-out; box-shadow: 0 2px 12px rgba(196,169,106,0.25); }
  .calc-next-btn:hover { background: #A88B4A; box-shadow: 0 4px 20px rgba(196,169,106,0.35); transform: translateY(-1px); }
  .calc-back-btn { padding: 0.75rem 1rem; background: transparent; border: 1px solid rgba(255,255,255,0.10); border-radius: 8px; color: rgba(237,242,236,0.45); font-size: 0.875rem; cursor: pointer; transition: border-color 0.15s ease-out, color 0.15s ease-out; font-family: 'Inter', sans-serif; }
  .calc-back-btn:hover { border-color: rgba(196,169,106,0.35); color: rgba(237,242,236,0.80); }

  .calc-result { display: flex; flex-direction: column; gap: 1rem; }
  .result-badge { font-size: 0.8rem; font-weight: 600; color: #C4A96A; text-transform: uppercase; letter-spacing: 0.05em; }
  .result-total { display: flex; flex-direction: column; gap: 0.375rem; background: rgba(110,158,101,0.10); border: 1px solid rgba(110,158,101,0.20); border-radius: 12px; padding: 1.5rem; }
  .result-label { font-size: 0.875rem; color: rgba(237,242,236,0.45); }
  .result-price { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 2rem; font-weight: 700; color: #C4A96A; }
  .result-split { font-size: 0.875rem; color: rgba(237,242,236,0.65); margin-top: 0.25rem; }
  .result-split strong { color: #86C97D; }

  .result-breakdown { display: flex; flex-direction: column; border: 1px solid rgba(255,255,255,0.09); border-radius: 8px; overflow: hidden; }
  .breakdown-row { display: flex; justify-content: space-between; padding: 0.75rem 1rem; font-size: 0.875rem; border-bottom: 1px solid rgba(255,255,255,0.07); color: rgba(237,242,236,0.65); }
  .breakdown-row:last-child { border-bottom: none; }
  .breakdown-row--split { color: rgba(134,201,125,0.70); }
  .breakdown-row--total { background: rgba(255,255,255,0.04); }
  .breakdown-row--total strong { color: #EDF2EC; }
  .breakdown-amount { font-weight: 600; color: #C4A96A; }

  .result-disclaimer { font-size: 0.775rem; color: rgba(237,242,236,0.30); margin: 0; line-height: 1.6; padding: 0 0.25rem; }

  .whatsapp-section { background: rgba(37,211,102,0.06); border: 1px solid rgba(37,211,102,0.20); border-radius: 12px; padding: 1.125rem; display: flex; flex-direction: column; gap: 0.625rem; }
  .whatsapp-label { margin: 0; font-size: 0.875rem; font-weight: 600; color: rgba(237,242,236,0.70); font-family: 'Plus Jakarta Sans', sans-serif; }
  .whatsapp-btn { display: flex; align-items: center; justify-content: center; gap: 0.625rem; padding: 0.75rem 1.25rem; background: #25D366; color: #fff; border: none; border-radius: 8px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.9375rem; font-weight: 700; cursor: pointer; transition: all 0.15s; box-shadow: 0 2px 12px rgba(37,211,102,0.20); }
  .whatsapp-btn:hover { background: #1da851; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(37,211,102,0.30); }

  .permit-warning { display: flex; gap: 0.75rem; align-items: flex-start; background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.25); border-radius: 8px; padding: 0.875rem 1rem; font-size: 0.875rem; color: rgba(237,242,236,0.70); }
  .permit-warning span { font-size: 1.1rem; flex-shrink: 0; margin-top: 0.1rem; }
  .permit-warning p { margin: 0; line-height: 1.55; }
  .permit-warning strong { color: #FCD34D; }

  .result-cta-btn { width: 100%; padding: 0.875rem 1.5rem; background: #C4A96A; color: #1C1400; text-align: center; text-decoration: none; border-radius: 8px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1rem; font-weight: 700; transition: all 0.15s; box-shadow: 0 2px 12px rgba(196,169,106,0.25); display: block; }
  .result-cta-btn:hover { background: #A88B4A; text-decoration: none; box-shadow: 0 4px 20px rgba(196,169,106,0.35); }
`

export default SchuttingCalculator
