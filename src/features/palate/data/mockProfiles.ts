import type { PalateProfile, PalateReads } from './types'

// ---------------------------------------------------------------------------
// Mock fixtures — grounded editorial voice (Decision #039).
// "established" = mature palate (47 coffees), "early" = forming (12 coffees).
// Emphasis markers use *asterisks* — parsed by EditorialRead into styled spans.
// Emphasis goes on a number or the actionable phrase, not on a dramatic flourish.
// ---------------------------------------------------------------------------

export const establishedProfile: PalateProfile = {
  ratingCount: 47,
  summary:
    'Forty-seven coffees rated. You score light, fruit-forward coffees highest, and your picks have *trended lighter* over the past six months.',
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
  stats: {
    coffees: 47,
    roasters: 19,
    origins: 9,
    topNote: 'blueberry',
  },
}

export const establishedReads: PalateReads = {
  fingerprint:
    'Fruity and floral notes appear in most of your top-rated coffees; roasted and nutty notes rarely do. Your highest-rated dark roast so far is a *3*.',
  roast:
    'Your average rating rises as the roast gets lighter — light and medium-light sit near *5*, dark closer to *2*.',
  process:
    'Naturals average about half a star higher than washed for you. Natural processing leaves more fruit character in the cup, which lines up with your profile.',
  origins:
    'Ethiopia and Kenya are your highest-rated origins. Brazil sits lowest — but every Brazil you’ve rated was a medium-dark, your lowest-scoring roast level, so origin and roast are tangled here. *A light-roast Brazil would settle it.*',
}

export const earlyProfile: PalateProfile = {
  ratingCount: 12,
  summary:
    'Twelve coffees rated. Early on, you’re scoring fruit-forward, lighter-roast coffees highest — but it’s *too soon to lock the pattern*.',
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
  stats: {
    coffees: 12,
    roasters: 7,
    origins: 4,
    topNote: 'blueberry',
  },
}

export const earlyReads: PalateReads = {
  fingerprint:
    'Fruity notes lead your early ratings. Your fingerprint firms up around *20 coffees*; for now it’s a sketch.',
  roast:
    'So far your lighter roasts score higher. You haven’t rated a dark roast yet — one would test the pattern.',
  process:
    'Naturals are your early favorite. You haven’t logged a honey-processed coffee yet.',
  origins:
    'Ethiopia leads your early ratings. Too few origins logged to name a favorite — keep exploring.',
}
