import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import { theme } from '../../../lib/theme'
import { useIsMobile } from '../../../lib/useIsMobile'
import { barColor } from '../palateTheme'

export type SweetSpotDatum = {
  name: string
  value: number          // avgRating, 0 when no data (zero-height bar)
  rawRating: number | null
}

type Props = {
  data: SweetSpotDatum[]
  /** Shown when no bucket has any ratings yet (e.g. thin varietal/elevation data). */
  emptyHint?: string
}

const emptyStyle = {
  fontFamily: theme.bodyFont,
  fontSize: '13px',
  color: theme.ink50,
  padding: '28px 4px',
  textAlign: 'center' as const,
} as const

/**
 * The shared 0–5 bar chart behind every "sweet spot" dimension (roast, process,
 * varietal, elevation). Callers pre-map their buckets to {name, value, rawRating};
 * coloring (ember / ochre / muted) is driven by rawRating via barColor().
 */
export function SweetSpotChart({ data, emptyHint }: Props) {
  const isMobile = useIsMobile()
  const hasData = data.some((d) => (d.rawRating ?? 0) > 0)
  if (!hasData) {
    return <p style={emptyStyle}>{emptyHint ?? 'Not enough data yet.'}</p>
  }

  return (
    <div style={{ width: '100%', marginTop: '10px' }}>
      {/* On mobile Recharts silently drops overlapping x labels (e.g. only 3 of 6
          varietals showed). Force every label with interval={0} and angle them so
          they fit the narrow width; desktop keeps clean horizontal labels. The
          taller container + XAxis height give the angled labels room. */}
      <ResponsiveContainer width="100%" height={isMobile ? 178 : 150}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: isMobile ? 4 : 0 }}>
          <CartesianGrid vertical={false} stroke={theme.gridColorLight} />
          <XAxis
            dataKey="name"
            interval={isMobile ? 0 : undefined}
            axisLine={{ stroke: theme.ink15 }}
            tickLine={false}
            height={isMobile ? 52 : 30}
            angle={isMobile ? -35 : 0}
            textAnchor={isMobile ? 'end' : 'middle'}
            tick={{
              fill: theme.espresso,
              fontSize: isMobile ? 10 : 11,
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
          <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={32}>
            {data.map((entry, idx) => (
              <Cell key={idx} fill={barColor(entry.rawRating)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
