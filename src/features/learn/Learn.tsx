import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { CountryPanel } from './components/CountryPanel'
import { RegionDetail } from './components/RegionDetail'
import { GlobeFallback } from './components/GlobeFallback'
import { GlobeLegend } from './components/GlobeLegend'
import { AboutData } from './components/AboutData'
import { CountryDirectory } from './components/CountryDirectory'
import { findRegion, originByCountry } from './data/originsData'

// Lazy so three.js lands in its own async chunk, never the main bundle.
const LearnGlobe = lazy(() => import('./components/LearnGlobe'))

// Cheap WebGL capability probe — if it fails, skip the globe and lean on the directory.
function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return (
      !!window.WebGLRenderingContext &&
      !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

const espresso = '#1E1410'
const ember = '#D94E1F'
const ink70 = 'rgba(30,20,16,0.70)'
const serif = '"Instrument Serif", serif'
const sans = 'Geist, system-ui, sans-serif'

const INTRO = 'Learn about where coffee comes from.'

// Drill-down: world -> country -> region. Held locally (intra-tab nav). A discriminated
// union keeps invalid states unrepresentable.
type LearnLevel =
  | { level: 'world' }
  | { level: 'country'; country: string }
  | { level: 'region'; country: string; regionSlug: string }

const styles = {
  container: { marginTop: '2rem', maxWidth: '720px' } as const,
  eyebrow: {
    fontFamily: sans,
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    color: ember,
    margin: '0 0 0.75rem',
  } as const,
  intro: {
    fontFamily: serif,
    fontSize: 'clamp(1.6rem, 4vw, 2.1rem)',
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
    color: espresso,
    margin: '0 0 2rem',
    maxWidth: '520px',
  } as const,
  globeWrap: { margin: '0 0 1.5rem' } as const,
  globeHint: {
    fontFamily: sans,
    fontSize: '0.85rem',
    color: ink70,
    textAlign: 'center' as const,
    margin: '0.75rem auto 0',
    maxWidth: '440px',
    lineHeight: 1.4,
  } as const,
}

type Props = {
  onBrowseOrigin: (country: string) => void
  onSelectCoffee: (coffeeId: string) => void
}

/**
 * The Learn tab: an interactive Globe → Country → Region drill-down that connects the cup
 * to the soil it came from. Content comes from the verified origins markdown (Decision
 * #056), parsed at load. The world level shows the globe plus a sectioned directory.
 */
export function Learn({ onBrowseOrigin, onSelectCoffee }: Props) {
  const [nav, setNav] = useState<LearnLevel>({ level: 'world' })
  const canWebGL = useMemo(() => webglAvailable(), [])

  // The drill-down swaps content in place, so a click far down the world
  // directory otherwise opens the country page at that same scroll offset.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [nav])

  const selectCountry = (country: string) => {
    if (originByCountry(country)) setNav({ level: 'country', country })
  }

  if (nav.level === 'region') {
    const region = findRegion(nav.regionSlug)
    if (region) {
      return (
        <RegionDetail
          region={region}
          onBack={() => setNav({ level: 'country', country: nav.country })}
          onSelectCoffee={onSelectCoffee}
          onBrowseOrigin={onBrowseOrigin}
        />
      )
    }
    setNav({ level: 'country', country: nav.country })
    return null
  }

  if (nav.level === 'country') {
    const origin = originByCountry(nav.country)
    if (origin) {
      return (
        <CountryPanel
          origin={origin}
          onBack={() => setNav({ level: 'world' })}
          onSelectRegion={(slug) =>
            setNav({ level: 'region', country: nav.country, regionSlug: slug })
          }
          onBrowseOrigin={onBrowseOrigin}
        />
      )
    }
    setNav({ level: 'world' })
    return null
  }

  // World level — the spinning globe plus the sectioned directory below it.
  return (
    <div style={styles.container}>
      <p style={styles.eyebrow}>Learn</p>
      <h1 style={styles.intro}>{INTRO}</h1>

      {canWebGL && (
        <div style={styles.globeWrap}>
          <Suspense fallback={<GlobeFallback />}>
            <LearnGlobe onSelectCountry={selectCountry} />
          </Suspense>
          <GlobeLegend />
          <p style={styles.globeHint}>
            Spin and pinch to zoom — tap a highlighted origin, or pick one from the list below.
          </p>
        </div>
      )}

      <AboutData />
      <CountryDirectory onSelect={selectCountry} />
    </div>
  )
}
