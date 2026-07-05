import { useNewVarietals, type VarietalPick } from '../data/useNewVarietals'
import { track } from '../../../lib/track'
import { theme } from '../../../lib/theme'
import { ModuleCard } from './ModuleCard'
import { CoffeePlaceholder } from '../../../components/CoffeePlaceholder'

type Props = {
  onSelectCoffee: (coffeeId: string) => void
}

/**
 * "New varietals" — catalog coffees featuring a varietal the user has never
 * rated. Catalog-linked: every card opens a coffee they can actually buy and
 * rate. The companion to Taste the World on the varietal axis.
 */
export function NewVarietals({ onSelectCoffee }: Props) {
  const { picks, loading } = useNewVarietals()

  return (
    <ModuleCard title="New varietals" tag="unrated">
      {loading ? (
        <p style={styles.hint}>Finding varietals you haven’t tried…</p>
      ) : picks.length === 0 ? (
        <p style={styles.hint}>
          You’ve rated a coffee from every varietal in the catalog. Rare air.
        </p>
      ) : (
        picks.map((pick) => (
          <VarietalCard key={pick.coffee.id} pick={pick} onSelectCoffee={onSelectCoffee} />
        ))
      )}
    </ModuleCard>
  )
}

function VarietalCard({
  pick,
  onSelectCoffee,
}: {
  pick: VarietalPick
  onSelectCoffee: (id: string) => void
}) {
  const { coffee, newVarietals } = pick
  const headline = newVarietals.slice(0, 2).join(' · ')
  const handleClick = () => {
    track('new_varietal_clicked', { coffeeId: coffee.id, varietals: newVarietals })
    onSelectCoffee(coffee.id)
  }
  return (
    <div style={styles.card} onClick={handleClick}>
      <div style={styles.thumb}>
        {coffee.bag_image_url ? (
          <img src={coffee.bag_image_url} alt="" style={styles.thumbImg} />
        ) : (
          <CoffeePlaceholder coffeeId={coffee.id} artScale={0.95} />
        )}
      </div>
      <div>
        <p style={styles.kind}>New to you · {headline}</p>
        <p style={styles.name}>{coffee.coffee_name}</p>
        <p style={styles.meta}>
          {coffee.roaster_name}
          {coffee.origin_country ? ` · ${coffee.origin_country}` : ''}
        </p>
      </div>
    </div>
  )
}

const styles = {
  hint: { fontFamily: theme.bodyFont, fontSize: '13px', color: theme.ink50, padding: '10px 0' } as const,
  card: {
    display: 'flex',
    gap: '14px',
    alignItems: 'flex-start',
    padding: '16px 0',
    borderTop: `1px solid ${theme.ink15}`,
    cursor: 'pointer',
  } as const,
  thumb: {
    width: '54px',
    height: '78px',
    flexShrink: 0,
    borderRadius: '8px',
    overflow: 'hidden' as const,
    background: theme.ink08,
  } as const,
  thumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    display: 'block',
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
}
