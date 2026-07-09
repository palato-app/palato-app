import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useCoffees, type Coffee } from '../../lib/useCoffees'
import { CoffeePlaceholder } from '../../components/CoffeePlaceholder'
import { StartHereRail } from '../palate/StartHereRail'
import { ScanHowItWorks } from '../../components/ScanHowItWorks'
import { ROAST_LABELS, PROCESS_LABELS } from '../../lib/labels'

const ROAST_ORDER = ['light', 'medium_light', 'medium', 'medium_dark', 'dark']

type SortKey = 'roaster' | 'newest' | 'origin'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'roaster', label: 'Roaster' },
  { key: 'origin', label: 'Origin' },
  { key: 'newest', label: 'Newest' },
]

function toggleSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

function deriveFilterValues(coffees: Coffee[]) {
  const origins = new Map<string, number>()
  const roasts = new Map<string, number>()
  const processes = new Map<string, number>()

  for (const c of coffees) {
    if (c.origin_country) origins.set(c.origin_country, (origins.get(c.origin_country) ?? 0) + 1)
    if (c.roaster_stated_roast_level && c.roaster_stated_roast_level !== 'unspecified')
      roasts.set(c.roaster_stated_roast_level, (roasts.get(c.roaster_stated_roast_level) ?? 0) + 1)
    if (c.process) processes.set(c.process, (processes.get(c.process) ?? 0) + 1)
  }

  const sortedOrigins = [...origins.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k)
  const sortedRoasts = [...roasts.entries()]
    .sort((a, b) => ROAST_ORDER.indexOf(a[0]) - ROAST_ORDER.indexOf(b[0]))
    .map(([k]) => k)
  const sortedProcesses = [...processes.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k)

  return {
    origins: sortedOrigins,
    originCounts: origins,
    roasts: sortedRoasts,
    roastCounts: roasts,
    processes: sortedProcesses,
    processCounts: processes,
  }
}

function sortCoffees(coffees: Coffee[], key: SortKey): Coffee[] {
  const sorted = [...coffees]
  switch (key) {
    case 'roaster':
      return sorted.sort(
        (a, b) => a.roaster_name.localeCompare(b.roaster_name) || a.coffee_name.localeCompare(b.coffee_name)
      )
    case 'origin':
      return sorted.sort(
        (a, b) => (a.origin_country ?? 'ZZZ').localeCompare(b.origin_country ?? 'ZZZ') || a.roaster_name.localeCompare(b.roaster_name)
      )
    case 'newest':
      return sorted.sort((a, b) => b.created_at.localeCompare(a.created_at))
  }
}

// --- FilterPill: a compact dropdown trigger + menu ---

type FilterPillProps = {
  label: string
  options: string[]
  counts: Map<string, number>
  selected: Set<string>
  onToggle: (value: string) => void
  displayLabel?: (value: string) => string
}

