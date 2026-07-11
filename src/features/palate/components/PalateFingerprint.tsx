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
import { remainingForModule, FINGERPRINT_FULL_THRESHOLD } from '../data/maturity'
import type { PalateProfile } from '../data/types'
import { theme } from '../../../lib/theme'
import { FLAVOR_FAMILY_LABELS } from '../palateTheme'
import { ModuleCard } from './ModuleCard'
import { EditorialRead } from './EditorialRead'
import { LockedTeaser } from './LockedTeaser'

// Sparse palates otherwise collapse to a lonely spike — one family pins to 100
// (score = familyCount / maxFamilyCount) while the rest fall to ~0. Blend each
// axis toward a neutral mid-radius by how much data backs the whole fingerprint,
// so an early palate reads as a full, round shape that *sharpens* into a defined
// fingerprint by FINGERPRINT_FULL_THRESHOLD ratings (w → 1 → raw scores, so the
// mature shape is untouched). View-only: the underlying axis.score is unchanged.
const FORMING_BASELINE = 45
function smoothScore(raw: number, ratingCount: number): number {
  const w = Math.min(1, ratingCount / FINGERPRINT_FULL_THRESHOLD)
  return Math.round(raw * w + FORMING_BASELINE * (1 - w))
}

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
    // One-time draw-in on mount. recharts' own Radar animation is disabled
    // (it gets interrupted by dashboard re-renders and collapses to center), so
    // the motion lives here: a fade + gentle grow. Transforms don't affect
    // ResizeObserver's layout measurement, so this is safe for ResponsiveContainer.
    // Keyframes live under a reduced-motion media query, so reduced-motion users
    // resolve to an undefined animation-name (a no-op; the element stays put).
    animation: 'fingerprintDraw 650ms ease-out',
    transformOrigin: 'center',
  } as const,
}

// Mirrors the quiz's QuizStyles pattern (PalateQuiz.tsx). Gated on
// prefers-reduced-motion: no-preference so the animation-name is undefined —
// and thus a no-op — when the user asks for reduced motion.
function FingerprintStyles() {
  return (
    <style>{`
      @media (prefers-reduced-motion: no-preference) {
        @keyframes fingerprintDraw {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
      }
    `}</style>
  )
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
    score: smoothScore(axis.score, profile.ratingCount),
  }))

  return (
    <ModuleCard title="Palate fingerprint" tag={isForming ? 'still forming' : undefined}>
      <FingerprintStyles />
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
              fillOpacity={isForming ? 0.11 : 0.14}
              strokeWidth={2}
              dot={{
                r: 3,
                fill: theme.ember,
                stroke: theme.ember,
              }}
              isAnimationActive={false}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <EditorialRead text={read} />
    </ModuleCard>
  )
}
