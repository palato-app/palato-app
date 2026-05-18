import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useAuth } from './auth'

export type UserRatingForCoffee = {
  id: string
  rating: number
  user_tasting_notes: string | null
  created_at: string
  descriptors: Array<{
    id: string
    descriptor: string
    category: string
    category_icon_color: string | null
    category_pill_tint: string | null
  }>
}

export function useUserRatingForCoffee(coffeeId: string | null) {
  const { user } = useAuth()
  const [rating, setRating] = useState<UserRatingForCoffee | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !coffeeId) {
      setRating(null)
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('ratings')
        .select(
          `
          id,
          rating,
          user_tasting_notes,
          created_at,
          rating_flavor_descriptors (
            descriptor:flavor_descriptors (
              id,
              descriptor,
              category,
              category_icon_color,
              category_pill_tint
            )
          )
        `
        )
        .eq('user_id', user!.id)
        .eq('coffee_id', coffeeId!)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (cancelled) return

      if (error) {
        setError(error.message)
        setRating(null)
        setLoading(false)
        return
      }

      if (!data) {
        setRating(null)
        setLoading(false)
        return
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = data as any
      const normalized: UserRatingForCoffee = {
        id: r.id,
        rating: Number(r.rating),
        user_tasting_notes: r.user_tasting_notes,
        created_at: r.created_at,
        descriptors: (r.rating_flavor_descriptors ?? [])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((rfd: any) => rfd.descriptor)
          .filter(Boolean),
      }

      setRating(normalized)
      setLoading(false)
    }

    load()

    return () => {
      cancelled = true
    }
  }, [user, coffeeId])

  return { rating, loading, error }
}