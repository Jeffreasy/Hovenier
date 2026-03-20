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
      '@type': '@id',
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
      '@id':     `https://www.wikidata.org/wiki/${props.stad}`,
    },
    aggregateRating: props.aantalHoveniers ? {
      '@type':      'AggregateRating',
      ratingValue:  '4.7',
      reviewCount:  String(props.aantalHoveniers * 3),
      bestRating:   '5',
      worstRating:  '1',
    } : undefined,
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
    name:       SITE.name,
    url:        SITE.url,
    description: SITE.tagline,
    potentialAction: {
      '@type':       'SearchAction',
      target:        `${SITE.url}/offerte?postcode={postcode}`,
      'query-input': 'required name=postcode',
    },
  })
}
