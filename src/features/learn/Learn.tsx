import { useState } from 'react'
import { ORIGINS, type Origin } from './originData'

const espresso = '#1E1410'
const ember = '#D94E1F'
const ink70 = 'rgba(30,20,16,0.70)'
const ink50 = 'rgba(30,20,16,0.50)'
const ink15 = 'rgba(30,20,16,0.15)'
const serif = '"Instrument Serif", serif'
const sans = 'Geist, system-ui, sans-serif'

const INTRO = 'Where your coffee comes from — and why it tastes the way it does.'

const styles = {
  container: { marginTop: '2rem', maxWidth: '720px' } as const,
  eyebrow: {
    fontFamily: sans,
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    color: ember,
    margin: '0 0 0.75rem',
  } as const,
  intro: {
    fontFamily: serif,
    fontSize: 'clamp(1.6rem, 4vw, 2.1rem)',
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
    color: espresso,
    margin: '0 0 2.5rem',
    maxWidth: '520px',
  } as const,
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1.25rem',
  } as const,
  card: {
    border: `1px solid ${ink15}`,
    borderRadius: '14px',
    overflow: 'hidden' as const,
    cursor: 'pointer',
    padding: 0,
    textAlign: 'left' as const,
    fontFamily: 'inherit',
    color: 'inherit',
    background: 'transparent',
    display: 'flex',
    flexDirection: 'column' as const,
  } as const,
  cardHero: (tint: string) =>
    ({
      background: tint,
      padding: '1.5rem 1.25rem',
      minHeight: '110px',
      display: 'flex',
      alignItems: 'flex-end',
    }) as const,
  cardHeroName: {
    fontFamily: serif,
    fontSize: '1.9rem',
    lineHeight: 1,
    color: espresso,
    margin: 0,
  } as const,
  cardBody: { padding: '0.9rem 1.25rem 1.1rem' } as const,
  cardTagline: {
    fontFamily: sans,
    fontSize: '0.85rem',
    color: ink70,
    margin: 0,
    lineHeight: 1.35,
  } as const,
  // Detail
  back: {
    background: 'none',
    border: 'none',
    color: ink50,
    fontFamily: sans,
    fontSize: '0.85rem',
    cursor: 'pointer',
    padding: 0,
    margin: '0 0 1.5rem',
  } as const,
  detailHero: (tint: string) =>
    ({
      background: tint,
      borderRadius: '16px',
      padding: '2.5rem 1.75rem',
      marginBottom: '1.75rem',
    }) as const,
  detailName: {
    fontFamily: serif,
    fontSize: 'clamp(3rem, 9vw, 4.5rem)',
    lineHeight: 0.95,
    letterSpacing: '-0.02em',
    color: espresso,
    margin: 0,
  } as const,
  detailTagline: {
    fontFamily: serif,
    fontStyle: 'italic' as const,
    fontSize: '1.4rem',
    color: ink70,
    margin: '0.5rem 0 0',
  } as const,
  para: {
    fontFamily: sans,
    fontSize: '1rem',
    lineHeight: 1.6,
    color: espresso,
    opacity: 0.85,
    margin: '0 0 1.1rem',
  } as const,
  link: {
    marginTop: '1rem',
    display: 'inline-block',
    background: 'none',
    border: 'none',
    fontFamily: sans,
    fontSize: '1rem',
    fontWeight: 600,
    color: ember,
    cursor: 'pointer',
    padding: 0,
  } as const,
}

type Props = {
  onBrowseOrigin: (country: string) => void
}

/**
 * The Learn tab (§6): a grid of origin cards, each opening a short editorial
 * origin page with a typographic hero and a link to filter the catalog by
 * that origin. Static content for v1; no interactive globe (deferred).
 */
export function Learn({ onBrowseOrigin }: Props) {
  const [selected, setSelected] = useState<Origin | null>(null)

  if (selected) {
    return (
      <div style={styles.container}>
        <button style={styles.back} onClick={() => setSelected(null)}>
          ← All origins
        </button>
        <div style={styles.detailHero(selected.tint)}>
          <h1 style={styles.detailName}>{selected.name}</h1>
          <p style={styles.detailTagline}>{selected.tagline}</p>
        </div>
        {selected.paragraphs.map((p, i) => (
          <p key={i} style={styles.para}>
            {p}
          </p>
        ))}
        <button style={styles.link} onClick={() => onBrowseOrigin(selected.country)}>
          See {selected.name} coffees →
        </button>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <p style={styles.eyebrow}>Learn</p>
      <h1 style={styles.intro}>{INTRO}</h1>
      <div style={styles.grid}>
        {ORIGINS.map((o) => (
          <button key={o.slug} style={styles.card} onClick={() => setSelected(o)}>
            <div style={styles.cardHero(o.tint)}>
              <h2 style={styles.cardHeroName}>{o.name}</h2>
            </div>
            <div style={styles.cardBody}>
              <p style={styles.cardTagline}>{o.tagline}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
