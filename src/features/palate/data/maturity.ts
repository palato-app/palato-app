import type { PalateProfile } from './types'

const FINGERPRINT_FORMING_THRESHOLD = 3
const FINGERPRINT_FULL_THRESHOLD = 15
const SWEET_SPOT_THRESHOLD = 5
const ORIGINS_THRESHOLD = 5
const RECOMMENDATION_THRESHOLD = 3

export type MaturityState = 'full' | 'forming' | 'locked'

export function fingerprintMaturity(profile: PalateProfile): MaturityState {
  if (profile.ratingCount >= FINGERPRINT_FULL_THRESHOLD) return 'full'
  if (profile.ratingCount >= FINGERPRINT_FORMING_THRESHOLD) return 'forming'
  return 'locked'
}

export function sweetSpotMaturity(profile: PalateProfile): MaturityState {
  if (profile.ratingCount >= SWEET_SPOT_THRESHOLD) return 'full'
  return 'locked'
}

export function originsMaturity(profile: PalateProfile): MaturityState {
  if (profile.ratingCount >= ORIGINS_THRESHOLD) return 'full'
  return 'locked'
}

export function recommendationMaturity(profile: PalateProfile): MaturityState {
  return profile.ratingCount >= RECOMMENDATION_THRESHOLD ? 'full' : 'locked'
}

export function remainingForModule(ratingCount: number, module: 'fingerprint' | 'sweetSpot' | 'origins' | 'recommendation'): number {
  const thresholds: Record<string, number> = {
    fingerprint: FINGERPRINT_FORMING_THRESHOLD,
    sweetSpot: SWEET_SPOT_THRESHOLD,
    origins: ORIGINS_THRESHOLD,
    recommendation: RECOMMENDATION_THRESHOLD,
  }
  return Math.max(0, thresholds[module] - ratingCount)
}
