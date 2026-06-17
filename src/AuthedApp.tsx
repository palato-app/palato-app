import { useState } from 'react'
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
import { PalatoWordmark } from './components/PalatoWordmark'
import { BottomTabBar } from './components/BottomTabBar'

const cream = '#F4EAD5'
const espresso = '#1E1410'

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
  textAlign: 'left' as const,
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

export function AuthedApp() {
  const { signOut } = useAuth()
  const [view, setView] = useState<View>('browse')
  const [selectedCoffeeId, setSelectedCoffeeId] = useState<string | null>(null)
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

      {view !== 'rating' && view !== 'add-flow' && (
        <FloatingAddButton onClick={goToAddFlow} compact={view !== 'browse'} />
      )}

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
