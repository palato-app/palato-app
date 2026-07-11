import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'

export type Coffee = {
  id: string
  roaster_name: string
  coffee_name: string
  origin_country: string | null
  origin_region: string | null
  producer: string | null
  farm: string | null
  process: string | null
  process_detail: string | null
  roaster_stated_roast_level: string | null
  variety: string[] | null
  elevation_masl: number | null
  // High end of a stated elevation range (migration 0017); null = single value.
  elevation_masl_max: number | null
  roast_date: string | null
  roaster_tasting_notes_raw: string[] | null
  sca_score: number | null
  bag_image_url: string | null
  verified: boolean
  // Catalog moderation gate (migration 0013). New coffees enter 'pending' and
  // are invisible in the global catalog until an admin approves them.
  moderation_status: 'pending' | 'approved' | 'rejected'
  // Web augmentation (migration 0010). Dormant until the augment pipeline writes
  // them; the system-managed ones (source_url, web_augmented_at, augmentation_raw)
  // are admin-only writable via a trigger (migration 0013).
  purchase_url: string | null
  retailer_name: string | null
  price_usd: number | null
  bag_weight_grams: number | null
  price_per_gram: number | null
  purchase_availability: 'yes' | 'no' | 'unsure'
  source_url: string | null
  web_augmented_at: string | null
  augmentation_raw: unknown | null
  created_at: string
  updated_at: string
}

export function useCoffees() {
  const [coffees, setCoffees] = useState<Coffee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // The user-facing catalog hook: approved coffees only. RLS also returns a
  // caller's own pending coffees and (for admins) every pending/rejected row, so
  // without this filter the admin's catalog leaks unapproved coffees (the gate is
  // meant to keep them out of the brand surface). Admin review uses its own
  // status-scoped queries (usePendingCoffees / useRejectedCoffees), not this hook.
  const refetch = useCallback(async () => {
    const { data, error } = await supabase
      .from('coffees')
      .select('*')
      .eq('moderation_status', 'approved')
      .order('roaster_name', { ascending: true })
      .order('coffee_name', { ascending: true })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setCoffees(data ?? [])
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data, error } = await supabase
        .from('coffees')
        .select('*')
        .eq('moderation_status', 'approved')
        .order('roaster_name', { ascending: true })
        .order('coffee_name', { ascending: true })
      if (cancelled) return
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      setCoffees(data ?? [])
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { coffees, loading, error, refetch }
}