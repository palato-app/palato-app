import { useState, useCallback } from 'react'
import { useAuth } from './lib/auth'
import { TaxonomyView } from './TaxonomyView'
import { BrowseCoffees } from './BrowseCoffees'
import { CoffeeDetail } from './CoffeeDetail'
import { RateCoffee } from './RateCoffee'
import { Journal } from './Journal'
import { AddAndRateFlow } from './AddAndRateFlow'
import { FloatingAddButton } from './components/FloatingAddButton'
import { PalateDashboard } from './features/palate/PalateDashboard'
import { PalateLocked } from './features/palate/components/PalateLocked'
import { useRatingCount } from './features/palate/data/useRatingCount'
import { screenAccessMaturity } from './features/palate/data/maturity'
import { LoadingScreen } from './components/LoadingScreen'
import { PalatoWordmark } from './components/PalatoWordmark'
import { BottomTabBar } from './components/BottomTabBar'

const cream = '#F4EAD5'
const espresso = '#1E1410'
const ember = '#D94E1F'

type View = 'browse' | 'journal' | 'palate' | 'flavors' | 'coffee-detail' | 'rating' | 'add-flow'

const pageStyle = {
  padding: '3rem 2.5rem 6rem',
  fontFamily: 'Geist, system-ui, sans-serif',
  backgroundColor: cream,
  minHeight: '100vh',
  color: espresso,
  maxWidth: '980px',
  width: '100%',
  margin: '0 auto',
  boxSizing: 'border-box' as const,
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
  const [view, setView] = useState<View>('browse')
  const [selectedCoffeeId, setSelectedCoffeeId] = useState<string | null>(null)
  const [splashDone, setSplashDone] = useState(false)
  const onSplashComplete = useCallback(() => setSplashDone(true), [])
  const { count: ratingCount } = useRatingCount()
  const palateUnlocked = screenAccessMaturity(ratingCount) !== 'locked'

  const goToBrowse = () => {
    setView('browse')
    setSelectedCoffeeId(null)
  }

  const goToJournal = () => {
    setView('journal')
    setSelectedCoffeeId(null)
  }

  const goToPalate = () => {
    setView('palate')
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

  const goToAddFlow = () => {
    setView('add-flow')
    setSelectedCoffeeId(null)
  }

  if (!splashDone) {
    return <LoadingScreen onComplete={onSplashComplete} />
  }

  if (loading) {
    return (
      <div className="palato-page" style={pageStyle}>
        <p style={{ opacity: 0.5 }}>Loading…</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="palato-page" style={pageStyle}>
        <PalatoWordmark
          color={ember}
          style={{
            width: 'clamp(200px, 50vw, 340px)',
            height: 'auto',
            margin: '0 0 1rem',
          }}
        />
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
    <div className="palato-page" style={pageStyle}>
      <header
        className="palato-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0',
        }}
      >
        <PalatoWordmark
          color={espresso}
          style={{
            height: '2.2rem',
            width: 'auto',
          }}
        />
        <nav
          className="palato-nav"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <button onClick={goToBrowse} style={headerNavButton(view === 'browse')}>
            Coffees
          </button>
          <button onClick={goToJournal} style={headerNavButton(view === 'journal')}>
            Journal
          </button>
          <button onClick={goToPalate} style={headerNavButton(view === 'palate')}>
            Palate
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
      {view === 'journal' && <Journal onSelectCoffee={goToCoffee} />}
      {view === 'palate' && (
        palateUnlocked
          ? <PalateDashboard />
          : <PalateLocked ratingCount={ratingCount} onGoRate={goToBrowse} />
      )}
      {view === 'flavors' && <TaxonomyView />}
      {view === 'coffee-detail' && selectedCoffeeId && (
        <CoffeeDetail
          coffeeId={selectedCoffeeId}
          onBack={goToBrowse}
          onRate={goToRating}
        />
      )}
      {view === 'rating' && selectedCoffeeId && (
        <RateCoffee
          coffeeId={selectedCoffeeId}
          onCancel={goBackToCoffee}
          onComplete={goToBrowse}
        />
      )}
      {view === 'add-flow' && (
        <AddAndRateFlow onComplete={goToPalate} onCancel={goToBrowse} />
      )}

      {view !== 'add-flow' && <FloatingAddButton onClick={goToAddFlow} />}

      <BottomTabBar
        activeView={view}
        onNavigate={(v) => {
          if (v === 'browse') goToBrowse()
          else if (v === 'journal') goToJournal()
          else if (v === 'palate') goToPalate()
        }}
        onGoToFlavors={goToFlavors}
        onSignOut={signOut}
      />
    </div>
  )
}

export default App