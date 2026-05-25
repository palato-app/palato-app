import type { OriginStat } from '../data/types'
import { theme, originBarColor } from '../palateTheme'
import { ModuleCard } from './ModuleCard'
import { EditorialRead } from './EditorialRead'

const MAX_RATING = 5

const styles = {
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '11px',
    fontSize: '13px',
    fontFamily: theme.bodyFont,
  } as const,
  name: {
    width: '78px',
    flexShrink: 0,
    color: theme.espresso,
  } as const,
  track: {
    flex: 1,
    height: '8px',
    background: theme.ink08,
    borderRadius: '999px',
    overflow: 'hidden',
  } as const,
  val: {
    width: '58px',
    flexShrink: 0,
    textAlign: 'right' as const,
    fontSize: '12px',
    color: theme.ink70,
    fontVariantNumeric: 'tabular-nums',
  } as const,
}

type Props = {
  origins: OriginStat[]
  read: string
}

export function Origins({ origins, read }: Props) {
  return (
    <ModuleCard title="Origins">
      {origins.map((o) => {
        const widthPct = Math.round((o.avgRating / MAX_RATING) * 100)
        const fill = originBarColor(o.avgRating)

        return (
          <div key={o.country} style={styles.row}>
            <div style={styles.name}>{o.country}</div>
            <div style={styles.track}>
              <div
                style={{
                  height: '100%',
                  width: `${widthPct}%`,
                  borderRadius: '999px',
                  background: fill,
                }}
              />
            </div>
            <div style={styles.val}>
              {o.avgRating.toFixed(1)} · {o.count}
            </div>
          </div>
        )
      })}

      <EditorialRead text={read} />
    </ModuleCard>
  )
}
