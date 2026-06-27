import { useMemo } from 'react'
import { theme } from '../../palate/palateTheme'
import { useCoffees } from '../../../lib/useCoffees'
import { normalizeRegionText } from '../lib/matchRegion'
import { sectionTint } from '../lib/originStyle'
import { STATUS_COLOR, STATUS_LABELS } from '../data/countryStatus'
import { flagUrl } from '../data/countryIso'
import {
  buildProjector,
  featurePath,
  matchProvince,
  useCountryProvinces,
} from '../lib/provinceMap'
import type { Origin } from '../data/originsData'

// Countries too wide for a useful card-size locator (a province would be a dot). The
// big region page still maps these; only the tiny card map is skipped.
const SKIP_CARD_MAP = new Set(['China', 'India', 'Indonesia', 'Australia'])
const MINI = 76

// Country-level view, driven entirely by the parsed verified data. Renders the species,
// the country varieties and growing band as prose (preserving the editorial voice), any
// labeled blurbs, and the growing regions as cards. Also handles secondary origins
// (robusta-only / emerging / historical) with a lighter layout.

type Props = {
  origin: Origin
  onBack: () => void
  onSelectRegion: (slug: string) => void
  onBrowseOrigin: (country: string) => void
}

// All-caps section headers for the editorial blurbs. "Emerging" becomes "Background"
// because the Status badge already says Emerging (no redundant header).
const BLURB_HEADER: Record<string, string> = {
  Emerging: 'Background',
  Heritage: 'Heritage',
  Signature: 'Signature',
  Note: 'Note',
  Curiosity: 'Curiosity',
}

