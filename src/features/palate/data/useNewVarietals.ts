import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth'
import { useCoffees, type Coffee } from '../../../lib/useCoffees'
import { normalizeVarietal } from '../palateTheme'

export type VarietalPick = {
  coffee: Coffee
  newVarietals: string[]   // normalized labels this coffee has that the user hasn't rated
}

type RatedRow = { coffee: { id: string; variety: string[] | null } | null }

const MAX_PICKS = 4

/** Split a raw variety[] entry into normalized varietal labels. */
function varietalsOf(variety: string[] | null): string[] {
  const out: string[] = []
  for (const entry of variety ?? []) {
    for (const part of entry.split(',')) {
      const k = normalizeVarietal(part)
      if (k) out.push(k)
    }
  }
  return out
}

/**
 * Catalog coffees that feature a varietal the user has never rated — the "new
 * varietals" frontier. Catalog-linked (approved + unrated only) and greedily
 * diversified so the picks showcase *different* new varietals, not four Geshas.
 */
export function useNewVarietals(): { picks: VarietalPick[]; loading: boolean } {
  const { user } = useAuth()
  const { coffees, loading: coffeesLoading } = useCoffees()
  const [rated, setRated] = useState<RatedRow[]>([])
  const [ratedLoading, setRatedLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setRatedLoading(false)
      return
    }
    let cancelled = false
    async function load() {
      setRatedLoading(true)
      const { data, error } = await supabase
        .from('ratings')
        .select('coffee:coffees ( id, variety )')
        .eq('user_id', user!.id)
      if (cancelled) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!error) setRated((data as any) ?? [])
      setRatedLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user])

  return useMemo(() => {
    const loading = coffeesLoading || ratedLoading

    const seen = new Set<string>()
    const ratedIds = new Set<string>()
    for (const r of rated) {
      if (!r.coffee) continue
      ratedIds.add(r.coffee.id)
      for (const v of varietalsOf(r.coffee.variety)) seen.add(v)
    }

    const candidates: VarietalPick[] = []
    for (const c of coffees) {
      if (c.moderation_status !== 'approved' || ratedIds.has(c.id)) continue
      const news = [...new Set(varietalsOf(c.variety).filter((v) => !seen.has(v)))]
      if (news.length > 0) candidates.push({ coffee: c, newVarietals: news })
    }
    candidates.sort((a, b) => b.newVarietals.length - a.newVarietals.length)

    // Greedy: prefer coffees introducing a varietal not already shown, for variety.
    const shown = new Set<string>()
    const picks: VarietalPick[] = []
    for (const cand of candidates) {
      if (picks.length >= MAX_PICKS) break
      if (!cand.newVarietals.some((v) => !shown.has(v))) continue
      picks.push(cand)
      cand.newVarietals.forEach((v) => shown.add(v))
    }
    // Backfill if diversity ran out before we hit MAX_PICKS.
    if (picks.length < MAX_PICKS) {
      for (const cand of candidates) {
        if (picks.length >= MAX_PICKS) break
        if (!picks.includes(cand)) picks.push(cand)
      }
    }

    return { picks, loading }
  }, [coffees, coffeesLoading, rated, ratedLoading])
}
