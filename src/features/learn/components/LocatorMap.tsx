import { useMemo } from 'react'
import { theme } from '../../../lib/theme'
import {
  buildProjector,
  featurePath,
  resolveHighlight,
  useCountryAdmin2,
  useCountryProvinces,
} from '../lib/provinceMap'

// The big region locator: the country's provinces drawn faintly with the growing region
// highlighted — an admin-1 province, a vendored admin-2 district, or the curated parent
// province. Renders nothing when the region resolves to no boundary (we never fake one).

type Props = {
  country: string
  regionName: string
  matchTerms: string[]
}

const W = 320
const H = 320

export function LocatorMap({ country, regionName, matchTerms }: Props) {
  const provinces = useCountryProvinces(country)
  const admin2 = useCountryAdmin2(country)

  const built = useMemo(() => {
    if (!provinces) return null
    const hl = resolveHighlight(provinces, admin2, country, regionName, matchTerms)
    if (!hl) return null
    const proj = buildProjector(provinces, W, H, 14)
    return {
      outline: provinces.map((f) => featurePath(f.geometry, proj)),
      highlightD: featurePath(hl.geometry, proj),
    }
  }, [provinces, admin2, country, regionName, matchTerms])

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
        {built.outline.map((d, i) => (
          <path key={i} d={d} fill="rgba(30,20,16,0.05)" stroke={theme.ink15} strokeWidth={0.5} />
        ))}
        <path d={built.highlightD} fill={theme.ember} stroke={theme.espresso} strokeWidth={0.75} />
      </svg>
    </div>
  )
}
