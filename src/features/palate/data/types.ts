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

export type RecommendationKind = 'unique' | 'explore' | 'love'

export interface Recommendation {
  kind: RecommendationKind
  coffeeId: string           // for tap-through to coffee detail
  coffeeName: string
  roaster: string
  process: string            // display value straight from the catalog (label-mapped in UI)
  roastLevel: string
  reason: string             // grounded one-liner from /api/recommend (Claude or templated fallback)
}

// The three strategy cards. Any may be null if its shortlist was empty.
export interface Recommendations {
  unique: Recommendation | null
  explore: Recommendation | null
  love: Recommendation | null
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
  // recommendations are decoupled — see useRecommendations + the recommendations cache
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
