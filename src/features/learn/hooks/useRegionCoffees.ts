import { useMemo } from 'react'
import { useCoffees, type Coffee } from '../../../lib/useCoffees'
import { coffeeMatchesRegion } from '../lib/matchRegion'
import type { OriginRegion } from '../data/originsData'

// Surfaces the catalog coffees that belong to a region. Composes the existing
// useCoffees() fetch and filters in memory via the matcher — no extra query, no DB
// migration. (RLS already limits the catalog to approved coffees + the user's own.)
export function useRegionCoffees(region: OriginRegion): {
  coffees: Coffee[]
  loading: boolean
  error: string | null
} {
  const { coffees, loading, error } = useCoffees()

  const matched = useMemo(
    () => coffees.filter((c) => coffeeMatchesRegion(c, region)),
    [coffees, region],
  )

  return { coffees: matched, loading, error }
}
