import { supabase } from '../../lib/supabase'

export type UserProfileRow = {
  id: string
  display_name: string | null
  location: string | null
}

export async function fetchUserProfile(userId: string): Promise<UserProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, location')
    .eq('id', userId)
    .maybeSingle()
  if (error) {
    console.error('fetchUserProfile error:', error)
    return null
  }
  return (data as UserProfileRow | null) ?? null
}

/**
 * Upsert the editable account fields on `profiles` (§9 More tab). The dev/early
 * users may have no profiles row yet, so upsert (not update) on the user id.
 */
export async function saveUserProfile(
  userId: string,
  patch: { display_name?: string | null; location?: string | null },
): Promise<UserProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...patch }, { onConflict: 'id' })
    .select('id, display_name, location')
    .single()
  if (error) {
    console.error('saveUserProfile error:', error)
    return null
  }
  return data as UserProfileRow
}
