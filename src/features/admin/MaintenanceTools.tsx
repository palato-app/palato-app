import { useState } from 'react'
import { rebuildFlavorLinks } from './flavorBackfill'

const espresso = '#1E1410'
const ember = '#D94E1F'
const ink50 = 'rgba(30,20,16,0.5)'
const line = 'rgba(30,20,16,0.12)'

export function MaintenanceTools() {
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const run = async () => {
    setBusy(true)
    setResult(null)
    const { error, coffeesWithNotes, links } = await rebuildFlavorLinks()
    setBusy(false)
    setResult(
      error
        ? `Failed: ${error}`
        : `Linked ${links} flavor tag${links === 1 ? '' : 's'} across ${coffeesWithNotes} coffee${coffeesWithNotes === 1 ? '' : 's'}.`,
    )
  }

  return (
    <div style={{ marginTop: '2.5rem', paddingTop: '1.25rem', borderTop: `1px solid ${line}` }}>
      <p style={{ fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: ink50, margin: '0 0 0.5rem', fontWeight: 600 }}>
        Maintenance
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={run}
          disabled={busy}
          style={{
            background: 'none',
            color: espresso,
            border: `1px solid ${espresso}`,
            borderRadius: '999px',
            padding: '0.4rem 1.1rem',
            fontSize: '0.82rem',
            cursor: busy ? 'default' : 'pointer',
            fontFamily: 'Geist, system-ui, sans-serif',
          }}
        >
          {busy ? 'Rebuilding…' : 'Rebuild flavor links'}
        </button>
        {result && <span style={{ fontSize: '0.82rem', color: ember }}>{result}</span>}
      </div>
      <p style={{ fontSize: '0.76rem', color: ink50, margin: '0.5rem 0 0' }}>
        Maps each approved coffee’s roaster notes onto the flavor taxonomy. Powers the palate
        recommendation engine. Safe to re-run.
      </p>
    </div>
  )
}
