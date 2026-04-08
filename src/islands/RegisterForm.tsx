import { useState } from 'react'
import { apiRequest } from '../lib/api'

export default function RegisterForm() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (form.password !== form.confirm) {
      setError('Wachtwoorden komen niet overeen.')
      return
    }

    if (form.password.length < 8) {
      setError('Wachtwoord moet minimaal 8 tekens zijn.')
      return
    }

    setIsSubmitting(true)

    try {
      await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          password: form.password,
        }),
      })

      window.location.href = '/inloggen?registered=true'
    } catch (err: any) {
      setError(err.message || 'Registreren mislukt.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-card">
      <h2 className="auth-title">Account aanmaken</h2>
      <p className="auth-subtitle">Registreer je hoveniersbedrijf</p>

      {error && <div className="auth-alert auth-alert--error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-field">
          <label htmlFor="reg-name">Volledige naam</label>
          <input
            id="reg-name"
            type="text"
            value={form.full_name}
            onChange={update('full_name')}
            placeholder="Jan Jansen"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="reg-email">E-mailadres</label>
          <input
            id="reg-email"
            type="email"
            value={form.email}
            onChange={update('email')}
            placeholder="naam@bedrijf.nl"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="reg-password">Wachtwoord</label>
          <input
            id="reg-password"
            type="password"
            value={form.password}
            onChange={update('password')}
            placeholder="Min. 8 tekens"
            required
            minLength={8}
          />
        </div>

        <div className="form-field">
          <label htmlFor="reg-confirm">Bevestig wachtwoord</label>
          <input
            id="reg-confirm"
            type="password"
            value={form.confirm}
            onChange={update('confirm')}
            placeholder="Herhaal wachtwoord"
            required
          />
        </div>

        <button type="submit" className="auth-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Bezig...' : 'Account aanmaken'}
        </button>
      </form>
    </div>
  )
}
