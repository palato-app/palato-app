// Canonical enum→display maps for coffee facts. The keys are the DB enum
// values (underscore form, e.g. `medium_light`) — the single source of truth.

export const ROAST_LABELS: Record<string, string> = {
  light: 'Light',
  medium_light: 'Medium-light',
  medium: 'Medium',
  medium_dark: 'Medium-dark',
  dark: 'Dark',
  unspecified: '',
}

export const ROAST_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'medium_light', label: 'Medium-light' },
  { value: 'medium', label: 'Medium' },
  { value: 'medium_dark', label: 'Medium-dark' },
  { value: 'dark', label: 'Dark' },
]

// Scan pipeline emits hyphenated roast levels; map them to DB enum values.
export const ROAST_FROM_SCAN: Record<string, string> = {
  light: 'light',
  'medium-light': 'medium_light',
  medium: 'medium',
  'medium-dark': 'medium_dark',
  dark: 'dark',
}

export const PROCESS_OPTIONS = [
  { value: 'washed', label: 'Washed' },
  { value: 'natural', label: 'Natural' },
  { value: 'honey', label: 'Honey' },
  { value: 'anaerobic', label: 'Anaerobic' },
  { value: 'carbonic_maceration', label: 'Carbonic maceration' },
  { value: 'pulped_natural', label: 'Pulped natural' },
  { value: 'wet_hulled', label: 'Wet-hulled' },
  { value: 'experimental', label: 'Experimental' },
  { value: 'other', label: 'Other' },
]

export const PROCESS_VALUES = PROCESS_OPTIONS.map((o) => o.value)

export const PROCESS_LABELS: Record<string, string> = Object.fromEntries(
  PROCESS_OPTIONS.map((o) => [o.value, o.label]),
)

// --- Palate-domain roast vocabulary ----------------------------------------
// The palate feature uses HYPHENATED roast keys ('medium-light'), not the DB
// enum's underscores: profile bucket keys (usePalateProfile), the quiz's
// persisted palate_profiles.roast_preference values, and the roastLevel in
// cached /api/recommend JSON are all hyphen-form. Both vocabularies are
// persisted, so neither can be renamed cheaply — convert at the seam with
// toRoastBucketKey instead of inline .replace() hacks.

export function toRoastBucketKey(dbRoast: string): string {
  return dbRoast.replace(/_/g, '-')
}

// Compact labels for dense surfaces (chart axes, card meta lines), keyed by
// the hyphenated palate-domain vocabulary above.
export const ROAST_LABELS_COMPACT: Record<string, string> = {
  light: 'Light',
  'medium-light': 'Med-light',
  medium: 'Medium',
  'medium-dark': 'Med-dark',
  dark: 'Dark',
}
