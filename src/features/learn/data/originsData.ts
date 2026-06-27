// Canonical origins data, parsed from the verified markdown at load time (the file is
// the single source of truth — Decision #056). No hand-copied data lives here.

import originsMarkdown from './palato-coffee-origins-verified.md?raw'
import { parseOrigins, type Origin as RawOrigin, type OriginRegion } from './originsParser'
import { statusFor, type OriginStatus } from './countryStatus'

// Origins carry a curated availability status (see countryStatus.ts), merged in here so
// the parser stays a pure data-extraction layer.
export type Origin = RawOrigin & { status: OriginStatus }

export type {
  OriginRegion,
  SpeciesType,
  ElevationBasis,
  Elevation,
  Altitude,
} from './originsParser'
export type { OriginStatus } from './countryStatus'

const parsed = parseOrigins(originsMarkdown)
const enrich = (o: RawOrigin): Origin => ({
  ...o,
  status: statusFor(o.country, o.hasFullData, o.speciesType),
})

/** Primary, full-data origins (have growing regions). */
export const ORIGINS: Origin[] = parsed.origins.map(enrich)
/** Secondary origins: robusta roster, emerging, historical, minor (no region rows). */
export const SECONDARY_ORIGINS: Origin[] = parsed.secondary.map(enrich)

// Surface parse gaps in dev so a markdown formatting drift is visible, not silent.
if (import.meta.env?.DEV && parsed.warnings.length > 0) {
  console.warn(
    `[origins] ${parsed.warnings.length} parse warning(s):\n` + parsed.warnings.join('\n'),
  )
}

// Primary first so a full-data origin always wins over a same-named secondary entry.
const byCountry = new Map([...SECONDARY_ORIGINS, ...ORIGINS].map((o) => [o.country, o]))
const byMapName = new Map(
  [...ORIGINS, ...SECONDARY_ORIGINS]
    .filter((o) => o.mapName)
    .map((o) => [o.mapName as string, o]),
)
const regionBySlug = new Map(
  ORIGINS.flatMap((o) => o.regions).map((r) => [r.slug, r]),
)

/** Map-friendly ADMIN names of every coffee origin (primary + secondary), for the globe. */
export const ALL_MAP_NAMES: Set<string> = new Set(byMapName.keys())
/** ADMIN names of full-data origins (the ones that drill into a country panel). */
export const PRIMARY_MAP_NAMES: Set<string> = new Set(
  ORIGINS.filter((o) => o.mapName).map((o) => o.mapName as string),
)

export function originByCountry(country: string): Origin | undefined {
  return byCountry.get(country)
}

export function originByMapName(adminName: string): Origin | undefined {
  return byMapName.get(adminName)
}

export function findRegion(slug: string): OriginRegion | undefined {
  return regionBySlug.get(slug)
}

export function regionsForCountry(country: string): OriginRegion[] {
  return byCountry.get(country)?.regions ?? []
}

/** Methodology note for the "About this data" panel (kept in sync with the file header). */
export const METHODOLOGY = {
  sourcing:
    'Priority goes to national coffee authorities (Anacafé, ICAFE, IHCAFE, Cenicafé, and the like), World Coffee Research, the SCA, and peer-reviewed or governmental data, then to established specialty importers. General-reference sites are a lead only, checked against a primary source before publishing. No fact is invented; anything uncertain is flagged.',
  altitude:
    'The altitude shown is the verified coffee-growing band, the elevation where coffee is actually grown, not the terrain range of the wider region. A region inherits its country band unless a specific verified figure exists. No per-region elevation is synthesized from maps.',
}
