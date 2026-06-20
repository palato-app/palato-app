import { useMemo, useState } from 'react'
import { useCoffees } from '../../lib/useCoffees'
import {
  usePendingAugmentations,
  runAugment,
  approveAugmentation,
  rejectAugmentation,
  type Augmentation,
  type ProposedFields,
} from './useAugmentations'

const cream = '#F4EAD5'
const espresso = '#1E1410'
const ember = '#D94E1F'
const ink50 = 'rgba(30,20,16,0.5)'
const line = 'rgba(30,20,16,0.12)'

const FIELD_LABELS: Record<keyof ProposedFields, string> = {
  roaster_name: 'Roaster',
  coffee_name: 'Coffee',
  origin_country: 'Origin',
  origin_region: 'Region',
  producer: 'Producer',
  farm: 'Farm',
  process: 'Process',
  process_detail: 'Process detail',
  roaster_stated_roast_level: 'Roast',
  variety: 'Variety',
  elevation_masl: 'Elevation',
  roaster_tasting_notes_raw: 'Tasting notes',
}

function fmt(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—'
  if (Array.isArray(v)) return v.length ? v.join(', ') : '—'
  return String(v)
}

const s = {
  h2: { fontFamily: 'Instrument Serif, Georgia, serif', fontSize: '1.5rem', margin: '1.5rem 0 0.5rem' } as const,
  sub: { fontSize: '0.82rem', color: ink50, margin: '0 0 0.75rem' } as const,
  card: { padding: '1rem 0', borderBottom: `1px solid ${line}` } as const,
  name: { fontFamily: 'Instrument Serif, Georgia, serif', fontSize: '1.2rem', margin: 0 } as const,
  meta: { fontSize: '0.8rem', color: ink50, margin: '0.15rem 0 0' } as const,
  row: { display: 'grid', gridTemplateColumns: '90px 1fr', gap: '0.5rem', fontSize: '0.82rem', padding: '0.2rem 0' } as const,
  fieldName: { color: ink50 } as const,
  diff: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap' as const, alignItems: 'baseline' } as const,
  cur: { color: ink50, textDecoration: 'line-through' as const } as const,
  prop: { color: espresso, fontWeight: 600 } as const,
  newTag: { color: ember, fontSize: '0.7rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em' } as const,
  actions: { display: 'flex', gap: '0.5rem', marginTop: '0.6rem', alignItems: 'center' } as const,
  approve: { background: espresso, color: cream, border: 'none', borderRadius: '999px', padding: '0.4rem 1.1rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' as const } as const,
  reject: { background: 'none', color: ink50, border: `1px solid ${line}`, borderRadius: '999px', padding: '0.4rem 1.1rem', fontSize: '0.82rem', cursor: 'pointer' as const } as const,
  src: { fontSize: '0.74rem', color: ink50, marginTop: '0.4rem', wordBreak: 'break-all' as const } as const,
  search: { width: '100%', padding: '0.5rem 0.75rem', border: `1px solid ${line}`, borderRadius: '8px', fontSize: '0.9rem', fontFamily: 'Geist, system-ui, sans-serif', boxSizing: 'border-box' as const, background: 'transparent', color: espresso } as const,
  pickRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', padding: '0.55rem 0', borderBottom: `1px solid ${line}` } as const,
  augBtn: { background: 'none', color: espresso, border: `1px solid ${espresso}`, borderRadius: '999px', padding: '0.3rem 0.9rem', fontSize: '0.78rem', cursor: 'pointer' as const, whiteSpace: 'nowrap' as const } as const,
  empty: { color: ink50, fontSize: '0.9rem', padding: '0.75rem 0' } as const,
}

function changedFields(aug: Augmentation): (keyof ProposedFields)[] {
  const cur = aug.coffee ?? ({} as Record<string, unknown>)
  return (Object.keys(aug.proposed) as (keyof ProposedFields)[]).filter((k) => {
    return fmt(aug.proposed[k]) !== fmt((cur as Record<string, unknown>)[k as string])
  })
}

