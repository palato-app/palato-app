import { useAuth } from './lib/auth'

function App() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()

  if (loading) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'system-ui', backgroundColor: '#F4EAD5', minHeight: '100vh', color: '#1E1410' }}>
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'system-ui', backgroundColor: '#F4EAD5', minHeight: '100vh', color: '#1E1410' }}>
        <h1>Palato</h1>
        <p>The specialty coffee app that learns what you love.</p>
        <button
          onClick={signInWithGoogle}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#D94E1F',
            color: '#F4EAD5',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer',
            marginTop: '1rem',
          }}
        >
          Sign in with Google
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui', backgroundColor: '#F4EAD5', minHeight: '100vh', color: '#1E1410' }}>
      <h1>Palato</h1>
      <p>Welcome, {user.user_metadata.full_name || user.email}</p>
      <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>You're logged in. Journal coming soon.</p>
      <button
        onClick={signOut}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: 'transparent',
          color: '#1E1410',
          border: '1px solid #1E1410',
          borderRadius: '8px',
          fontSize: '0.9rem',
          cursor: 'pointer',
          marginTop: '1rem',
        }}
      >
        Sign out
      </button>
    </div>
  )
}

export default App