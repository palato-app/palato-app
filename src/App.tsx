import { useState } from 'react'
import { useAuth } from './lib/auth'
import { TaxonomyView } from './TaxonomyView'
import { BrowseCoffees } from './BrowseCoffees'
import { CoffeeDetail } from './CoffeeDetail'
import { AddCoffeeForm } from './AddCoffeeForm'
import { useIsAdmin } from './lib/useIsAdmin'

const cream = '#F4EAD5'
const espresso = '#1E1410'
const ember = '#D94E1F'

type View = 'browse' | 'flavors' | 'coffee-detail' | 'rating'

const pageStyle = {
  padding: '3rem 2.5rem 6rem',
  fontFamily: 'Geist, system-ui, sans-serif',
  backgroundColor: cream,
  minHeight: '100vh',
  color: espresso,
  maxWidth: '980px',
  margin: '0 auto',
  backgroundImage:
    'radial-gradient(rgba(30,20,16,0.025) 1px, transparent 1px), radial-gradient(rgba(30,20,16,0.02) 1px, transparent 1px)',
  backgroundSize: '3px 3px, 7px 7px',
  backgroundPosition: '0 0, 1px 2px',
} as const

const headerNavButton = (active: boolean) => ({
  background: 'none',
  border: 'none',
  padding: '0.3rem 0',
  fontFamily: 'Geist, system-ui, sans-serif',
  fontSize: '0.9rem',
  fontWeight: 500,
  color: espresso,
  opacity: active ? 1 : 0.5,
  cursor: 'pointer' as const,
  borderBottom: active ? `1.5px solid ${espresso}` : '1.5px solid transparent',
  transition: 'opacity 0.15s',
})

function App() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()
  const isAdmin = useIsAdmin()
  const [view, setView] = useState<View>('browse')
  const [selectedCoffeeId, setSelectedCoffeeId] = useState<string | null>(null)

  // Navigation handlers
  const goToBrowse = () => {
    setView('browse')
    setSelectedCoffeeId(null)
  }

  const goToFlavors = () => {
    setView('flavors')
    setSelectedCoffeeId(null)
  }

  const goToCoffee = (id: string) => {
    setSelectedCoffeeId(id)
    setView('coffee-detail')
  }

  const goToRating = () => {
    setView('rating')
  }

  const goBackToCoffee = () => {
    setView('coffee-detail')
  }

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
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
          }}
        >
          <button onClick={goToBrowse} style={headerNavButton(view === 'browse')}>
            Coffees
          </button>
          <button onClick={goToFlavors} style={headerNavButton(view === 'flavors')}>
            Flavors
          </button>
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
        </nav>
      </header>

      {view === 'browse' && <BrowseCoffees onSelectCoffee={goToCoffee} />}
      {view === 'flavors' && <TaxonomyView />}
      {view === 'coffee-detail' && selectedCoffeeId && (
        <CoffeeDetail
          coffeeId={selectedCoffeeId}
          onBack={goToBrowse}
          onRate={goToRating}
        />
      )}
      {view === 'rating' && selectedCoffeeId && (
        <div style={{ marginTop: '3rem' }}>
          <button
            onClick={goBackToCoffee}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.5rem 0',
              fontFamily: 'Geist, system-ui, sans-serif',
              fontSize: '0.85rem',
              color: espresso,
              opacity: 0.6,
              cursor: 'pointer',
              marginBottom: '2.5rem',
            }}
          >
            ← Back
          </button>
          <p
            style={{
              fontFamily: '"Instrument Serif", serif',
              fontSize: '1.5rem',
              opacity: 0.8,
            }}
          >
            Rating flow coming next.
          </p>
        </div>
      )}

      {isAdmin && view === 'browse' && <AddCoffeeForm />}
    </div>
  )
}

export default App