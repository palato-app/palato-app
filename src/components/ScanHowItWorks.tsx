const espresso = '#1E1410'
const ember = '#D94E1F'
const ink50 = 'rgba(30,20,16,0.50)'
const ink15 = 'rgba(30,20,16,0.15)'
const serif = '"Instrument Serif", serif'
const sans = 'Geist, system-ui, sans-serif'

const STEPS = [
  'Take a picture of a new coffee bag.',
  'Confirm the details are correct.',
  'Rate it.',
]

const styles = {
  container: {
    marginBottom: '3.5rem',
    border: `1px solid ${ink15}`,
    borderRadius: '14px',
    padding: '1.5rem 1.5rem 1.75rem',
    background: 'rgba(255,255,255,0.18)',
  } as const,
  eyebrow: {
    fontFamily: sans,
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    color: ink50,
    margin: '0 0 1.25rem',
  } as const,
  steps: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.25rem',
  } as const,
  step: { display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' } as const,
  num: {
    fontFamily: serif,
    fontStyle: 'italic' as const,
    fontSize: '1.75rem',
    lineHeight: 1,
    color: ember,
  } as const,
  text: {
    fontFamily: sans,
    fontSize: '0.9rem',
    lineHeight: 1.35,
    color: espresso,
    opacity: 0.8,
  } as const,
}

/**
 * A lightweight scan walkthrough for the catalog (§4): three steps so new
 * users know what "Rate a coffee" actually does before they tap it.
 */
export function ScanHowItWorks() {
  return (
    <section className="palato-scan-howto" style={styles.container}>
      <p style={styles.eyebrow}>See how it works</p>
      <div style={styles.steps}>
        {STEPS.map((text, i) => (
          <div key={i} style={styles.step}>
            <span style={styles.num}>{i + 1}</span>
            <span style={styles.text}>{text}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
