import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth'
import type { Recommendations } from './types'

const STALE_MS = 24 * 60 * 60 * 1000

/**
 * The three recommendation cards for the current user. Reads the per-user cache;
 * regenerates via /api/recommend when it's missing or stale (rating count changed
 * or > 24h old). Falls back to whatever was cached if regeneration fails, so the
 * dashboard degrades gracefully. Pass `enabled` false to skip entirely (e.g. below
 * the unlock gate, or in preview mode).
 */
export function useRecommendations(ratingCount: number, enabled: boolean) {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user || !enabled) return
    let cancelled = false

    ;(async () => {
      setLoading(true)

      const { data: cache } = await supabase
        .from('recommendations')
        .select('recommendations, rating_count_at_generation, generated_at')
        .eq('user_id', user.id)
        .maybeSingle()

      const fresh =
        cache &&
        cache.rating_count_at_generation === ratingCount &&
        Date.now() - new Date(cache.generated_at).getTime() < STALE_MS

      if (fresh) {
        if (!cancelled) {
          setRecommendations(cache.recommendations as Recommendations)
          setLoading(false)
        }
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      try {
        const res = await fetch('/api/recommend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token ?? ''}`,
          },
          body: JSON.stringify({}),
        })
        const data = await res.json()
        if (cancelled) return
        setRecommendations(
          res.ok && data.recommendations
            ? (data.recommendations as Recommendations)
            : ((cache?.recommendations as Recommendations) ?? null),
        )
        setLoading(false)
      } catch {
        if (cancelled) return
        setRecommendations((cache?.recommendations as Recommendations) ?? null)
        setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [user, enabled, ratingCount])

  return { recommendations, loading }
}
