import type { PalateProfile, PalateReads } from './types'
import {
  establishedProfile,
  establishedReads,
  earlyProfile,
  earlyReads,
} from './mockProfiles'

export interface PalateViewData {
  profile: PalateProfile
  reads: PalateReads
}

/**
 * Returns the palate profile for the current user.
 *
 * Today: returns a mock fixture. The `variant` param selects which fixture
 * to preview (drives the ?variant=early dev switch — see §10 of the spec).
 *
 * Tomorrow: this becomes a Supabase query that aggregates ratings, descriptors,
 * and coffees into the PalateProfile shape. No component changes needed.
 *
 * // TODO(jesse): remove variant param when real aggregation lands
 */
export function getPalateProfile(
  variant?: 'established' | 'early'
): PalateViewData {
  // Check URL query param if no explicit variant passed
  const resolvedVariant =
    variant ??
    (typeof window !== 'undefined'
      ? (new URLSearchParams(window.location.search).get('variant') as
          | 'established'
          | 'early'
          | null) ?? 'established'
      : 'established')

  if (resolvedVariant === 'early') {
    return { profile: earlyProfile, reads: earlyReads }
  }

  return { profile: establishedProfile, reads: establishedReads }
}
