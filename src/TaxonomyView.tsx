import { useState } from 'react'
import { useFlavorDescriptors, type FlavorDescriptor } from './lib/useFlavorDescriptors'
import { useAuth } from './lib/auth'

// Light-to-dark category ordering for the flavor block.
// Body & Mouthfeel handled separately (rendered after the perceptual divider).
// Defects handled separately (rendered in collapsible at bottom).
const FLAVOR_CATEGORY_ORDER = [
  'Fruit',
  'Floral',
  'Fermented & Funky',
  'Sweet',
  'Spice',
  'Nutty & Cocoa',
  'Roasted',
  'Earthy & Wood',
]

const styles = {
  container: { marginTop: '4rem' } as const,
  hero: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
    marginBottom: '5rem',
    alignItems: 'end',
  } as const,
  heroEyebrow: {
    fontFamily: 'Geist, system-ui, sans-serif',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.18em',
    fontSize: '0.75rem',
    color: '#D94E1F',
    margin: '0 0 0.75rem',
    fontWeight: 600,
  },
  heroHeadline: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: 'clamp(3.5rem, 7vw, 6rem)',
    lineHeight: 0.95,
    letterSpacing: '-0.025em',
    margin: 0,
    fontWeight: 400,
  } as const,
  heroEm: {
    fontStyle: 'italic' as const,
    color: '#D94E1F',
  },
  heroMeta: {
    textAlign: 'right' as const,
    fontSize: '0.95rem',
    opacity: 0.7,
    lineHeight: 1.4,
  },
  category: {
    marginBottom: '4.5rem',
    display: 'grid',
    gridTemplateColumns: '240px 1fr',
    gap: '3rem',
  } as const,
  categoryMeta: {
    position: 'sticky' as const,
    top: '2rem',
    alignSelf: 'start' as const,
    textAlign: 'left' as const,
  },
  categoryNumber: {
    fontFamily: '"Boldonse", system-ui',
    fontSize: '0.85rem',
    letterSpacing: '0.05em',
    opacity: 0.5,
    marginBottom: '0.5rem',
  },
  categoryTitle: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: '2.75rem',
    lineHeight: 1,
    margin: '0 0 0.75rem',
    letterSpacing: '-0.02em',
  } as const,
  categoryRule: {
    width: '100%',
    height: '3px',
    marginBottom: '0.75rem',
  },
  categoryCount: {
    fontSize: '0.8rem',
    opacity: 0.55,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
  },
  subcat: {
    marginBottom: '1.75rem',
    textAlign: 'left' as const,
  },
  subcatLabel: {
    fontFamily: '"Instrument Serif", serif',
    fontStyle: 'italic' as const,
    fontSize: '1.15rem',
    margin: '0 0 0.5rem',
    opacity: 0.85,
    textAlign: 'left' as const,
  },
  descriptorList: {
    listStyle: 'none' as const,
    padding: 0,
    margin: 0,
    display: 'flex' as const,
    flexWrap: 'wrap' as const,
    gap: '0.5rem 0',
    justifyContent: 'flex-start' as const,
  },
  perceptualDivider: {
    margin: '3rem 0',
    textAlign: 'center' as const,
    opacity: 0.45,
  },
  perceptualDividerSpan: {
    fontFamily: '"Instrument Serif", serif',
    fontStyle: 'italic' as const,
    fontSize: '1.1rem',
    letterSpacing: '0.05em',
    padding: '0 1rem',
  },
  perceptualDividerRule: {
    display: 'inline-block' as const,
    width: '80px',
    height: '1px',
    background: '#1E1410',
    verticalAlign: 'middle' as const,
    opacity: 0.5,
  },
  defectsSection: {
    marginTop: '5rem',
    paddingTop: '2.5rem',
    borderTop: '1px solid rgba(30, 20, 16, 0.15)',
    textAlign: 'left' as const,
  },
  defectsToggle: {
    fontFamily: '"Instrument Serif", serif',
    fontStyle: 'italic' as const,
    fontSize: '1.5rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer' as const,
    color: '#1E1410',
    opacity: 0.6,
    padding: 0,
    textAlign: 'left' as const,
    display: 'inline-block' as const,
  },
}

