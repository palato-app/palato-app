import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

const cream = '#F4EAD5'
const espresso = '#1E1410'

/**
 * Gate for authenticated-only routes (§1b). While the session is still
 * resolving we hold on a neutral loading state; once resolved, an
 * unauthenticated visitor is redirected to the public landing at `/`.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: cream,
          color: espresso,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Geist, system-ui, sans-serif',
        }}
      >
        <p style={{ opacity: 0.5 }}>Loading…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
