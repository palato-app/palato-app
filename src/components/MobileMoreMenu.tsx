const cream = '#F4EAD5'
const espresso = '#1E1410'
const ember = '#D94E1F'

type Props = {
  open: boolean
  onClose: () => void
  activeView: string
  onGoToFlavors: () => void
  onSignOut: () => void
}

function FlavorsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={espresso} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  )
}

function SignOutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={espresso} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

export function MobileMoreMenu({ open, onClose, activeView, onGoToFlavors, onSignOut }: Props) {
  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(30, 20, 16, 0.3)',
          zIndex: 300,
          animation: 'fadeIn 0.15s ease-out',
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: cream,
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)',
          zIndex: 301,
          fontFamily: 'Geist, system-ui, sans-serif',
          animation: 'slideUp 0.2s ease-out',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem 0 0.5rem' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', backgroundColor: 'rgba(30, 20, 16, 0.15)' }} />
        </div>

        <div style={{ padding: '0.5rem 1.5rem 1rem' }}>
          <MenuItem
            icon={<FlavorsIcon />}
            label="Flavors"
            sublabel="SCA flavor taxonomy"
            active={activeView === 'flavors'}
            onClick={onGoToFlavors}
          />
          <div style={{ height: '1px', backgroundColor: 'rgba(30, 20, 16, 0.08)', margin: '0.25rem 0' }} />
          <MenuItem
            icon={<SignOutIcon />}
            label="Sign out"
            onClick={onSignOut}
          />
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  )
}

function MenuItem({ icon, label, sublabel, active, onClick }: {
  icon: React.ReactNode
  label: string
  sublabel?: string
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        width: '100%',
        padding: '0.85rem 0.5rem',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        borderRadius: '8px',
        fontFamily: 'Geist, system-ui, sans-serif',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {icon}
      <div style={{ textAlign: 'left' }}>
        <div style={{
          fontSize: '0.95rem',
          fontWeight: active ? 600 : 500,
          color: active ? ember : espresso,
        }}>
          {label}
        </div>
        {sublabel && (
          <div style={{ fontSize: '0.75rem', color: espresso, opacity: 0.5, marginTop: '1px' }}>
            {sublabel}
          </div>
        )}
      </div>
    </button>
  )
}
