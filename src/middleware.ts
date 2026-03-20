import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server'

// Routes that require authentication
const isPortalRoute = createRouteMatcher(['/portal(.*)', '/portal'])

export const onRequest = clerkMiddleware((auth, context) => {
  const { redirectToSignIn, userId } = auth()

  // Protect all /portal/* routes
  if (isPortalRoute(context.request) && !userId) {
    return redirectToSignIn()
  }
})
