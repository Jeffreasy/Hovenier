import { useState } from 'react'
import { apiRequest } from '../lib/api'
import { setAuth } from '../lib/auth'

type ViewState = 'login' | 'forgot'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [view, setView] = useState<ViewState>('login')

  const clearState = () => { setError(null); setSuccess(null) }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    clearState()

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      const rawUser = data.User || data.user
      if (!rawUser) throw new Error('Ongeldige server reactie.')

      const user = {
        id: rawUser.ID || rawUser.id,
        email: rawUser.Email || rawUser.email,
        role: (rawUser.Role || rawUser.role || 'user').toLowerCase(),
        name: rawUser.Name || rawUser.name || rawUser.FullName || rawUser.full_name,
      }

      setAuth(user)
      window.location.href = '/portal'
    } catch (err: any) {
      setError(err.message || 'Ongeldige inloggegevens.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    clearState()

    try {
      await apiRequest('/auth/password/forgot', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      setSuccess('Check je email voor de reset-link.')
      setTimeout(() => setView('login'), 3000)
    } catch (err: any) {
      setError(err.message || 'Kon geen reset-link versturen.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (view === 'forgot') {
    return (
      <div className="auth-card">
        <h2 className="auth-title">Herstel wachtwoord</h2>
        <p className="auth-subtitle">Vul je email in voor een reset-link</p>

        {error && <div className="auth-alert auth-alert--error">{error}</div>}
        {success && <div className="auth-alert auth-alert--success">{success}</div>}

        <form onSubmit={handleForgotSubmit} className="auth-form">
          <div className="form-field">
            <label htmlFor="reset-email">E-mailadres</label>
            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="naam@bedrijf.nl"
              required
            />
          </div>

          <button type="submit" className="auth-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Bezig...' : 'Verstuur Reset Link'}
          </button>
        </form>

        <button
          type="button"
          className="auth-link"
          onClick={() => { setView('login'); clearState() }}
        >
          ← Terug naar inloggen
        </button>
      </div>
    )
  }

  return (
    <div className="auth-card">
      <h2 className="auth-title">Welkom terug</h2>
      <p className="auth-subtitle">Log in om je leads te beheren</p>

      {error && <div className="auth-alert auth-alert--error">{error}</div>}
      {success && <div className="auth-alert auth-alert--success">{success}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-field">
          <label htmlFor="login-email">E-mailadres</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="naam@bedrijf.nl"
            required
          />
        </div>

        <div className="form-field">
          <div className="form-field-header">
            <label htmlFor="login-password">Wachtwoord</label>
            <button
              type="button"
              className="forgot-link"
              onClick={() => { setView('forgot'); clearState() }}
            >
              Vergeten?
            </button>
          </div>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" className="auth-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Bezig...' : 'Inloggen'}
        </button>
      </form>
    </div>
  )
}
