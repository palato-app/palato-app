import type { OriginStat } from '../data/types'
import { useTasteTheWorld } from '../data/useTasteTheWorld'
import { track } from '../../../lib/track'
import { theme } from '../palateTheme'
import { ModuleCard } from './ModuleCard'
import { EditorialRead, parseEmphasis } from './EditorialRead'
import { PalateGlobe } from './PalateGlobe'

type Props = {
  origins: OriginStat[]
  onBrowseOrigin: (country: string) => void
}

const FRONTIER_PREVIEW = 4

/**
 * "Taste the World" — the globe shows arabica origins you've tasted (ember) vs. an
 * untasted frontier we actually stock (ochre). Catalog-linked: every highlighted
 * country and every chip leads into the catalog filtered to that origin, so the
 * prompt always ends in a coffee you can rate. Immediately available — most
 * motivating when the map is still mostly empty.
 */
export function TasteTheWorld({ origins, onBrowseOrigin }: Props) {
  const { loading, tastedMapNames, frontierMapNames, frontier, tastedCount } =
    useTasteTheWorld(origins)

  const select = (country: string, source: 'globe' | 'list') => {
    track('taste_the_world_country_click', { country, source })
    onBrowseOrigin(country)
  }

  const isHighlighted = (admin: string) =>
    tastedMapNames.has(admin) || frontierMapNames.has(admin)
  const capColor = (admin: string) =>
    tastedMapNames.has(admin) ? theme.ember : frontierMapNames.has(admin) ? theme.ochre : null
  const capAltitude = (admin: string) => (isHighlighted(admin) ? 0.05 : null)
  const noteFor = (admin: string) => (tastedMapNames.has(admin) ? 'Tasted ✓' : 'Try →')

  const intro = loading
    ? 'Mapping your frontier…'
    : frontier.length === 0
      ? tastedCount > 0
        ? "You've rated a coffee from every arabica origin we stock. Remarkable."
        : 'No arabica origins in the catalog yet.'
      : tastedCount > 0
        ? `You've tasted *${tastedCount}* arabica ${tastedCount === 1 ? 'origin' : 'origins'}. *${frontier.length}* more sit in the catalog, waiting.`
        : `The whole arabica world is ahead of you — *${frontier.length}* origins in the catalog to start with.`

  return (
    <ModuleCard title="Taste the world" tag="arabica">
      <p style={styles.intro}>{parseEmphasis(intro)}</p>

      <PalateGlobe
        onSelectCountry={(c) => select(c, 'globe')}
        isHighlighted={isHighlighted}
        capColor={capColor}
        capAltitude={capAltitude}
        noteFor={noteFor}
      />

      {!loading && frontier.length > 0 && (
        <>
          <div style={styles.legend}>
            <span style={styles.legendItem}>
              <span style={{ ...styles.dot, background: theme.ember }} /> Tasted
            </span>
            <span style={styles.legendItem}>
              <span style={{ ...styles.dot, background: theme.ochre }} /> To try
            </span>
          </div>

          <div style={styles.chips}>
            {frontier.slice(0, FRONTIER_PREVIEW).map((f) => (
              <button key={f.mapName} style={styles.chip} onClick={() => select(f.country, 'list')}>
                {f.country}
                <span style={styles.chipCount}>{f.coffeeCount}</span>
              </button>
            ))}
          </div>

          <EditorialRead text="Each new origin widens the map — *and your palate*." />
        </>
      )}
    </ModuleCard>
  )
}

const styles = {
  intro: {
    fontFamily: theme.displayFont,
    fontSize: '18px',
    lineHeight: 1.35,
    color: theme.espresso,
    margin: '8px 0 6px',
  } as const,
  legend: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    marginTop: '8px',
  } as const,
  legendItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: theme.bodyFont,
    fontSize: '11px',
    letterSpacing: '0.4px',
    color: theme.ink50,
  } as const,
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '999px',
    display: 'inline-block',
  } as const,
  chips: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
    marginTop: '14px',
  } as const,
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '7px 12px',
    borderRadius: '999px',
    border: `1px solid ${theme.ink15}`,
    background: 'none',
    fontFamily: theme.bodyFont,
    fontSize: '13px',
    color: theme.espresso,
    cursor: 'pointer',
  } as const,
  chipCount: {
    fontSize: '11px',
    color: theme.ochre,
    fontVariantNumeric: 'tabular-nums' as const,
  } as const,
}
