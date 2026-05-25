import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import type { ProcessMethod, RatingBucket } from '../data/types'
import { theme, barColor, PROCESS_LABELS } from '../palateTheme'
import { ModuleCard } from './ModuleCard'
import { EditorialRead } from './EditorialRead'

type Props = {
  buckets: RatingBucket<ProcessMethod>[]
  read: string
}

export function ProcessSweetSpot({ buckets, read }: Props) {
  const chartData = buckets.map((b) => ({
    name: PROCESS_LABELS[b.key] ?? b.key,
    value: b.avgRating ?? 0,
    rawRating: b.avgRating,
  }))

  return (
    <ModuleCard title="Process">
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
