import { useNavigate } from 'react-router-dom'
import { useAuth } from './lib/auth'
import { PalatoWordmark } from './components/PalatoWordmark'

const cream = '#F4EAD5'
const espresso = '#1E1410'
const ember = '#D94E1F'

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
  textAlign: 'center' as const,
  backgroundImage:
    'radial-gradient(rgba(30,20,16,0.025) 1px, transparent 1px), radial-gradient(rgba(30,20,16,0.02) 1px, transparent 1px)',
  backgroundSize: '3px 3px, 7px 7px',
  backgroundPosition: '0 0, 1px 2px',
} as const

/**
 * Public landing at `/` (§2).
 * NOTE: This is the routing-foundation placeholder — the full §2 redesign
 * (headline/sub-line copy, demoted sign-in styling) lands in a later unit.
 * What matters now: the primary CTA routes to `/quiz` and does NOT trigger
 * auth; the returning-user link does.
 */
export function Landing() {
  const navigate = useNavigate()
  const { signInWithGoogle, signInWithPassword } = useAuth()

  const devUserEmail = import.meta.env.VITE_DEV_USER_EMAIL as string | undefined
  const devUserPassword = import.meta.env.VITE_DEV_USER_PASSWORD as string | undefined
  const devSignInAvailable =
    import.meta.env.DEV && Boolean(devUserEmail) && Boolean(devUserPassword)

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
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: 1.3,
        }}
      >
        The specialty coffee app that learns what you love.
      </p>

      <button
        onClick={() => navigate('/quiz')}
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
        Unlock your palate
      </button>

      <div style={{ marginTop: '1.75rem' }}>
        <button
          onClick={signInWithGoogle}
          style={{
            background: 'none',
            border: 'none',
            color: espresso,
            opacity: 0.6,
            fontSize: '0.9rem',
            fontFamily: 'Geist, system-ui, sans-serif',
            cursor: 'pointer',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
          }}
        >
          Already have an account? Sign in
        </button>
      </div>

      {devSignInAvailable && (
        <div style={{ marginTop: '1.5rem' }}>
          <button
            onClick={() => signInWithPassword(devUserEmail!, devUserPassword!)}
            style={{
              padding: '0.55rem 1.25rem',
              backgroundColor: 'transparent',
              color: espresso,
              border: '1px dashed rgba(30, 20, 16, 0.35)',
              borderRadius: '100px',
              fontSize: '0.8rem',
              fontFamily: 'Geist, system-ui, sans-serif',
              opacity: 0.7,
              cursor: 'pointer',
            }}
          >
            Dev sign-in (local only)
          </button>
        </div>
      )}
    </div>
  )
}
