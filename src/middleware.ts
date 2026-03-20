import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server'

// Routes that require authentication
const isPortalRoute = createRouteMatcher(['/portal(.*)', '/portal'])

// Routes that should bypass Clerk entirely (ISR, static assets, API internals)
const isPublicAsset = createRouteMatcher([
  '/_isr(.*)',
  '/_astro(.*)',
  '/fonts(.*)',
  '/favicon(.*)',
])

export const onRequest = clerkMiddleware((auth, context) => {
  // Skip Clerk for internal Astro/Vercel paths — prevents ISR redirect loop
  if (isPublicAsset(context.request)) return

  const { redirectToSignIn, userId } = auth()

  // Protect all /portal/* routes
  if (isPortalRoute(context.request) && !userId) {
    return redirectToSignIn()
  }
})
