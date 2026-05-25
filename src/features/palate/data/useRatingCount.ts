import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth'

export function useRatingCount() {
  const { user } = useAuth()
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      const { count: total, error } = await supabase
        .from('ratings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)

      if (cancelled) return
      if (!error && total !== null) setCount(total)
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [user])

  return { count, loading }
}
