import { theme } from '../palateTheme'
import { useUserRatings, type RatedCoffee } from '../../../lib/useUserRatings'
import { CoffeePlaceholder } from '../../../components/CoffeePlaceholder'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const styles = {
  container: {
    marginTop: '3.5rem',
    paddingTop: '2rem',
    borderTop: `1px solid ${theme.ink10}`,
    maxWidth: '600px',
  } as const,
  eyebrow: {
    fontFamily: theme.bodyFont,
    fontSize: '11px',
    letterSpacing: '1.6px',
    textTransform: 'uppercase' as const,
    color: theme.ink50,
    margin: '0 0 1.25rem',
  } as const,
  list: { display: 'flex', flexDirection: 'column' as const, gap: '0.75rem' } as const,
  card: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    padding: '0.9rem 1rem',
    border: `1px solid ${theme.ink10}`,
    borderRadius: '10px',
    background: theme.cream,
    width: '100%',
    textAlign: 'left' as const,
    cursor: 'pointer',
    fontFamily: 'inherit',
    color: 'inherit',
    boxSizing: 'border-box' as const,
  } as const,
  img: {
    width: '52px',
    height: '52px',
    objectFit: 'cover' as const,
    borderRadius: '6px',
    background: theme.ink08,
    flexShrink: 0,
  } as const,
  cardName: {
    fontFamily: theme.displayFont,
    fontSize: '1.2rem',
    lineHeight: 1.1,
    color: theme.espresso,
    margin: 0,
  } as const,
  cardMeta: {
    fontFamily: theme.bodyFont,
    fontSize: '0.75rem',
    color: theme.ink50,
    margin: '0.2rem 0 0',
  } as const,
  rating: {
    fontFamily: theme.displayFont,
    fontStyle: 'italic' as const,
    fontSize: '1.6rem',
    color: theme.ember,
    lineHeight: 1,
    marginLeft: 'auto',
  } as const,
  // Empty state
  emptyHeadline: {
    fontFamily: theme.displayFont,
    fontSize: '28px',
    lineHeight: 1.1,
    color: theme.espresso,
    margin: '0 0 0.5rem',
  } as const,
  emptySub: {
    fontFamily: theme.bodyFont,
    fontSize: '0.95rem',
    lineHeight: 1.5,
    color: theme.ink70,
    margin: '0 0 1.5rem',
    maxWidth: '420px',
  } as const,
  cta: {
    marginTop: '1.5rem',
    padding: '12px 26px',
    backgroundColor: theme.ember,
    color: theme.cream,
    border: 'none',
    borderRadius: '100px',
    fontSize: '15px',
    fontFamily: theme.bodyFont,
    fontWeight: 500,
    cursor: 'pointer',
  } as const,
  seeAll: {
    marginTop: '1rem',
    background: 'none',
    border: 'none',
    fontFamily: theme.bodyFont,
    fontSize: '0.85rem',
    fontWeight: 600,
    color: theme.ember,
    cursor: 'pointer',
    padding: 0,
  } as const,
}

type Props = {
  onSelectCoffee: (coffeeId: string) => void
  onGoRate: () => void
  onSeeAll: () => void
}

/**
 * The journal nested inside the Palate tab (§1a / §8): "Your Most Recent
 * Ratings", capped at the 3 latest. For a user with no ratings it shows a
 * real empty state — a headline, a ghosted sample entry so the shape is
 * visible, and a single CTA into the rating flow.
 */
export function RecentRatings({ onSelectCoffee, onGoRate, onSeeAll }: Props) {
  const { ratings, loading } = useUserRatings()

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.eyebrow}>Your most recent ratings</p>
        <p style={{ opacity: 0.5, fontFamily: theme.bodyFont }}>Loading…</p>
      </div>
    )
  }

  if (ratings.length === 0) {
    return (
      <div style={styles.container}>
        <p style={styles.eyebrow}>Your most recent ratings</p>
        <h2 style={styles.emptyHeadline}>Your journal starts with your first cup.</h2>
        <p style={styles.emptySub}>
          Every coffee you rate lands here with your notes, your score, and how you brewed it.
        </p>
        <GhostCard />
        <button style={styles.cta} onClick={onGoRate}>
          Rate your first coffee
        </button>
      </div>
    )
  }

  const recent = ratings.slice(0, 3)

  return (
    <div style={styles.container}>
      <p style={styles.eyebrow}>Your most recent ratings</p>
      <div style={styles.list}>
        {recent.map((r) => (
          <RecentCard key={r.id} rating={r} onClick={() => r.coffee && onSelectCoffee(r.coffee.id)} />
        ))}
      </div>
      {ratings.length > 3 && (
        <button style={styles.seeAll} onClick={onSeeAll}>
          See all {ratings.length} ratings →
        </button>
      )}
    </div>
  )
}

function RecentCard({ rating, onClick }: { rating: RatedCoffee; onClick: () => void }) {
  const coffee = rating.coffee
  if (!coffee) return null
  return (
    <button style={styles.card} onClick={onClick}>
      {coffee.bag_image_url ? (
        <img src={coffee.bag_image_url} alt={`${coffee.coffee_name} bag`} style={styles.img} />
      ) : (
        <CoffeePlaceholder coffeeId={coffee.id} style={styles.img} />
      )}
      <div style={{ minWidth: 0 }}>
        <p style={styles.cardName}>{coffee.coffee_name}</p>
        <p style={styles.cardMeta}>
          {coffee.roaster_name} · {formatDate(rating.created_at)}
        </p>
      </div>
      <span style={styles.rating}>{rating.rating.toFixed(1)}</span>
    </button>
  )
}

/** A visually muted sample entry so the empty journal shows its shape. */
function GhostCard() {
  return (
    <div style={{ ...styles.card, cursor: 'default', opacity: 0.4, pointerEvents: 'none' }} aria-hidden>
      <div style={styles.img} />
      <div style={{ minWidth: 0 }}>
        <p style={styles.cardName}>Ethiopia Guji Natural</p>
        <p style={styles.cardMeta}>A roaster you love · your notes, your brew</p>
      </div>
      <span style={styles.rating}>4.5</span>
    </div>
  )
}
