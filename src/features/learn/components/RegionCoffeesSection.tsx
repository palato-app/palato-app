import { CoffeePlaceholder } from '../../../components/CoffeePlaceholder'
import { theme } from '../../../lib/theme'
import { useRegionCoffees } from '../hooks/useRegionCoffees'
import type { OriginRegion } from '../data/originsData'
import { ROAST_LABELS } from '../../../lib/labels'

// "Coffees from this region" — the connective tissue back to the atomic action
// (rate a coffee). Read-time matched via useRegionCoffees (no DB query). The
// catalog deep-link CTA stays country-level for now (BrowseCoffees has no region
// filter — see TECH_DEBT).

type Props = {
  region: OriginRegion
  onSelectCoffee: (coffeeId: string) => void
  onBrowseOrigin: (country: string) => void
}

const styles = {
  heading: {
    fontFamily: theme.displayFont,
    fontSize: '1.6rem',
    color: theme.espresso,
    margin: '0 0 0.25rem',
  } as const,
  sub: {
    fontFamily: theme.bodyFont,
    fontSize: '0.85rem',
    color: theme.ink50,
    margin: '0 0 1.25rem',
  } as const,
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '1.25rem',
  } as const,
  card: {
    display: 'flex',
    flexDirection: 'column' as const,
    border: `1px solid ${theme.ink15}`,
    borderRadius: '12px',
    overflow: 'hidden' as const,
    background: 'rgba(255, 255, 255, 0.25)',
    padding: 0,
    fontFamily: 'inherit',
    color: 'inherit',
    textAlign: 'left' as const,
    cursor: 'pointer' as const,
    width: '100%',
  } as const,
  imageWrapper: {
    width: '100%',
    aspectRatio: '1 / 1',
    background: theme.ink08,
    overflow: 'hidden' as const,
  } as const,
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    display: 'block',
  } as const,
  cardBody: { padding: '0.85rem 1rem 1.1rem' } as const,
  cardRoaster: {
    fontFamily: theme.bodyFont,
    fontSize: '0.65rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
    color: theme.ink50,
  } as const,
  cardName: {
    fontFamily: theme.displayFont,
    fontSize: '1.2rem',
    lineHeight: 1.15,
    color: theme.espresso,
    margin: '0.15rem 0 0.35rem',
  } as const,
  cardMeta: {
    fontFamily: theme.bodyFont,
    fontSize: '0.8rem',
    color: theme.ink70,
  } as const,
  empty: {
    border: `1px dashed ${theme.ink15}`,
    borderRadius: '12px',
    padding: '1.75rem 1.5rem',
    textAlign: 'center' as const,
  } as const,
  emptyHead: {
    fontFamily: theme.displayFont,
    fontStyle: 'italic' as const,
    fontSize: '1.25rem',
    color: theme.espresso,
    margin: '0 0 0.35rem',
  } as const,
  emptyHint: {
    fontFamily: theme.bodyFont,
    fontSize: '0.85rem',
    color: theme.ink50,
    margin: 0,
  } as const,
  link: {
    marginTop: '1.25rem',
    display: 'inline-block',
    background: 'none',
    border: 'none',
    fontFamily: theme.bodyFont,
    fontSize: '0.95rem',
    fontWeight: 600,
    color: theme.ember,
    cursor: 'pointer' as const,
    padding: 0,
  } as const,
}

export function RegionCoffeesSection({ region, onSelectCoffee, onBrowseOrigin }: Props) {
  const { coffees, loading, error } = useRegionCoffees(region)

  return (
    <section style={{ marginTop: '2.5rem' }}>
      <h2 style={styles.heading}>Coffees from {region.name}</h2>
      <p style={styles.sub}>
        {loading
          ? 'Finding coffees…'
          : coffees.length > 0
            ? `${coffees.length} in the catalog right now`
            : 'None in the catalog yet'}
      </p>

      {error && (
        <p style={{ ...styles.emptyHint, color: theme.ember }}>Couldn’t load coffees: {error}</p>
      )}

      {!loading && coffees.length === 0 && (
        <div style={styles.empty}>
          <p style={styles.emptyHead}>No {region.name} coffees yet</p>
          <p style={styles.emptyHint}>
            As the catalog grows, coffees from {region.name} will show up here. Scanned a bag from
            this region? Add it and be the first.
          </p>
        </div>
      )}

      {coffees.length > 0 && (
        <>
          <div style={styles.grid}>
            {coffees.map((coffee) => {
              const roast = coffee.roaster_stated_roast_level
                ? ROAST_LABELS[coffee.roaster_stated_roast_level] ?? ''
                : ''
              return (
                <button
                  key={coffee.id}
                  style={styles.card}
                  onClick={() => onSelectCoffee(coffee.id)}
                >
                  <div style={styles.imageWrapper}>
                    {coffee.bag_image_url ? (
                      <img
                        src={coffee.bag_image_url}
                        alt={`${coffee.coffee_name} bag`}
                        style={styles.image}
                      />
                    ) : (
                      <CoffeePlaceholder coffeeId={coffee.id} />
                    )}
                  </div>
                  <div style={styles.cardBody}>
                    <div style={styles.cardRoaster}>{coffee.roaster_name}</div>
                    <h3 style={styles.cardName}>{coffee.coffee_name}</h3>
                    <div style={styles.cardMeta}>
                      {[coffee.origin_region, roast].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
          <button style={styles.link} onClick={() => onBrowseOrigin(region.country)}>
            Browse all {region.country} coffees →
          </button>
        </>
      )}
    </section>
  )
}
