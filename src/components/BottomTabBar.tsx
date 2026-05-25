import { useState } from 'react'
import { MobileMoreMenu } from './MobileMoreMenu'

const cream = '#F4EAD5'
const espresso = '#1E1410'
const ember = '#D94E1F'

type TabView = 'browse' | 'journal' | 'palate'

type Props = {
  activeView: string
  onNavigate: (view: TabView) => void
  onGoToFlavors: () => void
  onSignOut: () => void
}

function CoffeesIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? ember : espresso} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: active ? 1 : 0.5 }}>
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      <line x1="6" y1="2" x2="6" y2="4" />
      <line x1="10" y1="2" x2="10" y2="4" />
      <line x1="14" y1="2" x2="14" y2="4" />
    </svg>
  )
}

function JournalIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? ember : espresso} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: active ? 1 : 0.5 }}>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      <line x1="8" y1="7" x2="16" y2="7" />
      <line x1="8" y1="11" x2="13" y2="11" />
    </svg>
  )
}

function PalateIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? ember : espresso} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: active ? 1 : 0.5 }}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <line x1="2" y1="12" x2="22" y2="12" />
    </svg>
  )
}

function MoreIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? ember : espresso} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: active ? 1 : 0.5 }}>
      <circle cx="12" cy="5" r="1.5" fill={active ? ember : espresso} />
      <circle cx="12" cy="12" r="1.5" fill={active ? ember : espresso} />
      <circle cx="12" cy="19" r="1.5" fill={active ? ember : espresso} />
    </svg>
  )
}

const tabs: { key: TabView | 'more'; label: string }[] = [
  { key: 'browse', label: 'Coffees' },
  { key: 'journal', label: 'Journal' },
  { key: 'palate', label: 'Palate' },
  { key: 'more', label: 'More' },
]

function TabIcon({ tabKey, active }: { tabKey: string; active: boolean }) {
  switch (tabKey) {
    case 'browse': return <CoffeesIcon active={active} />
    case 'journal': return <JournalIcon active={active} />
    case 'palate': return <PalateIcon active={active} />
    case 'more': return <MoreIcon active={active} />
    default: return null
  }
}

export function BottomTabBar({ activeView, onNavigate, onGoToFlavors, onSignOut }: Props) {
  const [moreOpen, setMoreOpen] = useState(false)

  const isTabActive = (key: string) => {
    if (key === 'more') return activeView === 'flavors' || moreOpen
    return activeView === key
  }

  const handleTabPress = (key: TabView | 'more') => {
    if (key === 'more') {
      setMoreOpen(true)
    } else {
      onNavigate(key)
    }
  }

  return (
    <>
      <nav
        className="bottom-tab-bar"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '64px',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          backgroundColor: cream,
          borderTop: `1px solid rgba(30, 20, 16, 0.1)`,
          display: 'none',
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 200,
          fontFamily: 'Geist, system-ui, sans-serif',
        }}
      >
        {tabs.map(({ key, label }) => {
          const active = isTabActive(key)
          return (
            <button
              key={key}
              onClick={() => handleTabPress(key)}
              style={{
                background: 'none',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                padding: '6px 12px',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <TabIcon tabKey={key} active={active} />
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  color: active ? ember : espresso,
                  opacity: active ? 1 : 0.5,
                  textTransform: 'uppercase',
                }}
              >
                {label}
              </span>
            </button>
          )
        })}
      </nav>

      <MobileMoreMenu
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        activeView={activeView}
        onGoToFlavors={() => { onGoToFlavors(); setMoreOpen(false) }}
        onSignOut={onSignOut}
      />
    </>
  )
}
