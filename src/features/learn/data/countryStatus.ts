import { theme } from '../../../lib/theme'
import type { SpeciesType } from './originsParser'

// Curated availability/maturity status per origin (Decision: globe legend by status,
// not by species — so an Arabica-dominant but realistically-unbuyable origin like
// Myanmar does not read like an established source). This is a SEED for Jesse to verify
// and adjust; it is a classification layer, not invented facts. Tiers:
//
//   established  — a real, buyable specialty-coffee source today
//   emerging     — a young/reviving scene; specialty exists but is hard to buy
//   robusta      — robusta-dominant; not a specialty-Arabica purchase for our use case
//   historical   — vestigial / no meaningful production (a story, not a source)
//
// Country keys must match the parsed `country` value exactly.

export type OriginStatus = 'established' | 'emerging' | 'robusta' | 'historical'

export const STATUS_LABELS: Record<OriginStatus, string> = {
  established: 'Established',
  emerging: 'Emerging',
  robusta: 'Robusta-dominant',
  historical: 'Historical',
}

// Globe + badge color per tier. Established leads (ember); emerging is a muted ember so
// it reads "present but secondary"; robusta is ochre; historical is quiet.
export const STATUS_COLOR: Record<OriginStatus, string> = {
  established: theme.ember,
  emerging: 'rgba(200,144,64,0.82)', // ochre
  robusta: 'rgba(217,78,31,0.5)', // muted ember
  historical: theme.ink35,
}

// How each tier actually READS on the globe — its (semi-transparent) cap color
// composited over the dark globe material — so the legend matches what the user sees,
// not the raw swatch on a cream background.
export const STATUS_LEGEND_COLOR: Record<OriginStatus, string> = {
  established: '#d94e1f', // ember, opaque
  emerging: '#ac7b38', // ochre over espresso
  robusta: '#82351a', // muted ember over espresso
  historical: theme.ink35,
}

// Globe raised height per tier (historical stays flat / effectively unhighlighted).
export const STATUS_ALTITUDE: Record<OriginStatus, number> = {
  established: 0.06,
  emerging: 0.04,
  robusta: 0.025,
  historical: 0.006,
}

// Curated seed. Primary origins are listed explicitly (the established-vs-emerging call
// is the contentious one, so it should be auditable at a glance). Secondary origins fall
// through to the heuristic in statusFor() unless listed here.
const COUNTRY_STATUS: Record<string, OriginStatus> = {
  // Established — buyable specialty sources
  Colombia: 'established',
  Brazil: 'established',
  Peru: 'established',
  Mexico: 'established',
  Guatemala: 'established',
  Honduras: 'established',
  'El Salvador': 'established',
  Nicaragua: 'established',
  'Costa Rica': 'established',
  Panama: 'established',
  Jamaica: 'established',
  'Dominican Republic': 'established',
  Ethiopia: 'established',
  Kenya: 'established',
  Tanzania: 'established',
  Rwanda: 'established',
  Burundi: 'established',
  India: 'established',
  Indonesia: 'established',
  Vietnam: 'established',
  Yemen: 'established',
  'Papua New Guinea': 'established',
  Hawaii: 'established',

  // Established by reach/availability even though their specialty tier is young
  // (Jesse's call, 2026-06-26): Ecuador, Uganda, China.
  Ecuador: 'established',
  Uganda: 'established',
  China: 'established',

  // Emerging — young or reviving; specialty exists but is harder to source
  Bolivia: 'emerging',
  Venezuela: 'emerging',
  Cuba: 'emerging',
  Haiti: 'emerging',
  'Puerto Rico': 'emerging',
  'DR Congo': 'emerging',
  Malawi: 'emerging',
  Zambia: 'emerging',
  Zimbabwe: 'emerging',
  Mozambique: 'emerging',
  'South Africa': 'emerging',
  Réunion: 'emerging',
  'Saudi Arabia': 'emerging',
  'Sri Lanka': 'emerging',
  Nepal: 'emerging', // borderline: ~400-600 t/yr, marker literally says "emerging"
  Laos: 'emerging',
  Thailand: 'emerging',
  Myanmar: 'emerging',
  Taiwan: 'emerging',
  'The Philippines': 'emerging',
  'Timor-Leste': 'emerging',
  Australia: 'emerging',
  Paraguay: 'emerging',
  Belize: 'emerging',

  // Robusta-dominant
  Madagascar: 'robusta',
  Angola: 'robusta',
  Cameroon: 'robusta',
  Cambodia: 'robusta',
  Malaysia: 'robusta',

  // Historical — vestigial / no meaningful production today
  'French Guiana': 'historical',
  Suriname: 'historical',
  Guyana: 'historical',
  Martinique: 'historical',

  // Minor boutique islands with a living (if tiny) crop
  Vanuatu: 'emerging',
  'New Caledonia': 'emerging',
}

/**
 * Status for an origin. Curated value if present; otherwise a safe default: secondary
 * (no-region) origins are historical, primary robusta-species origins are robusta, and
 * everything else established.
 */
export function statusFor(
  country: string,
  hasFullData: boolean,
  species: SpeciesType,
): OriginStatus {
  if (country in COUNTRY_STATUS) return COUNTRY_STATUS[country]
  // Robusta first: the robusta roster (Côte d'Ivoire, Ghana, …) is secondary but should
  // read robusta, not historical.
  if (species === 'robusta') return 'robusta'
  // Other secondary (no regions, not robusta) is genuinely vestigial.
  if (!hasFullData) return 'historical'
  return 'established'
}
