import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth'
import type { Recommendation, Recommendations } from './types'

const STALE_MS = 24 * 60 * 60 * 1000

// Recommendations are cached, so a pick can go unavailable AFTER it was
// generated (its buy link 404s, or the availability check flags it sold-out).
// These helpers read CURRENT catalog state so the display never points at a
// coffee you can't buy — a dead/sold-out rec earns no affiliate and breaks trust
// (Decisions #067/#068). This is the read-time complement to /api/recommend's
// generation-time filter.
function recIds(recs: Recommendations | null): string[] {
  return recs
    ? [recs.unique, recs.explore, recs.love]
        .filter((r): r is Recommendation => r != null)
        .map((r) => r.coffeeId)
    : []
}

async function currentlyBuyableIds(recs: Recommendations | null): Promise<Set<string>> {
  const ids = recIds(recs)
  if (ids.length === 0) return new Set()
  const { data } = await supabase
    .from('coffees')
    .select('id, purchase_url, purchase_availability')
    .in('id', ids)
  return new Set(
    (data ?? [])
      .filter((c) => c.purchase_url != null && c.purchase_availability !== 'no')
      .map((c) => c.id),
  )
}

function allBuyable(recs: Recommendations, buyable: Set<string>): boolean {
  return recIds(recs).every((id) => buyable.has(id))
}

// Null out any card whose coffee isn't currently buyable (WhatsNext drops nulls).
function sanitize(recs: Recommendations | null, buyable: Set<string>): Recommendations | null {
  if (!recs) return null
  const keep = (r: Recommendation | null) => (r && buyable.has(r.coffeeId) ? r : null)
  return { unique: keep(recs.unique), explore: keep(recs.explore), love: keep(recs.love) }
}

/**
 * The three recommendation cards for the current user. Reads the per-user cache;
 * regenerates via /api/recommend when it's missing or stale (rating count changed,
 * > 24h old, OR a cached pick has since gone unavailable). Whatever is shown is
 * sanitized against current buyability, so an unbuyable coffee can never reach a
 * card. Falls back to the (sanitized) cache if regeneration fails, so the
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

      const cachedRecs = (cache?.recommendations as Recommendations | undefined) ?? null

      // Current buyability of the cached picks — a since-unavailable pick makes an
      // otherwise-recent cache stale, forcing a regenerate that excludes it.
      const cachedBuyable = await currentlyBuyableIds(cachedRecs)
      if (cancelled) return

      const fresh =
        cache &&
        cache.rating_count_at_generation === ratingCount &&
        Date.now() - new Date(cache.generated_at).getTime() < STALE_MS &&
        cachedRecs != null &&
        allBuyable(cachedRecs, cachedBuyable)

      if (fresh) {
        if (!cancelled) {
          setRecommendations(cachedRecs)
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
        const next =
          res.ok && data.recommendations
            ? (data.recommendations as Recommendations)
            : cachedRecs
        // Belt-and-suspenders: sanitize even freshly generated recs before display.
        const buyable = next === cachedRecs ? cachedBuyable : await currentlyBuyableIds(next)
        if (cancelled) return
        setRecommendations(sanitize(next, buyable))
        setLoading(false)
      } catch {
        if (cancelled) return
        setRecommendations(sanitize(cachedRecs, cachedBuyable))
        setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [user, enabled, ratingCount])

  return { recommendations, loading }
}
