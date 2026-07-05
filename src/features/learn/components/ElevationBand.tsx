import { theme } from '../../../lib/theme'
import type { Elevation } from '../data/originsData'

// Editorial 2D elevation diagram. The fixed 0-3,000 masl axis lets regions compare at a
// glance (most specialty coffee sits 1,000-2,300 m). Honors the data standard: shows the
// basis (verified for the region, inherited country band, or not yet verified) and never
// invents a number.

const AXIS_MAX = 3000
const TICKS = [0, 1000, 2000, 3000]

const BASIS_LABEL: Record<Elevation['basis'], string> = {
  region: 'Verified for this region',
  country: 'Country growing band (regions inherit this)',
  unverified: 'Not yet verified at region level',
}

type Props = {
  elevation: Elevation
}

const styles = {
  wrap: { margin: '0 0 1.75rem' } as const,
  label: {
    fontFamily: theme.bodyFont,
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: theme.ink50,
    margin: '0 0 0.6rem',
  } as const,
  value: {
    fontFamily: theme.displayFont,
    fontSize: '1.5rem',
    color: theme.espresso,
    margin: '0 0 0.2rem',
  } as const,
  basis: {
    fontFamily: theme.bodyFont,
    fontSize: '0.72rem',
    color: theme.ink50,
    margin: '0 0 0.75rem',
  } as const,
  track: {
    position: 'relative' as const,
    height: '14px',
    borderRadius: '7px',
    background: theme.ink08,
    overflow: 'hidden' as const,
  } as const,
  axis: { position: 'relative' as const, height: '1.1rem', marginTop: '0.4rem' } as const,
  tick: {
    position: 'absolute' as const,
    transform: 'translateX(-50%)',
    fontFamily: theme.bodyFont,
    fontSize: '0.65rem',
    color: theme.ink35,
    whiteSpace: 'nowrap' as const,
  } as const,
  prose: {
    fontFamily: theme.bodyFont,
    fontSize: '0.92rem',
    lineHeight: 1.5,
    color: theme.ink70,
    margin: 0,
  } as const,
}

export function ElevationBand({ elevation }: Props) {
  const { min, max, basis, raw } = elevation
  const hasNumber = min !== null

  return (
    <div style={styles.wrap}>
      <p style={styles.label}>Where it grows</p>

      {hasNumber ? (
        <>
          <p style={styles.value}>
            {min!.toLocaleString()}
            {max !== null && max !== min ? `-${max.toLocaleString()}` : ''} masl
          </p>
          <p style={styles.basis}>{BASIS_LABEL[basis]}</p>
          <div style={styles.track}>
            <div
              style={{
                position: 'absolute',
                left: `${(Math.min(min!, AXIS_MAX) / AXIS_MAX) * 100}%`,
                width: `${Math.max(
                  ((Math.min(max ?? min!, AXIS_MAX) - Math.min(min!, AXIS_MAX)) / AXIS_MAX) * 100,
                  2,
                )}%`,
                top: 0,
                bottom: 0,
                borderRadius: '7px',
                background: `linear-gradient(90deg, ${theme.ochre}, ${theme.ember})`,
              }}
            />
          </div>
          <div style={styles.axis}>
            {TICKS.map((t) => (
              <span key={t} style={{ ...styles.tick, left: `${(t / AXIS_MAX) * 100}%` }}>
                {t === 0 ? '0' : `${(t / 1000).toLocaleString()}k`}
              </span>
            ))}
          </div>
        </>
      ) : (
        <p style={styles.prose}>{raw || 'Not yet verified.'}</p>
      )}
    </div>
  )
}
