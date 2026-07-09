import { useEffect, useMemo, useRef, useState } from 'react'
import Globe, { type GlobeMethods } from 'react-globe.gl'
import * as THREE from 'three'
import { theme } from '../../../lib/theme'
import { originByCountry, originByMapName } from '../data/originsData'
import { STATUS_ALTITUDE, STATUS_COLOR } from '../data/countryStatus'

// The interactive 3D globe — the sole importer of react-globe.gl / three, so the lazy
// boundary (React.lazy in Learn) keeps three.js out of the main bundle. Highlights every
// coffee origin from the parsed data (Decision #056): full-data origins read in their
// species color and drill in; secondary (robusta / emerging) read ochre and dimmer.
// Topographic relief carries the terroir/elevation story.

const GEO_URL = '/geo/ne_110m_admin_0_countries.geojson'
const TOPO_URL = '/geo/earth-topology.png'

type CountryFeature = {
  properties: { ADMIN: string; ISO_A2: string }
}

// Origins that have no faithful country polygon at 110m (a US state, small islands) get
// a point marker at their verified location instead, so they still show on the globe.
type IslandPoint = { country: string; lat: number; lng: number }
const ISLAND_POINTS: IslandPoint[] = [
  { country: 'Hawaii', lat: 19.6, lng: -155.5 },
  { country: 'Puerto Rico', lat: 18.2, lng: -66.5 },
  { country: 'Réunion', lat: -21.1, lng: 55.5 },
]

type Props = {
  onSelectCountry: (country: string) => void
  /** Override which countries are highlighted/clickable. Default: any mapped non-historical origin. */
  isHighlighted?: (adminName: string) => boolean
  /** Cap color per country; return null to fall back to status coloring / dormant. */
  capColor?: (adminName: string) => string | null
  /** Cap altitude per country; return null to fall back to status altitude / flat. */
  capAltitude?: (adminName: string) => number | null
  /** Tooltip note suffix for a highlighted country (default: Explore → / View). */
  noteFor?: (adminName: string) => string
  /** Spin the globe (respecting reduced-motion). Default true; pass false on a dashboard. */
  autoRotate?: boolean
}

const DORMANT = 'rgba(244,234,213,0.05)'

