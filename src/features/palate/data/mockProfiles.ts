import type { PalateProfile, PalateReads } from './types'

// ---------------------------------------------------------------------------
// Mock fixtures — values match the branded HTML mock exactly.
// "established" = mature palate (47 coffees), "early" = forming (12 coffees).
// Emphasis markers use *asterisks* — parsed by EditorialRead into styled spans.
// ---------------------------------------------------------------------------

export const establishedProfile: PalateProfile = {
  ratingCount: 47,
  firstRatedAt: '2025-11-24T00:00:00Z',
  summary:
    'Forty-seven coffees in. You’re a bright, fruit-forward drinker who’s quietly been *creeping lighter*.',
  fingerprint: [
    { family: 'fruity', score: 90, confidence: 1 },
    { family: 'floral', score: 74, confidence: 1 },
    { family: 'sweet', score: 60, confidence: 1 },
    { family: 'sour_ferment', score: 56, confidence: 1 },
    { family: 'cocoa_nut', score: 26, confidence: 1 },
    { family: 'spice', score: 34, confidence: 1 },
    { family: 'roasted', score: 15, confidence: 1 },
    { family: 'green', score: 20, confidence: 1 },
  ],
  roastSweetSpot: [
    { key: 'light', avgRating: 4.6, count: 15 },
    { key: 'medium-light', avgRating: 4.3, count: 12 },
    { key: 'medium', avgRating: 3.5, count: 10 },
    { key: 'medium-dark', avgRating: 2.8, count: 6 },
    { key: 'dark', avgRating: 2.2, count: 4 },
  ],
  processSweetSpot: [
    { key: 'natural', avgRating: 4.5, count: 18 },
    { key: 'honey', avgRating: 4.3, count: 10 },
    { key: 'anaerobic', avgRating: 4.4, count: 8 },
    { key: 'washed', avgRating: 4.0, count: 11 },
  ],
  origins: [
    { country: 'Ethiopia', avgRating: 4.6, count: 12 },
    { country: 'Kenya', avgRating: 4.4, count: 8 },
    { country: 'Colombia', avgRating: 3.9, count: 6 },
    { country: 'Guatemala', avgRating: 3.8, count: 4 },
    { country: 'Brazil', avgRating: 2.9, count: 3 },
  ],
  evolution: [
    { period: '6 mo', avgRoast: 3.1 },
    { period: '5', avgRoast: 2.9 },
    { period: '4', avgRoast: 2.8 },
    { period: '3', avgRoast: 2.5 },
    { period: '2', avgRoast: 2.2 },
    { period: 'now', avgRoast: 2.0 },
  ],
  recommendation: {
    coffeeName: 'Ethiopia Gelgelu',
    roaster: 'Onyx Coffee Lab',
    process: 'natural',
    roastLevel: 'light',
    reason:
      'You love wild Ethiopian naturals. This has the same *blueberry* as your top-rated Hambela, with more body — we think it lands at a five.',
  },
  stats: {
    coffees: 47,
    roasters: 19,
    origins: 9,
    topNote: 'blueberry',
  },
}

export const establishedReads: PalateReads = {
  fingerprint:
    'Fruit and florals are your gravity. *Roasty and nutty leave you cold* — you’ve never rated a dark roast above a three.',
  roast: 'Your fives live in the light end. *Past medium, you check out.*',
  process:
    'Naturals edge washed by half a star — you like them a little wild.',
  origins:
    'Ethiopia is home. You’ve never loved a Brazil — but *every Brazil you tried was a medium-dark*. Might be the roast, not the country.',
  evolution:
    'Six months ago you drank medium. Now you reach for light. *Your palate’s moving.*',
}

export const earlyProfile: PalateProfile = {
  ratingCount: 12,
  firstRatedAt: '2026-05-10T00:00:00Z',
  summary:
    'Twelve in. Early read: you *skew bright and fruity* — but it isn’t locked yet.',
  fingerprint: [
    { family: 'fruity', score: 70, confidence: 0.6 },
    { family: 'floral', score: 52, confidence: 0.5 },
    { family: 'sweet', score: 55, confidence: 0.5 },
    { family: 'sour_ferment', score: 38, confidence: 0.4 },
    { family: 'cocoa_nut', score: 40, confidence: 0.4 },
    { family: 'spice', score: 30, confidence: 0.3 },
    { family: 'roasted', score: 28, confidence: 0.3 },
    { family: 'green', score: 30, confidence: 0.3 },
  ],
  roastSweetSpot: [
    { key: 'light', avgRating: 4.4, count: 5 },
    { key: 'medium-light', avgRating: 4.1, count: 3 },
    { key: 'medium', avgRating: 3.6, count: 3 },
    { key: 'medium-dark', avgRating: 3.0, count: 1 },
    { key: 'dark', avgRating: null, count: 0 },
  ],
  processSweetSpot: [
    { key: 'natural', avgRating: 4.4, count: 5 },
    { key: 'honey', avgRating: null, count: 0 },
    { key: 'anaerobic', avgRating: 4.2, count: 3 },
    { key: 'washed', avgRating: 3.9, count: 4 },
  ],
  origins: [
    { country: 'Ethiopia', avgRating: 4.5, count: 4 },
    { country: 'Colombia', avgRating: 4.0, count: 3 },
    { country: 'Kenya', avgRating: 4.2, count: 2 },
  ],
  evolution: [],
  recommendation: null,
  stats: {
    coffees: 12,
    roasters: 7,
    origins: 4,
    topNote: 'blueberry',
  },
}

export const earlyReads: PalateReads = {
  fingerprint:
    'Fruit is leading early. *Eight more coffees* and your fingerprint locks in — right now it’s a sketch, not a signature.',
  roast:
    'Early pattern: light beats dark. You haven’t tried a dark roast yet — worth one, just to be sure.',
  process: 'Naturals look like your lane. You’ve not logged a honey yet.',
  origins:
    'Strong early start with Ethiopia. Too few origins to call a favourite — go explore.',
  evolution: '',
}
