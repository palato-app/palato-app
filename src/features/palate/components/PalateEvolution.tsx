import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import type { PalateProfile } from '../data/types'
import type { MaturityState } from '../data/maturity'
import { remainingForModule } from '../data/maturity'
import { theme } from '../palateTheme'
import { ModuleCard } from './ModuleCard'
import { EditorialRead } from './EditorialRead'
import { LockedTeaser } from './LockedTeaser'

type Props = {
  profile: PalateProfile
  read: string
  maturity: MaturityState
}

export function PalateEvolution({ profile, read, maturity }: Props) {

  return (
    <ModuleCard title="Palate evolution">
      {maturity === 'locked' ? (
        <LockedTeaser
          remaining={remainingForModule(profile.ratingCount, 'evolution')}
          description="Watch how your taste changes over time"
        />
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
