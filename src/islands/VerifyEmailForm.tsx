import { useState, useEffect } from 'react'
import { apiRequest } from '../lib/api'

type ViewState = 'loading' | 'success' | 'error'

export default function VerifyEmailForm() {
  const [status, setStatus] = useState<ViewState>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (!token) {
      setError('Geen verificatie-token gevonden. Controleer de link in je email.')
      setStatus('error')
      return
    }

    // Auto-verify on page load
    verifyEmail(token)
  }, [])

  async function verifyEmail(token: string) {
    try {
      await apiRequest('/auth/email/verify', {
        method: 'POST',
        body: JSON.stringify({ token }),
      })
      setStatus('success')
    } catch (err: any) {
      setError(err.message || 'Verificatie mislukt. Is de link verlopen?')
      setStatus('error')
    }
  }

  if (status === 'loading') {
    return (
      <div className="auth-card" aria-label="Authenticatie status">
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#008d51" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <p style={{ color: '#475569', fontSize: '0.9375rem' }}>Email wordt geverifieerd...</p>
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
          <h2 className="auth-title" style={{ marginBottom: '0.5rem' }}>Email geverifieerd!</h2>
          <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>
            Je email is succesvol bevestigd. Je kunt nu inloggen.
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
        <h2 className="auth-title" style={{ marginBottom: '0.5rem' }}>Verificatie mislukt</h2>
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
