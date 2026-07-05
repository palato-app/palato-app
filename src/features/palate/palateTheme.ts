// Palate-domain display maps and chart helpers.
// Brand tokens live in src/lib/theme.ts — import `theme` from there.

import { theme } from '../../lib/theme'

// Display-name maps
export const FLAVOR_FAMILY_LABELS: Record<string, string> = {
  fruity: 'Fruity',
  floral: 'Floral',
  sweet: 'Sweet',
  sour_ferment: 'Sour / ferment',
  cocoa_nut: 'Cocoa / nut',
  spice: 'Spice',
  roasted: 'Roasted',
  green: 'Green',
}

// Roast/process display maps live in src/lib/labels.ts (ROAST_LABELS_COMPACT,
// PROCESS_LABELS) — import from there, not here.

export const ELEVATION_LABELS: Record<string, string> = {
  'under-1200': '<1200',
  '1200-1500': '1200–1500',
  '1500-1800': '1500–1800',
  'over-1800': '1800+',
}

// Light-touch varietal canonicalization: collapse the common spelling variants,
// title-case the rest. Variety is free text (no canonical list), so this only
// merges the cases that would obviously split a bucket.
const VARIETAL_ALIASES: Record<string, string> = {
  geisha: 'Gesha',
  gesha: 'Gesha',
  'sl 28': 'SL28',
  'sl-28': 'SL28',
  sl28: 'SL28',
  'sl 34': 'SL34',
  'sl-34': 'SL34',
  sl34: 'SL34',
}

/** Normalize one raw varietal token to a display label, or null if empty. */
export function normalizeVarietal(raw: string): string | null {
  const t = raw.trim()
  if (!t) return null
  const lower = t.toLowerCase()
  if (VARIETAL_ALIASES[lower]) return VARIETAL_ALIASES[lower]
  return t.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
}

/** Value-encoded bar color: Ember for highs, Ochre for mid, muted for lows. */
export function barColor(val: number | null): string {
  if (val === null || val <= 0) return theme.emptyBar
  if (val >= 4.3) return theme.ember
  if (val >= 3.4) return theme.ochre
  return theme.mutedBar
}

/** Same encoding for origin horizontal bars. */
export function originBarColor(val: number): string {
  if (val >= 4.3) return theme.ember
  if (val >= 3.4) return theme.ochre
  return theme.mutedOrigin
}
