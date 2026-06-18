type Props = {
  onClick: () => void
  compact?: boolean
  label?: string
}

const ember = '#D94E1F'
const cream = '#F4EAD5'

export function FloatingAddButton({ onClick, compact = false, label = 'Add a coffee' }: Props) {
  if (compact) {
    return (
      <button
        onClick={onClick}
        aria-label="Add a coffee"
        className="palato-fab"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: ember,
          color: cream,
          border: 'none',
          fontSize: '1.75rem',
          fontFamily: 'Geist, system-ui, sans-serif',
          fontWeight: 300,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(30, 20, 16, 0.3)',
          zIndex: 100,
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onPointerDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.95)'
        }}
        onPointerUp={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
        }}
        onPointerLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        +
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="palato-fab"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        height: '52px',
        paddingLeft: '1.25rem',
        paddingRight: '1.5rem',
        borderRadius: '100px',
        backgroundColor: ember,
        color: cream,
        border: 'none',
        fontSize: '0.95rem',
        fontFamily: 'Geist, system-ui, sans-serif',
        fontWeight: 500,
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(30, 20, 16, 0.3)',
        zIndex: 100,
        transition: 'transform 0.15s, box-shadow 0.15s',
        whiteSpace: 'nowrap',
      }}
      onPointerDown={(e) => {
        e.currentTarget.style.transform = 'translateX(-50%) scale(0.95)'
      }}
      onPointerUp={(e) => {
        e.currentTarget.style.transform = 'translateX(-50%) scale(1)'
      }}
      onPointerLeave={(e) => {
        e.currentTarget.style.transform = 'translateX(-50%) scale(1)'
      }}
    >
      <span style={{ fontSize: '1.4rem', fontWeight: 300, lineHeight: 1 }}>+</span>
      {label}
    </button>
  )
}
