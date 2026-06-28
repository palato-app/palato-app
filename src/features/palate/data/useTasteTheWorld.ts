import { useMemo } from 'react'
import { useCoffees } from '../../../lib/useCoffees'
import {
  ORIGINS,
  SECONDARY_ORIGINS,
  originByCountry,
  type Origin,
} from '../../learn/data/originsData'
import type { OriginStat } from './types'

export type FrontierCountry = {
  country: string   // display name (the catalog join + nav key)
  mapName: string   // GeoJSON ADMIN name (globe highlight key)
  coffeeCount: number
}

export type TasteTheWorldData = {
  loading: boolean
  tastedMapNames: Set<string>
  frontierMapNames: Set<string>
  frontier: FrontierCountry[]   // untasted arabica origins we actually stock, by stock desc
  tastedCount: number
}

const isArabica = (o: Origin) =>
  o.speciesType === 'arabica' || o.speciesType === 'both' || o.speciesType === 'all_four'

/**
 * Powers "Taste the World": which arabica origins the user has tasted vs. an
 * untasted *frontier* we can actually sell them. The frontier is gated on
 * catalog stock (catalog-linked only, Decision: Palate 2.0) so nothing the
 * globe highlights ever dead-ends.
 */
export function useTasteTheWorld(origins: OriginStat[]): TasteTheWorldData {
  const { coffees, loading } = useCoffees()

  return useMemo(() => {
    const approved = coffees.filter((c) => c.moderation_status === 'approved')

    // Approved catalog stock, keyed by the origin's globe mapName.
    const stockByMap = new Map<string, number>()
    const countryByMap = new Map<string, string>()
    for (const c of approved) {
      if (!c.origin_country) continue
      const o = originByCountry(c.origin_country)
      if (!o?.mapName) continue
      stockByMap.set(o.mapName, (stockByMap.get(o.mapName) ?? 0) + 1)
      countryByMap.set(o.mapName, o.country)
    }

    const tastedMapNames = new Set<string>()
    for (const stat of origins) {
      const o = originByCountry(stat.country)
      if (o?.mapName) tastedMapNames.add(o.mapName)
    }

    const arabicaMapNames = new Set<string>()
    for (const o of [...ORIGINS, ...SECONDARY_ORIGINS]) {
      if (o.mapName && isArabica(o)) arabicaMapNames.add(o.mapName)
    }

    const frontier: FrontierCountry[] = []
    const frontierMapNames = new Set<string>()
    for (const [mapName, coffeeCount] of stockByMap) {
      if (tastedMapNames.has(mapName)) continue
      if (!arabicaMapNames.has(mapName)) continue
      frontierMapNames.add(mapName)
      frontier.push({ country: countryByMap.get(mapName)!, mapName, coffeeCount })
    }
    frontier.sort((a, b) => b.coffeeCount - a.coffeeCount || a.country.localeCompare(b.country))

    return {
      loading,
      tastedMapNames,
      frontierMapNames,
      frontier,
      tastedCount: tastedMapNames.size,
    }
  }, [coffees, loading, origins])
}
