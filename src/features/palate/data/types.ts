// The data contract between the Palate dashboard and the eventual rating aggregation.
// Every field maps to something the rating flow must produce.
// When real data lands, only getPalateProfile changes — components never touch this.

export type FlavorFamily =
  | 'fruity' | 'floral' | 'sweet' | 'sour_ferment'
  | 'cocoa_nut' | 'spice' | 'roasted' | 'green'

export type RoastLevel =
  | 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark'

export type ProcessMethod =
  | 'natural' | 'honey' | 'anaerobic' | 'washed' | 'other'

export interface FingerprintAxis {
  family: FlavorFamily
  score: number        // 0–100, normalized share of weighted descriptor frequency
  confidence: number   // 0–1, how much data backs this axis (drives "forming" feel)
}

export interface RatingBucket<T extends string> {
  key: T
  avgRating: number | null  // null = not enough data for this bucket
  count: number
}

export interface OriginStat {
  country: string
  avgRating: number
  count: number
}

export interface EvolutionPoint {
  period: string       // e.g. '6 mo', '5', ... 'now' — or ISO month
  avgRoast: number     // 1 (light) … 5 (dark)
}

export interface Recommendation {
  coffeeName: string
  roaster: string
  process: ProcessMethod
  roastLevel: RoastLevel
  reason: string       // editorial one-liner (templated for now — Claude-generated later)
}

export interface PalateProfile {
  ratingCount: number          // drives maturity states everywhere
  firstRatedAt: string | null  // ISO; with ratingCount, gates evolution
  summary: string              // the big editorial one-liner at the top
  fingerprint: FingerprintAxis[]        // always 8, in FlavorFamily order
  roastSweetSpot: RatingBucket<RoastLevel>[]
  processSweetSpot: RatingBucket<ProcessMethod>[]
  origins: OriginStat[]        // sorted desc by a blend of avgRating & count
  evolution: EvolutionPoint[]  // [] until unlocked
  recommendation: Recommendation | null // null until unlocked
  stats: {
    coffees: number
    roasters: number
    origins: number
    topNote: string | null
  }
}

// Editorial reads — the "talking chart" captions, kept separate from the data contract.
// Today these are hardcoded in mock fixtures; later they'll come from deterministic
// templates or Claude-generated copy (Competency A seam).
export interface PalateReads {
  fingerprint: string
  roast: string
  process: string
  origins: string
  evolution: string
}
