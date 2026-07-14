import { useMemo, useState } from 'react'
import { useCoffees } from '../../lib/useCoffees'
// Deliberate cross-feature seam (like catalog→StartHereRail): augmentation must
// propose regions inside Learn's demarcated vocabulary or the Learn→catalog link
// breaks (Decision #062). If a third consumer appears, move origins data to lib/.
import { regionsForCountry } from '../learn/data/originsData'
import {
  usePendingAugmentations,
  runAugment,
  approveAugmentation,
  rejectAugmentation,
  type Augmentation,
  type ProposedFields,
} from './useAugmentations'
import { theme } from '../../lib/theme'

const { cream, espresso, ember, ink50 } = theme
const line = theme.gridColor // the 0.12-ink hairline used across admin surfaces

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
  purchase_url: 'Buy URL',
  retailer_name: 'Retailer',
  price_usd: 'Price (USD)',
  bag_weight_grams: 'Bag size (g)',
  purchase_availability: 'Availability',
}

function fmt(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—'
  if (Array.isArray(v)) return v.length ? v.join(', ') : '—'
  return String(v)
}

// API spend per run is cents-scale — three decimals below a dollar so a 1.4¢
// run doesn't render as "$0.01" everywhere.
function fmtUsd(n: number): string {
  return `$${n.toFixed(n < 1 ? 3 : 2)}`
}

