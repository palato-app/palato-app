import { useState } from 'react'
import type { PalateProfile, PalateReads } from '../data/types'
import type { MaturityState } from '../data/maturity'
import { remainingForModule } from '../data/maturity'
import { theme, ROAST_LABELS, PROCESS_LABELS } from '../palateTheme'
import { ModuleCard } from './ModuleCard'
import { EditorialRead } from './EditorialRead'
import { LockedTeaser } from './LockedTeaser'
import { SweetSpotChart, type SweetSpotDatum } from './SweetSpotChart'

type Props = {
  profile: PalateProfile
  reads: PalateReads
  maturity: MaturityState
  ratingCount: number
}

type Tab = {
  key: string
  label: string
  data: SweetSpotDatum[]
  read: string
  emptyHint: string
}

/**
 * One card, four toggleable dimensions of how you rate (roast, process — plus
 * varietal & elevation in step 3). Consolidates what used to be separate
 * Roast / Process cards and reuses the shared SweetSpotChart for each.
 */
export function TasteProfile({ profile, reads, maturity, ratingCount }: Props) {
  const tabs: Tab[] = [
    {
      key: 'roast',
      label: 'Roast',
      read: reads.roast,
      emptyHint: 'Not enough roast data yet.',
      data: profile.roastSweetSpot.map((b) => ({
        name: ROAST_LABELS[b.key] ?? b.key,
        value: b.avgRating ?? 0,
        rawRating: b.avgRating,
      })),
    },
    {
      key: 'process',
      label: 'Process',
      read: reads.process,
      emptyHint: 'Not enough process data yet.',
      data: profile.processSweetSpot.map((b) => ({
        name: PROCESS_LABELS[b.key] ?? b.key,
        value: b.avgRating ?? 0,
        rawRating: b.avgRating,
      })),
    },
  ]

  const [active, setActive] = useState(tabs[0].key)

  if (maturity === 'locked') {
    return (
      <ModuleCard title="Taste profile">
        <LockedTeaser
          remaining={remainingForModule(ratingCount, 'sweetSpot')}
          description="See which roasts and processes you score highest"
        />
      </ModuleCard>
    )
  }

  const current = tabs.find((t) => t.key === active) ?? tabs[0]

  return (
    <ModuleCard title="Taste profile">
      <div style={styles.tabs} role="tablist">
        {tabs.map((t) => {
          const isActive = t.key === active
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(t.key)}
              style={{ ...styles.tab, ...(isActive ? styles.tabActive : null) }}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      <SweetSpotChart data={current.data} emptyHint={current.emptyHint} />

      <EditorialRead text={current.read} />
    </ModuleCard>
  )
}

const styles = {
  tabs: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '6px',
    marginTop: '12px',
  } as const,
  tab: {
    padding: '5px 12px',
    borderRadius: '999px',
    border: `1px solid ${theme.ink15}`,
    background: 'none',
    fontFamily: theme.bodyFont,
    fontSize: '12px',
    letterSpacing: '0.3px',
    color: theme.ink50,
    cursor: 'pointer',
  } as const,
  tabActive: {
    border: `1px solid ${theme.ember}`,
    color: theme.ember,
    background: 'rgba(217,78,31,0.06)',
  } as const,
}