const styles = {
  container: { marginTop: '2rem', maxWidth: '720px' } as const,
  back: {
    background: 'none',
    border: 'none',
    color: theme.ink50,
    fontFamily: theme.bodyFont,
    fontSize: '0.85rem',
    cursor: 'pointer' as const,
    padding: 0,
    margin: '0 0 1.5rem',
  } as const,
  hero: (tint: string) =>
    ({
      background: tint,
      borderRadius: '16px',
      padding: '2.25rem 1.75rem',
      marginBottom: '1.5rem',
    }) as const,
  heroEyebrow: {
    fontFamily: theme.bodyFont,
    fontSize: '0.72rem',
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    color: theme.ink50,
    margin: '0 0 0.6rem',
  } as const,
  badge: (status: Origin['status']) =>
    ({
      display: 'inline-block',
      fontFamily: theme.bodyFont,
      fontSize: '0.68rem',
      fontWeight: 600,
      letterSpacing: '0.12em',
      textTransform: 'uppercase' as const,
      color: STATUS_COLOR[status],
      border: `1px solid ${STATUS_COLOR[status]}`,
      borderRadius: '20px',
      padding: '0.2rem 0.7rem',
      marginTop: '0.9rem',
    }) as const,
  nameRow: { display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' as const } as const,
  flag: {
    height: '2rem',
    width: 'auto',
    borderRadius: '3px',
    boxShadow: '0 1px 4px rgba(30,20,16,0.2)',
    display: 'block',
  } as const,
  name: {
    fontFamily: theme.displayFont,
    fontSize: 'clamp(2.75rem, 9vw, 4.5rem)',
    lineHeight: 0.95,
    letterSpacing: '-0.02em',
    color: theme.espresso,
    margin: 0,
  } as const,
  // By the numbers
  statsWrap: { margin: '0 0 1.75rem' } as const,
  statsTitle: {
    fontFamily: theme.bodyFont,
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: theme.ink50,
    margin: '0 0 0.75rem',
  } as const,
  statRow: {
    display: 'flex',
    gap: '1rem',
    padding: '0.7rem 0',
    borderTop: `1px solid ${theme.ink10}`,
    alignItems: 'baseline',
  } as const,
  statLabel: {
    fontFamily: theme.bodyFont,
    fontSize: '0.8rem',
    fontWeight: 600,
    color: theme.ink50,
    flex: '0 0 8.5rem',
  } as const,
  statValue: {
    fontFamily: theme.bodyFont,
    fontSize: '0.95rem',
    color: theme.espresso,
    margin: 0,
    lineHeight: 1.45,
  } as const,
  fieldLabel: {
    fontFamily: theme.bodyFont,
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: theme.ink50,
    margin: '0 0 0.5rem',
  } as const,
  prose: {
    fontFamily: theme.bodyFont,
    fontSize: '1rem',
    lineHeight: 1.6,
    color: theme.espresso,
    opacity: 0.85,
    margin: '0 0 1.6rem',
  } as const,
  blurb: {
    fontFamily: theme.bodyFont,
    fontSize: '1rem',
    lineHeight: 1.6,
    color: theme.espresso,
    opacity: 0.9,
    margin: '0 0 1.1rem',
  } as const,
  blurbLabel: {
    fontFamily: theme.bodyFont,
    fontWeight: 600,
    color: theme.ember,
    marginRight: '0.4rem',
  } as const,
  regionsHeading: {
    fontFamily: theme.displayFont,
    fontSize: '1.6rem',
    color: theme.espresso,
    margin: '2rem 0 0.25rem',
  } as const,
  regionsSub: {
    fontFamily: theme.bodyFont,
    fontSize: '0.85rem',
    color: theme.ink50,
    margin: '0 0 1.25rem',
  } as const,
  regionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
  } as const,
  regionCard: {
    border: `1px solid ${theme.ink15}`,
    borderRadius: '12px',
    padding: '1.1rem 1.25rem',
    textAlign: 'left' as const,
    background: 'rgba(255,255,255,0.3)',
    cursor: 'pointer' as const,
    fontFamily: 'inherit',
    color: 'inherit',
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.85rem',
  } as const,
  regionCardText: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.3rem',
    flex: 1,
    minWidth: 0,
  } as const,
  regionName: {
    fontFamily: theme.displayFont,
    fontSize: '1.4rem',
    lineHeight: 1.05,
    color: theme.espresso,
    margin: 0,
  } as const,
  regionElev: {
    fontFamily: theme.bodyFont,
    fontSize: '0.72rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    color: theme.ember,
  } as const,
  regionDetail: {
    fontFamily: theme.bodyFont,
    fontSize: '0.82rem',
    lineHeight: 1.4,
    color: theme.ink70,
    margin: 0,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden' as const,
  } as const,
  link: {
    marginTop: '2rem',
    display: 'inline-block',
    background: 'none',
    border: 'none',
    fontFamily: theme.bodyFont,
    fontSize: '1rem',
    fontWeight: 600,
    color: theme.ember,
    cursor: 'pointer' as const,
    padding: 0,
  } as const,
}

// A tiny country silhouette with the region's province highlighted, for a region card.
// Renders nothing if there's no province match (we never fake a location).
function MiniMap({
  paths,
  matchedName,
}: {
  paths: { name: string; d: string }[]
  matchedName: string | undefined
}) {
  if (!matchedName) return null
  return (
    <svg
      viewBox={`0 0 ${MINI} ${MINI}`}
      width={72}
      height={72}
      style={{ flexShrink: 0 }}
      aria-hidden="true"
    >
      {paths
        .filter((p) => p.name !== matchedName)
        .map((p, i) => (
          <path key={i} d={p.d} fill="rgba(30,20,16,0.06)" stroke="rgba(30,20,16,0.12)" strokeWidth={0.4} />
        ))}
      {paths
        .filter((p) => p.name === matchedName)
        .map((p, i) => (
          <path key={`m${i}`} d={p.d} fill={theme.ember} stroke={theme.espresso} strokeWidth={0.5} />
        ))}
    </svg>
  )
}

