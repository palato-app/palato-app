import { theme } from '../../palate/palateTheme'

// Compact elevation slider for the country By the Numbers: the coffee-growing band drawn
// against a fixed 0-3,000 masl axis so countries compare at a glance.

const AXIS_MAX = 3000
const TICKS = [0, 1000, 2000, 3000]

type Props = {
  min: number
  max: number | null
}

const styles = {
  value: {
    fontFamily: theme.displayFont,
    fontSize: '1.4rem',
    color: theme.espresso,
    margin: '0 0 0.5rem',
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
    fontSize: '0.62rem',
    color: theme.ink35,
    whiteSpace: 'nowrap' as const,
  } as const,
}

export function ElevationBar({ min, max }: Props) {
  const hi = max !== null && max !== min ? max : min
  const left = (Math.min(min, AXIS_MAX) / AXIS_MAX) * 100
  const width = ((Math.min(hi, AXIS_MAX) - Math.min(min, AXIS_MAX)) / AXIS_MAX) * 100

  return (
    <div>
      <p style={styles.value}>
        {min.toLocaleString()}
        {max !== null && max !== min ? `-${max.toLocaleString()}` : ''} masl
      </p>
      <div style={styles.track}>
        <div
          style={{
            position: 'absolute',
            left: `${left}%`,
            width: `${Math.max(width, 2)}%`,
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
            {t === 0 ? '0' : `${t / 1000}k`}
          </span>
        ))}
      </div>
    </div>
  )
}
