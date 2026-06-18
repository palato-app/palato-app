import { useEffect } from 'react'
import { useAuth } from '../../lib/auth'
import { hydratePalateProfileFromSession } from './palateProfile'

/**
 * Runs the §3d hydration once the user is authenticated: a quiz taken
 * pre-auth (stashed in sessionStorage before the OAuth redirect) is written
 * to `palate_profiles` on the first authed load, then the key is cleared.
 * No-op when there's no pending quiz result.
 */
export function useQuizHydration() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return
    let cancelled = false
    hydratePalateProfileFromSession(user.id).then((row) => {
      if (!cancelled && row) {
        console.log('[palate] hydrated profile from quiz:', row.user_id)
      }
    })
    return () => {
      cancelled = true
    }
  }, [user])
}
