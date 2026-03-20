/**
 * Utility functions for the Hovenier Platform
 */

// ─── String helpers ───────────────────────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// ─── Number / currency ────────────────────────────────────────────────────────

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatRange(min: number, max: number): string {
  return `${formatCurrency(min)} – ${formatCurrency(max)}`
}

// ─── Reading time ─────────────────────────────────────────────────────────────

export function getReadingTime(text: string): number {
  const wordsPerMinute = 220
  const words = text.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

// ─── Postcode helpers ─────────────────────────────────────────────────────────

export function isValidPostcode(postcode: string): boolean {
  return /^[1-9][0-9]{3}\s?[A-Za-z]{2}$/.test(postcode.trim())
}

export function normalizePostcode(postcode: string): string {
  return postcode.trim().toUpperCase().replace(/\s+/, ' ')
}

/** Get the numeric prefix of a postcode (first 4 digits) */
export function getPostcodePrefix(postcode: string): string {
  return postcode.trim().replace(/\s+/, '').slice(0, 4)
}

// ─── SEO helpers ──────────────────────────────────────────────────────────────

export function buildTitle(pageTitle: string, siteName = 'Tuinplatform'): string {
  return `${pageTitle} | ${siteName}`
}

export function buildCanonical(path: string, base = 'https://www.tuinplatform.nl'): string {
  return `${base}${path.startsWith('/') ? path : '/' + path}`
}

// ─── Class names (utility for conditional classes) ────────────────────────────

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
