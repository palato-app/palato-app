import { useState } from 'react'
import { theme } from '../../palate/palateTheme'
import { METHODOLOGY } from '../data/originsData'

// The visible methodology note required by the Origins Data Standard (Decision #056):
// how the data is sourced and how altitude is interpreted, behind a subtle disclosure.

const styles = {
  wrap: {
    border: `1px solid ${theme.ink10}`,
    borderRadius: '12px',
    margin: '0 0 2.5rem',
    overflow: 'hidden' as const,
  } as const,
  toggle: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(255,255,255,0.25)',
    border: 'none',
    cursor: 'pointer' as const,
    padding: '0.85rem 1.1rem',
    fontFamily: theme.bodyFont,
    fontSize: '0.78rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: theme.ink70,
  } as const,
  body: { padding: '0 1.1rem 1.1rem' } as const,
  label: {
    fontFamily: theme.bodyFont,
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: theme.ember,
    margin: '0.9rem 0 0.35rem',
  } as const,
  prose: {
    fontFamily: theme.bodyFont,
    fontSize: '0.9rem',
    lineHeight: 1.55,
    color: theme.ink70,
    margin: 0,
  } as const,
}

export function AboutData() {
  const [open, setOpen] = useState(false)
  return (
    <div style={styles.wrap}>
      <button style={styles.toggle} onClick={() => setOpen((v) => !v)}>
        <span>About this data</span>
        <span style={{ opacity: 0.5, fontSize: '0.7rem' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={styles.body}>
          <p style={styles.label}>Sourcing</p>
          <p style={styles.prose}>{METHODOLOGY.sourcing}</p>
          <p style={styles.label}>Altitude</p>
          <p style={styles.prose}>{METHODOLOGY.altitude}</p>
        </div>
      )}
    </div>
  )
}
