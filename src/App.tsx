import { useState, useCallback } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/auth'
import { AuthedApp } from './AuthedApp'
import { Landing } from './Landing'
import { Quiz } from './Quiz'
import { RequireAuth } from './components/RequireAuth'
import { LoadingScreen } from './components/LoadingScreen'

const cream = '#F4EAD5'
const espresso = '#1E1410'

/**
 * Root route (`/`). Public landing for signed-out visitors; signed-in users
 * are sent straight into the app. See §1b / §2.
 */
function RootRoute() {
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

  if (user) {
    return <Navigate to="/coffees" replace />
  }

  return <Landing />
}

function App() {
  const [splashDone, setSplashDone] = useState(false)
  const onSplashComplete = useCallback(() => setSplashDone(true), [])

  if (!splashDone) {
    return <LoadingScreen onComplete={onSplashComplete} />
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<RootRoute />} />
      <Route path="/quiz" element={<Quiz />} />

      {/* Everything else is gated; unauthenticated hits redirect to `/`. */}
      <Route
        path="*"
        element={
          <RequireAuth>
            <AuthedApp />
          </RequireAuth>
        }
      />
    </Routes>
  )
}

export default App
