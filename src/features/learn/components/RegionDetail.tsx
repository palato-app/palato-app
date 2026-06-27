import { theme } from '../../palate/palateTheme'
import { ElevationBand } from './ElevationBand'
import { LocatorMap } from './LocatorMap'
import { RegionCoffeesSection } from './RegionCoffeesSection'
import type { OriginRegion } from '../data/originsData'

// Region-level detail (the deepest level — farms are out of scope by design). Kept lean
// so it earns its place: the region's sub-areas, a verified region-specific elevation if
// one exists (otherwise it inherits the country band shown on the country page), and the
// catalog coffees from the region. A locator map is the next addition.

type Props = {
  region: OriginRegion
  onBack: () => void
  onSelectCoffee: (coffeeId: string) => void
  onBrowseOrigin: (country: string) => void
}

const styles = {
  container: { marginTop: '2rem', maxWidth: '720px' } as const,
  back: {
    background: 'none',
    border: 'none',
    color: theme.ink50,
    fontFamily: theme.bodyFont,
    fontSize: '0.85rem',
    cursor: 'pointer' as const,
    padding: 0,
    margin: '0 0 1.5rem',
  } as const,
  eyebrow: {
    fontFamily: theme.bodyFont,
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    color: theme.ember,
    margin: '0 0 0.5rem',
  } as const,
  name: {
    fontFamily: theme.displayFont,
    fontSize: 'clamp(2.75rem, 8vw, 4rem)',
    lineHeight: 0.95,
    letterSpacing: '-0.02em',
    color: theme.espresso,
    margin: 0,
  } as const,
  detail: {
    fontFamily: theme.displayFont,
    fontStyle: 'italic' as const,
    fontSize: '1.25rem',
    lineHeight: 1.35,
    color: theme.ink70,
    margin: '0.6rem 0 2rem',
  } as const,
  sectionLabel: {
    fontFamily: theme.bodyFont,
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: theme.ink50,
    margin: '0 0 0.5rem',
  } as const,
  prose: {
    fontFamily: theme.bodyFont,
    fontSize: '1rem',
    lineHeight: 1.6,
    color: theme.espresso,
    opacity: 0.85,
    margin: '0 0 2rem',
  } as const,
}

export function RegionDetail({ region, onBack, onSelectCoffee, onBrowseOrigin }: Props) {
  return (
    <div style={styles.container}>
      <button style={styles.back} onClick={onBack}>
        ← {region.country}
      </button>

      <p style={styles.eyebrow}>{region.country}</p>
      <h1 style={styles.name}>{region.name}</h1>
      {region.detail && <p style={styles.detail}>{region.detail}</p>}

      <LocatorMap
        country={region.country}
        regionName={region.name}
        matchTerms={region.matchTerms}
      />

      {/* Elevation lives on the country page; show it here only when this region has a
          verified figure that deviates from the country band. */}
      {region.elevation.basis === 'region' && <ElevationBand elevation={region.elevation} />}

      <RegionCoffeesSection
        region={region}
        onSelectCoffee={onSelectCoffee}
        onBrowseOrigin={onBrowseOrigin}
      />
    </div>
  )
}
