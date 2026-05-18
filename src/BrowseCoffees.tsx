import { useCoffees, type Coffee } from './lib/useCoffees'

const ROAST_LABELS: Record<string, string> = {
  light: 'Light',
  medium_light: 'Medium-light',
  medium: 'Medium',
  medium_dark: 'Medium-dark',
  dark: 'Dark',
  unspecified: '',
}

const styles = {
  container: { marginTop: '4rem' } as const,
  hero: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
    marginBottom: '5rem',
    alignItems: 'end',
  } as const,
  heroEyebrow: {
    fontFamily: 'Geist, system-ui, sans-serif',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.18em',
    fontSize: '0.75rem',
    color: '#D94E1F',
    margin: '0 0 0.75rem',
    fontWeight: 600,
  },
  heroHeadline: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: 'clamp(3.5rem, 7vw, 6rem)',
    lineHeight: 0.95,
    letterSpacing: '-0.025em',
    margin: 0,
    fontWeight: 400,
  } as const,
  heroEm: {
    fontStyle: 'italic' as const,
    color: '#D94E1F',
  },
  heroMeta: {
    textAlign: 'right' as const,
    fontSize: '0.95rem',
    opacity: 0.7,
    lineHeight: 1.4,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '2rem',
  } as const,
  card: {
    display: 'flex',
    flexDirection: 'column' as const,
    border: '1px solid rgba(30, 20, 16, 0.2)',
    borderRadius: '12px',
    overflow: 'hidden' as const,
    background: 'rgba(255, 255, 255, 0.25)',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: '1 / 1',
    background: 'rgba(30, 20, 16, 0.05)',
    overflow: 'hidden' as const,
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    display: 'block',
  },
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
    fontSize: '0.95rem',
  } as const,
  cardBody: {
    padding: '1rem 1.1rem 1.25rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  cardRoaster: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
    color: '#1E1410',
    opacity: 0.6,
  } as const,
  cardName: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: '1.35rem',
    lineHeight: 1.15,
    letterSpacing: '-0.01em',
    color: '#1E1410',
    margin: '0.1rem 0 0.4rem',
  },
  cardMeta: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.85rem',
    color: '#1E1410',
    opacity: 0.7,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  cardMetaDot: {
    opacity: 0.5,
  },
}

export function BrowseCoffees() {
  const { coffees, loading, error } = useCoffees()

  if (loading) return <p style={{ opacity: 0.5 }}>Loading coffees…</p>
  if (error) return <p style={{ color: '#D94E1F' }}>Couldn't load coffees: {error}</p>

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <div>
          <p style={styles.heroEyebrow}>The catalog</p>
          <h2 style={styles.heroHeadline}>
            What's <em style={styles.heroEm}>good</em>.
          </h2>
        </div>
        <div style={styles.heroMeta}>
          <strong style={{ fontWeight: 600, opacity: 0.95 }}>{coffees.length} coffees</strong>
          <br />
          from {new Set(coffees.map((c) => c.roaster_name)).size} roasters
          <br />
          <span style={{ opacity: 0.5 }}>v01 · May 2026</span>
        </div>
      </section>

      <div style={styles.grid}>
        {coffees.map((coffee) => (
          <CoffeeCard key={coffee.id} coffee={coffee} />
        ))}
      </div>
    </div>
  )
}

function CoffeeCard({ coffee }: { coffee: Coffee }) {
  const roastLabel = coffee.roaster_stated_roast_level
    ? ROAST_LABELS[coffee.roaster_stated_roast_level] ?? ''
    : ''

  return (
    <article style={styles.card}>
      <div style={styles.imageWrapper}>
        {coffee.bag_image_url ? (
          <img src={coffee.bag_image_url} alt={`${coffee.coffee_name} bag`} style={styles.image} />
        ) : (
          <div style={styles.imagePlaceholder}>no photo</div>
        )}
      </div>
      <div style={styles.cardBody}>
        <div style={styles.cardRoaster}>{coffee.roaster_name}</div>
        <h3 style={styles.cardName}>{coffee.coffee_name}</h3>
        <div style={styles.cardMeta}>
          {coffee.origin_country && <span>{coffee.origin_country}</span>}
          {coffee.origin_country && roastLabel && <span style={styles.cardMetaDot}>·</span>}
          {roastLabel && <span>{roastLabel}</span>}
        </div>
      </div>
    </article>
  )
}