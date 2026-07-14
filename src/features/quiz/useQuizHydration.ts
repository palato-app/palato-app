import { useEffect, useRef } from 'react'
import { useAuth } from '../../lib/auth'
import { hydratePalateProfileFromSession } from './palateProfile'

/**
 * Runs the §3d hydration once the user is authenticated: a quiz taken
 * pre-auth (stashed in sessionStorage before the OAuth redirect) is written
 * to `palate_profiles` on the first authed load, then the key is cleared.
 * No-op when there's no pending quiz result.
 *
 * `onHydrated` fires only when a pending quiz result was actually present —
 * i.e. the user just came through the quiz → sign-in flow. A returning user
 * with no stashed quiz never triggers it. AuthedApp uses this to land a
 * just-finished-quiz user on their Palate rather than the default Catalog.
 */
export function useQuizHydration(onHydrated?: () => void) {
  const { user } = useAuth()
  // Keep the latest callback in a ref so the effect stays keyed on [user]
  // only — an inline arrow from the caller won't re-run hydration each render.
  const onHydratedRef = useRef(onHydrated)
  onHydratedRef.current = onHydrated

  useEffect(() => {
    if (!user) return
    let cancelled = false
    hydratePalateProfileFromSession(user.id).then((row) => {
      if (!cancelled && row) {
        console.log('[palate] hydrated profile from quiz:', row.user_id)
        onHydratedRef.current?.()
      }
    })
    return () => {
      cancelled = true
    }
  }, [user])
}
