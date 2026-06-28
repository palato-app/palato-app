// Read-time linking of a Region to catalog coffees. Free-text coffees.origin_region
// has no structured FK (see TECH_DEBT) — so we normalize both sides and test whether
// any of the region's matchTerms appears in the coffee's origin_region, within the
// same country. No DB migration, no backfill: this runs over the already-fetched
// catalog (see hooks/useRegionCoffees.ts).

import type { Coffee } from '../../../lib/useCoffees'
import type { OriginRegion } from '../data/originsData'

/**
 * Normalize region text for forgiving comparison: lowercase, strip diacritics
 * (so "San Agustín" === "San Agustin"), and collapse runs of whitespace.
 */
export function normalizeRegionText(s: string | null | undefined): string {
  if (!s) return ''
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    // Special Latin letters NFD doesn't decompose (đ in Lâm Đồng, ø, ł, ı, ß).
    .replace(/đ/g, 'd')
    .replace(/ø/g, 'o')
    .replace(/ł/g, 'l')
    .replace(/ı/g, 'i')
    .replace(/ß/g, 'ss')
    // Treat hyphens/slashes as spaces ("Zamora-Chinchipe" = "Zamora Chinchipe").
    .replace(/[-_/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * True when a coffee belongs to a region: same country (exact, the catalog's only
 * structured origin field) AND any normalized matchTerm is contained in the
 * normalized origin_region (e.g. "huila" within "huila, san agustin").
 */
export function coffeeMatchesRegion(coffee: Coffee, region: OriginRegion): boolean {
  if (coffee.origin_country !== region.country) return false
  const haystack = normalizeRegionText(coffee.origin_region)
  if (!haystack) return false
  return region.matchTerms.some((term) => {
    const needle = normalizeRegionText(term)
    return needle.length > 0 && haystack.includes(needle)
  })
}
