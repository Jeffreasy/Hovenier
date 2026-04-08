import { useState, useEffect } from 'react'
import { apiRequest } from '../lib/api'

type ViewState = 'loading' | 'input' | 'success' | 'error'

export default function ResetPasswordForm() {
  const [token, setToken] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<ViewState>('loading')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlToken = params.get('token')

    if (!urlToken) {
      setError('Geen geldige reset-token gevonden. Controleer de link in je email.')
      setStatus('error')
      return
    }

    setToken(urlToken)
    setStatus('input')
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Wachtwoorden komen niet overeen.')
      return
    }

    if (password.length < 8) {
      setError('Wachtwoord moet minimaal 8 tekens zijn.')
      return
    }

    setIsSubmitting(true)

    try {
      await apiRequest('/auth/password/reset', {
        method: 'POST',
        body: JSON.stringify({
          token,
          password,
        }),
      })

      setStatus('success')
    } catch (err: any) {
      setError(err.message || 'Reset mislukt. Is de link verlopen?')
      setStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="auth-card">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem', color: '#94a3b8' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="auth-card">
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'rgba(16,185,129,0.1)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 className="auth-title" style={{ marginBottom: '0.5rem' }}>Wachtwoord aangepast!</h2>
          <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>
            Je kunt nu inloggen met je nieuwe wachtwoord.
          </p>
          <a
            href="/inloggen"
            style={{
              display: 'block', width: '100%', padding: '0.875rem',
              background: '#008d51', color: '#ffffff', borderRadius: '10px',
              textDecoration: 'none', fontWeight: 700, textAlign: 'center',
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.9375rem',
            }}
          >
            Ga naar inloggen
          </a>
        </div>
      </div>
    )
  }

  if (status === 'error' && !token) {
    return (
      <div className="auth-card">
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'rgba(220,38,38,0.08)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="auth-title" style={{ marginBottom: '0.5rem' }}>Ongeldige link</h2>
          <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>{error}</p>
          <a
            href="/inloggen"
            style={{
              display: 'block', width: '100%', padding: '0.875rem',
              background: '#008d51', color: '#ffffff', borderRadius: '10px',
              textDecoration: 'none', fontWeight: 700, textAlign: 'center',
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.9375rem',
            }}
          >
            Terug naar inloggen
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-card">
      <h2 className="auth-title">Nieuw wachtwoord kiezen</h2>
      <p className="auth-subtitle">Kies een veilig wachtwoord voor je account</p>

      {error && <div className="auth-alert auth-alert--error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-field">
          <label htmlFor="new-password">Nieuw wachtwoord</label>
          <input
            id="new-password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Min. 8 tekens"
            required
            minLength={8}
          />
        </div>

        <div className="form-field">
          <label htmlFor="confirm-password">Bevestig wachtwoord</label>
          <input
            id="confirm-password"
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Herhaal wachtwoord"
            required
          />
        </div>

        <button type="submit" className="auth-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Bezig...' : 'Wachtwoord opslaan'}
        </button>
      </form>
    </div>
  )
}
