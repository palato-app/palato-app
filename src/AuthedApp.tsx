import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './lib/auth'
import { TaxonomyView } from './TaxonomyView'
import { BrowseCoffees } from './BrowseCoffees'
import { CoffeeDetail } from './CoffeeDetail'
import { RateCoffee } from './RateCoffee'
import { Journal } from './Journal'
import { AddAndRateFlow } from './AddAndRateFlow'
import { FloatingAddButton } from './components/FloatingAddButton'
import { PalateTab } from './features/palate/PalateTab'
import { Learn } from './features/learn/Learn'
import { MoreTab } from './features/more/MoreTab'
import { PalatoWordmark } from './components/PalatoWordmark'
import { BottomTabBar } from './components/BottomTabBar'
import { useQuizHydration } from './features/quiz/useQuizHydration'

const cream = '#F4EAD5'
const espresso = '#1E1410'

type View = 'browse' | 'learn' | 'journal' | 'palate' | 'flavors' | 'more' | 'coffee-detail' | 'rating' | 'add-flow'

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
  const navigate = useNavigate()
  useQuizHydration()
  const [view, setView] = useState<View>('browse')
  const [selectedCoffeeId, setSelectedCoffeeId] = useState<string | null>(null)
  const [catalogOrigin, setCatalogOrigin] = useState<string | null>(null)

  const goToBrowse = () => {
    setView('browse')
    setSelectedCoffeeId(null)
    setCatalogOrigin(null)
  }

  // From Learn: open the catalog pre-filtered to one origin (§6).
  const goToBrowseWithOrigin = (country: string) => {
    setCatalogOrigin(country)
    setSelectedCoffeeId(null)
    setView('browse')
  }

  const goToLearn = () => {
    setView('learn')
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

  const goToMore = () => {
    setView('more')
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
            Catalog
          </button>
          <button onClick={goToLearn} style={headerNavButton(view === 'learn')}>
            Learn
          </button>
          <button onClick={goToPalate} style={headerNavButton(view === 'palate')}>
            Palate
          </button>
          <button
            onClick={goToMore}
            style={headerNavButton(view === 'more' || view === 'flavors')}
          >
            More
          </button>
        </nav>
      </header>

      {view === 'browse' && (
        <BrowseCoffees
          key={catalogOrigin ?? 'all'}
          onSelectCoffee={goToCoffee}
          initialOrigin={catalogOrigin}
        />
      )}
      {view === 'learn' && <Learn onBrowseOrigin={goToBrowseWithOrigin} />}
      {view === 'journal' && <Journal onSelectCoffee={goToCoffee} />}
      {view === 'palate' && (
        <PalateTab
          onSelectCoffee={goToCoffee}
          onGoRate={goToBrowse}
          onSeeAllRatings={goToJournal}
        />
      )}
      {view === 'flavors' && <TaxonomyView />}
      {view === 'more' && (
        <MoreTab
          onRetakeQuiz={() => navigate('/quiz')}
          onOpenFlavors={goToFlavors}
          onSignOut={signOut}
        />
      )}
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

      {view !== 'rating' && view !== 'add-flow' && view !== 'more' && (
        <FloatingAddButton
          onClick={goToAddFlow}
          compact={view !== 'browse'}
          label="Rate a coffee"
        />
      )}

      <BottomTabBar
        activeView={view}
        onNavigate={(v) => {
          if (v === 'browse') goToBrowse()
          else if (v === 'learn') goToLearn()
          else if (v === 'palate') goToPalate()
          else if (v === 'more') goToMore()
        }}
      />
    </div>
  )
}