function ProposalCard({ aug, onDone }: { aug: Augmentation; onDone: () => void }) {
  const [busy, setBusy] = useState(false)
  const cur = (aug.coffee ?? {}) as Record<string, unknown>
  const fields = changedFields(aug)

  const act = async (fn: () => Promise<{ error: string | null }>) => {
    setBusy(true)
    const { error } = await fn()
    setBusy(false)
    if (error) {
      alert(`Failed: ${error}`)
      return
    }
    onDone()
  }

  return (
    <div style={s.card}>
      <p style={s.name}>{aug.coffee?.coffee_name ?? 'Coffee'}</p>
      <p style={s.meta}>{aug.coffee?.roaster_name}</p>
      {fields.length === 0 ? (
        <p style={s.empty}>No changes proposed (web data matched what we have).</p>
      ) : (
        <div style={{ margin: '0.6rem 0' }}>
          {fields.map((k) => {
            const isNew = fmt(cur[k as string]) === '—'
            return (
              <div key={k} style={s.row}>
                <span style={s.fieldName}>{FIELD_LABELS[k]}</span>
                <span style={s.diff}>
                  {isNew ? (
                    <>
                      <span style={s.newTag}>new</span>
                      <span style={s.prop}>{fmt(aug.proposed[k])}</span>
                    </>
                  ) : (
                    <>
                      <span style={s.cur}>{fmt(cur[k as string])}</span>
                      <span>→</span>
                      <span style={s.prop}>{fmt(aug.proposed[k])}</span>
                    </>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      )}
      {aug.source_urls && aug.source_urls.length > 0 && (
        <p style={s.src}>Source: {aug.source_urls.join(' · ')}</p>
      )}
      <div style={s.actions}>
        <button style={s.approve} disabled={busy} onClick={() => act(() => approveAugmentation(aug))}>
          {busy ? '…' : 'Approve'}
        </button>
        <button style={s.reject} disabled={busy} onClick={() => act(() => rejectAugmentation(aug.id))}>
          Reject
        </button>
      </div>
    </div>
  )
}

export function AugmentSection() {
  const { items, loading, error, refetch } = usePendingAugmentations()
  const { coffees } = useCoffees()
  const [query, setQuery] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [flash, setFlash] = useState<string | null>(null)

  const approved = useMemo(
    () => coffees.filter((c) => c.moderation_status === 'approved'),
    [coffees],
  )
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return approved.slice(0, 25)
    return approved
      .filter((c) => `${c.roaster_name} ${c.coffee_name}`.toLowerCase().includes(q))
      .slice(0, 25)
  }, [approved, query])

  const onAugment = async (id: string) => {
    setBusyId(id)
    setFlash(null)
    const { error, fieldCount } = await runAugment(id)
    setBusyId(null)
    if (error) {
      setFlash(`Augment failed: ${error}`)
      return
    }
    setFlash(fieldCount ? `Proposal ready (${fieldCount} field${fieldCount === 1 ? '' : 's'}).` : 'Done — nothing to propose.')
    refetch()
  }

  return (
    <div>
      <h2 style={s.h2}>Pending proposals</h2>
      {loading ? (
        <p style={s.empty}>Loading…</p>
      ) : error ? (
        <p style={s.empty}>Couldn’t load: {error}</p>
      ) : items.length === 0 ? (
        <p style={s.empty}>No proposals waiting. Run augmentation on a coffee below.</p>
      ) : (
        items.map((a) => <ProposalCard key={a.id} aug={a} onDone={refetch} />)
      )}

      <h2 style={s.h2}>Run augmentation</h2>
      <p style={s.sub}>
        Claude searches the web for the roaster’s official data and proposes fact fixes/fills — nothing is
        applied until you approve it above.
      </p>
      {flash && <p style={{ ...s.sub, color: ember }}>{flash}</p>}
      <input
        style={s.search}
        placeholder="Search roaster or coffee…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div style={{ marginTop: '0.5rem' }}>
        {filtered.map((c) => (
          <div key={c.id} style={s.pickRow}>
            <span style={{ minWidth: 0 }}>
              <span style={{ fontWeight: 600 }}>{c.coffee_name}</span>
              <span style={{ color: ink50 }}> · {c.roaster_name}</span>
            </span>
            <button style={s.augBtn} disabled={busyId === c.id} onClick={() => onAugment(c.id)}>
              {busyId === c.id ? 'Searching…' : 'Augment'}
            </button>
          </div>
        ))}
        {filtered.length === 0 && <p style={s.empty}>No coffees match.</p>}
      </div>
    </div>
  )
}
