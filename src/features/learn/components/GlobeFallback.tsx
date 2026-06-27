import { theme } from '../../palate/palateTheme'

// Shown while the lazy globe chunk (three.js) loads, and as the standing state when
// WebGL is unavailable. The reliable country list below the globe (in Learn) is the
// real no-WebGL fallback — this just holds the globe's space gracefully.

type Props = {
  message?: string
}

export function GlobeFallback({ message = 'Spinning up the globe…' }: Props) {
  return (
    <div
      style={{
        width: '100%',
        minHeight: '320px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '16px',
        border: `1px solid ${theme.ink10}`,
        background:
          'radial-gradient(circle at 50% 40%, rgba(217,78,31,0.06), transparent 60%)',
      }}
    >
      <p
        style={{
          fontFamily: theme.displayFont,
          fontStyle: 'italic',
          fontSize: '1.1rem',
          color: theme.ink50,
          margin: 0,
        }}
      >
        {message}
      </p>
    </div>
  )
}
