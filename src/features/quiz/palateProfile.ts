import { supabase } from '../../lib/supabase'
import { clearQuizResult, loadQuizResult, type QuizResult } from './quizConfig'

export type PalateProfileRow = {
  user_id: string
  quiz_version: string
  raw_responses: unknown
  motivation: string | null
  experience_level: string | null
  aspiration: string | null
  flavor_lean: number | null
  flavor_unsure: boolean
  roast_preference: string | null
  origin_affinity: string | null
  brew_methods: string[] | null
  archetype: string | null
  created_at: string
  updated_at: string
}

function rowFromResult(userId: string, result: QuizResult) {
  const a = result.answers
  return {
    user_id: userId,
    quiz_version: result.quiz_version,
    raw_responses: a,
    motivation: a.motivation,
    experience_level: a.experience_level,
    aspiration: a.aspiration,
    flavor_lean: a.flavor_lean,
    flavor_unsure: a.flavor_unsure,
    roast_preference: a.roast_preference,
    origin_affinity: a.origin_affinity,
    brew_methods: a.brew_methods,
  }
}

/**
 * Create-or-update editable palate fields (More tab, §9). A user who skipped
 * the quiz (no palate_profiles row yet) can still set these — the row is
 * created on first edit.
 *
 * NOTE: deliberately NOT a single `upsert` — PostgREST upsert resets columns
 * absent from the payload to their defaults, which would wipe the rest of an
 * existing palate when editing one field. Instead: partial UPDATE if the row
 * exists (non-destructive), else INSERT.
 */
export async function updatePalateProfile(
  userId: string,
  patch: Partial<
    Pick<PalateProfileRow, 'experience_level' | 'aspiration' | 'brew_methods'>
  >,
): Promise<PalateProfileRow | null> {
  const { data: updated, error: updateError } = await supabase
    .from('palate_profiles')
    .update(patch)
    .eq('user_id', userId)
    .select()
    .maybeSingle()
  if (updateError) {
    console.error('updatePalateProfile update error:', updateError)
    return null
  }
  if (updated) return updated as PalateProfileRow

  // No existing row — create one with just these fields (rest take defaults).
  const { data: inserted, error: insertError } = await supabase
    .from('palate_profiles')
    .insert({ user_id: userId, ...patch })
    .select()
    .single()
  if (insertError) {
    console.error('updatePalateProfile insert error:', insertError)
    return null
  }
  return inserted as PalateProfileRow
}

export async function fetchPalateProfile(userId: string): Promise<PalateProfileRow | null> {
  const { data, error } = await supabase
    .from('palate_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) {
    console.error('fetchPalateProfile error:', error)
    return null
  }
  return (data as PalateProfileRow | null) ?? null
}

/**
 * Upsert the full quiz result for a user. Used by the quiz-retake path (§9),
 * which intentionally overwrites the existing profile.
 */
export async function savePalateProfile(
  userId: string,
  result: QuizResult,
): Promise<PalateProfileRow | null> {
  const { data, error } = await supabase
    .from('palate_profiles')
    .upsert(rowFromResult(userId, result), { onConflict: 'user_id' })
    .select()
    .single()
  if (error) {
    console.error('savePalateProfile error:', error)
    return null
  }
  return data as PalateProfileRow
}

/**
 * The sign-in hydration step (§3d): if a quiz result is waiting in
 * sessionStorage from a pre-auth run, write it to the DB — but only if the
 * user has no profile yet (never clobber an existing palate from a stale key).
 * Either way the key is cleared once handled. Returns the active profile row.
 */
export async function hydratePalateProfileFromSession(
  userId: string,
): Promise<PalateProfileRow | null> {
  const pending = loadQuizResult()
  if (!pending) return null

  const existing = await fetchPalateProfile(userId)
  if (existing) {
    clearQuizResult()
    return existing
  }

  const { data, error } = await supabase
    .from('palate_profiles')
    .insert(rowFromResult(userId, pending))
    .select()
    .single()

  if (error) {
    // A concurrent hydration (e.g. StrictMode double-invoke or two tabs) may
    // have inserted first — a unique violation means the profile now exists,
    // so treat it as success rather than an error.
    if (error.code === '23505') {
      clearQuizResult()
      return fetchPalateProfile(userId)
    }
    // Otherwise leave the key in place so a transient failure can retry.
    console.error('hydratePalateProfileFromSession insert error:', JSON.stringify(error))
    return null
  }

  clearQuizResult()
  return data as PalateProfileRow
}
