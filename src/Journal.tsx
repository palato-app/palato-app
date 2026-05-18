import { useUserRatings, type RatedCoffee } from './lib/useUserRatings'

const ROAST_LABELS: Record<string, string> = {
  light: 'Light',
  medium_light: 'Medium-light',
  medium: 'Medium',
  medium_dark: 'Medium-dark',
  dark: 'Dark',
  unspecified: '',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
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
  } as const,
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
  } as const,
  heroMeta: {
    textAlign: 'right' as const,
    fontSize: '0.95rem',
    opacity: 0.7,
    lineHeight: 1.4,
  } as const,
  emptyState: {
    textAlign: 'center' as const,
    padding: '6rem 2rem',
  } as const,
  emptyHeadline: {
    fontFamily: '"Instrument Serif", serif',
    fontStyle: 'italic' as const,
    fontSize: '3rem',
    color: '#1E1410',
    opacity: 0.45,
    margin: '0 0 0.5rem',
  } as const,
  emptyHint: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.95rem',
    color: '#1E1410',
    opacity: 0.5,
    margin: 0,
  } as const,
  list: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  } as const,
  card: {
    display: 'flex',
    gap: '1.5rem',
    padding: '1.5rem',
    border: '1px solid rgba(30, 20, 16, 0.15)',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.25)',
    width: '100%',
    fontFamily: 'inherit',
    color: 'inherit',
    textAlign: 'left' as const,
    cursor: 'pointer' as const,
    transition: 'border-color 0.15s, transform 0.15s',
  } as const,
  cardImage: {
    width: '100px',
    height: '100px',
    objectFit: 'cover' as const,
    borderRadius: '6px',
    border: '1px solid rgba(30, 20, 16, 0.15)',
    background: 'rgba(30, 20, 16, 0.05)',
    flexShrink: 0,
  } as const,
  cardContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    minWidth: 0,
  } as const,
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    gap: '1rem',
    marginBottom: '0.5rem',
  } as const,
  cardHeaderText: {
    flex: 1,
    minWidth: 0,
  } as const,
  cardEyebrow: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
    color: '#1E1410',
    opacity: 0.6,
    margin: '0 0 0.2rem',
  } as const,
  cardName: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: '1.5rem',
    lineHeight: 1.15,
    color: '#1E1410',
    margin: 0,
    letterSpacing: '-0.01em',
  } as const,
  cardRating: {
    fontFamily: '"Instrument Serif", serif',
    fontStyle: 'italic' as const,
    fontSize: '2.25rem',
    color: '#D94E1F',
    lineHeight: 1,
    flexShrink: 0,
  } as const,
  cardNotes: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.95rem',
    color: '#1E1410',
    opacity: 0.85,
    lineHeight: 1.5,
    margin: '0.5rem 0 0',
  } as const,
  cardChips: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.35rem',
    marginTop: '0.75rem',
  } as const,
  chip: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.75rem',
    padding: '0.25rem 0.7rem',
    borderRadius: '100px',
    border: '1px solid',
    fontWeight: 500,
  } as const,
}

type Props = {
  onSelectCoffee: (coffeeId: string) => void
}

export function Journal({ onSelectCoffee }: Props) {
  const { ratings, loading, error } = useUserRatings()

  if (loading) return <p style={{ opacity: 0.5, marginTop: '3rem' }}>Loading…</p>
  if (error)
    return (
      <p style={{ color: '#D94E1F', marginTop: '3rem' }}>
        Couldn't load your journal: {error}
      </p>
    )

  if (ratings.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <p style={styles.emptyHeadline}>No ratings yet.</p>
          <p style={styles.emptyHint}>Pop the bag.</p>
        </div>
      </div>
    )
  }

  const totalDescriptors = ratings.reduce((sum, r) => sum + r.descriptors.length, 0)
  const uniqueRoasters = new Set(
    ratings.map((r) => r.coffee?.roaster_name).filter(Boolean)
  ).size
  const firstDate = ratings[ratings.length - 1].created_at

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <div>
          <p style={styles.heroEyebrow}>Your journal</p>
          <h2 style={styles.heroHeadline}>
            The <em style={styles.heroEm}>cups</em>.
          </h2>
        </div>
        <div style={styles.heroMeta}>
          <strong style={{ fontWeight: 600, opacity: 0.95 }}>
            {ratings.length} {ratings.length === 1 ? 'rating' : 'ratings'}
          </strong>
          <br />
          {uniqueRoasters} {uniqueRoasters === 1 ? 'roaster' : 'roasters'} · {totalDescriptors} flavor{' '}
          {totalDescriptors === 1 ? 'note' : 'notes'}
          <br />
          <span style={{ opacity: 0.5 }}>since {formatDate(firstDate)}</span>
        </div>
      </section>

      <div style={styles.list}>
        {ratings.map((r) => (
          <RatingCard
            key={r.id}
            rating={r}
            onClick={() => r.coffee && onSelectCoffee(r.coffee.id)}
          />
        ))}
      </div>
    </div>
  )
}

function RatingCard({
  rating,
  onClick,
}: {
  rating: RatedCoffee
  onClick: () => void
}) {
  const coffee = rating.coffee
  if (!coffee) return null

  const roastLabel = coffee.roaster_stated_roast_level
    ? ROAST_LABELS[coffee.roaster_stated_roast_level] ?? ''
    : ''

  return (
    <button onClick={onClick} style={styles.card}>
      {coffee.bag_image_url ? (
        <img
          src={coffee.bag_image_url}
          alt={`${coffee.coffee_name} bag`}
          style={styles.cardImage}
        />
      ) : (
        <div style={styles.cardImage} />
      )}

      <div style={styles.cardContent}>
        <div style={styles.cardHeader}>
          <div style={styles.cardHeaderText}>
            <p style={styles.cardEyebrow}>
              {coffee.roaster_name}
              {roastLabel && ` · ${roastLabel}`} · {formatDate(rating.created_at)}
            </p>
            <h3 style={styles.cardName}>{coffee.coffee_name}</h3>
          </div>
          <div style={styles.cardRating}>{rating.rating.toFixed(1)}</div>
        </div>

        {rating.user_tasting_notes && (
          <p style={styles.cardNotes}>{rating.user_tasting_notes}</p>
        )}

        {rating.descriptors.length > 0 && (
          <div style={styles.cardChips}>
            {rating.descriptors.map((d) => {
              const iconColor = d.category_icon_color ?? '#1E1410'
              const tintColor = d.category_pill_tint ?? 'rgba(30, 20, 16, 0.06)'
              return (
                <span
                  key={d.id}
                  style={{
                    ...styles.chip,
                    background: tintColor,
                    color: iconColor,
                    borderColor: `${iconColor}40`,
                  }}
                >
                  {d.descriptor}
                </span>
              )
            })}
          </div>
        )}
      </div>
    </button>
  )
}