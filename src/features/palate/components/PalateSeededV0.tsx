import { theme } from '../../../lib/theme'
import { ROAST_LABELS_COMPACT } from '../../../lib/labels'
import type { PalateProfileRow } from '../../quiz/palateProfile'

function flavorLeanLabel(row: PalateProfileRow): string {
  if (row.flavor_unsure || row.flavor_lean === null) return 'Still forming'
  if (row.flavor_lean <= 33) return 'Bright & fruit-forward'
  if (row.flavor_lean <= 66) return 'Balanced'
  return 'Rich & chocolatey'
}

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
  facts: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1px',
    marginTop: '32px',
    border: `1px solid ${theme.ink10}`,
    borderRadius: '12px',
    overflow: 'hidden',
    background: theme.ink08,
  } as const,
  factRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    padding: '18px 20px',
    background: theme.cream,
  } as const,
  factLabel: {
    fontFamily: theme.bodyFont,
    fontSize: '11px',
    letterSpacing: '1.2px',
    textTransform: 'uppercase' as const,
    color: theme.ink50,
  } as const,
  factValue: {
    fontFamily: theme.displayFont,
    fontSize: '24px',
    lineHeight: 1,
    color: theme.espresso,
  } as const,
  factValueMuted: {
    fontFamily: theme.displayFont,
    fontStyle: 'italic' as const,
    fontSize: '20px',
    lineHeight: 1,
    color: theme.ink35,
  } as const,
  milestone: {
    marginTop: '28px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  } as const,
  milestoneDots: { display: 'flex', gap: '6px' } as const,
  dot: (filled: boolean) => ({
    width: '9px',
    height: '9px',
    borderRadius: '50%',
    background: filled ? theme.ember : theme.ink15,
  }),
  milestoneText: {
    fontFamily: theme.bodyFont,
    fontSize: '13px',
    color: theme.ink70,
  } as const,
}

type Props = {
  profile: PalateProfileRow
  ratingCount: number
}

/**
 * The quiz-seeded v0 palate (§8). A user who finished the quiz already *owns*
 * a palate, so this renders immediately from `palate_profiles` — no locked,
 * rate-to-unlock gate. The milestone is framed as sharpening, not unlocking.
 */
export function PalateSeededV0({ profile, ratingCount }: Props) {
  const flavor = flavorLeanLabel(profile)
  const flavorUnknown = profile.flavor_unsure || profile.flavor_lean === null
  const roast = profile.roast_preference ? ROAST_LABELS_COMPACT[profile.roast_preference] : null
  const origin = profile.origin_affinity

  const remaining = Math.max(0, 3 - ratingCount)

  return (
    <div style={styles.container}>
      <p style={styles.eyebrow}>your palate</p>
      <h1 style={styles.headline}>Your starting palate</h1>
      <p style={styles.sub}>Built from your quiz. It sharpens with every coffee you rate.</p>

      <div style={styles.facts}>
        <div style={styles.factRow}>
          <span style={styles.factLabel}>Flavor lean</span>
          <span style={flavorUnknown ? styles.factValueMuted : styles.factValue}>{flavor}</span>
        </div>
        <div style={styles.factRow}>
          <span style={styles.factLabel}>Roast preference</span>
          <span style={roast ? styles.factValue : styles.factValueMuted}>
            {roast ?? 'Still forming'}
          </span>
        </div>
        <div style={styles.factRow}>
          <span style={styles.factLabel}>Origin affinity</span>
          <span style={origin ? styles.factValue : styles.factValueMuted}>{origin ?? '—'}</span>
        </div>
      </div>

      {remaining > 0 && (
        <div style={styles.milestone}>
          <div style={styles.milestoneDots}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={styles.dot(i < ratingCount)} />
            ))}
          </div>
          <span style={styles.milestoneText}>
            Rate {remaining} {remaining === 1 ? 'coffee' : 'coffees'} to sharpen your palate
          </span>
        </div>
      )}
    </div>
  )
}
