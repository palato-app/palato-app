import { useState } from 'react'
import { usePendingCoffees, approveCoffee, rejectCoffee, type PendingCoffee } from './usePendingCoffees'
import { CoffeePlaceholder } from '../../components/CoffeePlaceholder'
import { AugmentSection } from './AugmentSection'
import { MaintenanceTools } from './MaintenanceTools'

const cream = '#F4EAD5'
const espresso = '#1E1410'
const ember = '#D94E1F'
const ink50 = 'rgba(30,20,16,0.5)'
const line = 'rgba(30,20,16,0.12)'

type Section = 'verify' | 'augment'

const styles = {
  h1: {
    fontFamily: 'Instrument Serif, Georgia, serif',
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
    fontFamily: 'Geist, system-ui, sans-serif',
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
    fontFamily: 'Instrument Serif, Georgia, serif',
    fontSize: '1.3rem',
    lineHeight: 1.1,
    margin: 0,
  } as const,
  meta: { fontSize: '0.82rem', color: ink50, margin: '0.2rem 0 0' } as const,
  actions: { display: 'flex', gap: '0.5rem', marginTop: '0.6rem' } as const,
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
}

function summarize(c: PendingCoffee): string {
  return [c.origin_country, c.process, c.roaster_stated_roast_level]
    .filter((v) => v && v !== 'unspecified')
    .join(' · ')
}

function VerifyQueue() {
  const { coffees, loading, error, refetch } = usePendingCoffees()
  const [busyId, setBusyId] = useState<string | null>(null)

  const act = async (id: string, fn: (id: string) => Promise<{ error: string | null }>) => {
    setBusyId(id)
    const { error } = await fn(id)
    setBusyId(null)
    if (error) {
      alert(`Action failed: ${error}`)
      return
    }
    refetch()
  }

  if (loading) return <p style={styles.empty}>Loading pending coffees…</p>
  if (error) return <p style={styles.empty}>Couldn’t load the queue: {error}</p>
  if (coffees.length === 0) {
    return (
      <p style={styles.empty}>
        Nothing waiting. New coffees added by non-admins land here for review before
        they enter the global catalog.
      </p>
    )
  }

  return (
    <div>
      <p style={{ ...styles.meta, marginBottom: '0.5rem' }}>
        {coffees.length} coffee{coffees.length === 1 ? '' : 's'} awaiting review
      </p>
      {coffees.map((c) => (
        <div key={c.id} style={styles.card}>
          {c.bag_image_url ? (
            <img src={c.bag_image_url} alt={`${c.coffee_name} bag`} style={styles.thumb} />
          ) : (
            <CoffeePlaceholder coffeeId={c.id} style={{ width: '72px', height: '96px', flexShrink: 0, borderRadius: '6px' }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={styles.name}>{c.coffee_name}</p>
            <p style={styles.meta}>{c.roaster_name}</p>
            {summarize(c) && <p style={styles.meta}>{summarize(c)}</p>}
            <div style={styles.actions}>
              <button
                style={styles.approve}
                disabled={busyId === c.id}
                onClick={() => act(c.id, approveCoffee)}
              >
                {busyId === c.id ? '…' : 'Approve'}
              </button>
              <button
                style={styles.reject}
                disabled={busyId === c.id}
                onClick={() => act(c.id, rejectCoffee)}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      ))}
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
