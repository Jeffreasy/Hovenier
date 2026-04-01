/**
 * Core TypeScript types for the Hovenier Platform
 */

// ─── Service Types ────────────────────────────────────────────────────────────

export type ServiceType =
  | 'tuinaanleg'
  | 'onderhoud'
  | 'bestrating'
  | 'beplanting'
  | 'schutting'
  | 'overig'

export type QualityLevel = 'basis' | 'midden' | 'premium'

export type BudgetRange =
  | '<2500'
  | '2500-5000'
  | '5000-10000'
  | '10000-25000'
  | '>25000'

export type StartTiming =
  | 'asap'
  | 'binnen-3-maanden'
  | 'geen-haast'

// ─── Offerte ─────────────────────────────────────────────────────────────────

export interface OfferteData {
  dienst: ServiceType
  m2: number
  budget: BudgetRange
  timing: StartTiming
  postcode: string
  plaatsnaam?: string
  naam: string
  email: string
  telefoon: string
}

// ─── Steden ──────────────────────────────────────────────────────────────────

export interface Stad {
  naam: string
  slug: string
  regio: string
  provincie: string
  gemeente: string
  prioriteit: number // 1 = hoog (nieuwbouwwijk), 2 = middel, 3 = laag
}

// ─── Subsidies ───────────────────────────────────────────────────────────────

export type SubsidieType =
  | 'tegelwippen'
  | 'groendak'
  | 'regenton'
  | 'afkoppelen'
  | 'bomen'

export interface Subsidie {
  type: SubsidieType
  naam: string
  beschrijving: string
  maxBedrag?: number
  url?: string
}

export interface GemeenteSubsidies {
  gemeente: string
  postcode4Prefixes: string[] // bijv. ['1011', '1012', '1013']
  subsidies: Subsidie[]
}

// ─── Content ─────────────────────────────────────────────────────────────────

export interface BlogPost {
  title: string
  slug: string
  description: string
  publishDate: Date
  updatedDate?: Date
  category: BlogCategory
  readingTime?: number
  image?: string
  imageAlt?: string
  featured?: boolean
}

export type BlogCategory =
  | 'tuinaanleg'
  | 'onderhoud'
  | 'bestrating'
  | 'beplanting'
  | 'schutting'
  | 'kosten'
  | 'tips'
  | 'subsidies'

export interface FAQItem {
  question: string
  answer: string
  category: string
  schema?: boolean // of FAQPage schema markup genereren
}

// ─── Calculator ───────────────────────────────────────────────────────────────

export interface TuinkostenInput {
  m2: number
  services: ServiceType[]
  quality: QualityLevel
}

export interface TuinkostenOutput {
  min: number
  max: number
  breakdown: {
    label: string
    min: number
    max: number
  }[]
}

// ─── SEO ─────────────────────────────────────────────────────────────────────

export interface SEOMeta {
  title: string
  description: string
  canonical?: string
  ogImage?: string
  ogType?: 'website' | 'article'
  noindex?: boolean
}

// ─── Bedrijven (Google Places dataset) ───────────────────────────────────────

export interface Bedrijf {
  _id:             string
  naam:            string
  stad?:           string
  provincie?:      string
  website?:        string
  telefoon?:       string
  googleScore?:    number
  aantalReviews?:  number
  postcode?:       string
  hoofdCategorie?: string
  googleMapsUrl:   string
  slug:            string
}

export const CATEGORIE_LABELS: Record<string, string> = {
  'Tuin':                         'Tuin',
  'Tuin- en landschapaannemer':   'Tuinaannemer',
  'Tuin- en landschapsaannemer':  'Tuinaannemer',
  'Tuin- en landschapsarchitect': 'Tuinaannemer',
  'Hoveniersbedrijf':             'Hovenier',
  'Hovenier':                     'Hovenier',
  'Landschapsarchitect':          'Landschapsarchitect',
  'Boomverzorging':               'Boomverzorging',
  'Boomverzorgingsdienst':        'Boomverzorging',
  'Tuinaannemer':                 'Tuinaannemer',
  'Tuinonderhoud':                'Tuinonderhoud',
  'Tuinman':                      'Tuinman',
}
