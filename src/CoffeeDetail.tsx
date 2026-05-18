import { useCoffee } from './lib/useCoffee'

const ROAST_LABELS: Record<string, string> = {
  light: 'Light',
  medium_light: 'Medium-light',
  medium: 'Medium',
  medium_dark: 'Medium-dark',
  dark: 'Dark',
  unspecified: '',
}

const styles = {
  container: { marginTop: '3rem' } as const,
  backLink: {
    background: 'none',
    border: 'none',
    padding: '0.5rem 0',
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.85rem',
    color: '#1E1410',
    opacity: 0.6,
    cursor: 'pointer' as const,
    marginBottom: '2.5rem',
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '3rem',
    alignItems: 'start',
  } as const,
  imageWrapper: {
    width: '100%',
    aspectRatio: '1 / 1',
    background: 'rgba(30, 20, 16, 0.05)',
    borderRadius: '12px',
    overflow: 'hidden' as const,
    border: '1px solid rgba(30, 20, 16, 0.15)',
  } as const,
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    display: 'block',
  } as const,
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1E1410',
    opacity: 0.3,
    fontFamily: '"Instrument Serif", serif',
    fontStyle: 'italic' as const,
  } as const,
  detailsColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
  } as const,
  roasterEyebrow: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
    color: '#1E1410',
    opacity: 0.7,
    margin: '0 0 0.75rem',
  } as const,
  coffeeName: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
    lineHeight: 1.0,
    letterSpacing: '-0.02em',
    margin: '0 0 2rem',
    fontWeight: 400,
  } as const,
  factGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.25rem 2rem',
    marginBottom: '2.5rem',
    paddingTop: '1.75rem',
    borderTop: '1px solid rgba(30, 20, 16, 0.15)',
  } as const,
  factLabel: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
    color: '#1E1410',
    opacity: 0.5,
    margin: '0 0 0.3rem',
  } as const,
  factValue: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: '1.15rem',
    color: '#1E1410',
    margin: 0,
    lineHeight: 1.3,
  } as const,
  rateButton: {
    padding: '1rem 2rem',
    backgroundColor: '#D94E1F',
    color: '#F4EAD5',
    border: 'none',
    borderRadius: '100px',
    fontSize: '1rem',
    fontFamily: 'Geist, system-ui, sans-serif',
    fontWeight: 500,
    cursor: 'pointer' as const,
    alignSelf: 'flex-start' as const,
  } as const,
}

type Props = {
  coffeeId: string
  onBack: () => void
  onRate: () => void
}

export function CoffeeDetail({ coffeeId, onBack, onRate }: Props) {
  const { coffee, loading, error } = useCoffee(coffeeId)

  if (loading) return <p style={{ opacity: 0.5, marginTop: '3rem' }}>Loading…</p>
  if (error) return <p style={{ color: '#D94E1F', marginTop: '3rem' }}>Couldn't load this coffee: {error}</p>
  if (!coffee) return <p style={{ opacity: 0.5, marginTop: '3rem' }}>Coffee not found.</p>

  const roastLabel = coffee.roaster_stated_roast_level
    ? ROAST_LABELS[coffee.roaster_stated_roast_level] ?? ''
    : ''

  const originDisplay = [coffee.origin_country, coffee.origin_region].filter(Boolean).join(', ')
  const processLabel = coffee.process
    ? coffee.process.charAt(0).toUpperCase() + coffee.process.slice(1).replace(/_/g, ' ')
    : ''
  const varietyDisplay = coffee.variety?.length ? coffee.variety.join(', ') : null
  const elevationDisplay = coffee.elevation_masl ? `${coffee.elevation_masl} masl` : null

  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backLink}>← Back to coffees</button>

      <section style={styles.hero}>
        <div style={styles.imageWrapper}>
          {coffee.bag_image_url ? (
            <img src={coffee.bag_image_url} alt={`${coffee.coffee_name} bag`} style={styles.image} />
          ) : (
            <div style={styles.imagePlaceholder}>no photo</div>
          )}
        </div>

        <div style={styles.detailsColumn}>
          <p style={styles.roasterEyebrow}>{coffee.roaster_name}</p>
          <h2 style={styles.coffeeName}>{coffee.coffee_name}</h2>

          <div style={styles.factGrid}>
            {originDisplay && (
              <div>
                <p style={styles.factLabel}>Origin</p>
                <p style={styles.factValue}>{originDisplay}</p>
              </div>
            )}
            {processLabel && (
              <div>
                <p style={styles.factLabel}>Process</p>
                <p style={styles.factValue}>{processLabel}</p>
              </div>
            )}
            {roastLabel && (
              <div>
                <p style={styles.factLabel}>Roast</p>
                <p style={styles.factValue}>{roastLabel}</p>
              </div>
            )}
            {varietyDisplay && (
              <div>
                <p style={styles.factLabel}>Variety</p>
                <p style={styles.factValue}>{varietyDisplay}</p>
              </div>
            )}
            {elevationDisplay && (
              <div>
                <p style={styles.factLabel}>Elevation</p>
                <p style={styles.factValue}>{elevationDisplay}</p>
              </div>
            )}
            {coffee.sca_score !== null && coffee.sca_score !== undefined && (
              <div>
                <p style={styles.factLabel}>SCA score</p>
                <p style={styles.factValue}>{coffee.sca_score}</p>
              </div>
            )}
          </div>

          <button onClick={onRate} style={styles.rateButton}>Rate this coffee</button>
        </div>
      </section>
    </div>
  )
}