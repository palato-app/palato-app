import { useRef, useState, type ReactNode } from 'react'
import {
  usePendingCoffees,
  useRejectedCoffees,
  approveCoffee,
  rejectCoffee,
  restoreCoffee,
  type PendingCoffee,
} from './usePendingCoffees'
import { CoffeePlaceholder } from '../../components/CoffeePlaceholder'
import { AugmentSection } from './AugmentSection'
import { MaintenanceTools } from './MaintenanceTools'
import { useAuth } from '../../lib/auth'
import { supabase } from '../../lib/supabase'
import { prepareImage, uploadBagImage } from '../../lib/bagImage'
import { theme } from '../../lib/theme'
import { runAugment } from './useAugmentations'
// Same sanctioned admin→learn seam as AugmentSection: proposed regions must stay
// inside Learn's demarcated vocabulary (Decision #062).
import { regionsForCountry } from '../learn/data/originsData'

const { cream, espresso, ember, ink50 } = theme
const line = theme.gridColor // the 0.12-ink hairline used across admin surfaces

type Section = 'verify' | 'augment'

const styles = {
  h1: {
    fontFamily: theme.displayFont,
    fontSize: '2.4rem',
    lineHeight: 1.05,
    margin: '0 0 0.25rem',
  } as const,
  eyebrow: {
    fontSize: '0.7rem',
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    color: ember,
    fontWeight: 600,
    margin: 0,
  } as const,
  tabs: {
    display: 'flex',
    gap: '1.25rem',
    borderBottom: `1px solid ${line}`,
    margin: '1.5rem 0',
  } as const,
  tab: (active: boolean) => ({
    background: 'none',
    border: 'none',
    padding: '0.4rem 0',
    marginBottom: '-1px',
    fontFamily: theme.bodyFont,
    fontSize: '0.95rem',
    fontWeight: 500,
    color: espresso,
    opacity: active ? 1 : 0.45,
    cursor: 'pointer' as const,
    borderBottom: active ? `2px solid ${espresso}` : '2px solid transparent',
  }),
  card: {
    display: 'flex',
    gap: '1rem',
    padding: '1rem 0',
    borderBottom: `1px solid ${line}`,
  } as const,
  thumb: {
    width: '72px',
    height: '96px',
    flexShrink: 0,
    borderRadius: '6px',
    objectFit: 'cover' as const,
    background: 'rgba(30,20,16,0.06)',
    border: `1px solid ${line}`,
  } as const,
  thumbEmpty: {
    width: '72px',
    height: '96px',
    flexShrink: 0,
    borderRadius: '6px',
    background: 'rgba(30,20,16,0.06)',
    border: `1px dashed ${line}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.6rem',
    color: ink50,
    textAlign: 'center' as const,
    padding: '0 4px',
  } as const,
  name: {
    fontFamily: theme.displayFont,
    fontSize: '1.3rem',
    lineHeight: 1.1,
    margin: 0,
  } as const,
  meta: { fontSize: '0.82rem', color: ink50, margin: '0.2rem 0 0' } as const,
  actions: { display: 'flex', gap: '0.5rem', marginTop: '0.6rem', flexWrap: 'wrap' as const } as const,
  urlInput: {
    width: '100%',
    padding: '0.45rem 0.65rem',
    border: `1px solid ${line}`,
    borderRadius: '8px',
    fontSize: '0.82rem',
    fontFamily: theme.bodyFont,
    boxSizing: 'border-box' as const,
    background: 'transparent',
    color: espresso,
    marginTop: '0.6rem',
  } as const,
  approve: {
    background: espresso,
    color: cream,
    border: 'none',
    borderRadius: '999px',
    padding: '0.4rem 1.1rem',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer' as const,
  } as const,
  reject: {
    background: 'none',
    color: ink50,
    border: `1px solid ${line}`,
    borderRadius: '999px',
    padding: '0.4rem 1.1rem',
    fontSize: '0.82rem',
    cursor: 'pointer' as const,
  } as const,
  empty: { color: ink50, fontSize: '0.95rem', padding: '2rem 0' } as const,
  sectionLabel: {
    fontSize: '0.7rem',
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    color: ink50,
    fontWeight: 600,
    margin: '2.5rem 0 0.25rem',
  } as const,
  sectionNote: { fontSize: '0.82rem', color: ink50, margin: '0 0 0.75rem', maxWidth: '30rem', lineHeight: 1.4 } as const,
}

function summarize(c: PendingCoffee): string {
  return [c.origin_country, c.process, c.roaster_stated_roast_level]
    .filter((v) => v && v !== 'unspecified')
    .join(' · ')
}

/** The shared coffee card shell (thumb + facts), with an action-button slot. */
function CoffeeRow({ c, children }: { c: PendingCoffee; children: ReactNode }) {
  return (
    <div style={styles.card}>
      {c.bag_image_url ? (
        <img src={c.bag_image_url} alt={`${c.coffee_name} bag`} style={styles.thumb} />
      ) : (
        <CoffeePlaceholder coffeeId={c.id} style={{ width: '72px', height: '96px', flexShrink: 0, borderRadius: '6px' }} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={styles.name}>{c.coffee_name}</p>
        <p style={styles.meta}>{c.roaster_name}</p>
        {summarize(c) && <p style={styles.meta}>{summarize(c)}</p>}
        <div style={styles.actions}>{children}</div>
      </div>
    </div>
  )
}

/**
 * Replace a coffee's bag photo in-app, reusing the same validate/HEIC-convert/
 * upload path as the add flow (lib/bagImage). Fixes the "rejected only because
 * the photo was bad" case without hand-editing Supabase Storage.
 */
function ReplacePhotoButton({ coffeeId, onDone }: { coffeeId: string; onDone: () => void }) {
  const { user } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (inputRef.current) inputRef.current.value = '' // allow re-picking the same file
    if (!file || !user) return
    setBusy(true)
    try {
      const prepared = await prepareImage(file)
      const url = await uploadBagImage(prepared, user.id)
      const { error } = await supabase.from('coffees').update({ bag_image_url: url }).eq('id', coffeeId)
      if (error) throw error
      onDone()
    } catch (err) {
      alert(`Photo upload failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,.heic,.heif"
        style={{ display: 'none' }}
        onChange={onFile}
      />
      <button style={styles.reject} disabled={busy} onClick={() => inputRef.current?.click()}>
        {busy ? 'Uploading…' : 'Replace photo'}
      </button>
    </>
  )
}

