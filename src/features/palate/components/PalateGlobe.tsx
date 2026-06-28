import { lazy, Suspense, useMemo } from 'react'
import { GlobeFallback } from '../../learn/components/GlobeFallback'

// Lazy so three.js stays in its own async chunk and never lands in Palate's main bundle.
const LearnGlobe = lazy(() => import('../../learn/components/LearnGlobe'))

// Cheap WebGL probe — if it fails, render nothing; the frontier list below still works.
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

type Props = {
  onSelectCountry: (country: string) => void
  isHighlighted: (adminName: string) => boolean
  capColor: (adminName: string) => string | null
  capAltitude: (adminName: string) => number | null
  noteFor: (adminName: string) => string
}

/** The Learn globe, dropped onto the Palate dashboard with an external highlight set. */
export function PalateGlobe(props: Props) {
  const canWebGL = useMemo(webglAvailable, [])
  if (!canWebGL) return null
  return (
    <Suspense fallback={<GlobeFallback />}>
      <LearnGlobe {...props} autoRotate={false} />
    </Suspense>
  )
}
