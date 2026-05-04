import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export type FlavorDescriptor = {
  id: string
  category: string
  subcategory: string
  descriptor: string
  slug: string
  aliases: string[] | null
  is_defect: boolean
  description: string | null
  category_icon_color: string | null
  category_pill_tint: string | null
  sort_order: number
}

export function useFlavorDescriptors() {
  const [descriptors, setDescriptors] = useState<FlavorDescriptor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('flavor_descriptors')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setDescriptors(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  return { descriptors, loading, error }
}