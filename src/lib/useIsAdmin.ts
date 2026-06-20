import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useAuth } from './auth'

/**
 * Whether the current user is an admin. `profiles.is_admin` is the single source
 * of truth (set by the email allowlist in migration 0013); we read it for the
 * signed-in user. RLS lets a user read their own profile row.
 */
export function useIsAdmin(): { isAdmin: boolean; loading: boolean } {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function check() {
      if (!user) {
        if (!cancelled) {
          setIsAdmin(false)
          setLoading(false)
        }
        return
      }
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle()
      if (!cancelled) {
        setIsAdmin(Boolean(data?.is_admin))
        setLoading(false)
      }
    }
    check()
    return () => {
      cancelled = true
    }
  }, [user])

  return { isAdmin, loading }
}