function FilterPill({ label, options, counts, selected, onToggle, displayLabel }: FilterPillProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, close])

  const hasSelection = selected.size > 0
  const pillLabel = hasSelection
    ? selected.size === 1
      ? (displayLabel ?? ((v: string) => v))([...selected][0])
      : `${label} (${selected.size})`
    : label

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          fontFamily: 'Geist, system-ui, sans-serif',
          fontSize: '0.8rem',
          padding: '0.4rem 0.75rem',
          borderRadius: '20px',
          border: hasSelection ? '1px solid #D94E1F' : '1px solid rgba(30, 20, 16, 0.2)',
          background: hasSelection ? 'rgba(217, 78, 31, 0.08)' : 'rgba(255, 255, 255, 0.35)',
          color: hasSelection ? '#D94E1F' : '#1E1410',
          cursor: 'pointer',
          transition: 'all 0.15s',
          fontWeight: hasSelection ? 600 : 400,
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          whiteSpace: 'nowrap',
        }}
      >
        {pillLabel}
        <span style={{ fontSize: '0.6rem', opacity: 0.6, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
          ▼
        </span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            minWidth: '180px',
            maxHeight: '260px',
            overflowY: 'auto',
            background: '#FAF5EB',
            border: '1px solid rgba(30, 20, 16, 0.15)',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(30, 20, 16, 0.12)',
            zIndex: 100,
            padding: '0.35rem 0',
          }}
        >
          {options.map((opt) => {
            const isSelected = selected.has(opt)
            const display = displayLabel ? displayLabel(opt) : opt
            const count = counts.get(opt) ?? 0
            return (
              <button
                key={opt}
                onClick={() => onToggle(opt)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.45rem 0.85rem',
                  border: 'none',
                  background: isSelected ? 'rgba(217, 78, 31, 0.06)' : 'transparent',
                  color: isSelected ? '#D94E1F' : '#1E1410',
                  fontFamily: 'Geist, system-ui, sans-serif',
                  fontSize: '0.82rem',
                  fontWeight: isSelected ? 600 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.1s',
                }}
              >
                <span>{display}</span>
                <span style={{ fontSize: '0.72rem', opacity: 0.4, fontWeight: 400 }}>{count}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// --- Styles ---

const styles = {
  container: { marginTop: '4rem' } as const,
  hero: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
    marginBottom: '3rem',
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

  filterBar: {
    marginBottom: '2.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  searchRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.9rem',
    padding: '0.6rem 1rem',
    border: '1px solid rgba(30, 20, 16, 0.2)',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.35)',
    color: '#1E1410',
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  controlsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
  },
  divider: {
    width: '1px',
    height: '18px',
    background: 'rgba(30, 20, 16, 0.12)',
    flexShrink: 0,
    margin: '0 0.15rem',
  },
  sortGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    flexShrink: 0,
  },
  sortLabel: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    color: '#1E1410',
    opacity: 0.4,
    marginRight: '0.1rem',
  },
  sortButton: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.75rem',
    padding: '0.3rem 0.6rem',
    borderRadius: '6px',
    border: '1px solid rgba(30, 20, 16, 0.12)',
    background: 'transparent',
    color: '#1E1410',
    cursor: 'pointer' as const,
    transition: 'all 0.15s',
    opacity: 0.55,
  },
  sortButtonActive: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.75rem',
    padding: '0.3rem 0.6rem',
    borderRadius: '6px',
    border: '1px solid #D94E1F',
    background: 'rgba(217, 78, 31, 0.08)',
    color: '#D94E1F',
    cursor: 'pointer' as const,
    transition: 'all 0.15s',
    fontWeight: 600,
  },
  statusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: '1.5rem',
  },
  resultCount: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.78rem',
    color: '#1E1410',
    opacity: 0.45,
  },
  clearButton: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.72rem',
    padding: '0.2rem 0.55rem',
    borderRadius: '6px',
    border: '1px solid rgba(217, 78, 31, 0.3)',
    background: 'transparent',
    color: '#D94E1F',
    cursor: 'pointer' as const,
    transition: 'all 0.15s',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '4rem 2rem',
    opacity: 0.5,
  },
  emptyHeadline: {
    fontFamily: '"Instrument Serif", serif',
    fontStyle: 'italic' as const,
    fontSize: '1.5rem',
    margin: '0 0 0.5rem',
    color: '#1E1410',
  },
  emptyHint: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.85rem',
    color: '#1E1410',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '2rem',
  } as const,
  card: {
    display: 'flex',
    flexDirection: 'column' as const,
    border: '1px solid rgba(30, 20, 16, 0.2)',
    borderRadius: '12px',
    overflow: 'hidden' as const,
    background: 'rgba(255, 255, 255, 0.25)',
    transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
    padding: 0,
    fontFamily: 'inherit',
    color: 'inherit',
    textAlign: 'left' as const,
    cursor: 'pointer' as const,
    width: '100%',
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: '1 / 1',
    background: 'rgba(30, 20, 16, 0.05)',
    overflow: 'hidden' as const,
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    display: 'block',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1E1410',
    opacity: 0.3,
    fontFamily: '"Instrument Serif", serif',
    fontStyle: 'italic' as const,
    fontSize: '0.95rem',
  } as const,
  cardBody: {
    padding: '1rem 1.1rem 1.25rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  cardRoaster: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
    color: '#1E1410',
    opacity: 0.6,
  } as const,
  cardName: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: '1.35rem',
    lineHeight: 1.15,
    letterSpacing: '-0.01em',
    color: '#1E1410',
    margin: '0.1rem 0 0.4rem',
  },
  cardMeta: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.85rem',
    color: '#1E1410',
    opacity: 0.7,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  cardMetaDot: {
    opacity: 0.5,
  },
}

type Props = {
  onSelectCoffee: (coffeeId: string) => void
  initialOrigin?: string | null
}

