// Brand tokens (Decision #019: cream/espresso/ember, Instrument Serif + Geist).
// The single source for colors and fonts in TS — no hex literals in components.
// Palate-specific chart helpers (barColor, label maps) live in
// features/palate/palateTheme.ts.

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
