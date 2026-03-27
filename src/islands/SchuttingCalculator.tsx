import type { FC } from 'react'
import {
  SCHUTTING_MATERIALS,
  calculateSchuttingCosts,
  type SchuttingMaterial,
} from '../lib/pricing'
import { formatRange } from '../lib/utils'
import { useState } from 'react'

interface MaterialInfo {
  id:            string
  label:         string
  levensduur:    string
  onderhoud:     string
}

const MATERIAL_INFO: Record<string, MaterialInfo> = {
  vuren:       { id: 'vuren',       label: 'Hout',        levensduur: '10-20 jaar', onderhoud: 'Jaarlijks behandelen' },
  hardhout:    { id: 'hardhout',    label: 'Hardhout',    levensduur: '20-30 jaar', onderhoud: '2x per 5 jaar olien' },
  composiet:   { id: 'composiet',   label: 'Composiet',   levensduur: '25-40 jaar', onderhoud: 'Nauwelijks onderhoud' },
  beton:       { id: 'beton',       label: 'Beton',       levensduur: '30-50 jaar', onderhoud: 'Praktisch onderhoudsvr.' },
  metaal:      { id: 'metaal',      label: 'Cortenstaal', levensduur: '40-60 jaar', onderhoud: 'Geen, roest mooi' },
  toogplanken: { id: 'toogplanken', label: 'Toogplanken', levensduur: '10-15 jaar', onderhoud: 'Jaarlijks behandelen' },
}

const HOOGTE_OPTIONS = [
  { value: 1.2, label: '1,2 meter', desc: 'Lage erfscheiding' },
  { value: 1.5, label: '1,5 meter', desc: 'Standaard laag' },
  { value: 1.8, label: '1,8 meter', desc: 'Standaard hoog' },
  { value: 2.0, label: '2,0 meter', desc: 'Maximum vrij bouw' },
]

