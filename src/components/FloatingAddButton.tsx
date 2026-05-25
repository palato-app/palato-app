type Props = {
  onClick: () => void
}

export function FloatingAddButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      aria-label="Add a coffee"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: '#D94E1F',
        color: '#F4EAD5',
        border: 'none',
        fontSize: '2rem',
        fontWeight: 300,
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(30, 20, 16, 0.25)',
        zIndex: 100,
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onPointerDown={(e) => {
        const el = e.currentTarget
        el.style.transform = 'scale(0.92)'
      }}
      onPointerUp={(e) => {
        const el = e.currentTarget
        el.style.transform = 'scale(1)'
      }}
      onPointerLeave={(e) => {
        const el = e.currentTarget
        el.style.transform = 'scale(1)'
      }}
    >
      +
    </button>
  )
}
