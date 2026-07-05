import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'
import type { FingerprintAxis } from '../data/types'
import type { MaturityState } from '../data/maturity'
import { remainingForModule } from '../data/maturity'
import type { PalateProfile } from '../data/types'
import { theme } from '../../../lib/theme'
import { FLAVOR_FAMILY_LABELS } from '../palateTheme'
import { ModuleCard } from './ModuleCard'
import { EditorialRead } from './EditorialRead'
import { LockedTeaser } from './LockedTeaser'

const styles = {
  formingBadge: {
    position: 'absolute' as const,
    top: '16px',
    right: '16px',
    fontSize: '10px',
    letterSpacing: '0.5px',
    color: theme.ochre,
    border: `1px solid ${theme.ochre}`,
    borderRadius: '999px',
    padding: '3px 9px',
  } as const,
  chartWrap: {
    position: 'relative' as const,
    width: '100%',
    marginTop: '10px',
  } as const,
}

type Props = {
  profile: PalateProfile
  read: string
  maturity: MaturityState
}

export function PalateFingerprint({ profile, read, maturity }: Props) {
  if (maturity === 'locked') {
    return (
      <ModuleCard title="Palate fingerprint">
        <LockedTeaser
          remaining={remainingForModule(profile.ratingCount, 'fingerprint')}
          description="See which flavor families define your palate"
        />
      </ModuleCard>
    )
  }

  const isForming = maturity === 'forming'

  const chartData = profile.fingerprint.map((axis: FingerprintAxis) => ({
    name: FLAVOR_FAMILY_LABELS[axis.family] ?? axis.family,
    score: axis.score,
  }))

  return (
    <ModuleCard title="Palate fingerprint" tag={isForming ? 'still forming' : undefined}>
      <div style={styles.chartWrap}>
        <ResponsiveContainer width="100%" height={248}>
          <RadarChart data={chartData} outerRadius="75%">
            <PolarGrid stroke={theme.gridColor} />
            <PolarAngleAxis
              dataKey="name"
              tick={{
                fill: theme.espresso,
                fontSize: 11,
                fontFamily: theme.bodyFont,
              }}
            />
            <PolarRadiusAxis
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Radar
              dataKey="score"
              stroke={theme.ember}
              fill={theme.ember}
              fillOpacity={isForming ? 0.07 : 0.14}
              strokeWidth={2}
              dot={{
                r: 3,
                fill: theme.ember,
                stroke: theme.ember,
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <EditorialRead text={read} />
    </ModuleCard>
  )
}
