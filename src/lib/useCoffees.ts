import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { Coffee } from './useCoffees'

export function useCoffee(coffeeId: string | null) {
  const [coffee, setCoffee] = useState<Coffee | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!coffeeId) {
      setCoffee(null)
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('coffees')
        .select('*')
        .eq('id', coffeeId)
        .single()

      if (cancelled) return

      if (error) {
        setError(error.message)
        setCoffee(null)
        setLoading(false)
        return
      }

      setCoffee(data)
      setLoading(false)
    }

    load()

    return () => {
      cancelled = true
    }
  }, [coffeeId])

  return { coffee, loading, error }
}