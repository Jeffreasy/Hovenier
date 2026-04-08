/**
 * API Client — Routes all requests through BFF proxy to avoid CORS.
 * Includes 401 auto-refresh interceptor (Silent Token Renewal).
 */

const API_URL = '/api'
const TENANT_ID = '05cbd9a2-2ef6-4314-9e02-7b718a630bf9'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {})
  headers.set('Content-Type', 'application/json')
  headers.set('X-Tenant-ID', TENANT_ID)

  let res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  // 401 Interceptor: Token likely expired — attempt silent refresh
  // Exception: Don't refresh during login (401 = wrong credentials)
  if (res.status === 401 && !endpoint.includes('/auth/login')) {
    try {
      const refreshRes = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'X-Tenant-ID': TENANT_ID },
        credentials: 'include',
      })

      if (refreshRes.ok) {
        res = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
          credentials: 'include',
        })
      } else {
        throw new ApiError('Session expired', 401)
      }
    } catch (e) {
      if (!(e instanceof ApiError)) {
        window.location.href = '/inloggen?expired=true'
      }
      throw e
    }
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Er is een fout opgetreden.' }))
    throw new ApiError(errorData.error || `Request failed (${res.status})`, res.status)
  }

  const text = await res.text()
  return text ? JSON.parse(text) : {}
}
