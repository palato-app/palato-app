const cream = '#F4EAD5'
const espresso = '#1E1410'
const ember = '#D94E1F'

type TabView = 'browse' | 'learn' | 'palate' | 'more'

type Props = {
  activeView: string
  onNavigate: (view: TabView) => void
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

function LearnIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? ember : espresso} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: active ? 1 : 0.5 }}>
      <path d="M12 7v13" />
      <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H10a2 2 0 0 1 2 2v13a1.5 1.5 0 0 0-1.5-1.5H5.5A2.5 2.5 0 0 1 3 16z" />
      <path d="M21 5.5A2.5 2.5 0 0 0 18.5 3H14a2 2 0 0 0-2 2v13a1.5 1.5 0 0 1 1.5-1.5h5A2.5 2.5 0 0 0 21 16z" />
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
  { key: 'browse', label: 'Catalog' },
  { key: 'learn', label: 'Learn' },
  { key: 'palate', label: 'Palate' },
  { key: 'more', label: 'More' },
]

function TabIcon({ tabKey, active }: { tabKey: string; active: boolean }) {
  switch (tabKey) {
    case 'browse': return <CoffeesIcon active={active} />
    case 'learn': return <LearnIcon active={active} />
    case 'palate': return <PalateIcon active={active} />
    case 'more': return <MoreIcon active={active} />
    default: return null
  }
}

export function BottomTabBar({ activeView, onNavigate }: Props) {
  // "More" owns the settings shell; Flavors is reached from inside it, so it
  // keeps More highlighted.
  const isTabActive = (key: string) =>
    key === 'more' ? activeView === 'more' || activeView === 'flavors' : activeView === key

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
              onClick={() => onNavigate(key)}
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
    </>
  )
}
