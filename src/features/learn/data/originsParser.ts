// Pure parser for palato-coffee-origins-verified.md (the canonical, verified origins
// reference — Decision #056, the Origins Data Standard v1). The markdown is the single
// source of truth; this turns it into typed records WITHOUT inventing or copying data.
// House rules honored downstream: render prose as written, ranges use hyphens, missing
// data reads "not yet verified", elevation basis is tracked (region | country |
// unverified) and never synthesized.
//
// Parsing is deliberately tolerant; `parseOrigins` also returns `warnings` so a
// formatting drift that drops a country is visible (logged in dev) rather than silent.

export type SpeciesType = 'arabica' | 'both' | 'robusta' | 'liberica' | 'all_four'
export type ElevationBasis = 'region' | 'country' | 'unverified'

export type Altitude = {
  min: number | null
  max: number | null
  raw: string // the full prose, preserved (may be qualitative with no number)
}

export type Elevation = {
  min: number | null
  max: number | null
  basis: ElevationBasis
  // The prose to show: a region-specific note, else the inherited country band raw.
  raw: string
}

export type OriginRegion = {
  slug: string // unique across all origins, e.g. 'colombia-huila'
  name: string // 'Huila', 'Minas Gerais', 'Central'
  detail: string // sub-regions / notes after the name, preserved (may be '')
  country: string // display country name (join key to coffees.origin_country)
  section: string
  elevation: Elevation
  matchTerms: string[] // name + sub-region tokens, for linking catalog coffees
}

export type OriginBlurb = { label: string; text: string }

export type Origin = {
  slug: string
  country: string // clean display name, e.g. 'Colombia', "Côte d'Ivoire"
  mapName: string | null // GeoJSON ADMIN name for polygon highlighting, or null
  section: string
  speciesType: SpeciesType
  marker: string // the raw species marker prose, preserved
  varietals: string // raw prose after "Common (Arabica) varietals:", preserved
  altitude: Altitude
  regions: OriginRegion[]
  robusta: string | null // "Produces Robusta" prose, if any
  blurbs: OriginBlurb[]
  hasFullData: boolean // true for primary origins (with regions); false for secondary
}

export type ParsedOrigins = {
  origins: Origin[] // primary, full-data origins
  secondary: Origin[] // robusta-roster / emerging / historical / minor (no region rows)
  warnings: string[]
}

// Markdown country name -> GeoJSON ADMIN name, only where they differ. Defaults to the
// clean name. Explicit null = intentionally not highlighted (no faithful polygon at
// 110m resolution, e.g. a US state or small island), still shown in lists.
const MAP_NAME_ALIASES: Record<string, string | null> = {
  Tanzania: 'United Republic of Tanzania',
  'DR Congo': 'Democratic Republic of the Congo',
  'Republic of the Congo': 'Republic of the Congo',
  "Côte d'Ivoire": 'Ivory Coast',
  'The Philippines': 'Philippines',
  'Timor-Leste': 'East Timor',
  'Hawaii (USA)': null,
  Hawaii: null,
  'Puerto Rico': null,
  Réunion: null,
  Mauritius: null,
  Galápagos: null,
}

const BLURB_LABELS = ['Emerging', 'Heritage', 'Note', 'Signature', 'Curiosity']

function titleCaseSection(raw: string): string {
  // "AFRICA, EAST AFRICA" -> "Africa, East Africa"
  return raw
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/\bAnd\b/g, 'and')
    .replace(/\bThe\b/g, 'the')
    .trim()
}

function stripMd(s: string): string {
  return s
    .replace(/\*\*/g, '')
    .replace(/(^|\s)\*(?=\S)/g, '$1')
    .replace(/(?<=\S)\*(\s|$)/g, '$1')
    .replace(/\\(.)/g, '$1') // unescape \~ \# etc.
    .replace(/\s+/g, ' ')
    .trim()
}

