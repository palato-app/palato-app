import { useEffect, useState } from 'react'
import { normalizeRegionText } from './matchRegion'

// Shared province-map plumbing for the region locator (big) and the country-page region
// cards (mini). Boundaries are vendored Natural Earth admin-1, one file per country,
// fetched once and cached so many cards on a country page don't refetch.

export type Geom =
  | { type: 'Polygon'; coordinates: number[][][] }
  | { type: 'MultiPolygon'; coordinates: number[][][][] }
export type ProvinceFeature = { properties: { name: string }; geometry: Geom }

export function provinceFileSlug(country: string): string {
  return country
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const cache = new Map<string, Promise<ProvinceFeature[] | null>>()
function loadGeo(folder: string, country: string): Promise<ProvinceFeature[] | null> {
  const key = `${folder}/${provinceFileSlug(country)}`
  if (!cache.has(key)) {
    cache.set(
      key,
      fetch(`/geo/${folder}/${provinceFileSlug(country)}.geojson`)
        .then((r) => (r.ok ? r.json() : null))
        .then((g) => (g ? (g.features as ProvinceFeature[]) : null))
        .catch(() => null),
    )
  }
  return cache.get(key)!
}

function useCountryGeo(folder: string, country: string | null): ProvinceFeature[] | null {
  const [data, setData] = useState<{ country: string; features: ProvinceFeature[] | null }>({
    country: '',
    features: null,
  })
  useEffect(() => {
    if (!country) return
    let cancelled = false
    loadGeo(folder, country).then((features) => {
      if (!cancelled) setData({ country, features })
    })
    return () => {
      cancelled = true
    }
  }, [folder, country])
  return country && data.country === country ? data.features : null
}

/** Admin-1 province features (the country outline). Pass null to skip (e.g. massive
 *  countries where a card-size map is just a dot). */
export function useCountryProvinces(country: string | null): ProvinceFeature[] | null {
  return useCountryGeo('admin1', country)
}

/** Vendored admin-2 units for the handful of coffee regions that aren't provinces
 *  (geoBoundaries; only the matched districts are kept). Null when none for the country. */
export function useCountryAdmin2(country: string | null): ProvinceFeature[] | null {
  return useCountryGeo('admin2', country)
}

// Curated parent admin-1 province for regions that aren't an admin unit at all (coffee
// boards' zones, mountain ranges, multi-province zones) — we highlight the parent
// province instead of faking a boundary. Keyed by "country|region name" (exact).
const PARENT_PROVINCE: Record<string, string> = {
  "China|Pu'er": 'Yunnan',
  'China|Lincang': 'Yunnan',
  'Costa Rica|Central Valley': 'San José',
  'Costa Rica|West Valley': 'Alajuela',
  'Costa Rica|Tres Ríos': 'Cartago',
  'Costa Rica|Orosi': 'Cartago',
  'Costa Rica|Brunca': 'Puntarenas',
  'Bolivia|Coroico': 'La Paz',
  'Panama|Volcán / Tierras Altas': 'Chiriquí',
  'Guatemala|Atitlán': 'Sololá',
  "Yemen|Haraz": "Sana'a",
  'Yemen|Bani Ismail': "Sana'a",
  'Honduras|Agalta': 'Olancho',
  'El Salvador|Cacahuatique': 'Morazán',
  'Nicaragua|Dipilto-Jalapa': 'Nueva Segovia',
  'Sri Lanka|Kotmale': 'Nuvara Ĕliya',
  'Uganda|Mount Elgon / Bugisu': 'Mbale',
  'Uganda|Rwenzori': 'Kasese',
  'Uganda|South-Western Highlands': 'Kabale',
  'DR Congo|North Kivu': 'Nord-Kivu',
  'DR Congo|South Kivu': 'Sud-Kivu',
  'Haiti|Beaumont': "Grand'Anse",
  'Haiti|Cornillon': 'Ouest',
  'Haiti|Belle-Anse / Dondon': 'Sud-Est',
}

/**
 * The polygon to highlight for a region: an admin-1 province if it matches, else a
 * vendored admin-2 unit, else the curated parent province, else null (no map).
 */
export function resolveHighlight(
  admin1: ProvinceFeature[],
  admin2: ProvinceFeature[] | null,
  country: string,
  name: string,
  matchTerms: string[],
): ProvinceFeature | null {
  const province = matchProvince(admin1, name, matchTerms)
  if (province) return province
  if (admin2 && admin2.length) {
    const district = matchProvince(admin2, name, matchTerms)
    if (district) return district
  }
  // Tolerate a trailing parenthetical in the region name (e.g. "Mount Elgon / Bugisu
  // (Sebei)") when keying the parent map.
  const bare = name.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim()
  const parent = PARENT_PROVINCE[`${country}|${name}`] ?? PARENT_PROVINCE[`${country}|${bare}`]
  if (parent) {
    const t = normalizeRegionText(parent)
    const pf = admin1.find((f) => normalizeRegionText(f.properties.name) === t)
    if (pf) return pf
  }
  return null
}

// Pick the province matching the region: prefer an exact normalized-name hit, else a
// containment hit (so "Shan State" finds the "Shan" province).
export function matchProvince(
  features: ProvinceFeature[],
  regionName: string,
  matchTerms: string[],
): ProvinceFeature | null {
  const tokens = [regionName, ...matchTerms].map(normalizeRegionText).filter(Boolean)
  for (const f of features) {
    if (tokens.includes(normalizeRegionText(f.properties.name))) return f
  }
  for (const f of features) {
    const fn = normalizeRegionText(f.properties.name)
    if (fn && tokens.some((t) => fn.includes(t) || t.includes(fn))) return f
  }
  return null
}

export type Projector = (c: [number, number]) => [number, number]

export function buildProjector(
  features: ProvinceFeature[],
  width: number,
  height: number,
  pad: number,
): Projector {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  const scan = (coords: unknown): void => {
    const c = coords as number[] | number[][]
    if (typeof (c as number[])[0] === 'number') {
      const [lng, lat] = c as number[]
      if (lng < minX) minX = lng
      if (lng > maxX) maxX = lng
      if (lat < minY) minY = lat
      if (lat > maxY) maxY = lat
    } else {
      ;(c as number[][]).forEach(scan)
    }
  }
  features.forEach((f) => scan(f.geometry.coordinates))

  const midLat = (((minY + maxY) / 2) * Math.PI) / 180
  const kx = Math.cos(midLat) // compress longitude toward the poles
  const w = (maxX - minX) * kx
  const h = maxY - minY
  const scale = Math.min((width - 2 * pad) / w, (height - 2 * pad) / h)
  const offX = (width - w * scale) / 2
  const offY = (height - h * scale) / 2
  return ([lng, lat]) => [offX + (lng - minX) * kx * scale, offY + (maxY - lat) * scale]
}

function ringPath(ring: number[][], proj: Projector): string {
  return (
    ring
      .map((c, i) => {
        const [x, y] = proj(c as [number, number])
        return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`
      })
      .join(' ') + 'Z'
  )
}

export function featurePath(geom: Geom, proj: Projector): string {
  if (geom.type === 'Polygon') {
    return geom.coordinates.map((ring) => ringPath(ring, proj)).join(' ')
  }
  return geom.coordinates.map((poly) => poly.map((ring) => ringPath(ring, proj)).join(' ')).join(' ')
}
