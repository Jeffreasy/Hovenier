import { useState, type FC } from 'react'
import type { ServiceType } from '../lib/types'
import { isValidPostcode } from '../lib/utils'

const SERVICE_OPTIONS: { value: ServiceType; label: string }[] = [
  { value: 'tuinaanleg',  label: 'Tuinaanleg' },
  { value: 'onderhoud',   label: 'Onderhoud' },
  { value: 'bestrating',  label: 'Bestrating / terras' },
  { value: 'beplanting',  label: 'Beplanting' },
  { value: 'schutting',   label: 'Schutting' },
  { value: 'overig',      label: 'Iets anders' },
]

const Zoekbalk: FC = () => {
  const [postcode, setPostcode] = useState('')
  const [dienst, setDienst]     = useState<ServiceType | ''>('')
  const [error, setError]       = useState('')

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()

    if (!isValidPostcode(postcode.trim())) {
      setError('Vul een geldige postcode in (bijv. 1234 AB)')
      return
    }
    if (!dienst) {
      setError('Kies een dienst')
      return
    }

    const params = new URLSearchParams({ postcode: postcode.trim(), dienst })
    window.location.href = `/zoeken?${params.toString()}`
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="font-body text-charcoal" aria-label="Hovenier zoeken">
      <div className="flex flex-col gap-4">
        {/* Postcode */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="zb-postcode" className="font-heading text-[0.8rem] font-semibold text-charcoal-light tracking-wide">
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
            className="w-full px-4 py-3 border border-border rounded-md text-base bg-white text-charcoal placeholder:text-[#94a3b8] transition-colors duration-150 focus:outline-none focus:border-primary-500 focus:ring-3 focus:ring-primary-100"
            aria-required="true"
            aria-describedby={error ? 'zb-error' : undefined}
          />
        </div>

        {/* Dienst */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="zb-dienst" className="font-heading text-[0.8rem] font-semibold text-charcoal-light tracking-wide">
            Wat wil je laten doen?
          </label>
          <select
            id="zb-dienst"
            value={dienst}
            onChange={(e) => { setDienst(e.target.value as ServiceType); setError('') }}
            className="w-full px-4 py-3 border border-border rounded-md text-base bg-white text-charcoal appearance-none bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2212%22%20height%3D%228%22%20viewBox%3D%220%200%2012%208%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M1%201.5L6%206.5L11%201.5%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1rem_center] pr-10 transition-colors duration-150 focus:outline-none focus:border-primary-500 focus:ring-3 focus:ring-primary-100"
            aria-required="true"
          >
            <option value="" disabled>Kies een dienst</option>
            {SERVICE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* CTA */}
        <button
          type="submit"
          className="btn-primary w-full mt-1"
          style={{ padding: '0.875rem 1.5rem', fontSize: '1rem' }}
        >
          Vergelijk hoveniers
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      {error && (
        <p id="zb-error" role="alert" className="text-error text-sm mt-2">
          {error}
        </p>
      )}

      <p className="text-charcoal-muted text-[0.78rem] text-center mt-3 flex items-center justify-center gap-1">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        Gratis en vrijblijvend, geen spam
      </p>
    </form>
  )
}

export default Zoekbalk
