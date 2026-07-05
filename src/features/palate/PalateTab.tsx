import { useNavigate } from 'react-router-dom'
import { useRatingCount } from './data/useRatingCount'
import { usePalateProfileRow } from './data/usePalateProfileRow'
import { PalateDashboard } from './PalateDashboard'
import { PalateSeededV0 } from './components/PalateSeededV0'
import { RecentRatings } from './components/RecentRatings'
import { theme } from '../../lib/theme'
import { aspirationFocus } from '../quiz/quizConfig'

const SHARPEN_THRESHOLD = 3

const styles = {
  container: { marginTop: '2rem', maxWidth: '600px' } as const,
  eyebrow: {
    fontFamily: theme.bodyFont,
    fontSize: '11px',
    letterSpacing: '1.6px',
    textTransform: 'uppercase' as const,
    color: theme.ink50,
    margin: 0,
  } as const,
  headline: {
    fontFamily: theme.displayFont,
    fontWeight: 400,
    fontSize: '44px',
    lineHeight: 1.02,
    letterSpacing: '-0.4px',
    margin: '4px 0 0',
  } as const,
  sub: {
    fontFamily: theme.displayFont,
    fontSize: '20px',
    lineHeight: 1.3,
    color: theme.ink70,
    margin: '12px 0 0',
  } as const,
  cta: {
    marginTop: '24px',
    padding: '14px 28px',
    backgroundColor: theme.ember,
    color: theme.cream,
    border: 'none',
    borderRadius: '100px',
    fontSize: '15px',
    fontFamily: theme.bodyFont,
    fontWeight: 500,
    cursor: 'pointer',
  } as const,
  focusCard: {
    maxWidth: '600px',
    marginTop: '2rem',
    marginBottom: '0.5rem',
    padding: '1rem 1.25rem',
    borderLeft: `2px solid ${theme.ochre}`,
    background: theme.ink08,
    borderRadius: '0 10px 10px 0',
  } as const,
  focusEyebrow: {
    fontFamily: theme.bodyFont,
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    color: theme.ink50,
    margin: 0,
  } as const,
  focusLabel: {
    fontFamily: theme.displayFont,
    fontSize: '1.5rem',
    lineHeight: 1.1,
    color: theme.espresso,
    margin: '0.35rem 0 0.25rem',
  } as const,
  focusNudge: {
    fontFamily: theme.bodyFont,
    fontSize: '0.9rem',
    lineHeight: 1.4,
    color: theme.ink70,
    margin: 0,
  } as const,
}

type Props = {
  onSelectCoffee: (coffeeId: string) => void
  onGoRate: () => void
  onSeeAllRatings: () => void
  onBrowseOrigin: (country: string) => void
}

/**
 * The Palate tab (§8). Decides the top section by maturity:
 *   - 3+ ratings → the full ratings-driven dashboard.
 *   - quiz taken, <3 ratings → the seeded v0 profile (sharpening, not locked).
 *   - no quiz, <3 ratings → a prompt to take the quiz (§3d item 3).
 * The journal is nested below in every case.
 */
export function PalateTab({ onSelectCoffee, onGoRate, onSeeAllRatings, onBrowseOrigin }: Props) {
  const navigate = useNavigate()
  const { count: ratingCount } = useRatingCount()
  const { row: profile, loading } = usePalateProfileRow()

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={{ opacity: 0.5, fontFamily: theme.bodyFont }}>Loading your palate…</p>
      </div>
    )
  }

  const matured = ratingCount >= SHARPEN_THRESHOLD
  const focus = aspirationFocus(profile?.aspiration ?? null)

  return (
    <div>
      {/* The aspiration nudge is for the seeded/early state; once the palate has
          matured (3+ ratings) the dashboard speaks for itself, so hide it. */}
      {!matured && focus && (
        <div style={styles.focusCard}>
          <p style={styles.focusEyebrow}>What you're here for</p>
          <p style={styles.focusLabel}>{focus.label}</p>
          <p style={styles.focusNudge}>{focus.nudge}</p>
        </div>
      )}

      {matured ? (
        <PalateDashboard onSelectCoffee={onSelectCoffee} onBrowseOrigin={onBrowseOrigin} />
      ) : profile ? (
        <PalateSeededV0 profile={profile} ratingCount={ratingCount} />
      ) : (
        <div style={styles.container}>
          <p style={styles.eyebrow}>your palate</p>
          <h1 style={styles.headline}>Start your palate</h1>
          <p style={styles.sub}>
            Take the two-minute palate quiz and we'll give you a starting profile to sharpen.
          </p>
          <button style={styles.cta} onClick={() => navigate('/quiz')}>
            Take the palate quiz
          </button>
        </div>
      )}

      <RecentRatings
        onSelectCoffee={onSelectCoffee}
        onGoRate={onGoRate}
        onSeeAll={onSeeAllRatings}
      />
    </div>
  )
}
