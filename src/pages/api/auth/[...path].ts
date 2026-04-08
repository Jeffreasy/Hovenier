import type { APIRoute } from 'astro'

export const prerender = false

const API_URL = import.meta.env.PUBLIC_API_URL || 'https://laventecareauthsystems.onrender.com/api/v1'
const TENANT_ID = import.meta.env.PUBLIC_TENANT_ID || '05cbd9a2-2ef6-4314-9e02-7b718a630bf9'

export const ALL: APIRoute = async ({ request, params, cookies }) => {
  const path = params.path

  const targetUrl = `${API_URL}/auth/${path}`

  // ── LOGIN INTERCEPT ─────────────────────────────────────────────────────────
  if (path === 'login' && request.method === 'POST') {
    try {
      const body = await request.json()

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': TENANT_ID,
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorText = await response.text()
        return new Response(errorText, {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const data = await response.json()

      const responseHeaders = new Headers()
      responseHeaders.set('Content-Type', 'application/json')

      // Forward and sanitize Set-Cookie headers from backend
      let cookiesToSet: string[] = []
      if (typeof response.headers.getSetCookie === 'function') {
        cookiesToSet = response.headers.getSetCookie()
      } else {
        const sc = response.headers.get('set-cookie')
        if (sc) cookiesToSet = [sc]
      }

      cookiesToSet.forEach(cookie => {
        let adjusted = cookie
        adjusted = adjusted.replace(/SameSite=[a-zA-Z]+/gi, 'SameSite=Lax')
        adjusted = adjusted.replace(/; Partitioned/gi, '')
        adjusted = adjusted.replace(/;\s*Domain=[^;]*/gi, '')
        adjusted = adjusted.replace(/;\s*Path=[^;]*/gi, '')
        adjusted += '; Path=/'
        if (!import.meta.env.PROD) {
          adjusted = adjusted.replace(/; Secure/gi, '')
        }
        responseHeaders.append('Set-Cookie', adjusted)
      })

      // Strip sensitive fields from response body
      const { access_token, token: _, ...restData } = data
      if (restData.user || restData.User) {
        const u = restData.user || restData.User
        delete u.PasswordHash
        delete u.MfaSecret
      }

      return new Response(JSON.stringify(restData), {
        status: 200,
        headers: responseHeaders,
      })
    } catch (error) {
      console.error('Login Proxy Error:', error)
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
    }
  }

  // ── TOKEN RETRIEVAL (for Convex client-side calls) ──────────────────────────
  if (path === 'token' && request.method === 'GET') {
    const token = cookies.get('access_token')?.value
    if (token) {
      return new Response(JSON.stringify({ token }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return new Response(JSON.stringify({ error: 'No session' }), { status: 401 })
  }

  // ── LOGOUT INTERCEPT ────────────────────────────────────────────────────────
  if (path === 'logout') {
    const token = cookies.get('access_token')?.value
    if (token) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Tenant-ID': TENANT_ID,
          },
        })
      } catch {
        // Non-blocking: backend revocation failure should not block client logout
      }
    }
    cookies.delete('access_token', { path: '/' })
    return new Response(JSON.stringify({ success: true }), { status: 200 })
  }

  // ── GENERIC PROXY (register, password/forgot, refresh, etc.) ────────────────
  try {
    const token = cookies.get('access_token')?.value
    const headers = new Headers()
    headers.set('Content-Type', 'application/json')
    headers.set('X-Tenant-ID', TENANT_ID)

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    // Read body as text for reliability (avoid stream issues)
    let bodyText: string | undefined
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      bodyText = await request.clone().text()
    }

    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: bodyText || undefined,
    })

    const newHeaders = new Headers()
    newHeaders.set('Content-Type', response.headers.get('Content-Type') || 'application/json')

    // Forward and sanitize Set-Cookie headers
    let proxyCookies: string[] = []
    if (typeof response.headers.getSetCookie === 'function') {
      proxyCookies = response.headers.getSetCookie()
    } else {
      const sc = response.headers.get('set-cookie')
      if (sc) proxyCookies = [sc]
    }

    proxyCookies.forEach(cookie => {
      let adjusted = cookie.replace(/SameSite=[a-zA-Z]+/gi, 'SameSite=Lax')
      adjusted = adjusted.replace(/; Partitioned/gi, '')
      adjusted = adjusted.replace(/;\s*Domain=[^;]*/gi, '')
      adjusted = adjusted.replace(/;\s*Path=[^;]*/gi, '')
      adjusted += '; Path=/'
      if (!import.meta.env.PROD) {
        adjusted = adjusted.replace(/; Secure/gi, '')
      }
      newHeaders.append('Set-Cookie', adjusted)
    })

    const responseText = await response.text()
    return new Response(responseText, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    })
  } catch (error) {
    console.error('Auth Proxy Error:', error)
    return new Response(JSON.stringify({ error: 'Proxy Failed' }), { status: 500 })
  }
}
