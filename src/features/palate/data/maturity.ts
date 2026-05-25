import type { PalateProfile } from './types'

// ---------------------------------------------------------------------------
// Tunable thresholds — adjust as the product matures and we learn what
// "enough data" means for each module. Keep them here, not in components.
// ---------------------------------------------------------------------------
const FINGERPRINT_THRESHOLD = 20
const SWEET_SPOT_THRESHOLD = 8
const ORIGINS_THRESHOLD = 8
const EVOLUTION_THRESHOLD = 20
const EVOLUTION_MIN_WEEKS = 4
const RECOMMENDATION_THRESHOLD = 8

export type MaturityState = 'full' | 'forming' | 'locked'

export function fingerprintMaturity(profile: PalateProfile): MaturityState {
  return profile.ratingCount >= FINGERPRINT_THRESHOLD ? 'full' : 'forming'
}

export function sweetSpotMaturity(profile: PalateProfile): MaturityState {
  return profile.ratingCount >= SWEET_SPOT_THRESHOLD ? 'full' : 'forming'
}

export function originsMaturity(profile: PalateProfile): MaturityState {
  return profile.ratingCount >= ORIGINS_THRESHOLD ? 'full' : 'forming'
}

export function evolutionMaturity(profile: PalateProfile): MaturityState {
  if (profile.ratingCount < EVOLUTION_THRESHOLD) return 'locked'
  if (!profile.firstRatedAt) return 'locked'
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  const weeksSinceFirst = (Date.now() - new Date(profile.firstRatedAt).getTime()) / msPerWeek
  return weeksSinceFirst >= EVOLUTION_MIN_WEEKS ? 'full' : 'locked'
}

export function recommendationMaturity(profile: PalateProfile): MaturityState {
  return profile.ratingCount >= RECOMMENDATION_THRESHOLD ? 'full' : 'locked'
}

export function remainingForFingerprint(profile: PalateProfile): number {
  return Math.max(0, FINGERPRINT_THRESHOLD - profile.ratingCount)
}
