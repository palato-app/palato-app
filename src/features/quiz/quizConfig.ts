// Palate quiz (§3) — centralized copy, derivations, and persistence.
// All user-facing strings here are the spec's exact copy; do not paraphrase.

export const QUIZ_VERSION = 'v1'
export const QUIZ_STORAGE_KEY = 'palato_quiz_v1'

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'
export type RoastPreference = 'medium-light' | 'medium-dark'

export type QuizAnswers = {
  motivation: string | null // Q1 raw option label
  experience_level: ExperienceLevel | null // derived from Q1
  aspiration: string | null // Q2
  flavor_lean: number | null // Q3, 0–100; null if unsure
  flavor_unsure: boolean // Q3
  roast_preference: RoastPreference | null // derived from Q3; null if unsure/neutral
  origin_affinity: string | null // Q4
  brew_methods: string[] // Q5
}

export type QuizResult = {
  quiz_version: string
  answers: QuizAnswers
}

export const EMPTY_ANSWERS: QuizAnswers = {
  motivation: null,
  experience_level: null,
  aspiration: null,
  flavor_lean: null,
  flavor_unsure: false,
  roast_preference: null,
  origin_affinity: null,
  brew_methods: [],
}

// --- Q1 — motivation / intrigue (single-select) ---------------------------
export const Q1_PROMPT = 'What intrigues you most about specialty coffee?'

export const Q1_OPTIONS: {
  label: string
  experience: ExperienceLevel
  valueBack: string
}[] = [
  {
    label: "I'm new to this",
    experience: 'beginner',
    valueBack:
      "Specialty coffee is graded 80+ out of 100 by trained tasters, grown with care, and traceable to a farm. You're in the right place to learn.",
  },
  {
    label:
      'I want to taste more in my cup: e.g. notes of lychee, almond, etc. the things people describe',
    experience: 'intermediate',
    valueBack:
      "Tasting coffee is a learnable skill, not a gift you're born with. We'll build the vocabulary one cup at a time.",
  },
  {
    label: 'I want to understand the science of coffee: varietals, soil, process, etc.',
    experience: 'advanced',
    valueBack: 'You found the right app. We track the details most apps leave out.',
  },
]

// --- Q2 — aspiration (single-select) --------------------------------------
export const Q2_PROMPT = 'What do you want to learn about most?'
export const Q2_VALUE_BACK = "Noted: we'll keep pulling you toward that."

export const Q2_OPTIONS = [
  'Where to find the best coffee',
  'How brew methods change the taste',
  'How to name what I\'m tasting',
  'The story behind the coffees I drink',
  'I want to learn what I like',
] as const

// Reveal callback keyed to Q2 (§3c item 2).
export const ASPIRATION_CALLBACK: Record<string, string> = {
  'Where to find the best coffee':
    "You showed up to find better coffee. We're excited to point you in the right direction.",
  'How brew methods change the taste':
    "You came to understand how brewing methods change the coffee. We're pumped for you to learn more.",
  'How to name what I\'m tasting':
    'You came to put words to what you taste. Every coffee you rate here builds that vocabulary.',
  'The story behind the coffees I drink':
    "You came for the stories. We'll bring you the farms, the regions, the people behind what you're drinking.",
  // Authored to match voice — the 5th Q2 option had no example callback in the spec.
  'I want to learn what I like':
    'You came to discover what you like. Every coffee you rate makes that clearer.',
}

// --- Q3 — flavors (slider) ------------------------------------------------
export const Q3_PROMPT = 'What flavors do you gravitate toward in an ideal cup?'
export const Q3_LEFT_LABEL = 'Fruity & floral'
export const Q3_RIGHT_LABEL = 'Chocolatey & nutty'
export const Q3_UNSURE_LABEL = "I'm not sure yet"
export const Q3_FACT =
  "Here's something most people don't know: roasted coffee carries more than 800 aroma compounds (hint: that's more than wine.) No wonder it's hard to name them all."

// Live descriptor as the user drags (§3a).
export function flavorDescriptor(lean: number | null): string {
  if (lean === null) return 'A bit of both'
  if (lean <= 33) return 'Fruity & floral'
  if (lean <= 66) return 'A bit of both'
  return 'Chocolatey & nutty'
}

// Roast inference from the slider (§3b). Dead-center is treated as neutral
// (no roast lean); the "not sure" escape records unknown.
export function deriveRoast(lean: number | null, unsure: boolean): RoastPreference | null {
  if (unsure || lean === null) return null
  if (lean < 50) return 'medium-light'
  if (lean > 50) return 'medium-dark'
  return null
}

// --- Q4 — country / origin affinity (single-select) -----------------------
export const Q4_PROMPT = 'Your favorite coffees usually come from where?'

export const Q4_OPTIONS: { label: string; valueBack: string }[] = [
  {
    label: 'Ethiopia',
    valueBack:
      'Ethiopia is the birthplace of arabica coffee and coffee still makes up roughly 30–35% of everything the country exports.',
  },
  {
    label: 'Colombia',
    valueBack:
      'Colombia grows almost entirely washed arabica, tended by around 540,000 family farms.',
  },
  {
    label: 'Kenya',
    valueBack:
      'Most Kenyan coffee is sold through a single weekly auction and graded by bean size: the top grade is called AA.',
  },
  {
    label: 'Guatemala',
    valueBack:
      "Guatemala's coffee board recognizes eight distinct growing regions. Among the most famous are Antigua, Atitlán, & Huehuetenango.",
  },
  {
    label: 'Brazil',
    valueBack:
      'Brazil grows about a third of all the coffee on earth, and has led the coffee world for over 150 years.',
  },
  {
    label: 'Panama',
    valueBack:
      'Panama is Gesha country. In 2025, a single washed Gesha sold at auction for $13,705 per pound: a new world record.',
  },
  {
    label: 'Somewhere else',
    valueBack:
      "There's a whole world of origins beyond the usual names. We'll help you map yours.",
  },
  {
    label: 'Not sure yet',
    valueBack: "Figuring out your coffee map is half the fun. We'll get you there.",
  },
]

