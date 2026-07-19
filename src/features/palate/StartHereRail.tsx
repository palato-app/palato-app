import { usePalateProfileRow } from './data/usePalateProfileRow'
import { theme } from '../../lib/theme'
import { ROAST_LABELS_COMPACT, toRoastBucketKey } from '../../lib/labels'
import { CoffeePlaceholder } from '../../components/CoffeePlaceholder'
import type { Coffee } from '../../lib/useCoffees'
import type { PalateProfileRow } from '../quiz/palateProfile'

const ROAST_INDEX: Record<string, number> = {
  light: 0,
  medium_light: 1,
  medium: 2,
  medium_dark: 3,
  dark: 4,
}

const OPEN_ENDED_ORIGINS = new Set(['Somewhere else', 'Not sure yet'])

function roastTargetIndex(pref: string | null): number | null {
  if (pref === 'medium-light') return 1
  if (pref === 'medium-dark') return 3
  return null
}

/**
 * Heuristic "Start here" match (§4) — closeness to roast_preference, biased
 * toward origin_affinity, with sca_score as a quality nudge. When flavor is
 * unsure we drop the roast signal and lean on origin + highest-rated. This is
 * deliberately not the full recommendation engine.
 */
export function pickStartHere(
  coffees: Coffee[],
  profile: PalateProfileRow,
  limit = 5,
): Coffee[] {
  const concreteOrigin =
    profile.origin_affinity && !OPEN_ENDED_ORIGINS.has(profile.origin_affinity)
      ? profile.origin_affinity
      : null
  const roastTarget = profile.flavor_unsure ? null : roastTargetIndex(profile.roast_preference)

  // Never surface a coffee the user can't buy (Decisions #067/#068). A "picked
  // for you" card that leads to a dead or sold-out page breaks trust and earns
  // zero affiliate — so match only over coffees with a live buy link. Uses live
  // catalog data, so it reflects the availability check immediately (no cache).
  const buyable = coffees.filter(
    (c) => c.purchase_url != null && c.purchase_availability !== 'no',
  )

  const scored = buyable.map((c) => {
    let score = 0
    if (concreteOrigin && c.origin_country === concreteOrigin) score += 60
    if (roastTarget !== null && c.roaster_stated_roast_level) {
      const idx = ROAST_INDEX[c.roaster_stated_roast_level]
      if (idx !== undefined) score += Math.max(0, 40 - Math.abs(idx - roastTarget) * 15)
    }
    if (c.sca_score) score += Math.min(20, Math.max(0, c.sca_score - 84))
    return { c, score }
  })

  // Always returns a populated rail: when nothing matches the palate (origin
  // absent, no roast data), the sca_score / newest tiebreakers surface the
  // highest-rated coffees — the spec's flavor-unsure fallback.
  scored.sort(
    (a, b) =>
      b.score - a.score ||
      (b.c.sca_score ?? 0) - (a.c.sca_score ?? 0) ||
      b.c.created_at.localeCompare(a.c.created_at),
  )

  return scored.slice(0, limit).map((s) => s.c)
}

const styles = {
  container: { marginBottom: '3.5rem' } as const,
  eyebrow: {
    fontFamily: theme.bodyFont,
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    color: theme.ember,
    margin: '0 0 1rem',
  } as const,
  rail: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start' as const, // never let one card stretch its neighbors
    overflowX: 'auto' as const,
    paddingBottom: '0.5rem',
    scrollbarWidth: 'thin' as const,
    WebkitOverflowScrolling: 'touch' as const,
  } as const,
  card: {
    flex: '0 0 auto',
    width: '160px',
    border: `1px solid ${theme.ink15}`,
    borderRadius: '12px',
    overflow: 'hidden' as const,
    background: theme.cream,
    cursor: 'pointer',
    padding: 0,
    textAlign: 'left' as const,
    fontFamily: 'inherit',
    color: 'inherit',
  } as const,
  img: {
    width: '100%',
    aspectRatio: '1 / 1',
    objectFit: 'cover' as const,
    display: 'block',
    background: theme.ink08,
  } as const,
  imgPlaceholder: {
    width: '100%',
    aspectRatio: '1 / 1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: theme.ink08,
    fontFamily: theme.displayFont,
    fontStyle: 'italic' as const,
    fontSize: '0.85rem',
    color: theme.ink35,
  } as const,
  body: { padding: '0.7rem 0.8rem 0.9rem' } as const,
  roaster: {
    fontFamily: theme.bodyFont,
    fontSize: '0.62rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    color: theme.ink50,
    margin: 0,
  } as const,
  name: {
    fontFamily: theme.displayFont,
    fontSize: '1.05rem',
    lineHeight: 1.1,
    color: theme.espresso,
    margin: '0.2rem 0 0.3rem',
  } as const,
  meta: {
    fontFamily: theme.bodyFont,
    fontSize: '0.72rem',
    color: theme.ink50,
    margin: 0,
  } as const,
}

type Props = {
  coffees: Coffee[]
  onSelectCoffee: (coffeeId: string) => void
}

/**
 * Personalized rail above the catalog (§4). Renders only for users who have a
 * quiz-seeded palate profile; otherwise the catalog leads with its normal hero.
 */
export function StartHereRail({ coffees, onSelectCoffee }: Props) {
  const { row: profile } = usePalateProfileRow()

  if (!profile || coffees.length < 3) return null

  const picks = pickStartHere(coffees, profile)
  if (picks.length === 0) return null

  return (
    <section style={styles.container}>
      <p style={styles.eyebrow}>Start here: picked for your palate</p>
      <div style={styles.rail}>
        {picks.map((c) => {
          const roast = c.roaster_stated_roast_level
            ? ROAST_LABELS_COMPACT[toRoastBucketKey(c.roaster_stated_roast_level)] ?? ''
            : ''
          return (
            <button key={c.id} style={styles.card} onClick={() => onSelectCoffee(c.id)}>
              {c.bag_image_url ? (
                <img src={c.bag_image_url} alt={`${c.coffee_name} bag`} style={styles.img} />
              ) : (
                <div style={styles.imgPlaceholder}>
                  <CoffeePlaceholder coffeeId={c.id} />
                </div>
              )}
              <div style={styles.body}>
                <p style={styles.roaster}>{c.roaster_name}</p>
                <h3 style={styles.name}>{c.coffee_name}</h3>
                <p style={styles.meta}>
                  {[c.origin_country, roast].filter(Boolean).join(' · ')}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
