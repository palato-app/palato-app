import { useMemo } from 'react'
import { theme } from '../../../lib/theme'
import { ORIGINS, SECONDARY_ORIGINS, type Origin } from '../data/originsData'

// The sectioned list of every coffee origin. Sits below the globe as the reliable,
// scannable directory (and the no-WebGL fallback). Primary origins are full chips;
// emerging / historical / robusta-roster entries render dimmed and secondary so the
// Arabica story stays in front.

type Props = {
  onSelect: (country: string) => void
}

function groupBySection(origins: Origin[]): [string, Origin[]][] {
  const order: string[] = []
  const map = new Map<string, Origin[]>()
  for (const o of origins) {
    if (!map.has(o.section)) {
      map.set(o.section, [])
      order.push(o.section)
    }
    map.get(o.section)!.push(o)
  }
  return order.map((s) => [s, map.get(s)!])
}

const styles = {
  sectionTitle: {
    fontFamily: theme.bodyFont,
    fontSize: '0.72rem',
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    color: theme.ink50,
    margin: '1.75rem 0 0.75rem',
  } as const,
  row: { display: 'flex', flexWrap: 'wrap' as const, gap: '0.5rem' } as const,
  chip: {
    fontFamily: theme.bodyFont,
    fontSize: '0.9rem',
    padding: '0.4rem 0.85rem',
    borderRadius: '20px',
    border: `1px solid ${theme.ink15}`,
    background: 'rgba(255,255,255,0.35)',
    color: theme.espresso,
    cursor: 'pointer' as const,
    whiteSpace: 'nowrap' as const,
  } as const,
  chipDim: {
    fontFamily: theme.bodyFont,
    fontSize: '0.85rem',
    padding: '0.35rem 0.75rem',
    borderRadius: '20px',
    border: `1px dashed ${theme.ink15}`,
    background: 'transparent',
    color: theme.ink50,
    cursor: 'pointer' as const,
    whiteSpace: 'nowrap' as const,
  } as const,
  note: {
    fontFamily: theme.bodyFont,
    fontSize: '0.8rem',
    color: theme.ink50,
    margin: '0 0 0.75rem',
  } as const,
}

export function CountryDirectory({ onSelect }: Props) {
  const grouped = useMemo(() => groupBySection(ORIGINS), [])
  const secondaryGrouped = useMemo(() => groupBySection(SECONDARY_ORIGINS), [])

  return (
    <div>
      {grouped.map(([section, list]) => (
        <div key={section}>
          <p style={styles.sectionTitle}>{section}</p>
          <div style={styles.row}>
            {list.map((o) => (
              <button key={o.slug} style={styles.chip} onClick={() => onSelect(o.country)}>
                {o.country}
              </button>
            ))}
          </div>
        </div>
      ))}

      {SECONDARY_ORIGINS.length > 0 && (
        <>
          <p style={styles.sectionTitle}>Emerging, historical & robusta origins</p>
          <p style={styles.note}>
            Origins with a story but no full data row yet, plus the robusta belt. Lighter detail.
          </p>
          {secondaryGrouped.map(([section, list]) => (
            <div key={section} style={{ marginBottom: '0.75rem' }}>
              <div style={styles.row}>
                {list.map((o) => (
                  <button
                    key={`${section}-${o.slug}`}
                    style={styles.chipDim}
                    onClick={() => onSelect(o.country)}
                  >
                    {o.country}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
