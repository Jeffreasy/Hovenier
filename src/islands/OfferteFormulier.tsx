import { useState, useEffect, type FC } from 'react'
import type { BudgetRange, StartTiming, OfferteData } from '../lib/types'
import { SERVICE_OPTIONS, BUDGET_OPTIONS, TIMING_OPTIONS } from '../lib/constants'
import { isValidPostcode } from '../lib/utils'

const TOTAL_STEPS = 5

const STEP_LABELS = [
  'Dienst',
  'Tuingrootte',
  'Budget',
  'Planning',
  'Jouw gegevens',
]

type FormState = Partial<OfferteData>

/** Lees URL-params eenmalig bij mount (lazy initialiser = geen re-render). */
function readUrlParams(): { form: FormState; step: number; stad: string } {
  const params = new URLSearchParams(window.location.search)
  const postcode = params.get('postcode')?.trim() ?? ''
  const dienst   = params.get('dienst')?.trim()   ?? ''
  const stad     = params.get('stad')?.trim()      ?? ''
  const form: FormState = {}
  if (postcode) form.postcode = postcode
  if (dienst)   form.dienst   = dienst as FormState['dienst']
  const step = dienst ? 2 : 1
  return { form, step, stad }
}

const OfferteFormulier: FC = () => {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>({})
  const [stad, setStad] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Lees URL-params na hydration (client-only)
  useEffect(() => {
    const { form: initialForm, step: initialStep, stad: initialStad } = readUrlParams()
    if (Object.keys(initialForm).length > 0) setForm(initialForm)
    if (initialStep > 1) setStep(initialStep)
    if (initialStad) setStad(initialStad)
  }, [])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => { const e = { ...prev }; delete e[key]; return e })
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (step === 1 && !form.dienst) e.dienst = 'Kies een dienst'
    if (step === 2 && (!form.m2 || form.m2 < 1)) e.m2 = 'Vul een geldige tuingrootte in'
    if (step === 3 && !form.budget) e.budget = 'Kies een budgetrange'
    if (step === 4 && !form.timing) e.timing = 'Kies een startmoment'
    if (step === 5) {
      const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
      if (!form.naam?.trim())  e.naam = 'Vul je naam in'
      if (!form.email || !EMAIL_RE.test(form.email)) e.email = 'Vul een geldig e-mailadres in'
      if (!form.telefoon?.trim()) e.telefoon = 'Vul je telefoonnummer in'
      if (!form.postcode || !isValidPostcode(form.postcode)) e.postcode = 'Vul een geldige postcode in (bijv. 1234 AB)'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function next() {
    if (!validate()) return
    if (step < TOTAL_STEPS) setStep((s) => s + 1)
    else handleSubmit()
  }

  async function handleSubmit() {
    setLoading(true)
    setSubmitError('')
    try {
      const convexUrl = import.meta.env.PUBLIC_CONVEX_URL ?? ''
      const siteUrl = convexUrl.replace('.convex.cloud', '.convex.site')
      if (!siteUrl) throw new Error('Configuratiefout, probeer de pagina te herladen.')

      const res = await fetch(`${siteUrl}/submit-lead`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })

      const text = await res.text()
      let data: { ok: boolean; error?: string } = { ok: false }
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error(res.ok ? 'Onverwachte serverrespons, probeer opnieuw.' : `Serverfout (${res.status})`)
      }

      if (!res.ok || !data.ok) throw new Error(data.error ?? 'Onbekende fout')
      window.location.href = '/offerte/bedankt'
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Verzenden mislukt, probeer opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100

  return (
    <div className="flex flex-col gap-6 font-body text-charcoal w-full min-w-0 overflow-hidden">

      {/* Stad-context banner */}
      {stad && (
        <div className="flex items-center gap-2 py-3 px-4 bg-primary-50 border border-primary-200 rounded-md text-sm text-charcoal-light" role="note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500 shrink-0">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          Je vraagt offertes aan voor hoveniers in <strong className="text-charcoal font-semibold">{stad.charAt(0).toUpperCase() + stad.slice(1)}</strong>
        </div>
      )}

      {/* Progress bar */}
      <div className="h-1 bg-canvas-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-500 rounded-full transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Stap ${step} van ${TOTAL_STEPS} — ${STEP_LABELS[step - 1]}`}
        />
      </div>

      {/* Step indicator */}
      <div className="flex justify-between items-center text-xs text-charcoal-muted">
        <span>Stap {step} van {TOTAL_STEPS}</span>
        <span className="font-semibold text-primary-500">{STEP_LABELS[step - 1]}</span>
      </div>

      {/* Step 1 — Dienst */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <h2 className="m-0 text-xl font-heading font-bold text-charcoal">Wat wil je laten doen?</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {SERVICE_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={`py-3.5 px-3 border rounded-md text-sm font-semibold text-center cursor-pointer transition-colors duration-150
                  ${form.dienst === value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-border bg-white text-charcoal-light hover:border-primary-300 hover:bg-primary-50/50'
                  }`}
                onClick={() => update('dienst', value)}
                aria-pressed={form.dienst === value}
              >
                {label}
              </button>
            ))}
          </div>
          {errors.dienst && <p className="text-xs text-error m-0">{errors.dienst}</p>}
        </div>
      )}

      {/* Step 2 — m² */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <h2 className="m-0 text-xl font-heading font-bold text-charcoal">Hoe groot is je tuin?</h2>
          <div className="flex items-center gap-3">
            <input
              id="m2"
              type="number"
              min={1}
              max={5000}
              placeholder="bijv. 80"
              value={form.m2 ?? ''}
              onChange={(e) => update('m2', Number(e.target.value))}
              className="px-5 py-4 border border-border rounded-md text-2xl bg-white text-charcoal placeholder:text-charcoal-muted/40 transition-colors duration-150 focus:outline-none focus:border-primary-500 focus:ring-3 focus:ring-primary-100"
              style={{ width: '100%', boxSizing: 'border-box' }}
              aria-label="Tuingrootte in m²"
            />
            <span className="text-xl font-bold text-primary-500 shrink-0">m²</span>
          </div>
          {errors.m2 && <p className="text-xs text-error m-0">{errors.m2}</p>}
        </div>
      )}

      {/* Step 3 — Budget */}
      {step === 3 && (
        <div className="flex flex-col gap-4">
          <h2 className="m-0 text-xl font-heading font-bold text-charcoal">Wat is jouw budget?</h2>
          <div className="flex flex-col gap-2">
            {BUDGET_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={`py-3.5 px-5 border rounded-md text-[0.9375rem] font-semibold text-left cursor-pointer transition-colors duration-150
                  ${form.budget === value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-border bg-white text-charcoal-light hover:border-primary-300 hover:bg-primary-50/50'
                  }`}
                onClick={() => update('budget', value as BudgetRange)}
                aria-pressed={form.budget === value}
              >
                {label}
              </button>
            ))}
          </div>
          {errors.budget && <p className="text-xs text-error m-0">{errors.budget}</p>}
        </div>
      )}

      {/* Step 4 — Timing */}
      {step === 4 && (
        <div className="flex flex-col gap-4">
          <h2 className="m-0 text-xl font-heading font-bold text-charcoal">Wanneer wil je starten?</h2>
          <div className="flex flex-col gap-2">
            {TIMING_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={`py-3.5 px-5 border rounded-md text-[0.9375rem] font-semibold text-left cursor-pointer transition-colors duration-150
                  ${form.timing === value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-border bg-white text-charcoal-light hover:border-primary-300 hover:bg-primary-50/50'
                  }`}
                onClick={() => update('timing', value as StartTiming)}
                aria-pressed={form.timing === value}
              >
                {label}
              </button>
            ))}
          </div>
          {errors.timing && <p className="text-xs text-error m-0">{errors.timing}</p>}
        </div>
      )}

      {/* Step 5 — Contactgegevens */}
      {step === 5 && (
        <div className="flex flex-col gap-4">
          <h2 className="m-0 text-xl font-heading font-bold text-charcoal">Jouw gegevens</h2>
          <p className="m-0 text-sm text-charcoal-muted">Zodat hoveniers contact met je kunnen opnemen.</p>
          <div className="flex flex-col gap-4">
            {[
              { id: 'naam',     label: 'Naam',           type: 'text',  placeholder: 'Jan de Vries',     autoComplete: 'name',        value: form.naam },
              { id: 'email',    label: 'E-mailadres',    type: 'email', placeholder: 'jan@voorbeeld.nl', autoComplete: 'email',       value: form.email },
              { id: 'telefoon', label: 'Telefoonnummer', type: 'tel',   placeholder: '06 12 34 56 78',   autoComplete: 'tel',         value: form.telefoon },
              { id: 'postcode', label: 'Postcode',       type: 'text',  placeholder: '1234 AB',          autoComplete: 'postal-code', value: form.postcode },
            ].map(({ id, label, type, placeholder, autoComplete, value }) => (
              <div key={id} className="flex flex-col gap-1.5">
                <label htmlFor={id} className="font-heading text-sm font-semibold text-charcoal-light">{label}</label>
                <input
                  id={id}
                  type={type}
                  placeholder={placeholder}
                  autoComplete={autoComplete}
                  spellCheck={false}
                  value={(value as string) ?? ''}
                  onChange={(e) => update(id as keyof FormState, e.target.value)}
                  className={`w-full px-4 py-3 border rounded-md text-base bg-white text-charcoal placeholder:text-charcoal-muted/40 transition-colors duration-150 focus:outline-none focus:border-primary-500 focus:ring-3 focus:ring-primary-100
                    ${errors[id] ? 'border-error' : 'border-border'}`}
                />
                {errors[id] && <p className="text-xs text-error m-0">{errors[id]}</p>}
              </div>
            ))}
          </div>
          <p className="flex items-center gap-1.5 text-xs text-charcoal-muted m-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500 shrink-0">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Je gegevens worden alleen gedeeld met max. 3 hoveniers. Geen spam.
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-2 border-t border-border">
        {step > 1 && (
          <button
            type="button"
            className="py-3.5 px-4 bg-transparent border border-border rounded-md text-sm text-charcoal-muted cursor-pointer transition-colors duration-150 hover:border-border-hover hover:text-charcoal"
            onClick={() => setStep((s) => s - 1)}
            aria-label="Vorige stap"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Terug
          </button>
        )}
        <button
          type="button"
          className="flex-1 py-3.5 px-6 bg-primary-500 text-white border-none rounded-md font-heading text-base font-bold cursor-pointer transition-colors duration-150 hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={next}
          disabled={loading}
        >
          {loading
            ? 'Verzenden\u2026'
            : step < TOTAL_STEPS ? 'Volgende' : 'Verstuur aanvraag'
          }
        </button>
      </div>

      {submitError && (
        <p role="alert" className="text-sm text-error text-center m-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {submitError}
        </p>
      )}
    </div>
  )
}

export default OfferteFormulier