// Origins that are concrete countries (vs. the two open-ended choices).
const CONCRETE_ORIGINS = new Set([
  'Ethiopia',
  'Colombia',
  'Kenya',
  'Guatemala',
  'Brazil',
  'Panama',
])

// --- Q5 — brew method (multi-select) --------------------------------------
export const Q5_PROMPT = 'How do you usually brew your coffee?'

export const Q5_OPTIONS = [
  'v60',
  'Chemex',
  'AeroPress',
  'Kalita',
  'French press',
  'Espresso',
  'Moka pot',
  'Drip machine',
  'However the café makes it',
  'Other',
] as const

export const Q5_ESPRESSO_VALUE_BACK =
  "While espresso is amazing, we've built Palato for pourovers. We plan to drop Espresso features in the future."
export const Q5_DEFAULT_VALUE_BACK =
  "Brew method changes everything: the same bean can taste bright in a pour-over and deep as espresso. We'll point you to coffees that complement your preference."

export function brewValueBack(methods: string[]): string[] {
  const lines: string[] = []
  const hasEspresso = methods.includes('Espresso')
  const hasOther = methods.some((m) => m !== 'Espresso')
  if (hasOther) lines.push(Q5_DEFAULT_VALUE_BACK)
  if (hasEspresso) lines.push(Q5_ESPRESSO_VALUE_BACK)
  return lines
}

// --- Reveal (§3c) ----------------------------------------------------------
export const REVEAL_HEADLINE = "You're already on your way."
export const WHY_PALATO_TITLE = 'Why Palato'
export const WHY_PALATO_BODY =
  "Specialty coffee is one of the joy-inducing, good things of life. It's grown by people who care deeply about their craft on land that's getting harder to farm. You deserve to know what you love and why. We believe Palato offers a better way to drink coffee."
export const REVEAL_CTA = 'Save my palate'
export const REVEAL_CTA_SUBLINE = 'Sign in to keep your palate and start rating.'

function flavorPalateLabel(lean: number): string {
  if (lean <= 33) return 'bright and fruit-forward'
  if (lean <= 66) return 'balanced'
  return 'rich and chocolatey'
}

// Starting-palate line (§3c item 3).
export function startingPalateLine(answers: QuizAnswers): string {
  if (answers.flavor_unsure || answers.flavor_lean === null) {
    return "Your palate's still taking shape — and that's exactly what we'll map together."
  }
  const flavor = flavorPalateLabel(answers.flavor_lean)
  const origin = answers.origin_affinity
  if (origin && CONCRETE_ORIGINS.has(origin)) {
    return `Your starting palate: ${flavor}, with a soft spot for ${origin}.`
  }
  return `Your starting palate: ${flavor}, with a whole map of origins still to explore.`
}

export function aspirationCallback(aspiration: string | null): string | null {
  if (!aspiration) return null
  return ASPIRATION_CALLBACK[aspiration] ?? null
}

// --- Aspiration-driven personalization (§5) -------------------------------
// The Q2 answer tailors what the app emphasizes post-sign-in. This is the
// short, persistent reflection surfaced on the Palate tab; the per-surface
// emphasis (the catalog "Start here" rail, Learn origins, brew tips in the
// rating flow) is wired where each surface lives.
export type AspirationFocus = { label: string; nudge: string }

const ASPIRATION_FOCUS: Record<string, AspirationFocus> = {
  'Where to find the best coffee': {
    label: 'Finding the best coffee',
    nudge: 'Your "Start here" rail leads the catalog with picks for your palate.',
  },
  'How brew methods change the taste': {
    label: 'How brewing changes taste',
    nudge: "We'll surface brew tips as you rate.",
  },
  'How to name what I\'m tasting': {
    label: 'Naming what you taste',
    nudge: 'Lean on the flavor-note picker each time you rate.',
  },
  'The story behind the coffees I drink': {
    label: 'The stories behind your coffee',
    nudge: 'Explore where your coffee comes from in Learn.',
  },
  'I want to learn what I like': {
    label: 'Learning what you like',
    nudge: 'Every coffee you rate sharpens your palate.',
  },
}

export function aspirationFocus(aspiration: string | null): AspirationFocus | null {
  if (!aspiration) return null
  return ASPIRATION_FOCUS[aspiration] ?? null
}

// --- Persistence across the OAuth redirect (§3d) --------------------------
export function saveQuizResult(answers: QuizAnswers): void {
  try {
    const result: QuizResult = { quiz_version: QUIZ_VERSION, answers }
    sessionStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(result))
  } catch {
    // sessionStorage unavailable (private mode / quota) — non-fatal.
  }
}

export function loadQuizResult(): QuizResult | null {
  try {
    const raw = sessionStorage.getItem(QUIZ_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as QuizResult
  } catch {
    return null
  }
}

export function clearQuizResult(): void {
  try {
    sessionStorage.removeItem(QUIZ_STORAGE_KEY)
  } catch {
    // no-op
  }
}
