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
function loadProvinces(country: string): Promise<ProvinceFeature[] | null> {
  const key = provinceFileSlug(country)
  if (!cache.has(key)) {
    cache.set(
      key,
      fetch(`/geo/admin1/${key}.geojson`)
        .then((r) => (r.ok ? r.json() : null))
        .then((g) => (g ? (g.features as ProvinceFeature[]) : null))
        .catch(() => null),
    )
  }
  return cache.get(key)!
}

/** Province features for a country (or null while loading / when unavailable). Pass null
 *  to skip (e.g. for massive countries where a card-size map is just a dot). */
export function useCountryProvinces(country: string | null): ProvinceFeature[] | null {
  const [data, setData] = useState<{ country: string; features: ProvinceFeature[] | null }>({
    country: '',
    features: null,
  })
  useEffect(() => {
    if (!country) return
    let cancelled = false
    loadProvinces(country).then((features) => {
      if (!cancelled) setData({ country, features })
    })
    return () => {
      cancelled = true
    }
  }, [country])
  return country && data.country === country ? data.features : null
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
