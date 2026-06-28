import { theme } from '../../palate/palateTheme'
import { STATUS_LEGEND_COLOR } from '../data/countryStatus'

// Minimal legend for the globe's availability tiers. Uses the colors as they READ on the
// globe (composited over the dark material), not the raw cap colors. Historical origins
// aren't highlighted, so they're omitted here to keep it to three swatches.

const ITEMS: { label: string; color: string }[] = [
  { label: 'Established', color: STATUS_LEGEND_COLOR.established },
  { label: 'Emerging', color: STATUS_LEGEND_COLOR.emerging },
  { label: 'Robusta-dominant', color: STATUS_LEGEND_COLOR.robusta },
]

const styles = {
  row: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
    gap: '1rem',
    margin: '0.5rem auto 0',
  } as const,
  item: { display: 'flex', alignItems: 'center', gap: '0.4rem' } as const,
  dot: { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 } as const,
  label: {
    fontFamily: theme.bodyFont,
    fontSize: '0.75rem',
    color: theme.ink70,
  } as const,
}

export function GlobeLegend() {
  return (
    <div style={styles.row}>
      {ITEMS.map((it) => (
        <span key={it.label} style={styles.item}>
          <span style={{ ...styles.dot, background: it.color }} />
          <span style={styles.label}>{it.label}</span>
        </span>
      ))}
    </div>
  )
}
