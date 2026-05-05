import { useAuth } from './lib/auth'
import { TaxonomyView } from './TaxonomyView'
import { AddCoffeeForm } from './AddCoffeeForm'
import { useIsAdmin } from './lib/useIsAdmin'

const cream = '#F4EAD5'
const espresso = '#1E1410'
const ember = '#D94E1F'

const pageStyle = {
  padding: '3rem 2.5rem 6rem',
  fontFamily: 'Geist, system-ui, sans-serif',
  backgroundColor: cream,
  minHeight: '100vh',
  color: espresso,
  maxWidth: '980px',
  margin: '0 auto',
  // very subtle paper grain
  backgroundImage:
    'radial-gradient(rgba(30,20,16,0.025) 1px, transparent 1px), radial-gradient(rgba(30,20,16,0.02) 1px, transparent 1px)',
  backgroundSize: '3px 3px, 7px 7px',
  backgroundPosition: '0 0, 1px 2px',
} as const

function App() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()
  const isAdmin = useIsAdmin()

  if (loading) {
    return (
      <div style={pageStyle}>
        <p style={{ opacity: 0.5 }}>Loading…</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={pageStyle}>
        <h1
          style={{
            fontFamily: '"Boldonse", system-ui',
            fontSize: 'clamp(3rem, 8vw, 5rem)',
            letterSpacing: '-0.02em',
            margin: '0 0 1rem',
            lineHeight: 1,
          }}
        >
          PALATO
        </h1>
        <p
          style={{
            fontFamily: '"Instrument Serif", serif',
            fontSize: '1.5rem',
            opacity: 0.8,
            margin: '0 0 3rem',
            maxWidth: '540px',
            lineHeight: 1.3,
          }}
        >
          The specialty coffee app that learns what you love.
        </p>
        <button
          onClick={signInWithGoogle}
          style={{
            padding: '0.85rem 1.75rem',
            backgroundColor: ember,
            color: cream,
            border: 'none',
            borderRadius: '100px',
            fontSize: '1rem',
            fontFamily: 'Geist, system-ui, sans-serif',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Sign in with Google
        </button>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0',
        }}
      >
        <h1
          style={{
            fontFamily: '"Boldonse", system-ui',
            fontSize: '2rem',
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          PALATO
        </h1>
        <button
          onClick={signOut}
          style={{
            padding: '0.45rem 1rem',
            backgroundColor: 'transparent',
            color: espresso,
            border: '1px solid rgba(30, 20, 16, 0.25)',
            borderRadius: '100px',
            fontSize: '0.85rem',
            fontFamily: 'Geist, system-ui, sans-serif',
            cursor: 'pointer',
          }}
        >
          Sign out
        </button>
      </header>

      <TaxonomyView />
      {isAdmin && <AddCoffeeForm />}
    </div>
  )
}

export default App