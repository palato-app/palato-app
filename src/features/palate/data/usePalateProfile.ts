import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth'
import type {
  PalateProfile,
  PalateReads,
  FlavorFamily,
  FingerprintAxis,
  RatingBucket,
  RoastLevel,
  ProcessMethod,
  OriginStat,
} from './types'

const CATEGORY_TO_FAMILY: Record<string, FlavorFamily> = {
  'Fruit': 'fruity',
  'Floral': 'floral',
  'Sweet': 'sweet',
  'Fermented & Funky': 'sour_ferment',
  'Nutty & Cocoa': 'cocoa_nut',
  'Spice': 'spice',
  'Roasted': 'roasted',
  'Earthy & Wood': 'green',
  'Green': 'green',
  'Body & Mouthfeel': 'sweet',
  'Defects & Off-flavors': 'sour_ferment',
}

const ALL_FAMILIES: FlavorFamily[] = [
  'fruity', 'floral', 'sweet', 'sour_ferment',
  'cocoa_nut', 'spice', 'roasted', 'green',
]

const ROAST_ORDER: RoastLevel[] = [
  'light', 'medium-light', 'medium', 'medium-dark', 'dark',
]

const PROCESS_ORDER: ProcessMethod[] = [
  'natural', 'honey', 'anaerobic', 'washed',
]

function normalizeRoast(raw: string | null): RoastLevel | null {
  if (!raw) return null
  const lower = raw.toLowerCase().replace(/\s+/g, '-')
  if (ROAST_ORDER.includes(lower as RoastLevel)) return lower as RoastLevel
  if (lower.includes('light') && lower.includes('med')) return 'medium-light'
  if (lower.includes('dark') && lower.includes('med')) return 'medium-dark'
  if (lower.includes('light')) return 'light'
  if (lower.includes('dark')) return 'dark'
  if (lower.includes('med')) return 'medium'
  return null
}

function normalizeProcess(raw: string | null): ProcessMethod | null {
  if (!raw) return null
  const lower = raw.toLowerCase()
  if (lower.includes('natural') || lower.includes('dry')) return 'natural'
  if (lower.includes('honey')) return 'honey'
  if (lower.includes('anaerobic')) return 'anaerobic'
  if (lower.includes('washed') || lower.includes('wet')) return 'washed'
  return null
}

type RatingRow = {
  id: string
  rating: number
  created_at: string
  coffee: {
    id: string
    roaster_name: string
    origin_country: string | null
    roaster_stated_roast_level: string | null
    process: string | null
  } | null
  rating_flavor_descriptors: Array<{
    descriptor: {
      category: string
      descriptor: string
    } | null
  }>
}

export interface UsePalateProfileResult {
  profile: PalateProfile
  reads: PalateReads
  loading: boolean
  ratingCount: number
}

const EMPTY_PROFILE: PalateProfile = {
  ratingCount: 0,
  firstRatedAt: null,
  summary: '',
  fingerprint: ALL_FAMILIES.map((f) => ({ family: f, score: 0, confidence: 0 })),
  roastSweetSpot: ROAST_ORDER.map((k) => ({ key: k, avgRating: null, count: 0 })),
  processSweetSpot: PROCESS_ORDER.map((k) => ({ key: k, avgRating: null, count: 0 })),
  origins: [],
  evolution: [],
  stats: { coffees: 0, roasters: 0, origins: 0, topNote: null },
}

const EMPTY_READS: PalateReads = {
  fingerprint: '',
  roast: '',
  process: '',
  origins: '',
  evolution: '',
}

