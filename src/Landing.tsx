import { useNavigate } from 'react-router-dom'
import { useAuth } from './lib/auth'
import { PalatoWordmark } from './components/PalatoWordmark'

const cream = '#F4EAD5'
const espresso = '#1E1410'
const ember = '#D94E1F'

const serif = '"Instrument Serif", serif'
const sans = 'Geist, system-ui, sans-serif'

const pageStyle = {
  minHeight: '100vh',
  backgroundColor: cream,
  color: espresso,
  boxSizing: 'border-box' as const,
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center' as const,
  padding: '3rem 1.5rem',
  fontFamily: sans,
  backgroundImage:
    'radial-gradient(rgba(30,20,16,0.025) 1px, transparent 1px), radial-gradient(rgba(30,20,16,0.02) 1px, transparent 1px)',
  backgroundSize: '3px 3px, 7px 7px',
  backgroundPosition: '0 0, 1px 2px',
} as const

/**
 * Public landing at `/` (§2). The first invitation is to *experience value*
 * (the quiz), not to create an account: the primary CTA routes to `/quiz` and
 * never triggers auth. Sign-in is demoted to a small returning-user link.
 */
export function Landing() {
  const navigate = useNavigate()
  const { signInWithGoogle, signInWithPassword } = useAuth()

  const devUserEmail = import.meta.env.VITE_DEV_USER_EMAIL as string | undefined
  const devUserPassword = import.meta.env.VITE_DEV_USER_PASSWORD as string | undefined
  const devSignInAvailable =
    import.meta.env.DEV && Boolean(devUserEmail) && Boolean(devUserPassword)

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <PalatoWordmark
          color={espresso}
          style={{
            width: 'clamp(160px, 42vw, 240px)',
            height: 'auto',
            margin: '0 0 2.75rem',
          }}
        />

        <h1
          style={{
            fontFamily: serif,
            fontWeight: 400,
            fontSize: 'clamp(2.5rem, 9vw, 3.75rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            color: espresso,
            margin: '0 0 1.25rem',
          }}
        >
          Love Coffee? Time to Expand Your Palate.
        </h1>

        <p
          style={{
            fontFamily: sans,
            fontSize: '1.1rem',
            lineHeight: 1.5,
            color: espresso,
            opacity: 0.65,
            margin: '0 auto 2.75rem',
            maxWidth: '420px',
          }}
        >
          Made for those who love the craft.
        </p>

        <button
          onClick={() => navigate('/quiz')}
          style={{
            padding: '1rem 2.25rem',
            backgroundColor: ember,
            color: cream,
            border: 'none',
            borderRadius: '100px',
            fontSize: '1.05rem',
            fontFamily: sans,
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(217, 78, 31, 0.25)',
            transition: 'transform 200ms ease-out, box-shadow 200ms ease-out',
          }}
          onPointerDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.97)'
          }}
          onPointerUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
          onPointerLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          Unlock your palate
        </button>

        <div style={{ marginTop: '2rem' }}>
          <button
            onClick={signInWithGoogle}
            style={{
              background: 'none',
              border: 'none',
              color: espresso,
              opacity: 0.55,
              fontSize: '0.9rem',
              fontFamily: sans,
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
                fontFamily: sans,
                opacity: 0.7,
                cursor: 'pointer',
              }}
            >
              Dev sign-in (local only)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
