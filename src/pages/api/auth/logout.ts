import type { APIRoute } from 'astro'

export const prerender = false

const API_URL = import.meta.env.PUBLIC_API_URL || 'https://laventecareauthsystems.onrender.com/api/v1'

/**
 * Dedicated POST /api/auth/logout handler.
 * Takes precedence over [...path].ts catch-all.
 * Always returns 200 — even if Go backend invalidation fails.
 */
export const POST: APIRoute = async ({ cookies }) => {
  const token = cookies.get('access_token')?.value

  // Fire-and-forget backend revocation
  if (token) {
    fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': import.meta.env.PUBLIC_TENANT_ID || '05cbd9a2-2ef6-4314-9e02-7b718a630bf9',
      },
    }).catch(() => { /* non-blocking */ })
  }

  cookies.delete('access_token', { path: '/' })

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const OPTIONS: APIRoute = () => new Response(null, { status: 204 })