function buildProfile(rows: RatingRow[]): { profile: PalateProfile; reads: PalateReads } {
  if (rows.length === 0) return { profile: EMPTY_PROFILE, reads: EMPTY_READS }

  const ratingCount = rows.length
  const sorted = [...rows].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
  const firstRatedAt = sorted[0].created_at

  // --- Stats ---
  const coffeeIds = new Set<string>()
  const roasterNames = new Set<string>()
  const originCountries = new Set<string>()
  for (const r of rows) {
    if (r.coffee) {
      coffeeIds.add(r.coffee.id)
      roasterNames.add(r.coffee.roaster_name)
      if (r.coffee.origin_country) originCountries.add(r.coffee.origin_country)
    }
  }

  // --- Fingerprint from descriptor frequencies ---
  const familyCounts: Record<FlavorFamily, number> = Object.fromEntries(
    ALL_FAMILIES.map((f) => [f, 0])
  ) as Record<FlavorFamily, number>
  const descriptorCounts: Record<string, number> = {}
  let totalDescriptors = 0

  for (const r of rows) {
    for (const rfd of r.rating_flavor_descriptors) {
      if (!rfd.descriptor) continue
      const family = CATEGORY_TO_FAMILY[rfd.descriptor.category]
      if (family) {
        familyCounts[family]++
        totalDescriptors++
      }
      const name = rfd.descriptor.descriptor.toLowerCase()
      descriptorCounts[name] = (descriptorCounts[name] || 0) + 1
    }
  }

  const maxFamilyCount = Math.max(...Object.values(familyCounts), 1)
  const fingerprint: FingerprintAxis[] = ALL_FAMILIES.map((family) => ({
    family,
    score: Math.round((familyCounts[family] / maxFamilyCount) * 100),
    confidence: Math.min(1, familyCounts[family] / 10),
  }))

  const topNote = Object.entries(descriptorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  // --- Roast sweet spot ---
  const roastBuckets: Record<RoastLevel, { sum: number; count: number }> = Object.fromEntries(
    ROAST_ORDER.map((k) => [k, { sum: 0, count: 0 }])
  ) as Record<RoastLevel, { sum: number; count: number }>

  for (const r of rows) {
    const roast = normalizeRoast(r.coffee?.roaster_stated_roast_level ?? null)
    if (roast) {
      roastBuckets[roast].sum += r.rating
      roastBuckets[roast].count++
    }
  }

  const roastSweetSpot: RatingBucket<RoastLevel>[] = ROAST_ORDER.map((key) => ({
    key,
    avgRating: roastBuckets[key].count > 0
      ? Math.round((roastBuckets[key].sum / roastBuckets[key].count) * 10) / 10
      : null,
    count: roastBuckets[key].count,
  }))

  // --- Process sweet spot ---
  const processBuckets: Record<ProcessMethod, { sum: number; count: number }> = Object.fromEntries(
    PROCESS_ORDER.map((k) => [k, { sum: 0, count: 0 }])
  ) as Record<ProcessMethod, { sum: number; count: number }>

  for (const r of rows) {
    const process = normalizeProcess(r.coffee?.process ?? null)
    if (process) {
      processBuckets[process].sum += r.rating
      processBuckets[process].count++
    }
  }

  const processSweetSpot: RatingBucket<ProcessMethod>[] = PROCESS_ORDER.map((key) => ({
    key,
    avgRating: processBuckets[key].count > 0
      ? Math.round((processBuckets[key].sum / processBuckets[key].count) * 10) / 10
      : null,
    count: processBuckets[key].count,
  }))

  // --- Origins ---
  const originMap: Record<string, { sum: number; count: number }> = {}
  for (const r of rows) {
    const country = r.coffee?.origin_country
    if (country) {
      if (!originMap[country]) originMap[country] = { sum: 0, count: 0 }
      originMap[country].sum += r.rating
      originMap[country].count++
    }
  }

  const origins: OriginStat[] = Object.entries(originMap)
    .map(([country, { sum, count }]) => ({
      country,
      avgRating: Math.round((sum / count) * 10) / 10,
      count,
    }))
    .sort((a, b) => b.avgRating - a.avgRating || b.count - a.count)

  // --- Summary ---
  const topRoast = roastSweetSpot.filter((b) => b.avgRating !== null).sort((a, b) => b.avgRating! - a.avgRating!)[0]
  const topFamily = fingerprint.sort((a, b) => b.score - a.score)[0]

  let summary: string
  if (ratingCount < 5) {
    summary = `${ratingCount} coffees rated so far. Keep going — your palate is just getting started.`
  } else if (ratingCount < 15) {
    const familyHint = topFamily.score > 0 ? ` Early signs point toward *${topFamily.family.replace('_', '/')}* flavors.` : ''
    summary = `${ratingCount} coffees rated.${familyHint} A few more and the picture gets clearer.`
  } else {
    const roastHint = topRoast ? ` You score *${topRoast.key}* roasts highest.` : ''
    summary = `${ratingCount} coffees rated.${roastHint} Your palate has a shape — and it's sharpening.`
  }

  // --- Reads (templated for now) ---
  const reads: PalateReads = {
    fingerprint: totalDescriptors === 0
      ? 'Rate coffees with flavor descriptors to build your fingerprint.'
      : ratingCount < 15
        ? `${topFamily.family.replace('_', '/')} notes lead your early ratings. Your fingerprint firms up around *15 coffees*; for now it's a sketch.`
        : `Your top flavor families are clear. ${topFamily.family.replace('_', '/')} notes appear most often in your highest-rated coffees.`,
    roast: topRoast?.avgRating
      ? `Your ${topRoast.key} roasts average *${topRoast.avgRating.toFixed(1)}*. ${ratingCount < 10 ? 'A few more ratings will sharpen this.' : ''}`
      : 'Not enough roast data yet — rate coffees with known roast levels.',
    process: processSweetSpot.filter((b) => b.count > 0).length > 0
      ? `${processSweetSpot.filter((b) => b.count > 0).sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0))[0].key} coffees are your early favorite process.`
      : 'Not enough process data yet.',
    origins: origins.length > 0
      ? `${origins[0].country} leads with *${origins[0].avgRating.toFixed(1)}* across ${origins[0].count} coffees.${origins.length < 3 ? ' Keep exploring new origins.' : ''}`
      : 'Rate coffees from different origins to see where your palate leans.',
    evolution: '',
  }

  const profile: PalateProfile = {
    ratingCount,
    firstRatedAt,
    summary,
    fingerprint: ALL_FAMILIES.map((family) => ({
      family,
      score: Math.round((familyCounts[family] / maxFamilyCount) * 100),
      confidence: Math.min(1, familyCounts[family] / 10),
    })),
    roastSweetSpot,
    processSweetSpot,
    origins,
    evolution: [],
    stats: {
      coffees: coffeeIds.size,
      roasters: roasterNames.size,
      origins: originCountries.size,
      topNote,
    },
  }

  return { profile, reads }
}

export function usePalateProfile(): UsePalateProfileResult {
  const { user } = useAuth()
  const [rows, setRows] = useState<RatingRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from('ratings')
        .select(`
          id,
          rating,
          created_at,
          coffee:coffees (
            id,
            roaster_name,
            origin_country,
            roaster_stated_roast_level,
            process
          ),
          rating_flavor_descriptors (
            descriptor:flavor_descriptors (
              category,
              descriptor
            )
          )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (cancelled) return

      if (error) {
        setLoading(false)
        return
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setRows((data as any) ?? [])
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [user])

  const { profile, reads } = useMemo(() => buildProfile(rows), [rows])

  return { profile, reads, loading, ratingCount: rows.length }
}