export function TaxonomyView() {
  const { descriptors, loading, error } = useFlavorDescriptors()
  const { user } = useAuth()
  const [defectsExpanded, setDefectsExpanded] = useState(false)

  if (loading) return <p style={{ opacity: 0.5 }}>Loading flavors…</p>
  if (error) return <p style={{ color: '#D94E1F' }}>Couldn't load flavors: {error}</p>

  // Partition: flavor (in custom order), body & mouthfeel, defects
  const byCategory = groupByCategory(descriptors.filter((d) => !d.is_defect))
  const bodyDescriptors = byCategory.get('Body & Mouthfeel') ?? []
  const defectDescriptors = descriptors.filter((d) => d.is_defect)

  const flavorCategories = FLAVOR_CATEGORY_ORDER.map((name) => ({
    name,
    descriptors: byCategory.get(name) ?? [],
  })).filter((c) => c.descriptors.length > 0)

  const totalNonDefect = descriptors.filter((d) => !d.is_defect).length

  // Grab first name for the welcome eyebrow; fall back to "friend"
  const firstName = user?.user_metadata.full_name?.split(' ')[0] ?? 'friend'

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <div>
          <p style={styles.heroEyebrow}>Welcome, {firstName}</p>
          <h2 style={styles.heroHeadline}>
            The flavor <em style={styles.heroEm}>vocabulary</em>.
          </h2>
        </div>
        <div style={styles.heroMeta}>
          <strong style={{ fontWeight: 600, opacity: 0.95 }}>{totalNonDefect} descriptors</strong>
          <br />
          across nine categories
          <br />
          <span style={{ opacity: 0.5 }}>v01 · May 2026</span>
        </div>
      </section>

      {flavorCategories.map((cat, idx) => (
        <CategoryBlock
          key={cat.name}
          number={idx + 1}
          name={cat.name}
          descriptors={cat.descriptors}
        />
      ))}

      {bodyDescriptors.length > 0 && (
        <>
          <div style={styles.perceptualDivider}>
            <span style={styles.perceptualDividerRule}></span>
            <span style={styles.perceptualDividerSpan}>feel</span>
            <span style={styles.perceptualDividerRule}></span>
          </div>
          <CategoryBlock
            number={9}
            name="Body & Mouthfeel"
            descriptors={bodyDescriptors}
            italicTitle
          />
        </>
      )}

      <div style={styles.defectsSection}>
        <button
          onClick={() => setDefectsExpanded(!defectsExpanded)}
          style={styles.defectsToggle}
        >
          {defectsExpanded ? '▼' : '▶'} Defects &amp; off-flavors ({defectDescriptors.length})
        </button>
        {defectsExpanded && (
          <div style={{ marginTop: '2rem' }}>
            {Array.from(groupByCategory(defectDescriptors).entries()).map(([cat, descs]) => (
              <CategoryBlock key={cat} name={cat} descriptors={descs} italicTitle />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CategoryBlock({
  number,
  name,
  descriptors,
  italicTitle = false,
}: {
  number?: number
  name: string
  descriptors: FlavorDescriptor[]
  italicTitle?: boolean
}) {
  const iconColor = descriptors[0]?.category_icon_color ?? '#1E1410'
  const subcats = groupBySubcategory(descriptors)

  return (
    <section style={styles.category}>
      <div style={styles.categoryMeta}>
        {number !== undefined && (
          <div style={styles.categoryNumber}>{String(number).padStart(2, '0')}</div>
        )}
        <h3 style={{ ...styles.categoryTitle, fontStyle: italicTitle ? 'italic' : 'normal' }}>
          {name}
        </h3>
        <div style={{ ...styles.categoryRule, background: iconColor }}></div>
        <div style={styles.categoryCount}>
          {descriptors.length} descriptor{descriptors.length === 1 ? '' : 's'}
        </div>
      </div>
      <div>
        {Array.from(subcats.entries()).map(([subcat, descs]) => (
          <div key={subcat} style={styles.subcat}>
            <h4 style={styles.subcatLabel}>{subcat}</h4>
            <ul style={styles.descriptorList}>
              {descs.map((d, i) => (
                <DescriptorItem key={d.id} descriptor={d} isLast={i === descs.length - 1} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

function DescriptorItem({
  descriptor,
  isLast,
}: {
  descriptor: FlavorDescriptor
  isLast: boolean
}) {
  const [hover, setHover] = useState(false)
  return (
    <li
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        fontFamily: 'Geist, system-ui, sans-serif',
        fontWeight: 500,
        fontSize: '1rem',
        lineHeight: 1.3,
        cursor: 'default',
        color: hover ? '#D94E1F' : '#1E1410',
        transition: 'color 0.15s',
      }}
    >
      {descriptor.descriptor}
      {!isLast && <span style={{ margin: '0 0.85rem', opacity: 0.4 }}>·</span>}
    </li>
  )
}

function groupByCategory(descriptors: FlavorDescriptor[]): Map<string, FlavorDescriptor[]> {
  const groups = new Map<string, FlavorDescriptor[]>()
  for (const d of descriptors) {
    if (!groups.has(d.category)) groups.set(d.category, [])
    groups.get(d.category)!.push(d)
  }
  return groups
}

function groupBySubcategory(descriptors: FlavorDescriptor[]): Map<string, FlavorDescriptor[]> {
  const groups = new Map<string, FlavorDescriptor[]>()
  for (const d of descriptors) {
    if (!groups.has(d.subcategory)) groups.set(d.subcategory, [])
    groups.get(d.subcategory)!.push(d)
  }
  return groups
}
