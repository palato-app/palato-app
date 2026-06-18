const espresso = '#1E1410'
const ink50 = 'rgba(30,20,16,0.50)'
const ember = '#D94E1F'
const serif = '"Instrument Serif", serif'
const sans = 'Geist, system-ui, sans-serif'

const PARAGRAPHS = [
  'Specialty coffee is one of the joy-inducing, good things of life. It is grown by people who care deeply about their craft, on land that is getting harder to farm every year. A single cup can carry the mark of a specific farm, a specific elevation, a specific way the cherries were dried in the sun.',
  'Wine has Vivino. Beer has Untappd. Specialty coffee — a craft every bit as deep — has had no real home for the people who love it. Palato is that home: a place to rate what you drink, build a record of your taste, and slowly come to understand what you love and why.',
  'We believe taste is a learnable skill, not a gift you are born with. Every coffee you rate sharpens your palate a little more. The notes you could not name last month become obvious. The origins blur together less. Your own preferences come into focus.',
  'We are building Palato deliberately and in the open, one honest feature at a time, in service of the grower, the roaster, and you. We think you deserve to know what you love — and we think coffee deserves a better way to be remembered.',
]

const styles = {
  container: { marginTop: '2rem', maxWidth: '640px' } as const,
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
  eyebrow: {
    fontFamily: sans,
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    color: ember,
    margin: '0 0 0.5rem',
  } as const,
  title: {
    fontFamily: serif,
    fontWeight: 400,
    fontSize: 'clamp(2.4rem, 7vw, 3.25rem)',
    lineHeight: 1.05,
    letterSpacing: '-0.02em',
    color: espresso,
    margin: '0 0 2rem',
  } as const,
  para: {
    fontFamily: serif,
    fontSize: '1.35rem',
    lineHeight: 1.45,
    color: espresso,
    margin: '0 0 1.5rem',
  } as const,
}

export function TheStory({ onBack }: { onBack: () => void }) {
  return (
    <div style={styles.container}>
      <button style={styles.back} onClick={onBack}>
        ← Settings
      </button>
      <p style={styles.eyebrow}>The story</p>
      <h1 style={styles.title}>Why we built Palato</h1>
      {PARAGRAPHS.map((p, i) => (
        <p key={i} style={styles.para}>
          {p}
        </p>
      ))}
    </div>
  )
}