const s = {
  h2: { fontFamily: theme.displayFont, fontSize: '1.5rem', margin: '1.5rem 0 0.5rem' } as const,
  sub: { fontSize: '0.82rem', color: ink50, margin: '0 0 0.75rem' } as const,
  card: { padding: '1rem 0', borderBottom: `1px solid ${line}` } as const,
  name: { fontFamily: theme.displayFont, fontSize: '1.2rem', margin: 0 } as const,
  meta: { fontSize: '0.8rem', color: ink50, margin: '0.15rem 0 0' } as const,
  fieldRow: { display: 'grid', gridTemplateColumns: '22px 100px 1fr', gap: '0.5rem', alignItems: 'start', fontSize: '0.82rem', padding: '0.25rem 0' } as const,
  fieldName: { color: ink50 } as const,
  diff: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap' as const, alignItems: 'baseline' } as const,
  cur: { color: ink50, textDecoration: 'line-through' as const } as const,
  prop: { color: espresso, fontWeight: 600 } as const,
  newTag: { color: ember, fontSize: '0.7rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em' } as const,
  actions: { display: 'flex', gap: '0.5rem', marginTop: '0.6rem', alignItems: 'center' } as const,
  approve: { background: espresso, color: cream, border: 'none', borderRadius: '999px', padding: '0.4rem 1.1rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' as const } as const,
  approveOff: { background: 'rgba(30,20,16,0.25)', color: cream, border: 'none', borderRadius: '999px', padding: '0.4rem 1.1rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'not-allowed' as const } as const,
  reject: { background: 'none', color: ink50, border: `1px solid ${line}`, borderRadius: '999px', padding: '0.4rem 1.1rem', fontSize: '0.82rem', cursor: 'pointer' as const } as const,
  src: { fontSize: '0.74rem', color: ink50, marginTop: '0.4rem', wordBreak: 'break-all' as const } as const,
  search: { width: '100%', padding: '0.5rem 0.75rem', border: `1px solid ${line}`, borderRadius: '8px', fontSize: '0.9rem', fontFamily: theme.bodyFont, boxSizing: 'border-box' as const, background: 'transparent', color: espresso } as const,
  pickRow: { display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.55rem 0', borderBottom: `1px solid ${line}` } as const,
  augBtn: { background: 'none', color: espresso, border: `1px solid ${espresso}`, borderRadius: '999px', padding: '0.3rem 0.9rem', fontSize: '0.78rem', cursor: 'pointer' as const, whiteSpace: 'nowrap' as const } as const,
  batchBar: { display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.6rem 0' } as const,
  empty: { color: ink50, fontSize: '0.9rem', padding: '0.75rem 0' } as const,
}

function changedFields(aug: Augmentation): (keyof ProposedFields)[] {
  const cur = aug.coffee ?? ({} as Record<string, unknown>)
  return (Object.keys(aug.proposed) as (keyof ProposedFields)[]).filter((k) => {
    return fmt(aug.proposed[k]) !== fmt((cur as Record<string, unknown>)[k as string])
  })
}

function ProposalCard({ aug, onDone }: { aug: Augmentation; onDone: () => void }) {
  const cur = (aug.coffee ?? {}) as Record<string, unknown>
  const fields = changedFields(aug)
  const [selected, setSelected] = useState<Set<string>>(() => new Set(fields as string[]))
  const [busy, setBusy] = useState(false)

  const toggle = (k: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next
    })

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

  const chosen = fields.filter((k) => selected.has(k as string))

  return (
    <div style={s.card}>
      <p style={s.name}>{aug.coffee?.coffee_name ?? 'Coffee'}</p>
      <p style={s.meta}>
        {aug.coffee?.roaster_name}
        {typeof aug.raw_response?.est_cost_usd === 'number' && (
          <span> · run cost {fmtUsd(aug.raw_response.est_cost_usd)}</span>
        )}
      </p>
      {fields.length === 0 ? (
        <p style={s.empty}>No changes proposed (web data matched what we have).</p>
      ) : (
        <div style={{ margin: '0.6rem 0' }}>
          {fields.map((k) => {
            const isNew = fmt(cur[k as string]) === '—'
            return (
              <label key={k} style={{ ...s.fieldRow, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selected.has(k as string)}
                  onChange={() => toggle(k as string)}
                  style={{ marginTop: '2px', accentColor: espresso }}
                />
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
              </label>
            )
          })}
        </div>
      )}
      {aug.source_urls && aug.source_urls.length > 0 && (
        <p style={s.src}>Source: {aug.source_urls.join(' · ')}</p>
      )}
      <div style={s.actions}>
        <button
          style={chosen.length ? s.approve : s.approveOff}
          disabled={busy || chosen.length === 0}
          onClick={() => act(() => approveAugmentation(aug, chosen))}
        >
          {busy ? '…' : `Approve ${chosen.length}/${fields.length}`}
        </button>
        <button style={s.reject} disabled={busy} onClick={() => act(() => rejectAugmentation(aug.id))}>
          Reject all
        </button>
      </div>
    </div>
  )
}

export function AugmentSection() {
  const { items, loading, error, refetch } = usePendingAugmentations()
  const { coffees, refetch: refetchCoffees } = useCoffees()
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [progress, setProgress] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [needsUrl, setNeedsUrl] = useState<string[]>([])
  const [showAugmented, setShowAugmented] = useState(false)

  // Refresh both the proposal list and the coffee list (the latter so a just-
  // approved coffee's web_augmented_at lands and it drops from the run list).
  const refreshAll = () => {
    refetch()
    refetchCoffees()
  }

  // A coffee drops out of the run list once it's been augmented (web_augmented_at
  // set on approval) or while it has a pending proposal awaiting review.
  const pendingCoffeeIds = useMemo(() => new Set(items.map((i) => i.coffee_id)), [items])
  const approved = useMemo(
    () => coffees.filter((c) => c.moderation_status === 'approved'),
    [coffees],
  )
  const augmentedCount = useMemo(() => approved.filter((c) => c.web_augmented_at).length, [approved])
  const runnable = useMemo(
    () =>
      approved.filter(
        (c) => (showAugmented || !c.web_augmented_at) && !pendingCoffeeIds.has(c.id),
      ),
    [approved, pendingCoffeeIds, showAugmented],
  )
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return runnable.slice(0, 30)
    return runnable
      .filter((c) => `${c.roaster_name} ${c.coffee_name}`.toLowerCase().includes(q))
      .slice(0, 30)
  }, [runnable, query])

  const togglePick = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  // Sequential so we don't hammer Claude / the serverless function. Proposals
  // stream into the review list above as each completes.
  const runBatch = async (ids: string[]) => {
    setRunning(true)
    setErrors([])
    setNeedsUrl([])
    const errs: string[] = []
    const noUrl: string[] = []
    let ready = 0
    let nothing = 0
    let spend = 0
    for (let i = 0; i < ids.length; i++) {
      const c = coffees.find((x) => x.id === ids[i])
      setProgress(`Augmenting ${i + 1} of ${ids.length}: ${c?.coffee_name ?? '…'}…`)
      const vocab = c?.origin_country ? regionsForCountry(c.origin_country).map((r) => r.name) : []
      const { error, fieldCount, costUsd, reason } = await runAugment(ids[i], vocab)
      if (costUsd) spend += costUsd
      if (error) errs.push(`${c?.coffee_name ?? 'Coffee'} — ${error}`)
      else if (fieldCount && fieldCount > 0) ready++
      else if (reason === 'needs_url') noUrl.push(c?.coffee_name ?? 'Coffee')
      else nothing++
      refetch()
    }
    setRunning(false)
    setPicked(new Set())
    setProgress(
      `Done — ${ready} proposal${ready === 1 ? '' : 's'} ready` +
        `${nothing ? `, ${nothing} had nothing to add` : ''}` +
        `${noUrl.length ? `, ${noUrl.length} need${noUrl.length === 1 ? 's' : ''} a URL` : ''}` +
        `${errs.length ? `, ${errs.length} failed` : ''}` +
        ` · ${fmtUsd(spend)} API spend.`,
    )
    setErrors(errs)
    setNeedsUrl(noUrl)
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
        items.map((a) => <ProposalCard key={a.id} aug={a} onDone={refreshAll} />)
      )}

      <h2 style={s.h2}>Run augmentation</h2>
      <p style={s.sub}>
        Fetches the roaster’s product page (the URL you pasted at approval, or one cheap search
        to find it) and Claude proposes fixes/fills + where to buy — nothing is applied until you
        approve it above. Tick fields per proposal to accept only some.
        {augmentedCount > 0 && (
          <>
            {' '}
            {showAugmented ? `${augmentedCount} already augmented. ` : `${augmentedCount} already-augmented hidden. `}
            <button
              onClick={() => setShowAugmented((v) => !v)}
              style={{ background: 'none', border: 'none', padding: 0, color: ember, cursor: 'pointer', fontSize: 'inherit', fontFamily: 'inherit', textDecoration: 'underline' }}
            >
              {showAugmented ? 'Hide them' : 'Show them (to re-augment)'}
            </button>
          </>
        )}
      </p>

      <input
        style={s.search}
        placeholder="Search roaster or coffee…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div style={s.batchBar}>
        <button
          style={picked.size && !running ? s.augBtn : { ...s.augBtn, opacity: 0.4, cursor: 'not-allowed' }}
          disabled={!picked.size || running}
          onClick={() => runBatch([...picked])}
        >
          {running ? 'Working…' : `Augment selected (${picked.size})`}
        </button>
        {progress && <span style={{ ...s.sub, margin: 0, color: ember }}>{progress}</span>}
      </div>

      {errors.length > 0 && (
        <ul style={{ ...s.sub, paddingLeft: '1.1rem', margin: '0 0 0.75rem' }}>
          {errors.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      )}

      {needsUrl.length > 0 && (
        <p style={{ ...s.sub, margin: '0 0 0.75rem' }}>
          No product page found for: {needsUrl.join(', ')}. Paste the roaster’s product URL when
          approving in the Verify queue — or set it on the coffee — and re-run.
        </p>
      )}

      <div>
        {filtered.map((c) => (
          <div key={c.id} style={s.pickRow}>
            <input
              type="checkbox"
              checked={picked.has(c.id)}
              onChange={() => togglePick(c.id)}
              disabled={running}
              style={{ accentColor: espresso }}
            />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontWeight: 600 }}>{c.coffee_name}</span>
              <span style={{ color: ink50 }}> · {c.roaster_name}</span>
              {c.web_augmented_at && (
                <span style={{ color: ember, fontSize: '0.7rem', marginLeft: '0.4rem' }}>✓ augmented</span>
              )}
            </span>
            <button
              style={s.augBtn}
              disabled={running}
              onClick={() => runBatch([c.id])}
            >
              {c.web_augmented_at ? 'Re-augment' : 'Augment'}
            </button>
          </div>
        ))}
        {filtered.length === 0 && <p style={s.empty}>No coffees match.</p>}
      </div>
    </div>
  )
}
