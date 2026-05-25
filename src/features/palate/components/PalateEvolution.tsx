import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import type { PalateProfile } from '../data/types'
import { evolutionMaturity } from '../data/maturity'
import { theme } from '../palateTheme'
import { ModuleCard } from './ModuleCard'
import { EditorialRead } from './EditorialRead'

const styles = {
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
  read: string
}

export function PalateEvolution({ profile, read }: Props) {
  const maturity = evolutionMaturity(profile)

  return (
    <ModuleCard title="Palate evolution">
      {maturity === 'locked' ? (
        <div style={styles.locked}>
          <p style={styles.lockedTitle}>Not enough history yet</p>
          <p style={styles.lockedSub}>
            Evolution needs about 20 coffees across a few weeks.
            <br />
            Keep rating — this is where you'll watch your palate move.
          </p>
        </div>
      ) : (
        <>
          <div style={{ width: '100%', marginTop: '10px' }}>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={profile.evolution}>
                <CartesianGrid
                  vertical={false}
                  stroke={theme.gridColorLight}
                />
                <XAxis
                  dataKey="period"
                  axisLine={{ stroke: theme.ink15 }}
                  tickLine={false}
                  tick={{
                    fill: theme.ink50,
                    fontSize: 10,
                    fontFamily: theme.bodyFont,
                  }}
                />
                <YAxis
                  reversed
                  domain={[1, 4]}
                  ticks={[1, 4]}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: theme.ink35,
                    fontSize: 11,
                    fontFamily: theme.bodyFont,
                  }}
                  tickFormatter={(v: number) =>
                    v === 1 ? 'light' : v === 4 ? 'dark' : ''
                  }
                />
                <Area
                  type="monotone"
                  dataKey="avgRoast"
                  stroke={theme.forest}
                  fill={theme.evoFill}
                  strokeWidth={2.5}
                  dot={{
                    fill: theme.forest,
                    r: 3,
                    stroke: theme.forest,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <EditorialRead text={read} />
        </>
      )}
    </ModuleCard>
  )
}
