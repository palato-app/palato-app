// Brand tokens for the Palate dashboard.
// Sourced from the app's existing palette — do not duplicate or invent new values.
// Components import from here; no hex literals in chart code.

export const theme = {
  // Core brand colors
  cream: '#F4EAD5',
  creamDeep: '#EADCBF',
  espresso: '#1E1410',
  ember: '#D94E1F',
  ochre: '#C89040',
  forest: '#2F4A38',

  // Espresso at various opacities
  ink70: 'rgba(30,20,16,0.70)',
  ink50: 'rgba(30,20,16,0.50)',
  ink35: 'rgba(30,20,16,0.35)',
  ink15: 'rgba(30,20,16,0.15)',
  ink10: 'rgba(30,20,16,0.10)',
  ink08: 'rgba(30,20,16,0.08)',

  // Typography
  displayFont: '"Instrument Serif", serif',
  bodyFont: 'Geist, system-ui, sans-serif',
  wordmarkFont: '"Boldonse", system-ui',

  // Chart fills
  radarFill: 'rgba(217,78,31,0.14)',
  radarFillForming: 'rgba(217,78,31,0.07)',
  evoFill: 'rgba(47,74,56,0.08)',
  gridColor: 'rgba(30,20,16,0.12)',
  gridColorLight: 'rgba(30,20,16,0.07)',
  emptyBar: 'rgba(30,20,16,0.10)',
  mutedBar: 'rgba(30,20,16,0.32)',
  mutedOrigin: 'rgba(30,20,16,0.30)',
  emberDark: '#b03e17',
} as const

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

export const ROAST_LABELS: Record<string, string> = {
  'light': 'Light',
  'medium-light': 'Med-light',
  'medium': 'Medium',
  'medium-dark': 'Med-dark',
  'dark': 'Dark',
}

export const PROCESS_LABELS: Record<string, string> = {
  natural: 'Natural',
  honey: 'Honey',
  anaerobic: 'Anaerobic',
  washed: 'Washed',
  other: 'Other',
}

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
