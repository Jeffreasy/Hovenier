/**
 * seo.ts — Centralized JSON-LD schema markup generators
 *
 * Usage: import { articleSchema, faqSchema, localBusinessSchema } from '../lib/seo'
 * Then pass the result to BaseLayout's `schema` prop.
 */

import { SITE } from './constants'
import type { FAQItem } from './types'

// ─── Article Schema ───────────────────────────────────────────────────────────

interface ArticleSchemaProps {
  title:       string
  description: string
  url:         string
  publishDate: Date
  updatedDate?: Date
  authorName?: string
  image?: string
}

export function articleSchema(props: ArticleSchemaProps): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type':    'Article',
    headline:   props.title,
    description: props.description,
    url:        props.url,
    datePublished: props.publishDate.toISOString(),
    dateModified:  (props.updatedDate ?? props.publishDate).toISOString(),
    author: {
      '@type': 'Organization',
      name:    props.authorName ?? SITE.name,
      url:     SITE.url,
    },
    publisher: {
      '@type': 'Organization',
      name:    SITE.name,
      url:     SITE.url,
    },
    ...(props.image ? { image: props.image } : {}),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id':   props.url,
    },
  })
}

// ─── FAQ Schema ───────────────────────────────────────────────────────────────

export function faqSchema(items: Pick<FAQItem, 'question' | 'answer'>[]): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type':    'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name:    item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text:    item.answer,
      },
    })),
  })
}

// ─── LocalBusiness Schema ────────────────────────────────────────────────────

interface LocalBusinessSchemaProps {
  stad:           string
  slug:           string
  description:    string
  aantalHoveniers?: number
  gemiddeldePrijs?: string
  /**
   * Real review aggregate. ONLY pass this when actual reviews exist in Convex
   * (counted from `bedrijven` reviews, not synthesised). Without this prop the
   * schema omits `aggregateRating` entirely — preferable to a fake rating.
   */
  reviewAggregate?: {
    ratingValue: number
    reviewCount: number
  }
}

export function localBusinessSchema(props: LocalBusinessSchemaProps): string {
  return JSON.stringify({
    '@context':   'https://schema.org',
    '@type':      'LocalBusiness',
    name:         `${SITE.name} — Hoveniers in ${props.stad}`,
    description:  props.description,
    url:          `${SITE.url}/steden/${props.slug}`,
    areaServed: {
      '@type':   'City',
      name:      props.stad,
    },
    ...(props.reviewAggregate ? {
      aggregateRating: {
        '@type':      'AggregateRating',
        ratingValue:  String(props.reviewAggregate.ratingValue),
        reviewCount:  String(props.reviewAggregate.reviewCount),
        bestRating:   '5',
        worstRating:  '1',
      },
    } : {}),
  })
}

// ─── HowTo Schema ─────────────────────────────────────────────────────────────

interface HowToStep {
  name:  string
  text:  string
  image?: string
}

interface HowToSchemaProps {
  name:        string
  description: string
  steps:       HowToStep[]
  totalTime?:  string   // ISO 8601 duration, e.g. "PT1H"
}

export function howToSchema(props: HowToSchemaProps): string {
  return JSON.stringify({
    '@context':   'https://schema.org',
    '@type':      'HowTo',
    name:         props.name,
    description:  props.description,
    ...(props.totalTime ? { totalTime: props.totalTime } : {}),
    step: props.steps.map((s, i) => ({
      '@type':   'HowToStep',
      position:  i + 1,
      name:      s.name,
      text:      s.text,
      ...(s.image ? { image: s.image } : {}),
    })),
  })
}

// ─── BreadcrumbList Schema ────────────────────────────────────────────────────

interface BreadcrumbItem {
  name: string
  href: string
}

export function breadcrumbSchema(items: BreadcrumbItem[]): string {
  return JSON.stringify({
    '@context':        'https://schema.org',
    '@type':           'BreadcrumbList',
    itemListElement:   items.map((item, i) => ({
      '@type':    'ListItem',
      position:   i + 1,
      name:       item.name,
      item:       `${SITE.url}${item.href}`,
    })),
  })
}

// ─── WebSite Schema (homepage) ────────────────────────────────────────────────

export function websiteSchema(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type':    'WebSite',
    '@id':      `${SITE.url}/#website`,
    name:       SITE.name,
    url:        SITE.url,
    description: SITE.tagline,
    inLanguage: 'nl-NL',
    publisher:  { '@id': `${SITE.url}/#organization` },
    potentialAction: {
      '@type':       'SearchAction',
      target:        `${SITE.url}/offerte?postcode={postcode}`,
      'query-input': 'required name=postcode',
    },
  })
}

// ─── Organization Schema (homepage / E-E-A-T baseline) ───────────────────────

interface OrganizationSchemaProps {
  /** Optional list of social/profile URLs (LinkedIn, Instagram, etc.). */
  sameAs?: string[]
}

export function organizationSchema(props: OrganizationSchemaProps = {}): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type':    'Organization',
    '@id':      `${SITE.url}/#organization`,
    name:       SITE.name,
    url:        SITE.url,
    logo:       `${SITE.url}/og-default.png`,
    description: SITE.description,
    email:      SITE.email,
    areaServed: { '@type': 'Country', name: 'Netherlands' },
    ...(props.sameAs && props.sameAs.length > 0 ? { sameAs: props.sameAs } : {}),
    contactPoint: {
      '@type':           'ContactPoint',
      email:             SITE.email,
      contactType:       'customer support',
      areaServed:        'NL',
      availableLanguage: ['Dutch', 'nl-NL'],
    },
  })
}

// ─── Service Schema (offerte / lead-gen) ─────────────────────────────────────

interface ServiceSchemaProps {
  name:        string
  description: string
  url:         string
  /** Free text price range, e.g. "€45 – €75 per uur" or "Gratis offerte". */
  priceRange?: string
  /** Schema.org service type slug, e.g. "GardeningService". */
  serviceType?: string
}

export function serviceSchema(props: ServiceSchemaProps): string {
  return JSON.stringify({
    '@context':   'https://schema.org',
    '@type':      'Service',
    name:         props.name,
    description:  props.description,
    url:          props.url,
    serviceType:  props.serviceType ?? 'GardeningService',
    provider:     { '@id': `${SITE.url}/#organization` },
    areaServed:   { '@type': 'Country', name: 'Netherlands' },
    ...(props.priceRange ? { priceRange: props.priceRange } : {}),
    audience: {
      '@type':         'Audience',
      audienceType:    'Tuineigenaren in Nederland',
      geographicArea:  { '@type': 'Country', name: 'Netherlands' },
    },
  })
}

// ─── WebApplication Schema (calculators) ─────────────────────────────────────

interface WebApplicationSchemaProps {
  name:        string
  description: string
  url:         string
  /** "FinanceApplication" voor kosten-tools, "UtilitiesApplication" voor checks. */
  applicationCategory?: string
}

export function webApplicationSchema(props: WebApplicationSchemaProps): string {
  return JSON.stringify({
    '@context':           'https://schema.org',
    '@type':              'WebApplication',
    name:                 props.name,
    description:          props.description,
    url:                  props.url,
    applicationCategory:  props.applicationCategory ?? 'FinanceApplication',
    operatingSystem:      'Any',
    browserRequirements:  'Requires JavaScript',
    inLanguage:           'nl-NL',
    isAccessibleForFree:  true,
    offers: {
      '@type':         'Offer',
      price:           '0',
      priceCurrency:   'EUR',
      availability:    'https://schema.org/InStock',
    },
    publisher: { '@id': `${SITE.url}/#organization` },
  })
}
