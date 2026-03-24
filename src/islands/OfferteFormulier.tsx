import { useState, type FC } from 'react'
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

const OfferteFormulier: FC = () => {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

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
      const res = await fetch(`${convexUrl}/submit-lead`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json() as { ok: boolean; error?: string; matched?: boolean }
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
    <div className="of-wrapper">
      {/* Progress bar */}
      <div className="of-progress">
        <div
          className="of-progress-bar"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Stap ${step} van ${TOTAL_STEPS} — ${STEP_LABELS[step - 1]}`}
        />
      </div>

      {/* Step indicator */}
      <div className="of-step-info">
        <span className="of-step-count">Stap {step} van {TOTAL_STEPS}</span>
        <span className="of-step-label">{STEP_LABELS[step - 1]}</span>
      </div>

      {/* Step 1 — Dienst */}
      {step === 1 && (
        <div className="of-step">
          <h2 className="of-title">Wat wil je laten doen?</h2>
          <div className="of-options-grid">
            {SERVICE_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={`of-option-btn ${form.dienst === value ? 'of-option-btn--selected' : ''}`}
                onClick={() => update('dienst', value)}
                aria-pressed={form.dienst === value}
              >
                {label}
              </button>
            ))}
          </div>
          {errors.dienst && <p className="of-error">{errors.dienst}</p>}
        </div>
      )}

      {/* Step 2 — m² */}
      {step === 2 && (
        <div className="of-step">
          <h2 className="of-title">Hoe groot is je tuin?</h2>
          <div className="of-input-group">
            <input
              id="m2"
              type="number"
              min={1}
              max={5000}
              placeholder="bijv. 80"
              value={form.m2 ?? ''}
              onChange={(e) => update('m2', Number(e.target.value))}
              className="of-input of-input--lg"
              aria-label="Tuingrootte in m²"
            />
            <span className="of-input-suffix">m²</span>
          </div>
          {errors.m2 && <p className="of-error">{errors.m2}</p>}
        </div>
      )}

      {/* Step 3 — Budget */}
      {step === 3 && (
        <div className="of-step">
          <h2 className="of-title">Wat is jouw budget?</h2>
          <div className="of-budget-list">
            {BUDGET_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={`of-budget-btn ${form.budget === value ? 'of-budget-btn--selected' : ''}`}
                onClick={() => update('budget', value as BudgetRange)}
                aria-pressed={form.budget === value}
              >
                {label}
              </button>
            ))}
          </div>
          {errors.budget && <p className="of-error">{errors.budget}</p>}
        </div>
      )}

      {/* Step 4 — Timing */}
      {step === 4 && (
        <div className="of-step">
          <h2 className="of-title">Wanneer wil je starten?</h2>
          <div className="of-budget-list">
            {TIMING_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={`of-budget-btn ${form.timing === value ? 'of-budget-btn--selected' : ''}`}
                onClick={() => update('timing', value as StartTiming)}
                aria-pressed={form.timing === value}
              >
                {label}
              </button>
            ))}
          </div>
          {errors.timing && <p className="of-error">{errors.timing}</p>}
        </div>
      )}

      {/* Step 5 — Contactgegevens */}
      {step === 5 && (
        <div className="of-step">
          <h2 className="of-title">Jouw gegevens</h2>
          <p className="of-hint">Zodat hoveniers contact met je kunnen opnemen.</p>
          <div className="of-fields">
            {[
              { id: 'naam',     label: 'Naam',           type: 'text',  placeholder: 'Jan de Vries',     autoComplete: 'name',        spellCheck: false, value: form.naam },
              { id: 'email',    label: 'E-mailadres',    type: 'email', placeholder: 'jan@voorbeeld.nl', autoComplete: 'email',       spellCheck: false, value: form.email },
              { id: 'telefoon', label: 'Telefoonnummer', type: 'tel',   placeholder: '06 12 34 56 78',   autoComplete: 'tel',         spellCheck: false, value: form.telefoon },
              { id: 'postcode', label: 'Postcode',       type: 'text',  placeholder: '1234 AB',          autoComplete: 'postal-code', spellCheck: false, value: form.postcode },
            ].map(({ id, label, type, placeholder, autoComplete, spellCheck, value }) => (
              <div key={id} className="of-field">
                <label htmlFor={id} className="of-label">{label}</label>
                <input
                  id={id}
                  type={type}
                  placeholder={placeholder}
                  autoComplete={autoComplete}
                  spellCheck={spellCheck}
                  value={(value as string) ?? ''}
                  onChange={(e) => update(id as keyof FormState, e.target.value)}
                  className={`of-input ${errors[id] ? 'of-input--error' : ''}`}
                />
                {errors[id] && <p className="of-error">{errors[id]}</p>}
              </div>
            ))}
          </div>
          <p className="of-privacy">
            🔒 Je gegevens worden alleen gedeeld met max. 3 hoveniers. Geen spam.
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="of-nav">
        {step > 1 && (
          <button type="button" className="of-back-btn" onClick={() => setStep((s) => s - 1)} aria-label="Vorige stap">
            <span aria-hidden="true">←</span> Terug
          </button>
        )}
        <button type="button" className="of-next-btn" onClick={next} disabled={loading}>
          {loading
            ? 'Verzenden…'
            : step < TOTAL_STEPS ? 'Volgende' : 'Verstuur aanvraag'
          }
        </button>
      </div>

      {submitError && (
        <p role="alert" style={{ color: '#FF6B6B', fontSize: '0.875rem', textAlign: 'center', margin: 0 }}>
          ⚠️ {submitError}
        </p>
      )}

      <style>{formStyles}</style>
    </div>
  )
}

const formStyles = `
  .of-wrapper { font-family: 'Inter', sans-serif; display: flex; flex-direction: column; gap: 1.5rem; color: #EDF2EC; }

  .of-progress {
    height: 3px;
    background: rgba(255,255,255,0.10);
    border-radius: 99px;
    overflow: hidden;
  }

  .of-progress-bar {
    height: 100%;
    background: #C4A96A;
    border-radius: 99px;
    transition: width 0.3s ease;
  }

  .of-step-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
    color: rgba(237,242,236,0.45);
  }

  .of-step-label { font-weight: 600; color: #C4A96A; }

  .of-step { display: flex; flex-direction: column; gap: 1rem; }

  .of-title { margin: 0; font-size: 1.25rem; font-family: 'Plus Jakarta Sans', sans-serif; color: #EDF2EC; }
  .of-hint { margin: 0; font-size: 0.875rem; color: rgba(237,242,236,0.45); }

  .of-options-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.625rem;
  }

  .of-option-btn {
    padding: 0.875rem;
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 8px;
    background: rgba(255,255,255,0.05);
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    color: rgba(237,242,236,0.65);
    transition: border-color 0.15s ease-out, background-color 0.15s ease-out, color 0.15s ease-out;
    text-align: center;
  }

  .of-option-btn:hover { border-color: rgba(196,169,106,0.40); background: rgba(255,255,255,0.08); color: #EDF2EC; }
  .of-option-btn--selected { border-color: rgba(110,158,101,0.50); background: rgba(110,158,101,0.12); color: #EDF2EC; }

  .of-input-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .of-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 8px;
    font-size: 1rem;
    font-family: 'Inter', sans-serif;
    color: #EDF2EC;
    background: rgba(255,255,255,0.06);
    transition: border-color 0.15s, background 0.15s;
  }

  .of-input::placeholder { color: rgba(237,242,236,0.25); }
  .of-input--lg { font-size: 1.5rem; padding: 1rem 1.25rem; }
  .of-input:focus { outline: none; border-color: rgba(196,169,106,0.45); background: rgba(255,255,255,0.09); }
  .of-input--error { border-color: rgba(248,113,113,0.50); }

  .of-input-suffix {
    font-size: 1.25rem;
    font-weight: 700;
    color: #C4A96A;
    flex-shrink: 0;
  }

  .of-budget-list { display: flex; flex-direction: column; gap: 0.5rem; }

  .of-budget-btn {
    padding: 0.875rem 1.25rem;
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 8px;
    background: rgba(255,255,255,0.05);
    cursor: pointer;
    font-size: 0.9375rem;
    font-weight: 600;
    color: rgba(237,242,236,0.65);
    text-align: left;
    transition: border-color 0.15s ease-out, background-color 0.15s ease-out, color 0.15s ease-out;
  }

  .of-budget-btn:hover { border-color: rgba(196,169,106,0.35); background: rgba(255,255,255,0.08); color: #EDF2EC; }
  .of-budget-btn--selected { border-color: rgba(110,158,101,0.50); background: rgba(110,158,101,0.12); color: #EDF2EC; }

  .of-fields { display: flex; flex-direction: column; gap: 1rem; }
  .of-field  { display: flex; flex-direction: column; gap: 0.375rem; }

  .of-label {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(237,242,236,0.55);
  }

  .of-error {
    font-size: 0.8rem;
    color: #F87171;
    margin: 0;
  }

  .of-privacy {
    font-size: 0.75rem;
    color: rgba(237,242,236,0.30);
    margin: 0;
  }

  .of-nav {
    display: flex;
    gap: 0.75rem;
    padding-top: 0.5rem;
    border-top: 1px solid rgba(255,255,255,0.08);
  }

  .of-next-btn {
    flex: 1;
    padding: 0.875rem 1.5rem;
    background: #C4A96A;
    color: #1C1400;
    border: none;
    border-radius: 8px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: background-color 0.15s ease-out, box-shadow 0.15s ease-out, transform 0.15s ease-out;
    box-shadow: 0 2px 12px rgba(196,169,106,0.25);
  }

  .of-next-btn:hover { background: #A88B4A; box-shadow: 0 4px 20px rgba(196,169,106,0.35); transform: translateY(-1px); }

  .of-back-btn {
    padding: 0.875rem 1rem;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 8px;
    color: rgba(237,242,236,0.45);
    font-size: 0.875rem;
    cursor: pointer;
    transition: border-color 0.15s ease-out, color 0.15s ease-out;
  }

  .of-back-btn:hover { border-color: rgba(196,169,106,0.35); color: rgba(237,242,236,0.80); }
`

export default OfferteFormulier
