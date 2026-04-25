import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [status, setStatus] = useState<string>('Checking connection...')

  useEffect(() => {
    async function checkConnection() {
      const { error } = await supabase.from('_test').select('*').limit(1)

      if (error && error.code === 'PGRST205') {
        // Table not found — but Supabase responded, so the connection works.
        setStatus('Connected to Supabase')
      } else if (error) {
        setStatus(`Error: ${error.message}`)
      } else {
        setStatus('Connected to Supabase')
      }
    }
    checkConnection()
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Palato</h1>
      <p>{status}</p>
    </div>
  )
}

export default App