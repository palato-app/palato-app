import { useEffect, useState } from 'react'
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
  roast_date: string | null
  roaster_tasting_notes_raw: string[] | null
  sca_score: number | null
  bag_image_url: string | null
  verified: boolean
  created_at: string
  updated_at: string
}

export function useCoffees() {
  const [coffees, setCoffees] = useState<Coffee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('coffees')
        .select('*')
        .order('roaster_name', { ascending: true })
        .order('coffee_name', { ascending: true })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setCoffees(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  return { coffees, loading, error }
}