export default function LearnGlobe({
  onSelectCountry,
  isHighlighted,
  capColor,
  capAltitude,
  noteFor,
  autoRotate = true,
}: Props) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [features, setFeatures] = useState<CountryFeature[]>([])
  const [hovered, setHovered] = useState<CountryFeature | null>(null)
  const [size, setSize] = useState({ w: 360, h: 380 })

  // Load the (vendored) country polygons.
  useEffect(() => {
    let cancelled = false
    fetch(GEO_URL)
      .then((r) => r.json())
      .then((g) => {
        if (!cancelled) setFeatures(g.features as CountryFeature[])
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  // Responsive square-ish canvas sized to the container.
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth
      setSize({ w, h: Math.min(Math.max(w, 300), 460) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Muted espresso globe with topographic relief — editorial, not a NASA photo.
  const globeMaterial = useMemo(() => {
    const m = new THREE.MeshPhongMaterial({ color: '#2a1c14', shininess: 4 })
    new THREE.TextureLoader().load(TOPO_URL, (tex) => {
      m.bumpMap = tex
      m.bumpScale = 6
      m.needsUpdate = true
    })
    return m
  }, [])

  const adminOf = (f: CountryFeature) => f.properties.ADMIN
  const statusOf = (f: CountryFeature) => originByMapName(adminOf(f))?.status
  // Highlighted belt = any mapped origin except purely historical (not a buyable source),
  // unless the caller supplies its own highlight set (e.g. Palate's tasted/frontier).
  const inBelt = (f: CountryFeature) => {
    if (isHighlighted) return isHighlighted(adminOf(f))
    const s = statusOf(f)
    return !!s && s !== 'historical'
  }

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const spin = autoRotate && !prefersReducedMotion

  const onReady = () => {
    const g = globeRef.current
    if (!g) return
    const controls = g.controls()
    controls.autoRotate = spin
    controls.autoRotateSpeed = 0.4
    // A globe has to spin and zoom (July 8, 2026 interview). Pinch/scroll zoom
    // stays clamped so you can't fly through the surface or lose the globe.
    controls.enableZoom = true
    controls.zoomSpeed = 0.6
    controls.minDistance = 135 // ~street-of-countries close-up
    controls.maxDistance = 500 // never smaller than a coin
    // Flywheel feel: drags coast to a stop instead of dying under the finger.
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    g.pointOfView({ lat: 6, lng: -40, altitude: 2.3 })
  }

  // Pause auto-rotation while the tab is backgrounded (battery).
  useEffect(() => {
    if (!spin) return
    const onVisibility = () => {
      const controls = globeRef.current?.controls()
      if (controls) controls.autoRotate = !document.hidden
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [spin])

  return (
    <div ref={wrapRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Globe
        ref={globeRef}
        width={size.w}
        height={size.h}
        backgroundColor="rgba(0,0,0,0)"
        globeMaterial={globeMaterial}
        atmosphereColor={theme.ember}
        atmosphereAltitude={0.16}
        onGlobeReady={onReady}
        polygonsData={features}
        polygonAltitude={(d) => {
          const f = d as CountryFeature
          if (f === hovered && inBelt(f)) return 0.09
          if (capAltitude) return capAltitude(adminOf(f)) ?? 0.006
          const s = statusOf(f)
          return s ? STATUS_ALTITUDE[s] : 0.006
        }}
        polygonCapColor={(d) => {
          const f = d as CountryFeature
          if (f === hovered && inBelt(f)) return theme.ember
          if (capColor) return capColor(adminOf(f)) ?? DORMANT
          const s = statusOf(f)
          if (!s || s === 'historical') return DORMANT
          return STATUS_COLOR[s]
        }}
        polygonSideColor={() => 'rgba(30,20,16,0.15)'}
        polygonStrokeColor={() => 'rgba(30,20,16,0.22)'}
        polygonLabel={(d) => {
          const f = d as CountryFeature
          if (!inBelt(f)) return ''
          const origin = originByMapName(adminOf(f))
          const name = origin?.country ?? adminOf(f)
          const note = noteFor ? noteFor(adminOf(f)) : origin?.hasFullData ? 'Explore →' : 'View'
          return `<div style="font-family:Geist,system-ui,sans-serif;font-size:12px;font-weight:600;color:#1E1410;background:#F4EAD5;padding:4px 8px;border-radius:6px;box-shadow:0 4px 12px rgba(30,20,16,0.2)">${name}<span style="opacity:0.55;font-weight:400"> · ${note}</span></div>`
        }}
        pointsData={ISLAND_POINTS}
        pointLat={(d) => (d as IslandPoint).lat}
        pointLng={(d) => (d as IslandPoint).lng}
        pointAltitude={0.02}
        pointRadius={0.5}
        pointColor={(d) => {
          const o = originByCountry((d as IslandPoint).country)
          return o ? STATUS_COLOR[o.status] : theme.ember
        }}
        pointLabel={(d) => {
          const c = (d as IslandPoint).country
          const o = originByCountry(c)
          const note = o?.hasFullData ? ' · Explore →' : ''
          return `<div style="font-family:Geist,system-ui,sans-serif;font-size:12px;font-weight:600;color:#1E1410;background:#F4EAD5;padding:4px 8px;border-radius:6px;box-shadow:0 4px 12px rgba(30,20,16,0.2)">${c}<span style="opacity:0.55;font-weight:400">${note}</span></div>`
        }}
        onPointClick={(d) => {
          const c = (d as IslandPoint).country
          if (originByCountry(c)) onSelectCountry(c)
        }}
        onPolygonHover={(d) => setHovered((d as CountryFeature) ?? null)}
        onPolygonClick={(d, _event, coords) => {
          const f = d as CountryFeature
          if (!inBelt(f)) return
          const origin = originByMapName(adminOf(f))
          if (!origin) return
          const g = globeRef.current
          if (g) {
            g.controls().autoRotate = false
            g.pointOfView({ lat: coords.lat, lng: coords.lng, altitude: 1.6 }, 900)
          }
          onSelectCountry(origin.country)
        }}
        polygonsTransitionDuration={300}
      />
    </div>
  )
}
