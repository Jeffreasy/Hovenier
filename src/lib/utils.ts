/**
 * Utility functions for the Hovenier Platform
 */

import type { FAQItem } from './types'

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

export function buildTitle(pageTitle: string, siteName = 'TuinHub'): string {
  return `${pageTitle} | ${siteName}`
}

export function buildCanonical(path: string, base = 'https://www.tuinhub.nl'): string {
  return `${base}${path.startsWith('/') ? path : '/' + path}`
}

// ─── Class names (utility for conditional classes) ────────────────────────────

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

// ─── FAQ parser (extract `## Veelgestelde vragen` from markdown body) ─────────

/**
 * Extracts FAQ items from a markdown body. Looks for a `## Veelgestelde vragen`
 * H2-section, and parses each `### question` block beneath it. The answer is
 * everything from the question up to the next `### `, the next H2, or end of
 * document. Used by ArticleLayout to render `FAQPage` JSON-LD on blog posts.
 */
export function parseFAQs(markdown: string): FAQItem[] {
  if (!markdown) return []

  const lines = markdown.split('\n')
  const faqs: FAQItem[] = []
  let inFAQSection = false
  let currentQuestion: string | null = null
  let currentAnswerLines: string[] = []

  const flush = () => {
    if (currentQuestion && currentAnswerLines.length > 0) {
      const answer = currentAnswerLines.join(' ').replace(/\s+/g, ' ').trim()
      if (answer) {
        faqs.push({ question: currentQuestion, answer, category: 'blog' })
      }
    }
    currentQuestion = null
    currentAnswerLines = []
  }

  for (const line of lines) {
    // Section start
    if (/^##\s+Veelgestelde\s+vragen/i.test(line)) {
      inFAQSection = true
      continue
    }

    if (!inFAQSection) continue

    // End of FAQ section: any other H2
    if (/^##\s+/.test(line) && !/^##\s+Veelgestelde\s+vragen/i.test(line)) {
      flush()
      inFAQSection = false
      continue
    }

    // New FAQ question: `### Question` (H3) or `**Question?**` (bold paragraph)
    if (/^###\s+/.test(line)) {
      flush()
      currentQuestion = line.replace(/^###\s+/, '').trim()
      continue
    }
    const boldQ = line.match(/^\*\*(.+?\?)\*\*\s*$/)
    if (boldQ) {
      flush()
      currentQuestion = boldQ[1].trim()
      continue
    }

    // Answer body (non-empty lines accumulate)
    if (currentQuestion && line.trim()) {
      currentAnswerLines.push(line.trim())
    }
  }

  // Flush final FAQ if file ends inside the section
  flush()

  return faqs
}

// ─── HowTo parser (extract step-by-step instructions from markdown body) ────

export interface ParsedHowTo {
  sectionTitle: string
  steps: { name: string; text: string }[]
}

export function parseHowToSteps(markdown: string): ParsedHowTo | null {
  if (!markdown) return null

  const lines = markdown.split('\n')

  // Pattern 1: `## Stap N: Title` as H2 headers
  const h2Steps: { name: string; textLines: string[] }[] = []
  let activeH2Step: { name: string; textLines: string[] } | null = null

  for (const line of lines) {
    const h2Match = line.match(/^##\s+Stap\s+\d+[:.]\s*(.+)/i)
    if (h2Match) {
      if (activeH2Step) h2Steps.push(activeH2Step)
      activeH2Step = { name: h2Match[1].trim(), textLines: [] }
      continue
    }
    if (activeH2Step) {
      if (/^##\s+/.test(line) && !/^##\s+Stap\s+\d+/i.test(line)) {
        h2Steps.push(activeH2Step)
        activeH2Step = null
        continue
      }
      if (line.trim()) activeH2Step.textLines.push(line.trim())
    }
  }
  if (activeH2Step) h2Steps.push(activeH2Step)

  if (h2Steps.length >= 2) {
    return {
      sectionTitle: 'Stappenplan',
      steps: h2Steps.map((s) => ({
        name: s.name,
        text: s.textLines.join(' ').replace(/\s+/g, ' ').trim(),
      })),
    }
  }

  // Pattern 2: `## Stappenplan: ...` H2 with numbered steps inline
  // Handles: `**Stap N: Title.** text`, `**N. Title.** text`, `N. **Title.** text`
  let inSection = false
  let sectionTitle = ''
  const inlineSteps: { name: string; text: string }[] = []

  for (const line of lines) {
    const sectionMatch = line.match(/^##\s+(Stappenplan[:\s].+)/i)
    if (sectionMatch) {
      inSection = true
      sectionTitle = sectionMatch[1].replace(/^Stappenplan[:\s]+/i, '').trim()
      continue
    }
    if (inSection && /^##\s+/.test(line) && !/^##\s+Stappenplan/i.test(line)) {
      break
    }
    if (!inSection) continue

    // `**Stap N: Title.** text` or `**N. Title.** text`
    const boldFirst = line.match(/^\*\*(?:Stap\s+)?\d+[.:]\s*(.+?)\.\*\*\s*(.*)/i)
    if (boldFirst) {
      inlineSteps.push({
        name: boldFirst[1].trim(),
        text: boldFirst[2].trim(),
      })
      continue
    }

    // `N. **Title.** text` (numbered list with bold title)
    const listBold = line.match(/^\d+\.\s+\*\*(.+?)\.\*\*\s*(.*)/i)
    if (listBold) {
      inlineSteps.push({
        name: listBold[1].trim(),
        text: listBold[2].trim(),
      })
    }
  }

  if (inlineSteps.length >= 2) {
    return { sectionTitle: sectionTitle || 'Stappenplan', steps: inlineSteps }
  }

  return null
}
