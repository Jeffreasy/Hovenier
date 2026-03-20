import { useState, type FC } from 'react'
import type { ServiceType } from '../lib/types'

/**
 * Zoekbalk — Homepage search bar island
 * Handles postcode + service selection and redirects to offerte flow.
 *
 * Renders server-side HTML for SEO, hydrates client-side for interaction.
 */

const SERVICE_OPTIONS: { value: ServiceType; label: string; emoji: string }[] = [
  { value: 'tuinaanleg',  label: 'Tuinaanleg',         emoji: '🏡' },
  { value: 'onderhoud',   label: 'Onderhoud',           emoji: '✂️' },
  { value: 'bestrating',  label: 'Bestrating / terras', emoji: '⬜' },
  { value: 'beplanting',  label: 'Beplanting',          emoji: '🌿' },
  { value: 'schutting',   label: 'Schutting',           emoji: '🪵' },
  { value: 'overig',      label: 'Iets anders',         emoji: '💬' },
]

const Zoekbalk: FC = () => {
  const [postcode, setPostcode] = useState('')
  const [dienst, setDienst]     = useState<ServiceType | ''>('')
  const [error, setError]       = useState('')

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()

    if (!/^\d{4}\s?[A-Za-z]{2}$/.test(postcode.trim())) {
      setError('Vul een geldige postcode in (bijv. 1234 AB)')
      return
    }
    if (!dienst) {
      setError('Kies een dienst')
      return
    }

    const params = new URLSearchParams({ postcode: postcode.trim(), dienst })
    window.location.href = `/offerte?${params.toString()}`
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="zoekbalk-form" aria-label="Hovenier zoeken">
      <div className="zoekbalk-fields">
        {/* Postcode */}
        <div className="zoekbalk-field">
          <label htmlFor="zb-postcode" className="zoekbalk-label">
            Jouw postcode
          </label>
          <input
            id="zb-postcode"
            type="text"
            inputMode="text"
            placeholder="1234 AB"
            maxLength={7}
            autoComplete="postal-code"
            value={postcode}
            onChange={(e) => { setPostcode(e.target.value); setError('') }}
            className="zoekbalk-input"
            aria-required="true"
            aria-describedby={error ? 'zb-error' : undefined}
          />
        </div>

        {/* Dienst */}
        <div className="zoekbalk-field">
          <label htmlFor="zb-dienst" className="zoekbalk-label">
            Wat wil je laten doen?
          </label>
          <select
            id="zb-dienst"
            value={dienst}
            onChange={(e) => { setDienst(e.target.value as ServiceType); setError('') }}
            className="zoekbalk-select"
            aria-required="true"
          >
            <option value="" disabled>Kies een dienst</option>
            {SERVICE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.emoji} {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* CTA */}
        <button type="submit" className="zoekbalk-btn">
          Vergelijk hoveniers
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      {error && (
        <p id="zb-error" role="alert" className="zoekbalk-error">
          ⚠ {error}
        </p>
      )}

      <p className="zoekbalk-note">🔒 Gratis en vrijblijvend — geen spam</p>

      <style>{`
        .zoekbalk-form { font-family: 'Inter', sans-serif; color: #EDF2EC; }

        .zoekbalk-fields {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .zoekbalk-field {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .zoekbalk-label {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.8rem;
          font-weight: 600;
          color: rgba(237,242,236,0.55);
          letter-spacing: 0.03em;
        }

        .zoekbalk-input,
        .zoekbalk-select {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          font-size: 1rem;
          font-family: 'Inter', sans-serif;
          background: rgba(255,255,255,0.06);
          color: #EDF2EC;
          transition: border-color 0.15s, background 0.15s;
          appearance: none;
        }

        .zoekbalk-input::placeholder { color: rgba(237,242,236,0.30); }

        .zoekbalk-select option {
          background: #142619;
          color: #EDF2EC;
        }

        .zoekbalk-input:focus,
        .zoekbalk-select:focus {
          outline: none;
          border-color: rgba(196,169,106,0.45);
          background: rgba(255,255,255,0.10);
        }

        .zoekbalk-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.875rem 1.5rem;
          background: #C4A96A;
          color: #1C1400;
          border: none;
          border-radius: 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
          margin-top: 0.25rem;
          box-shadow: 0 4px 16px rgba(196,169,106,0.30);
        }

        .zoekbalk-btn:hover {
          background: #A88B4A;
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(196,169,106,0.45);
        }

        .zoekbalk-error {
          font-size: 0.8rem;
          color: #F87171;
          margin: 0.5rem 0 0;
        }

        .zoekbalk-note {
          font-size: 0.78rem;
          color: rgba(237,242,236,0.35);
          text-align: center;
          margin: 0.75rem 0 0;
        }
      `}</style>
    </form>
  )
}

export default Zoekbalk
