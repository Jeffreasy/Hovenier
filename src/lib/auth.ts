/**
 * Auth State — In-memory state for client-side React islands.
 * Token lives in HttpOnly cookie (not accessible to JS).
 * User state is hydrated from server via Astro locals.
 */
import { atom } from 'nanostores'

export type User = {
  id: string
  email: string
  name?: string
  full_name?: string
  role: 'admin' | 'editor' | 'user' | 'viewer'
}

export const $user = atom<User | null>(null)

export function setAuth(user: User | null) {
  $user.set(user)
}

export function logout() {
  fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    .finally(() => {
      $user.set(null)
      window.location.href = '/inloggen?uitgelogd=true'
    })
}
