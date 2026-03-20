import { useState, type FC } from 'react'
import type { ServiceType, BudgetRange, StartTiming, OfferteData } from '../lib/types'
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
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

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
      if (!form.naam?.trim())  e.naam = 'Vul je naam in'
      if (!form.email?.includes('@')) e.email = 'Vul een geldig e-mailadres in'
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

  function handleSubmit() {
    setSubmitted(true)
    // TODO: POST to API
  }

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100

  if (submitted) {
    return (
      <div className="of-success">
        <div className="success-icon" aria-hidden="true">✅</div>
        <h2>Aanvraag ontvangen!</h2>
        <p>
          Bedankt voor je aanvraag. Je ontvangt binnen <strong>48 uur</strong> maximaal
          3 offertes van hoveniers bij jou in de buurt.
        </p>
        <p>We sturen een bevestiging naar <strong>{form.email}</strong></p>
        <a href="/" className="of-home-btn">← Terug naar home</a>
        <style>{successStyles}</style>
      </div>
    )
  }

  return (
    <div className="of-wrapper">
      {/* Progress bar */}
      <div className="of-progress">
        <div className="of-progress-bar" style={{ width: `${progress}%` }} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} />
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
              { id: 'naam',     label: 'Naam',         type: 'text',  placeholder: 'Jan de Vries',      value: form.naam },
              { id: 'email',    label: 'E-mailadres',  type: 'email', placeholder: 'jan@voorbeeld.nl',  value: form.email },
              { id: 'telefoon', label: 'Telefoonnummer', type: 'tel', placeholder: '06 12 34 56 78',    value: form.telefoon },
              { id: 'postcode', label: 'Postcode',     type: 'text',  placeholder: '1234 AB',           value: form.postcode },
            ].map(({ id, label, type, placeholder, value }) => (
              <div key={id} className="of-field">
                <label htmlFor={id} className="of-label">{label}</label>
                <input
                  id={id}
                  type={type}
                  placeholder={placeholder}
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
          <button type="button" className="of-back-btn" onClick={() => setStep((s) => s - 1)}>
            ← Terug
          </button>
        )}
        <button type="button" className="of-next-btn" onClick={next}>
          {step < TOTAL_STEPS ? 'Volgende →' : 'Verstuur aanvraag ✓'}
        </button>
      </div>

      <style>{formStyles}</style>
    </div>
  )
}

const formStyles = `
  .of-wrapper { font-family: 'Inter', sans-serif; display: flex; flex-direction: column; gap: 1.5rem; }

  .of-progress {
    height: 4px;
    background: #E5E5E5;
    border-radius: 99px;
    overflow: hidden;
  }

  .of-progress-bar {
    height: 100%;
    background: #5B7553;
    border-radius: 99px;
    transition: width 0.3s ease;
  }

  .of-step-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
    color: #6B7280;
  }

  .of-step-label { font-weight: 600; color: #5B7553; }

  .of-step { display: flex; flex-direction: column; gap: 1rem; }

  .of-title { margin: 0; font-size: 1.25rem; font-family: 'Plus Jakarta Sans', sans-serif; }
  .of-hint { margin: 0; font-size: 0.875rem; color: #6B7280; }

  .of-options-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.625rem;
  }

  .of-option-btn {
    padding: 0.875rem;
    border: 2px solid #E5E5E5;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    color: #2D2D2D;
    transition: all 0.15s;
    text-align: center;
  }

  .of-option-btn:hover { border-color: #5B7553; background: #E8F0E4; }
  .of-option-btn--selected { border-color: #5B7553; background: #E8F0E4; color: #3D5438; }

  .of-input-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .of-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #E5E5E5;
    border-radius: 8px;
    font-size: 1rem;
    font-family: 'Inter', sans-serif;
    background: #F5F3EF;
    transition: border-color 0.15s;
  }

  .of-input--lg { font-size: 1.5rem; padding: 1rem 1.25rem; }
  .of-input:focus { outline: none; border-color: #5B7553; background: white; }
  .of-input--error { border-color: #EF4444; }

  .of-input-suffix {
    font-size: 1.25rem;
    font-weight: 700;
    color: #5B7553;
    flex-shrink: 0;
  }

  .of-budget-list { display: flex; flex-direction: column; gap: 0.5rem; }

  .of-budget-btn {
    padding: 0.875rem 1.25rem;
    border: 2px solid #E5E5E5;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    font-size: 0.9375rem;
    font-weight: 600;
    color: #2D2D2D;
    text-align: left;
    transition: all 0.15s;
  }

  .of-budget-btn:hover { border-color: #5B7553; background: #E8F0E4; }
  .of-budget-btn--selected { border-color: #5B7553; background: #E8F0E4; color: #3D5438; }

  .of-fields { display: flex; flex-direction: column; gap: 1rem; }
  .of-field  { display: flex; flex-direction: column; gap: 0.375rem; }

  .of-label {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 600;
    color: #4A4A4A;
  }

  .of-error {
    font-size: 0.8rem;
    color: #EF4444;
    margin: 0;
  }

  .of-privacy {
    font-size: 0.75rem;
    color: #9CA3AF;
    margin: 0;
  }

  .of-nav {
    display: flex;
    gap: 0.75rem;
    padding-top: 0.5rem;
    border-top: 1px solid #E5E5E5;
  }

  .of-next-btn {
    flex: 1;
    padding: 0.875rem 1.5rem;
    background: #C4A96A;
    color: #2D2D2D;
    border: none;
    border-radius: 8px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
  }

  .of-next-btn:hover { background: #A88B4A; }

  .of-back-btn {
    padding: 0.875rem 1rem;
    background: transparent;
    border: 2px solid #E5E5E5;
    border-radius: 8px;
    color: #6B7280;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .of-back-btn:hover { border-color: #5B7553; color: #5B7553; }
`

const successStyles = `
  .of-success {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem 0;
    font-family: 'Inter', sans-serif;
  }

  .success-icon { font-size: 3.5rem; }
  .of-success h2 { margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
  .of-success p { margin: 0; color: #4A4A4A; max-width: 420px; }

  .of-home-btn {
    display: inline-flex;
    padding: 0.75rem 1.5rem;
    background: #E8F0E4;
    color: #3D5438;
    border-radius: 8px;
    font-weight: 600;
    text-decoration: none;
    margin-top: 0.5rem;
    transition: all 0.15s;
  }

  .of-home-btn:hover { background: #d4e4ce; }
`

export default OfferteFormulier