// Capitalize the first letter for fields rendered as standalone labeled prose (the
// markdown writes them as mid-sentence fragments, e.g. "roughly 1,300-1,900 m").
function capFirst(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

// Drop unmatched parentheses (a ")" with no opener, or a trailing unclosed "(").
function balanceParens(s: string): string {
  let depth = 0
  let out = ''
  for (const ch of s) {
    if (ch === '(') {
      depth++
      out += ch
    } else if (ch === ')') {
      if (depth > 0) {
        depth--
        out += ch
      }
    } else {
      out += ch
    }
  }
  if (depth > 0) out = out.replace(/\s*\([^()]*$/, '')
  return out.replace(/\s+/g, ' ').replace(/\s+([,;.])/g, '$1').trim()
}

function kebab(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function speciesFromMarker(marker: string): SpeciesType {
  const m = marker.toLowerCase()
  if (m.includes('all four')) return 'all_four'
  if (m.includes('liberica-dominant')) return 'liberica'
  if (/\bboth\b/.test(m)) return 'both'
  // Check robusta-dominant / robusta-only BEFORE arabica: markers like Madagascar's
  // "Robusta-dominant; minor highland Arabica" mention both species.
  if (/robusta-dominant|robusta-only|robusta only/.test(m)) return 'robusta'
  if (m.includes('arabica')) return 'arabica'
  if (m.includes('robusta')) return 'robusta'
  return 'arabica'
}

// First "N-N m" (or "N,NNN-N,NNN m") range in a string; commas and en/em dashes tolerated.
function parseRange(text: string): { min: number | null; max: number | null } {
  const m = text.match(/([\d][\d,]{1,5})\s*[-–—]\s*([\d][\d,]{1,5})\s*m\b/)
  if (!m) return { min: null, max: null }
  const min = parseInt(m[1].replace(/,/g, ''), 10)
  const max = parseInt(m[2].replace(/,/g, ''), 10)
  return { min: Number.isFinite(min) ? min : null, max: Number.isFinite(max) ? max : null }
}

function mapNameFor(country: string, parenAlias: string | null): string | null {
  if (country in MAP_NAME_ALIASES) return MAP_NAME_ALIASES[country]
  if (parenAlias && parenAlias in MAP_NAME_ALIASES) return MAP_NAME_ALIASES[parenAlias]
  // A parenthetical alias is often the map-friendly name (e.g. "(Ivory Coast)").
  return parenAlias ?? country
}

// Split a region bullet into name + detail; derive match terms from both.
function parseRegionBullet(
  bulletRaw: string,
  country: string,
  section: string,
  countryAltitude: Altitude,
): OriginRegion {
  const text = stripMd(bulletRaw)
  // Prefer the colon as the name/detail separator (it's the bold-label divider). Only
  // fall back to the first '(' when there's no colon — otherwise a parenthetical inside
  // the name (e.g. "Hawai'i (Big Island): Kona, …") would split in the wrong place.
  const colon = text.indexOf(':')
  const paren = text.indexOf('(')
  const splitIdx = colon >= 0 ? colon : paren
  let name = (splitIdx >= 0 ? text.slice(0, splitIdx) : text).trim()
  let detail = (splitIdx >= 0 ? text.slice(splitIdx).replace(/^[:(]/, '').replace(/\)$/, '') : '')
    .trim()

  // Some markdown bullets aren't a clean "Name: detail" — they lead with a connector or
  // a status word (e.g. "plus the Sunshine Coast, …" or "emerging: Kachin, Chin, …").
  // Strip the connector and name the card after the first real place; the rest is detail.
  const CONNECTOR = /^(plus|also|and|emerging|including|incl\.?)\b[\s:,]*/i
  if (CONNECTOR.test(name)) {
    const merged = [name.replace(CONNECTOR, '').trim(), detail].filter(Boolean).join(', ')
    const comma = merged.indexOf(',')
    name = (comma >= 0 ? merged.slice(0, comma) : merged).trim()
    detail = (comma >= 0 ? merged.slice(comma + 1) : '').trim()
  }
  // Drop a trailing share-note from the name ("Central (~60%)" -> "Central") and remove
  // unbalanced parentheses left over from comma-list bullets (e.g. "Kula), Kauai (…)").
  name = capFirst(balanceParens(name.replace(/\s*\([^)]*%[^)]*\)\s*$/, '').trim()))
  detail = balanceParens(detail)

  // Region-specific elevation only if a verified figure sits in THIS bullet.
  const own = parseRange(text)
  const elevation: Elevation =
    own.min !== null
      ? { min: own.min, max: own.max, basis: 'region', raw: text }
      : countryAltitude.min !== null
        ? {
            min: countryAltitude.min,
            max: countryAltitude.max,
            basis: 'country',
            raw: countryAltitude.raw,
          }
        : { min: null, max: null, basis: 'unverified', raw: countryAltitude.raw }

  // Match terms: the region name plus comma/slash/paren-separated tokens from detail.
  const tokens = new Set<string>()
  if (name) tokens.add(name)
  for (const t of detail.split(/[,/;()]|\band\b/)) {
    const clean = t.replace(/~?\d[\d,.\s%-]*m?\b/g, '').replace(/["“”']/g, '').trim()
    if (clean.length >= 3 && !/^the$/i.test(clean)) tokens.add(clean)
  }

  return {
    slug: `${kebab(country)}-${kebab(name) || 'region'}`,
    name,
    detail,
    country,
    section,
    elevation,
    matchTerms: [...tokens],
  }
}

export function parseOrigins(md: string): ParsedOrigins {
  const lines = md.split(/\r?\n/)
  const origins: Origin[] = []
  const secondary: Origin[] = []
  const warnings: string[] = []

  let section = ''
  let current: Origin | null = null
  let mode: 'origin' | 'secondary' | 'other' = 'other'
  let inRegions = false

  const flush = () => {
    if (current) {
      if (current.hasFullData) origins.push(current)
      else secondary.push(current)
    }
    current = null
    inRegions = false
  }

  // H3 origin header: "### Name *(marker)*"
  const originHeader = /^###\s+(.+?)\s*\*\((.+?)\)\*\s*$/
  // H3 non-origin header (subsections like "... emerging & historical")
  const plainHeader = /^###\s+(.+?)\s*$/
  const varietalsLabel = /\*\*Common[^:*]*:\*\*/i
  const altitudeLabel = /\*\*Altitude[^:*]*:\*\*/i

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()

    // Section (H2)
    const h2 = line.match(/^##\s+([^#].*)$/)
    if (h2 && !line.startsWith('###')) {
      flush()
      section = titleCaseSection(h2[1])
      mode = 'other'
      continue
    }

    // H3
    if (line.startsWith('### ')) {
      flush()
      const om = line.match(originHeader)
      if (om) {
        const namePart = stripMd(om[1])
        const marker = stripMd(om[2])
        // Pull a trailing "(Alias)" off the display name (e.g. "DR Congo (DRC)").
        const parenMatch = namePart.match(/^(.*?)\s*\(([^)]+)\)\s*$/)
        const country = (parenMatch ? parenMatch[1] : namePart).trim()
        const parenAlias = parenMatch ? parenMatch[2].trim() : null
        const species = speciesFromMarker(marker)
        current = {
          slug: kebab(country),
          country,
          mapName: mapNameFor(country, parenAlias),
          section,
          speciesType: species,
          marker,
          varietals: '',
          altitude: { min: null, max: null, raw: '' },
          regions: [],
          robusta: null,
          blurbs: [],
          hasFullData: true,
        }
        mode = 'origin'
      } else {
        const pm = line.match(plainHeader)
        const title = pm ? stripMd(pm[1]).toLowerCase() : ''
        mode =
          /emerging|historical|robusta roster|also in the region|minor pacific/.test(title)
            ? 'secondary'
            : 'other'
      }
      continue
    }

    if (mode === 'origin' && current) {
      // Varietals (+ possibly Altitude sharing the same physical line)
      if (varietalsLabel.test(line)) {
        let work = line.replace(varietalsLabel, '|VAR|')
        let altPart = ''
        if (altitudeLabel.test(work)) {
          const [vPart, ...rest] = work.split(altitudeLabel)
          work = vPart
          altPart = rest.join(' ')
        }
        current.varietals = stripMd(work.replace('|VAR|', ''))
        if (altPart) {
          const raw = capFirst(stripMd(altPart))
          const { min, max } = parseRange(raw)
          current.altitude = { min, max, raw }
        }
        continue
      }
      // Standalone Altitude line
      if (altitudeLabel.test(line) && !current.altitude.raw) {
        const raw = capFirst(stripMd(line.replace(altitudeLabel, '')))
        const { min, max } = parseRange(raw)
        current.altitude = { min, max, raw }
        continue
      }
      // Regions header
      if (/\*\*Arabica regions/i.test(line)) {
        inRegions = true
        continue
      }
      // Produces Robusta
      if (/\*\*Produces Robusta/i.test(line)) {
        current.robusta = capFirst(stripMd(line.replace(/\*\*Produces Robusta[^:*]*:\*\*/i, '')))
        inRegions = false
        continue
      }
      // Labeled editorial blurb
      const blurbMatch = line.match(/^\*\*(\w+)\.\*\*\s*(.*)$/)
      if (blurbMatch && BLURB_LABELS.includes(blurbMatch[1])) {
        current.blurbs.push({ label: blurbMatch[1], text: stripMd(blurbMatch[2]) })
        inRegions = false
        continue
      }
      // Region bullet
      if (inRegions && /^[-*]\s+/.test(line)) {
        const bullet = line.replace(/^[-*]\s+/, '')
        if (stripMd(bullet)) {
          current.regions.push(
            parseRegionBullet(bullet, current.country, current.section, current.altitude),
          )
        }
        continue
      }
      // Italic standalone note: *(...)*
      const noteMatch = line.match(/^\*\((.+)\)\*\s*$/)
      if (noteMatch) {
        current.blurbs.push({ label: 'Note', text: stripMd(noteMatch[1]) })
        inRegions = false
        continue
      }
      // Blank lines are ignored (a blank line separates the "Arabica regions:" header
      // from its bullets); a non-blank, unhandled line is prose and ends region capture.
      if (line.trim() !== '') inRegions = false
      continue
    }

    if (mode === 'secondary') {
      // Bold-named secondary entry: "- **Name** *(marker)* prose" or "**Name** *(...)* prose"
      // The marker may carry a trailing period inside the italics (e.g. "*(…Liberica).*").
      const sm = line.match(/^[-*]?\s*\*\*([^*]+?)\*\*\s*(?:\*\(([^)]*)\)\.?\*)?\s*(.*)$/)
      if (sm && stripMd(sm[1])) {
        const name = stripMd(sm[1]).replace(/[:.]$/, '')
        // Skip labeled editorial paragraphs (e.g. "**Curiosity.**") — not a country.
        if (BLURB_LABELS.includes(name)) continue
        const marker = sm[2] ? stripMd(sm[2]) : ''
        const prose = stripMd(sm[3] || '')
        const parenMatch = name.match(/^(.*?)\s*\(([^)]+)\)\s*$/)
        const country = (parenMatch ? parenMatch[1] : name).trim()
        const parenAlias = parenMatch ? parenMatch[2].trim() : null
        const species = marker ? speciesFromMarker(marker) : 'robusta'
        secondary.push({
          slug: kebab(country),
          country,
          mapName: mapNameFor(country, parenAlias),
          section,
          speciesType: species,
          marker,
          varietals: '',
          altitude: { min: null, max: null, raw: '' },
          regions: [],
          // Robusta-dominant secondary origins don't get a separate "Robusta zones"
          // section (the whole country is robusta) — the story lives in the Note instead,
          // so the two no longer duplicate.
          robusta: null,
          blurbs: prose ? [{ label: 'Note', text: prose }] : [],
          hasFullData: false,
        })
      }
      continue
    }
  }
  flush()

  // Dev visibility: flag primary origins missing key fields. Robusta-dominant origins
  // legitimately carry no Arabica varietals / altitude / regions, so skip those.
  for (const o of origins) {
    if (o.speciesType === 'robusta') continue
    if (!o.varietals) warnings.push(`${o.country}: no varietals parsed`)
    if (!o.altitude.raw) warnings.push(`${o.country}: no altitude parsed`)
    if (o.regions.length === 0) warnings.push(`${o.country}: no regions parsed`)
  }

  return { origins, secondary, warnings }
}
