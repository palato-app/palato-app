import { theme } from '../../../lib/theme'
import { monthsInRange, rangeLabel, type HarvestData } from '../data/countryHarvest'

// A 12-month harvest-cycle band: main-crop months in ember, a secondary/fly crop in
// ochre, off-months faint. Reads as an annual calendar so the picking season is visible
// at a glance.

const MONTH_LETTERS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

const OCHRE = 'rgba(200,144,64,0.85)'

type Props = {
  harvest: HarvestData
}

const styles = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '3px' } as const,
  cell: { height: '16px', borderRadius: '3px' } as const,
  letters: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gap: '3px',
    marginTop: '5px',
  } as const,
  letter: {
    fontFamily: theme.bodyFont,
    fontSize: '0.6rem',
    textAlign: 'center' as const,
    color: theme.ink35,
  } as const,
  caption: {
    fontFamily: theme.bodyFont,
    fontSize: '0.78rem',
    color: theme.ink70,
    margin: '0.55rem 0 0',
  } as const,
  swatch: {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    borderRadius: '2px',
    marginRight: '0.3rem',
    verticalAlign: 'middle',
  } as const,
}

export function HarvestCalendar({ harvest }: Props) {
  const mainSet = new Set(monthsInRange(harvest.main))
  const secondarySet = new Set(harvest.secondary ? monthsInRange(harvest.secondary) : [])

  const colorFor = (month: number): string => {
    if (mainSet.has(month)) return theme.ember
    if (secondarySet.has(month)) return OCHRE
    return theme.ink08
  }

  return (
    <div>
      <div style={styles.grid}>
        {MONTH_LETTERS.map((_, i) => (
          <div key={i} style={{ ...styles.cell, background: colorFor(i + 1) }} />
        ))}
      </div>
      <div style={styles.letters}>
        {MONTH_LETTERS.map((l, i) => (
          <span key={i} style={styles.letter}>
            {l}
          </span>
        ))}
      </div>
      <p style={styles.caption}>
        <span style={{ ...styles.swatch, background: theme.ember }} />
        Main {rangeLabel(harvest.main)}
        {harvest.secondary && (
          <>
            {'   '}
            <span style={{ ...styles.swatch, background: OCHRE }} />
            Secondary {rangeLabel(harvest.secondary)}
          </>
        )}
      </p>
    </div>
  )
}
