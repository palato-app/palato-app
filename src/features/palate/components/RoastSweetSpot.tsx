import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import type { RoastLevel, RatingBucket } from '../data/types'
import type { MaturityState } from '../data/maturity'
import { remainingForModule } from '../data/maturity'
import { theme, barColor, ROAST_LABELS } from '../palateTheme'
import { ModuleCard } from './ModuleCard'
import { EditorialRead } from './EditorialRead'
import { LockedTeaser } from './LockedTeaser'

type Props = {
  buckets: RatingBucket<RoastLevel>[]
  read: string
  maturity: MaturityState
  ratingCount: number
}

export function RoastSweetSpot({ buckets, read, maturity, ratingCount }: Props) {
  if (maturity === 'locked') {
    return (
      <ModuleCard title="Roast sweet spot">
        <LockedTeaser
          remaining={remainingForModule(ratingCount, 'sweetSpot')}
          description="Discover which roast levels you score highest"
        />
      </ModuleCard>
    )
  }
  const chartData = buckets.map((b) => ({
    name: ROAST_LABELS[b.key] ?? b.key,
    value: b.avgRating ?? 0,
    rawRating: b.avgRating,
  }))

  return (
    <ModuleCard title="Roast sweet spot">
      <div style={{ width: '100%', marginTop: '10px' }}>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={chartData}>
            <CartesianGrid
              vertical={false}
              stroke={theme.gridColorLight}
            />
            <XAxis
              dataKey="name"
              axisLine={{ stroke: theme.ink15 }}
              tickLine={false}
              tick={{
                fill: theme.espresso,
                fontSize: 11,
                fontFamily: theme.bodyFont,
              }}
            />
            <YAxis
              domain={[0, 5]}
              ticks={[0, 1, 2, 3, 4, 5]}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: theme.ink35,
                fontSize: 11,
                fontFamily: theme.bodyFont,
              }}
            />
            <Bar
              dataKey="value"
              radius={[6, 6, 0, 0]}
              barSize={32}
            >
              {chartData.map((entry, idx) => (
                <Cell key={idx} fill={barColor(entry.rawRating)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <EditorialRead text={read} />
    </ModuleCard>
  )
}