const SchuttingCalculator: FC = () => {
  const [step,     setStep]     = useState<1 | 2 | 3 | 4>(1)
  const [meters,   setMeters]   = useState(10)
  const [hoogte,   setHoogte]   = useState(1.8)
  const [buurman,  setBuurman]  = useState(false)
  const [material, setMaterial] = useState<SchuttingMaterial>(SCHUTTING_MATERIALS[0]!)

  const result      = calculateSchuttingCosts(meters, material, hoogte)
  const needsPermit = hoogte >= 2.0
  const buurmanAandeel = buurman ? Math.round(result.min / 2) : null

  function shareWhatsApp() {
    const splitTekst = buurman
      ? `\n Jouw aandeel (50%): ${formatRange(Math.round(result.min / 2), Math.round(result.max / 2))}`
      : ''
    const text = encodeURIComponent(
      `Schutting kostenberekening via TuinHub.nl\n\n` +
      `${meters} meter ${material.label} (${String(hoogte).replace('.', ',')}m hoog)\n` +
      `Totaal: ${formatRange(result.min, result.max)}${splitTekst}\n\n` +
      `Specificatie:\n` +
      result.breakdown.map(b => `  - ${b.label}: ${formatRange(b.min, b.max)}`).join('\n') +
      `\n\nBereken zelf: tuinhub.nl/tools/schutting-kosten-calculator`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  const STEPS = ['Lengte', 'Hoogte & buurman', 'Materiaal', 'Resultaat']

  return (
    <div className="font-body text-charcoal">

      {/* Progress bar */}
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
            <span className={`text-[0.7rem] text-center font-medium
              ${step === i + 1 ? 'text-primary-500' : ''}
              ${step > i + 1 ? 'text-primary-500' : ''}
              ${step <= i ? 'text-charcoal-muted' : ''}
            `}>{label}</span>
          </div>
        ))}
      </div>

      {/* Step 1 — Lengte */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <h2 className="m-0 text-xl font-heading font-bold text-charcoal">Hoeveel strekkende meter schutting?</h2>
          <p className="m-0 text-sm text-charcoal-muted">Tip: meet de totale grenslengte inclusief eventuele zijkanten.</p>
          <div className="flex items-baseline gap-1 justify-center py-6 bg-primary-50 border border-primary-200 rounded-lg">
            <span className="text-[3.5rem] font-bold font-heading text-primary-500 leading-none">{meters}</span>
            <span className="text-2xl text-primary-300 font-semibold">meter</span>
          </div>
          <input
            type="range" min={2} max={100} step={1} value={meters}
            onChange={(e) => setMeters(Number(e.target.value))}
            className="w-full accent-primary-500 cursor-pointer h-1.5"
            aria-label="Lengte in strekkende meters"
          />
          <div className="flex justify-between text-xs text-charcoal-muted"><span>2 m</span><span>50 m</span><span>100 m</span></div>
          <button type="button" className="mt-3 flex-1 py-3 px-6 bg-primary-500 text-white border-none rounded-md font-heading text-base font-bold cursor-pointer transition-colors duration-150 hover:bg-primary-600" onClick={() => setStep(2)}>
            Volgende
          </button>
        </div>
      )}

      {/* Step 2 — Hoogte + buurman */}
      {step === 2 && (
        <div className="flex flex-col gap-5">
          <h2 className="m-0 text-xl font-heading font-bold text-charcoal">Hoogte & kostenverdeling</h2>

          <div>
            <p className="m-0 mb-2.5 text-sm font-semibold text-charcoal-light font-heading">Gewenste hoogte</p>
            <div className="grid grid-cols-2 gap-2">
              {HOOGTE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`flex flex-col items-start gap-0.5 py-3 px-4 border rounded-md cursor-pointer text-left w-full transition-colors duration-150
                    ${hoogte === opt.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-border bg-white hover:border-primary-300 hover:bg-primary-50/50'
                    }`}
                  onClick={() => setHoogte(opt.value)}
                  aria-pressed={hoogte === opt.value}
                >
                  <strong className={`font-heading text-sm ${hoogte === opt.value ? 'text-primary-700' : 'text-charcoal'}`}>{opt.label}</strong>
                  <span className="text-xs text-charcoal-muted">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {needsPermit && (
            <div className="flex gap-3 items-start bg-warning-light border border-warning/25 rounded-md py-3.5 px-4 text-sm text-charcoal-light" role="alert">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-warning shrink-0 mt-0.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <p className="m-0 leading-snug">Bij 2,0 meter is in veel gemeenten een <strong className="text-charcoal font-semibold">omgevingsvergunning</strong> vereist. Controleer dit bij uw gemeente.</p>
            </div>
          )}

          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <label className="flex items-center gap-3.5 cursor-pointer" htmlFor="sc-buurman">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500 shrink-0">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <div className="flex-1">
                <strong className="block font-heading text-[0.9375rem] text-charcoal mb-0.5">Kosten delen met buurman</strong>
                <p className="m-0 text-[0.775rem] text-charcoal-muted leading-snug">Wettelijk recht op kostensplitsing (art. 5:49 BW) bij grensmuur</p>
              </div>
              <div className="shrink-0">
                <input type="checkbox" id="sc-buurman" checked={buurman} onChange={(e) => setBuurman(e.target.checked)} className="sr-only peer" />
                <span className={`block w-[42px] h-6 rounded-full relative transition-colors duration-200 cursor-pointer
                  ${buurman ? 'bg-primary-500' : 'bg-border-hover'}
                  after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:w-[18px] after:h-[18px] after:rounded-full after:bg-white after:transition-transform after:duration-200
                  ${buurman ? 'after:translate-x-[18px]' : ''}
                `} aria-hidden="true" />
              </div>
            </label>
          </div>

          <div className="flex gap-3 mt-1">
            <button className="py-3 px-4 bg-transparent border border-border rounded-md text-sm text-charcoal-muted cursor-pointer transition-colors duration-150 hover:border-border-hover hover:text-charcoal" onClick={() => setStep(1)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Terug
            </button>
            <button className="flex-1 py-3 px-6 bg-primary-500 text-white border-none rounded-md font-heading text-base font-bold cursor-pointer transition-colors duration-150 hover:bg-primary-600" onClick={() => setStep(3)}>
              Kies materiaal
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Materiaal */}
      {step === 3 && (
        <div className="flex flex-col gap-4">
          <h2 className="m-0 text-xl font-heading font-bold text-charcoal">Welk materiaal?</h2>
          <p className="m-0 text-sm text-charcoal-muted">Kies het materiaal dat past bij uw budget en wensen.</p>
          <div className="flex flex-col gap-2">
            {SCHUTTING_MATERIALS.map((m) => {
              const info = MATERIAL_INFO[m.id]!
              return (
                <button
                  key={m.id}
                  type="button"
                  className={`flex flex-col gap-2.5 py-4 px-4.5 border rounded-lg cursor-pointer text-left w-full transition-colors duration-150
                    ${material.id === m.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-border bg-white hover:border-primary-300 hover:bg-primary-50/50'
                    }`}
                  onClick={() => setMaterial(m)}
                  aria-pressed={material.id === m.id}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <strong className={`block font-heading text-[0.9375rem] font-bold ${material.id === m.id ? 'text-primary-700' : 'text-charcoal'}`}>{m.label}</strong>
                      <span className="text-xs text-charcoal-muted">{'\u20AC'}{m.min}-{'\u20AC'}{m.max} / m</span>
                    </div>
                  </div>
                  <div className="flex gap-4 text-[0.775rem] text-charcoal-muted pt-1 border-t border-border-light">
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {info.levensduur}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                      {info.onderhoud}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
          <div className="flex gap-3 mt-1">
            <button className="py-3 px-4 bg-transparent border border-border rounded-md text-sm text-charcoal-muted cursor-pointer transition-colors duration-150 hover:border-border-hover hover:text-charcoal" onClick={() => setStep(2)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Terug
            </button>
            <button className="flex-1 py-3 px-6 bg-primary-500 text-white border-none rounded-md font-heading text-base font-bold cursor-pointer transition-colors duration-150 hover:bg-primary-600" onClick={() => setStep(4)}>
              Bereken kosten
            </button>
          </div>
        </div>
      )}

      {/* Step 4 — Resultaat */}
      {step === 4 && (
        <div className="flex flex-col gap-4">
          <span className="text-xs font-semibold text-primary-500 uppercase tracking-wide">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
            Jouw schutting indicatie
          </span>

          <div className="flex flex-col gap-1.5 bg-primary-50 border border-primary-200 rounded-lg p-6">
            <span className="text-sm text-charcoal-muted">{meters} meter {material.label}, hoogte {String(hoogte).replace('.', ',')}m</span>
            <strong className="font-heading text-[2rem] font-bold text-primary-500">{formatRange(result.min, result.max)}</strong>
            {buurman && (
              <span className="text-sm text-charcoal-light mt-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                Jouw aandeel (50%): <strong className="text-primary-600">{formatRange(Math.round(result.min / 2), Math.round(result.max / 2))}</strong>
              </span>
            )}
          </div>

          {needsPermit && (
            <div className="flex gap-3 items-start bg-warning-light border border-warning/25 rounded-md py-3.5 px-4 text-sm text-charcoal-light" role="note">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-warning shrink-0 mt-0.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <p className="m-0 leading-snug">Vergeet de <strong className="text-charcoal font-semibold">omgevingsvergunning</strong> niet aan te vragen voor schuttingen van 2m+.</p>
            </div>
          )}

          <div className="flex flex-col border border-border rounded-md overflow-hidden">
            {result.breakdown.map((item) => (
              <div key={item.label} className="flex justify-between py-3 px-4 text-sm border-b border-border last:border-b-0 text-charcoal-light">
                <span>{item.label}</span>
                <span className="font-semibold text-charcoal">{formatRange(item.min, item.max)}</span>
              </div>
            ))}
            {buurman && (
              <div className="flex justify-between py-3 px-4 text-sm border-b border-border text-primary-500">
                <span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  Buurman aandeel (50%)
                </span>
                <span className="font-semibold">-{formatRange(Math.round(result.min / 2), Math.round(result.max / 2))}</span>
              </div>
            )}
            <div className="flex justify-between py-3 px-4 text-sm bg-canvas-alt">
              <strong className="text-charcoal">{buurman ? 'Jouw kosten (50%)' : 'Totaal indicatie'}</strong>
              <strong className="text-primary-600">
                {buurman
                  ? formatRange(Math.round(result.min / 2), Math.round(result.max / 2))
                  : formatRange(result.min, result.max)
                }
              </strong>
            </div>
          </div>

          <p className="text-[0.775rem] text-charcoal-muted m-0 leading-relaxed px-1">
            Inclusief plaatsing en fundering. Excl. sloopreis oud scherm, vergunningskosten en grondwerkzaamheden.
            Tarieven 2025, excl. btw.
          </p>

          {/* WhatsApp delen */}
          <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg p-4.5 flex flex-col gap-2.5">
            <p className="m-0 text-sm font-semibold text-charcoal font-heading">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1 text-primary-500"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              {buurman ? 'Stuur de berekening naar uw buurman' : 'Deel de berekening via WhatsApp'}
            </p>
            <button type="button" className="flex items-center justify-center gap-2.5 py-3 px-5 bg-[#25D366] text-white border-none rounded-md font-heading text-[0.9375rem] font-bold cursor-pointer transition-colors duration-150 hover:bg-[#1da851]" onClick={shareWhatsApp} aria-label="Deel via WhatsApp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {buurman ? 'Stuur naar buurman via WhatsApp' : 'Deel via WhatsApp'}
            </button>
          </div>

          <a href="/offerte" className="block w-full py-3.5 px-6 bg-primary-500 text-white text-center no-underline rounded-md font-heading text-base font-bold transition-colors duration-150 hover:bg-primary-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            Vraag gratis offertes aan
          </a>
          <button className="w-full py-3 px-4 bg-transparent border border-border rounded-md text-sm text-charcoal-muted cursor-pointer transition-colors duration-150 hover:border-border-hover hover:text-charcoal" onClick={() => setStep(1)}>
            Opnieuw berekenen
          </button>
        </div>
      )}
    </div>
  )
}

export default SchuttingCalculator
