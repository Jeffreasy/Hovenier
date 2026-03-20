import type { ServiceType, QualityLevel } from './types'

// ─── Diensten ─────────────────────────────────────────────────────────────────

export const SERVICES: Record<ServiceType, { label: string; icon: string }> = {
  tuinaanleg:  { label: 'Tuinaanleg',  icon: 'sprout' },
  onderhoud:   { label: 'Onderhoud',   icon: 'scissors' },
  bestrating:  { label: 'Bestrating',  icon: 'grid-3x3' },
  beplanting:  { label: 'Beplanting',  icon: 'flower-2' },
  schutting:   { label: 'Schutting',   icon: 'fence' },
  overig:      { label: 'Overig',      icon: 'more-horizontal' },
}

export const SERVICE_OPTIONS: { value: ServiceType; label: string }[] = [
  { value: 'tuinaanleg', label: 'Tuinaanleg' },
  { value: 'onderhoud',  label: 'Onderhoud' },
  { value: 'bestrating', label: 'Bestrating / terras' },
  { value: 'beplanting', label: 'Beplanting' },
  { value: 'schutting',  label: 'Schutting / afscheiding' },
  { value: 'overig',     label: 'Iets anders' },
]

// ─── Budget ───────────────────────────────────────────────────────────────────

export const BUDGET_OPTIONS = [
  { value: '<2500',       label: 'Minder dan €2.500' },
  { value: '2500-5000',   label: '€2.500 – €5.000' },
  { value: '5000-10000',  label: '€5.000 – €10.000' },
  { value: '10000-25000', label: '€10.000 – €25.000' },
  { value: '>25000',      label: 'Meer dan €25.000' },
]

// ─── Timing ───────────────────────────────────────────────────────────────────

export const TIMING_OPTIONS = [
  { value: 'asap',              label: 'Zo snel mogelijk' },
  { value: 'binnen-3-maanden',  label: 'Binnen 3 maanden' },
  { value: 'geen-haast',        label: 'Geen haast, ik oriënteer me' },
]

// ─── Kwaliteit ────────────────────────────────────────────────────────────────

export const QUALITY_OPTIONS: Record<QualityLevel, { label: string; description: string; multiplier: number }> = {
  basis:   { label: 'Basis',   description: 'Functioneel en betaalbaar', multiplier: 1.0 },
  midden:  { label: 'Midden',  description: 'Goede prijs-kwaliteitverhouding', multiplier: 1.45 },
  premium: { label: 'Premium', description: 'Hoogwaardige materialen', multiplier: 2.0 },
}

// ─── Kosten Indicaties (€ per m²) ────────────────────────────────────────────

export const COST_PER_M2: Record<ServiceType, { min: number; max: number; label: string }> = {
  bestrating: { min: 40,  max: 80,  label: 'Bestrating' },
  beplanting: { min: 15,  max: 35,  label: 'Beplanting' },
  tuinaanleg: { min: 50,  max: 120, label: 'Tuinaanleg' },
  onderhoud:  { min: 5,   max: 15,  label: 'Onderhoud (per beurt)' },
  schutting:  { min: 30,  max: 90,  label: 'Schutting (per meter)' },
  overig:     { min: 20,  max: 60,  label: 'Overig' },
}

// ─── Steden (Fase 1 – Top 10) ────────────────────────────────────────────────

export const FASE1_STEDEN = [
  'amsterdam', 'rotterdam', 'utrecht', 'den-haag',
  'almere', 'eindhoven', 'amersfoort', 'breda', 'nijmegen', 'tilburg',
]

// ─── Navigatie ───────────────────────────────────────────────────────────────

export const NAV_LINKS = [
  { href: '/',                label: 'Home' },
  { href: '/blog',            label: 'Tuingids' },
  { href: '/tools/tuinkosten-calculator', label: 'Calculator' },
  { href: '/offerte',         label: 'Offerte aanvragen' },
  { href: '/over-ons',        label: 'Over ons' },
]

// ─── Social Proof ─────────────────────────────────────────────────────────────

export const SOCIAL_PROOF = {
  offertes:  '12.400+',
  hoveniers: '480+',
  rating:    '4.8',
  reviews:   '3.200+',
}

// ─── Site Info ────────────────────────────────────────────────────────────────

export const SITE = {
  name:        'Tuinplatform',
  tagline:     'Vind de beste hovenier in jouw regio',
  description: 'Vergelijk hoveniers in jouw buurt. Vraag gratis offertes aan voor tuinaanleg, onderhoud, bestrating en meer.',
  url:         'https://www.tuinplatform.nl',
  email:       'info@tuinplatform.nl',
}
