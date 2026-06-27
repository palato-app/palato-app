import { useMemo } from 'react'
import { theme } from '../../palate/palateTheme'
import {
  buildProjector,
  featurePath,
  matchProvince,
  useCountryProvinces,
} from '../lib/provinceMap'

// The big region locator: the country's provinces drawn faintly with the matched growing
// region highlighted. Renders nothing when the region has no province match (those zones
// are a later hand-sourcing task) — it never fakes a boundary.

type Props = {
  country: string
  regionName: string
  matchTerms: string[]
}

const W = 320
const H = 320

export function LocatorMap({ country, regionName, matchTerms }: Props) {
  const provinces = useCountryProvinces(country)

  const built = useMemo(() => {
    if (!provinces) return null
    const match = matchProvince(provinces, regionName, matchTerms)
    if (!match) return null
    const proj = buildProjector(provinces, W, H, 14)
    return provinces.map((f) => ({ d: featurePath(f.geometry, proj), isMatch: f === match }))
  }, [provinces, regionName, matchTerms])

  if (!built) return null

  return (
    <div style={{ margin: '0 0 1.75rem' }}>
      <p
        style={{
          fontFamily: theme.bodyFont,
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: theme.ink50,
          margin: '0 0 0.6rem',
        }}
      >
        Where it sits in {country}
      </p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', maxWidth: '340px', height: 'auto', display: 'block' }}
        role="img"
        aria-label={`Map showing ${regionName} within ${country}`}
      >
        {built
          .filter((p) => !p.isMatch)
          .map((p, i) => (
            <path key={i} d={p.d} fill="rgba(30,20,16,0.05)" stroke={theme.ink15} strokeWidth={0.5} />
          ))}
        {built
          .filter((p) => p.isMatch)
          .map((p, i) => (
            <path key={`m${i}`} d={p.d} fill={theme.ember} stroke={theme.espresso} strokeWidth={0.75} />
          ))}
      </svg>
    </div>
  )
}