export function CountryPanel({ origin, onBack, onSelectRegion, onBrowseOrigin }: Props) {
  const provinces = useCountryProvinces(
    SKIP_CARD_MAP.has(origin.country) ? null : origin.country,
  )
  const miniPaths = useMemo(() => {
    if (!provinces) return null
    const proj = buildProjector(provinces, MINI, MINI, 4)
    return provinces.map((f) => ({ name: f.properties.name, d: featurePath(f.geometry, proj) }))
  }, [provinces])

  // Live country-level catalog count for By the Numbers (hidden when 0 so we never show
  // an empty stat).
  const { coffees } = useCoffees()
  const catalogCount = useMemo(
    () =>
      coffees.filter(
        (c) => normalizeRegionText(c.origin_country) === normalizeRegionText(origin.country),
      ).length,
    [coffees, origin.country],
  )

  const { min, max, raw: altRaw } = origin.altitude
  const altitude =
    min !== null
      ? `${min.toLocaleString()}${max !== null && max !== min ? '-' + max.toLocaleString() : ''} m`
      : altRaw

  return (
    <div style={styles.container}>
      <button style={styles.back} onClick={onBack}>
        ← The globe
      </button>

      <div style={styles.hero(sectionTint(origin.section))}>
        {origin.section && <p style={styles.heroEyebrow}>{origin.section}</p>}
        <div style={styles.nameRow}>
          {flagUrl(origin.country) && (
            <img
              src={flagUrl(origin.country) as string}
              alt={`${origin.country} flag`}
              style={styles.flag}
              loading="lazy"
            />
          )}
          <h1 style={styles.name}>{origin.country}</h1>
        </div>
        <div>
          <span style={styles.badge(origin.status)}>{STATUS_LABELS[origin.status]}</span>
        </div>
      </div>

      <div style={styles.statsWrap}>
        <p style={styles.statsTitle}>By the numbers</p>
        <div style={styles.statRow}>
          <span style={styles.statLabel}>Status</span>
          <p style={styles.statValue}>{STATUS_LABELS[origin.status]}</p>
        </div>
        {origin.marker && (
          <div style={styles.statRow}>
            <span style={styles.statLabel}>Species</span>
            <p style={styles.statValue}>{origin.marker}</p>
          </div>
        )}
        {altitude && (
          <div style={styles.statRow}>
            <span style={styles.statLabel}>Grown at</span>
            <p style={styles.statValue}>{altitude}</p>
          </div>
        )}
        {origin.regions.length > 0 && (
          <div style={styles.statRow}>
            <span style={styles.statLabel}>Growing regions</span>
            <p style={styles.statValue}>{origin.regions.length}</p>
          </div>
        )}
        {catalogCount > 0 && (
          <div style={styles.statRow}>
            <span style={styles.statLabel}>In our catalog</span>
            <p style={styles.statValue}>
              {catalogCount} {catalogCount === 1 ? 'coffee' : 'coffees'}
            </p>
          </div>
        )}
      </div>

      {origin.varietals && (
        <>
          <p style={styles.fieldLabel}>Common varieties</p>
          <p style={styles.prose}>{origin.varietals}</p>
        </>
      )}

      {origin.blurbs.map((b, i) => (
        <div key={i}>
          <p style={styles.fieldLabel}>{BLURB_HEADER[b.label] ?? b.label}</p>
          <p style={styles.prose}>{b.text}</p>
        </div>
      ))}

      {origin.robusta && (
        <>
          <p style={styles.fieldLabel}>Robusta</p>
          <p style={styles.prose}>{origin.robusta}</p>
        </>
      )}

      {origin.regions.length > 0 && (
        <>
          <h2 style={styles.regionsHeading}>Growing regions</h2>
          <p style={styles.regionsSub}>
            Tap a region to see where it sits and the coffees that come from it.
          </p>
          <div style={styles.regionGrid}>
            {origin.regions.map((r) => {
              const matched = provinces
                ? matchProvince(provinces, r.name, r.matchTerms)?.properties.name
                : undefined
              return (
                <button
                  key={r.slug}
                  style={styles.regionCard}
                  onClick={() => onSelectRegion(r.slug)}
                >
                  <div style={styles.regionCardText}>
                    <h3 style={styles.regionName}>{r.name}</h3>
                    {r.detail && <p style={styles.regionDetail}>{r.detail}</p>}
                  </div>
                  {miniPaths && <MiniMap paths={miniPaths} matchedName={matched} />}
                </button>
              )
            })}
          </div>
        </>
      )}

      {origin.hasFullData && (
        <button style={styles.link} onClick={() => onBrowseOrigin(origin.country)}>
          See {origin.country} coffees →
        </button>
      )}
    </div>
  )
}
