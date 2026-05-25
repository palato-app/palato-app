import type { PalateProfile } from '../data/types'
import { recommendationMaturity } from '../data/maturity'
import { theme, PROCESS_LABELS, ROAST_LABELS } from '../palateTheme'
import { ModuleCard } from './ModuleCard'
import { parseEmphasis } from './EditorialRead'
import { track } from '../../../lib/track'

const styles = {
  rec: {
    display: 'flex',
    gap: '14px',
    alignItems: 'flex-start',
    marginTop: '12px',
  } as const,
  thumb: {
    width: '54px',
    height: '78px',
    flexShrink: 0,
    borderRadius: '8px',
    background: `linear-gradient(160deg, ${theme.ember}, ${theme.emberDark})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as const,
  thumbText: {
    fontFamily: theme.wordmarkFont,
    fontSize: '9px',
    color: theme.cream,
    textTransform: 'lowercase' as const,
    transform: 'rotate(-90deg)',
    whiteSpace: 'nowrap' as const,
    letterSpacing: '0.5px',
  } as const,
  name: {
    fontFamily: theme.displayFont,
    fontSize: '20px',
    lineHeight: 1.1,
    margin: 0,
  } as const,
  meta: {
    fontSize: '12px',
    color: theme.ink50,
    marginTop: '3px',
    letterSpacing: '0.2px',
  } as const,
  reason: {
    fontFamily: theme.displayFont,
    fontSize: '16px',
    lineHeight: 1.34,
    color: theme.ink70,
    marginTop: '11px',
  } as const,
  locked: {
    marginTop: '12px',
    border: `1px dashed ${theme.ink15}`,
    borderRadius: '12px',
    padding: '22px 16px',
    textAlign: 'center' as const,
  } as const,
  lockedTitle: {
    fontFamily: theme.displayFont,
    fontSize: '18px',
    color: theme.ink70,
    margin: 0,
  } as const,
  lockedSub: {
    fontSize: '12px',
    color: theme.ink50,
    marginTop: '6px',
    lineHeight: 1.5,
  } as const,
}

type Props = {
  profile: PalateProfile
}

export function WhatsNext({ profile }: Props) {
  const maturity = recommendationMaturity(profile)
  const rec = profile.recommendation

  const handleClick = () => {
    track('palate_recommendation_clicked', {
      coffeeName: rec?.coffeeName,
      roaster: rec?.roaster,
    })
  }

  return (
    <ModuleCard title="What's next" tag="preview · v1.1 engine">
      {maturity === 'locked' || !rec ? (
        <div style={styles.locked}>
          <p style={styles.lockedTitle}>We're still learning your palate</p>
          <p style={styles.lockedSub}>
            A few more ratings and we'll start pointing you
            <br />
            somewhere worth your $22.
          </p>
        </div>
      ) : (
        <div onClick={handleClick} style={{ cursor: 'pointer' }}>
          <div style={styles.rec}>
            <div style={styles.thumb}>
              <span style={styles.thumbText}>
                {rec.roaster.split(' ')[0].toLowerCase()}
              </span>
            </div>
            <div>
              <p style={styles.name}>{rec.coffeeName}</p>
              <p style={styles.meta}>
                {rec.roaster} · {PROCESS_LABELS[rec.process] ?? rec.process} ·{' '}
                {ROAST_LABELS[rec.roastLevel] ?? rec.roastLevel}
              </p>
            </div>
          </div>
          <p style={styles.reason}>{parseEmphasis(rec.reason)}</p>
        </div>
      )}
    </ModuleCard>
  )
}