function VerifyQueue() {
  const pending = usePendingCoffees()
  const rejected = useRejectedCoffees()
  const [busyId, setBusyId] = useState<string | null>(null)
  // Per-coffee product-page URL, pasted by the admin before approving. When set,
  // approval also stamps coffees.source_url and fires augmentation immediately —
  // the cheap fetch-only path, no discovery search (revision of #047/#048).
  const [urls, setUrls] = useState<Record<string, string>>({})

  // Restoring moves a coffee rejected → pending, so both lists must refresh.
  const refetchAll = () => {
    pending.refetch()
    rejected.refetch()
  }

  const act = async (id: string, fn: (id: string) => Promise<{ error: string | null }>) => {
    setBusyId(id)
    const { error } = await fn(id)
    setBusyId(null)
    if (error) {
      alert(`Action failed: ${error}`)
      return
    }
    refetchAll()
  }

  const approveWithUrl = async (c: PendingCoffee) => {
    const url = (urls[c.id] ?? '').trim()
    if (url && !/^https:\/\/.+\..+/.test(url)) {
      alert('The product page URL must start with https://')
      return
    }
    setBusyId(c.id)
    const { error } = await approveCoffee(c.id, url || undefined)
    if (error) {
      setBusyId(null)
      alert(`Action failed: ${error}`)
      return
    }
    if (url) {
      const vocab = c.origin_country ? regionsForCountry(c.origin_country).map((r) => r.name) : []
      const { error: augErr } = await runAugment(c.id, vocab)
      if (augErr) alert(`Approved, but augmentation failed: ${augErr}. You can re-run it from the Augment tab.`)
    }
    setBusyId(null)
    refetchAll()
  }

  if (pending.loading) return <p style={styles.empty}>Loading pending coffees…</p>
  if (pending.error) return <p style={styles.empty}>Couldn’t load the queue: {pending.error}</p>

  return (
    <div>
      {pending.coffees.length === 0 ? (
        <p style={styles.empty}>
          Nothing waiting. New coffees added by non-admins land here for review before
          they enter the global catalog.
        </p>
      ) : (
        <>
          <p style={{ ...styles.meta, marginBottom: '0.5rem' }}>
            {pending.coffees.length} coffee{pending.coffees.length === 1 ? '' : 's'} awaiting review
          </p>
          {pending.coffees.map((c) => (
            <CoffeeRow key={c.id} c={c}>
              <input
                style={styles.urlInput}
                type="url"
                placeholder="Roaster product-page URL — becomes the Buy link, then augments price & details"
                value={urls[c.id] ?? ''}
                disabled={busyId === c.id}
                onChange={(e) => setUrls((prev) => ({ ...prev, [c.id]: e.target.value }))}
              />
              <button style={styles.approve} disabled={busyId === c.id} onClick={() => approveWithUrl(c)}>
                {busyId === c.id ? '…' : (urls[c.id] ?? '').trim() ? 'Approve + buy link' : 'Approve (no buy link)'}
              </button>
              <button style={styles.reject} disabled={busyId === c.id} onClick={() => act(c.id, rejectCoffee)}>
                Reject
              </button>
              <ReplacePhotoButton coffeeId={c.id} onDone={refetchAll} />
            </CoffeeRow>
          ))}
        </>
      )}

      {rejected.coffees.length > 0 && (
        <div>
          <p style={styles.sectionLabel}>Rejected · {rejected.coffees.length}</p>
          <p style={styles.sectionNote}>
            Kept out of the catalog, never deleted. Restore sends a coffee back to the queue for
            re-review — if you rejected it only for a bad photo, replace the photo first.
          </p>
          {rejected.coffees.map((c) => (
            <CoffeeRow key={c.id} c={c}>
              <button style={styles.approve} disabled={busyId === c.id} onClick={() => act(c.id, restoreCoffee)}>
                {busyId === c.id ? '…' : 'Restore'}
              </button>
              <ReplacePhotoButton coffeeId={c.id} onDone={refetchAll} />
            </CoffeeRow>
          ))}
        </div>
      )}
    </div>
  )
}

export function AdminDashboard() {
  const [section, setSection] = useState<Section>('verify')

  return (
    <div>
      <p style={styles.eyebrow}>Admin</p>
      <h1 style={styles.h1}>Catalog control</h1>

      <div style={styles.tabs}>
        <button style={styles.tab(section === 'verify')} onClick={() => setSection('verify')}>
          Verify queue
        </button>
        <button style={styles.tab(section === 'augment')} onClick={() => setSection('augment')}>
          Augment
        </button>
      </div>

      {section === 'verify' && <VerifyQueue />}
      {section === 'augment' && <AugmentSection />}

      <MaintenanceTools />
    </div>
  )
}
