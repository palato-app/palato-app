import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useAuth } from './auth'

export type RatedCoffee = {
  id: string
  rating: number
  user_tasting_notes: string | null
  created_at: string
  coffee: {
    id: string
    roaster_name: string
    coffee_name: string
    origin_country: string | null
    bag_image_url: string | null
    roaster_stated_roast_level: string | null
  } | null
  descriptors: Array<{
    id: string
    descriptor: string
    category: string
    category_icon_color: string | null
    category_pill_tint: string | null
  }>
}

export function useUserRatings() {
  const { user } = useAuth()
  const [ratings, setRatings] = useState<RatedCoffee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      // Single nested query: ratings → coffee (many-to-one) → descriptors via join table
      const { data, error } = await supabase
        .from('ratings')
        .select(
          `
          id,
          rating,
          user_tasting_notes,
          created_at,
          coffee:coffees (
            id,
            roaster_name,
            coffee_name,
            origin_country,
            bag_image_url,
            roaster_stated_roast_level
          ),
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
        .order('created_at', { ascending: false })

      if (cancelled) return

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      // Flatten the nested rating_flavor_descriptors → descriptors structure
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const normalized: RatedCoffee[] = (data ?? []).map((r: any) => ({
        id: r.id,
        rating: Number(r.rating),
        user_tasting_notes: r.user_tasting_notes,
        created_at: r.created_at,
        coffee: r.coffee,
        descriptors: (r.rating_flavor_descriptors ?? [])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((rfd: any) => rfd.descriptor)
          .filter(Boolean),
      }))

      setRatings(normalized)
      setLoading(false)
    }

    load()

    return () => {
      cancelled = true
    }
  }, [user])

  return { ratings, loading, error }
}