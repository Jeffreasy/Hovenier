import { defineMiddleware } from 'astro:middleware'

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, cookies, redirect, locals } = context
  const url = new URL(request.url)

  // Skip middleware for static assets, API endpoints, prerendered pages
  if (
    url.pathname.startsWith('/_astro') ||
    url.pathname.startsWith('/_vercel') ||
    url.pathname.startsWith('/_isr') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.includes('.') ||
    context.isPrerendered
  ) {
    return next()
  }

  // Extract auth token from HttpOnly cookie
  const token = cookies.get('access_token')?.value
  let user = null

  // Zero-Trust token validation via LaventeCare backend
  if (token) {
    try {
      const API_URL = import.meta.env.PUBLIC_API_URL || 'https://laventecareauthsystems.onrender.com/api/v1'
      const TENANT_ID = import.meta.env.PUBLIC_TENANT_ID || '05cbd9a2-2ef6-4314-9e02-7b718a630bf9'

      const verifyReq = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `access_token=${token}`,
          'X-Tenant-ID': TENANT_ID,
        },
      })

      if (verifyReq.ok) {
        user = await verifyReq.json()
        if (user.data) user = user.data
        if (user.user) user = user.user
        if (user?.role) user.role = user.role.toLowerCase()
        // Normalize: backend returns full_name, frontend type expects name
        if (user?.full_name && !user.name) user.name = user.full_name
      }
    } catch (error) {
      console.error('[Auth] Validation error:', error)
    }
  }

  locals.token = token || null
  locals.user = user || null

  // Guard protected routes: /portal/*
  if (url.pathname.startsWith('/portal')) {
    if (!locals.user) {
      return redirect('/inloggen')
    }
  }

  return next()
})