export function BrowseCoffees({ onSelectCoffee, initialOrigin = null }: Props) {
  const { coffees, loading, error } = useCoffees()

  // Arriving with an origin (Learn CTA, Palate map) means "show me those
  // coffees" — land on the filtered results, not the hero + rails above them.
  const resultsRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (initialOrigin && !loading) resultsRef.current?.scrollIntoView({ block: 'start' })
  }, [initialOrigin, loading])

  const [search, setSearch] = useState('')
  // Seeded from `initialOrigin` when arriving via Learn's "See [Origin]
  // coffees" (§6). The catalog is remounted (keyed) on origin change, so the
  // initializer is the single source of truth — no syncing effect needed.
  const [selectedOrigins, setSelectedOrigins] = useState<Set<string>>(
    initialOrigin ? new Set([initialOrigin]) : new Set()
  )
  const [selectedRoasts, setSelectedRoasts] = useState<Set<string>>(new Set())
  const [selectedProcesses, setSelectedProcesses] = useState<Set<string>>(new Set())
  const [sortKey, setSortKey] = useState<SortKey>('roaster')

  const filterValues = useMemo(() => deriveFilterValues(coffees), [coffees])

  const hasActiveFilters = search.length > 0 || selectedOrigins.size > 0 || selectedRoasts.size > 0 || selectedProcesses.size > 0

  const filtered = useMemo(() => {
    let result = coffees

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.roaster_name.toLowerCase().includes(q) ||
          c.coffee_name.toLowerCase().includes(q) ||
          (c.origin_country?.toLowerCase().includes(q) ?? false) ||
          (c.origin_region?.toLowerCase().includes(q) ?? false)
      )
    }

    if (selectedOrigins.size > 0)
      result = result.filter((c) => c.origin_country !== null && selectedOrigins.has(c.origin_country))
    if (selectedRoasts.size > 0)
      result = result.filter((c) => c.roaster_stated_roast_level !== null && selectedRoasts.has(c.roaster_stated_roast_level))
    if (selectedProcesses.size > 0)
      result = result.filter((c) => c.process !== null && selectedProcesses.has(c.process))

    return sortCoffees(result, sortKey)
  }, [coffees, search, selectedOrigins, selectedRoasts, selectedProcesses, sortKey])

  function clearAll() {
    setSearch('')
    setSelectedOrigins(new Set())
    setSelectedRoasts(new Set())
    setSelectedProcesses(new Set())
  }

  if (loading) return <p style={{ opacity: 0.5 }}>Loading coffees…</p>
  if (error) return <p style={{ color: '#D94E1F' }}>Couldn't load coffees: {error}</p>

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <div>
          <p style={styles.heroEyebrow}>Palato</p>
          <h2 style={styles.heroHeadline}>
            Our Growing <em style={styles.heroEm}>Library</em>
          </h2>
        </div>
        <div style={styles.heroMeta}>
          <strong style={{ fontWeight: 600, opacity: 0.95 }}>{coffees.length} coffees</strong>
          <br />
          from {new Set(coffees.map((c) => c.roaster_name)).size} roasters
          <br />
          <span style={{ opacity: 0.5 }}>v01 · May 2026</span>
        </div>
      </section>

      <StartHereRail coffees={coffees} onSelectCoffee={onSelectCoffee} />

      <ScanHowItWorks />

      <div ref={resultsRef} style={{ ...styles.filterBar, scrollMarginTop: '1.5rem' }}>
        <div style={styles.searchRow}>
          <input
            type="text"
            placeholder="Search roasters, coffees, origins…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.controlsRow}>
          {filterValues.origins.length > 0 && (
            <FilterPill
              label="Origin"
              options={filterValues.origins}
              counts={filterValues.originCounts}
              selected={selectedOrigins}
              onToggle={(v) => setSelectedOrigins(toggleSet(selectedOrigins, v))}
            />
          )}
          {filterValues.roasts.length > 0 && (
            <FilterPill
              label="Roast"
              options={filterValues.roasts}
              counts={filterValues.roastCounts}
              selected={selectedRoasts}
              onToggle={(v) => setSelectedRoasts(toggleSet(selectedRoasts, v))}
              displayLabel={(v) => ROAST_LABELS[v] || v}
            />
          )}
          {filterValues.processes.length > 0 && (
            <FilterPill
              label="Process"
              options={filterValues.processes}
              counts={filterValues.processCounts}
              selected={selectedProcesses}
              onToggle={(v) => setSelectedProcesses(toggleSet(selectedProcesses, v))}
              displayLabel={(v) => PROCESS_LABELS[v] || v}
            />
          )}

          <div style={styles.divider} />

          <div style={styles.sortGroup}>
            <span style={styles.sortLabel}>Sort</span>
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSortKey(opt.key)}
                style={sortKey === opt.key ? styles.sortButtonActive : styles.sortButton}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <>
              <div style={{ flex: 1 }} />
              <button onClick={clearAll} style={styles.clearButton}>
                Clear all
              </button>
            </>
          )}
        </div>

        {hasActiveFilters && (
          <div style={styles.statusRow}>
            <span style={styles.resultCount}>
              {filtered.length === coffees.length
                ? `${coffees.length} coffees`
                : `${filtered.length} of ${coffees.length} coffees`}
            </span>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyHeadline}>No matches</p>
          <p style={styles.emptyHint}>Try broadening your filters or search.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {filtered.map((coffee) => (
            <CoffeeCard
              key={coffee.id}
              coffee={coffee}
              onClick={() => onSelectCoffee(coffee.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CoffeeCard({ coffee, onClick }: { coffee: Coffee; onClick: () => void }) {
  const roastLabel = coffee.roaster_stated_roast_level
    ? ROAST_LABELS[coffee.roaster_stated_roast_level] ?? ''
    : ''

  return (
    <button onClick={onClick} style={styles.card}>
      <div style={styles.imageWrapper}>
        {coffee.bag_image_url ? (
          <img src={coffee.bag_image_url} alt={`${coffee.coffee_name} bag`} style={styles.image} />
        ) : (
          <CoffeePlaceholder coffeeId={coffee.id} />
        )}
      </div>
      <div style={styles.cardBody}>
        <div style={styles.cardRoaster}>{coffee.roaster_name}</div>
        <h3 style={styles.cardName}>{coffee.coffee_name}</h3>
        <div style={styles.cardMeta}>
          {coffee.origin_country && <span>{coffee.origin_country}</span>}
          {coffee.origin_country && roastLabel && <span style={styles.cardMetaDot}>·</span>}
          {roastLabel && <span>{roastLabel}</span>}
        </div>
      </div>
    </button>
  )
}