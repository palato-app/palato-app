import { theme } from '../palateTheme'

const styles = {
  strip: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '18px 26px',
    padding: '20px 22px 4px',
    borderTop: `1px solid ${theme.ink08}`,
    margin: '18px 0 0',
  } as const,
  stat: {} as const,
  number: {
    fontFamily: theme.displayFont,
    fontSize: '26px',
    lineHeight: 1,
  } as const,
  label: {
    fontSize: '10.5px',
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
    color: theme.ink50,
    marginTop: '4px',
  } as const,
}

type Props = {
  stats: {
    coffees: number
    roasters: number
    origins: number
    topNote: string | null
  }
}

export function PalateStats({ stats }: Props) {
  const items: [string, string][] = [
    [String(stats.coffees), 'coffees'],
    [String(stats.roasters), 'roasters'],
    [String(stats.origins), 'origins'],
  ]
  if (stats.topNote) {
    items.push([stats.topNote, 'top note'])
  }

  return (
    <div style={styles.strip}>
      {items.map(([value, label]) => (
        <div key={label} style={styles.stat}>
          <div style={styles.number}>{value}</div>
          <div style={styles.label}>{label}</div>
        </div>
      ))}
    </div>
  )
}
