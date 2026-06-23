import type { Recommendations, Recommendation, RecommendationKind } from '../data/types'
import type { MaturityState } from '../data/maturity'
import { remainingForModule } from '../data/maturity'
import { theme, PROCESS_LABELS, ROAST_LABELS } from '../palateTheme'
import { ModuleCard } from './ModuleCard'
import { parseEmphasis } from './EditorialRead'
import { LockedTeaser } from './LockedTeaser'
import { track } from '../../../lib/track'

const KIND_LABEL: Record<RecommendationKind, string> = {
  unique: 'Try something unique',
  explore: 'Go somewhere new',
  love: 'Something you’ll love',
}

const styles = {
  card: {
    display: 'flex',
    gap: '14px',
    alignItems: 'flex-start',
    padding: '16px 0',
    borderTop: `1px solid ${theme.ink15}`,
    cursor: 'pointer',
  } as const,
  thumb: {
    width: '50px',
    height: '72px',
    flexShrink: 0,
    borderRadius: '8px',
    background: `linear-gradient(160deg, ${theme.ember}, ${theme.emberDark})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as const,
  thumbText: {
    fontFamily: theme.wordmarkFont,
    fontSize: '8px',
    color: theme.cream,
    textTransform: 'lowercase' as const,
    transform: 'rotate(-90deg)',
    whiteSpace: 'nowrap' as const,
    letterSpacing: '0.5px',
  } as const,
  kind: {
    fontFamily: theme.bodyFont,
    fontSize: '10px',
    letterSpacing: '1.2px',
    textTransform: 'uppercase' as const,
    color: theme.ember,
    fontWeight: 600,
    margin: 0,
  } as const,
  name: {
    fontFamily: theme.displayFont,
    fontSize: '19px',
    lineHeight: 1.1,
    margin: '3px 0 0',
  } as const,
  meta: {
    fontSize: '12px',
    color: theme.ink50,
    marginTop: '2px',
    letterSpacing: '0.2px',
  } as const,
  reason: {
    fontFamily: theme.displayFont,
    fontSize: '15px',
    lineHeight: 1.32,
    color: theme.ink70,
    marginTop: '8px',
  } as const,
  hint: { fontFamily: theme.bodyFont, fontSize: '13px', color: theme.ink50, padding: '10px 0' } as const,
}

type Props = {
  recommendations: Recommendations | null
  maturity: MaturityState
  ratingCount: number
  loading: boolean
  onSelectCoffee: (coffeeId: string) => void
}

function RecCard({ rec, onSelectCoffee }: { rec: Recommendation; onSelectCoffee: (id: string) => void }) {
  const handleClick = () => {
    track('palate_recommendation_clicked', { kind: rec.kind, coffeeId: rec.coffeeId, coffeeName: rec.coffeeName })
    onSelectCoffee(rec.coffeeId)
  }
  return (
    <div style={styles.card} onClick={handleClick}>
      <div style={styles.thumb}>
        <span style={styles.thumbText}>{rec.roaster.split(' ')[0].toLowerCase()}</span>
      </div>
      <div>
        <p style={styles.kind}>{KIND_LABEL[rec.kind]}</p>
        <p style={styles.name}>{rec.coffeeName}</p>
        <p style={styles.meta}>
          {rec.roaster} · {PROCESS_LABELS[rec.process as keyof typeof PROCESS_LABELS] ?? rec.process} ·{' '}
          {ROAST_LABELS[rec.roastLevel as keyof typeof ROAST_LABELS] ?? rec.roastLevel}
        </p>
        <p style={styles.reason}>{parseEmphasis(rec.reason)}</p>
      </div>
    </div>
  )
}

export function WhatsNext({ recommendations, maturity, ratingCount, loading, onSelectCoffee }: Props) {
  const cards = recommendations
    ? ([recommendations.unique, recommendations.explore, recommendations.love].filter(Boolean) as Recommendation[])
    : []

  return (
    <ModuleCard title="What's next" tag="for your palate">
      {maturity === 'locked' ? (
        <LockedTeaser
          remaining={remainingForModule(ratingCount, 'recommendation')}
          description="Personalized recommendations based on your palate"
        />
      ) : cards.length === 0 ? (
        <p style={styles.hint}>{loading ? 'Finding coffees for you…' : 'Rate a few more coffees to refine your recommendations.'}</p>
      ) : (
        cards.map((rec) => <RecCard key={rec.kind} rec={rec} onSelectCoffee={onSelectCoffee} />)
      )}
    </ModuleCard>
  )
}
