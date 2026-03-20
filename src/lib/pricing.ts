/**
 * pricing.ts — Centralized pricing logic for all calculators
 *
 * Single source of truth for cost ranges, quality multipliers and
 * material options. Import from here in all calculator islands.
 *
 * NOTE: These are Dutch market averages (2025). Update annually
 * or when market conditions change significantly.
 */

import type { ServiceType, QualityLevel } from './types'

// ─── Cost per m² per service type ─────────────────────────────────────────────

export interface CostRange {
  min: number
  max: number
  label: string
  unit: string
}

export const COST_PER_M2: Record<ServiceType, CostRange> = {
  tuinaanleg:  { min: 60,  max: 130, label: 'Tuinaanleg',      unit: 'm²' },
  onderhoud:   { min: 5,   max: 15,  label: 'Tuinonderhoud',   unit: 'm² / maand' },
  bestrating:  { min: 40,  max: 120, label: 'Bestrating',      unit: 'm²' },
  beplanting:  { min: 20,  max: 60,  label: 'Beplanting',      unit: 'm²' },
  schutting:   { min: 80,  max: 250, label: 'Schutting',       unit: 'strekkende meter' },
  overig:      { min: 50,  max: 100, label: 'Overig',          unit: 'm²' },
}

// ─── Schutting — cost per linear meter (not m²) ───────────────────────────────

export interface SchuttingMaterial {
  id:    string
  label: string
  min:   number   // € per strekkende meter incl. plaatsing
  max:   number
}

export const SCHUTTING_MATERIALS: SchuttingMaterial[] = [
  { id: 'vuren',       label: 'Vuren (geïmpregneerd)',      min: 80,  max: 130 },
  { id: 'hardhout',    label: 'Hardhout',                   min: 120, max: 200 },
  { id: 'composiet',   label: 'Composiet',                  min: 150, max: 280 },
  { id: 'beton',       label: 'Beton/scherm',               min: 90,  max: 160 },
  { id: 'metaal',      label: 'Metaal (cortenstaal)',        min: 200, max: 350 },
  { id: 'toogplanken', label: 'Toogplanken (Zweeds rabat)', min: 70,  max: 110 },
]

// ─── Quality multipliers ──────────────────────────────────────────────────────

export interface QualityOption {
  label:       string
  description: string
  multiplier:  number
}

export const QUALITY_OPTIONS: Record<QualityLevel, QualityOption> = {
  basis:   { label: 'Basis',       description: 'Functioneel, eenvoudige materialen',     multiplier: 0.8 },
  midden:  { label: 'Midden',      description: 'Goede kwaliteit, gangbare materialen',   multiplier: 1.0 },
  premium: { label: 'Premium',     description: 'Hoogwaardige materialen en afwerking',   multiplier: 1.45 },
}

// ─── Calculator helpers ──────────────────────────────────────────────────────

export interface BreakdownItem {
  label:  string
  min:    number
  max:    number
  unit?:  string
}

export interface CalculationResult {
  min:       number
  max:       number
  breakdown: BreakdownItem[]
}

/**
 * Calculate garden costs for given services, area and quality level.
 */
export function calculateGardenCosts(
  m2:       number,
  services: ServiceType[],
  quality:  QualityLevel,
): CalculationResult {
  const multiplier = QUALITY_OPTIONS[quality].multiplier
  const breakdown  = services.map((s) => {
    const base = COST_PER_M2[s]
    return {
      label: base.label,
      unit:  base.unit,
      min:   Math.round(base.min * m2 * multiplier),
      max:   Math.round(base.max * m2 * multiplier),
    }
  })

  const totals = breakdown.reduce(
    (acc, b) => ({ min: acc.min + b.min, max: acc.max + b.max }),
    { min: 0, max: 0 },
  )

  return { ...totals, breakdown }
}

/**
 * Calculate fence costs based on linear meters and material.
 */
export function calculateSchuttingCosts(
  meters:   number,
  material: SchuttingMaterial,
  hoogte:   number = 1.8,  // meters
): CalculationResult {
  const hoogteMultiplier = Math.max(0.8, hoogte / 1.8)
  const breakdown = [{
    label: material.label,
    unit:  'strekkende meter',
    min:   Math.round(material.min * meters * hoogteMultiplier),
    max:   Math.round(material.max * meters * hoogteMultiplier),
  }]

  // Fundatiekosten
  const fundatie = {
    label: 'Fundering & betonpalen',
    unit:  'per paal (~2m)',
    min:   Math.round((meters / 2) * 50),
    max:   Math.round((meters / 2) * 90),
  }
  breakdown.push(fundatie)

  const totals = breakdown.reduce(
    (acc, b) => ({ min: acc.min + b.min, max: acc.max + b.max }),
    { min: 0, max: 0 },
  )

  return { ...totals, breakdown }
}

// ─── Bouwdepot helpers (fase 2) ───────────────────────────────────────────────

/**
 * Calculate how much of the bouwdepot can be used for garden work.
 * Banks typically allow garden work if it adds value to the property.
 *
 * @todo fase 2: integrate with real bank product APIs
 */
export function estimateBouwdepotGardenShare(
  totalDepot: number,
  gardenM2:   number,
  woningWaarde: number,
): { maxTuinBudget: number; percentageOfDepot: number } {
  // Rule of thumb: tuin professioneel aangelegd = max 5-10% meerwaarde woning
  const maxMeerwaarde  = woningWaarde * 0.07
  const m2Indicatie    = gardenM2 * 90  // midden marktprijs
  const maxTuinBudget  = Math.min(totalDepot * 0.4, maxMeerwaarde, m2Indicatie)
  return {
    maxTuinBudget:     Math.round(maxTuinBudget),
    percentageOfDepot: Math.round((maxTuinBudget / totalDepot) * 100),
  }
}
