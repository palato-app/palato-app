import type { ReactNode } from 'react'

const espresso = '#1E1410'
const ember = '#D94E1F'
const ink50 = 'rgba(30,20,16,0.50)'
const ink15 = 'rgba(30,20,16,0.15)'
const serif = '"Instrument Serif", serif'
const sans = 'Geist, system-ui, sans-serif'

// Inline brand-style icons (no icon library, per brand rules).
function CameraIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ember} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

function CheckboxIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ember} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  )
}

function TrophyIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ember} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}

const STEPS: { icon: ReactNode; text: string }[] = [
  { icon: <CameraIcon />, text: 'Take a picture of a new coffee bag.' },
  { icon: <CheckboxIcon />, text: 'Confirm the details are correct.' },
  { icon: <TrophyIcon />, text: 'Rate the coffee and your palate will be updated.' },
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
  step: { display: 'flex', flexDirection: 'column' as const, gap: '0.6rem' } as const,
  stepHead: { display: 'flex', alignItems: 'center', gap: '0.6rem' } as const,
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
  goal: {
    fontFamily: serif,
    fontSize: '1.1rem',
    lineHeight: 1.4,
    color: espresso,
    opacity: 0.85,
    margin: '1.5rem 0 0',
    paddingTop: '1.25rem',
    borderTop: `1px solid ${ink15}`,
  } as const,
}

/**
 * A lightweight scan walkthrough for the catalog (§4): three steps so new
 * users know what "Rate a coffee" actually does before they tap it.
 */
export function ScanHowItWorks() {
  return (
    <section className="palato-scan-howto" style={styles.container}>
      <p style={styles.eyebrow}>How Palato works</p>
      <div style={styles.steps}>
        {STEPS.map((step, i) => (
          <div key={i} style={styles.step}>
            <div style={styles.stepHead}>
              <span style={styles.num}>{i + 1}</span>
              {step.icon}
            </div>
            <span style={styles.text}>{step.text}</span>
          </div>
        ))}
      </div>
      <p style={styles.goal}>
        Our goal: to synthesize insights about your palate so you can take the guesswork out of
        buying coffee and enjoy it more.
      </p>
    </section>
  )
}
