import { supabase } from '../../lib/supabase'
import { buildDescriptorLookup, findMatches } from '../../lib/descriptorMatcher'
import type { FlavorDescriptor } from '../../lib/useFlavorDescriptors'

/**
 * Populate coffee_flavor_descriptors for every approved coffee by mapping its
 * roaster_tasting_notes_raw onto the 168-row canonical taxonomy (descriptorMatcher).
 * The recommendation engine needs catalog coffees to carry canonical descriptors;
 * nothing else writes this table today. Re-runnable: upserts and ignores existing
 * (coffee_id, descriptor_id) pairs, so it also picks up coffees added later.
 */
export async function rebuildFlavorLinks(): Promise<{
  error: string | null
  coffeesWithNotes?: number
  links?: number
}> {
  const { data: descriptors, error: dErr } = await supabase
    .from('flavor_descriptors')
    .select('*')
  if (dErr) return { error: dErr.message }
  const lookup = buildDescriptorLookup((descriptors ?? []) as FlavorDescriptor[])

  const { data: coffees, error: cErr } = await supabase
    .from('coffees')
    .select('id, roaster_tasting_notes_raw')
    .eq('moderation_status', 'approved')
  if (cErr) return { error: cErr.message }

  const rows: { coffee_id: string; descriptor_id: string }[] = []
  let coffeesWithNotes = 0
  for (const c of coffees ?? []) {
    const notes = (c.roaster_tasting_notes_raw ?? []) as string[]
    if (!notes.length) continue
    coffeesWithNotes++
    const matches = findMatches(notes.join(', '), lookup)
    for (const m of matches) {
      rows.push({ coffee_id: c.id, descriptor_id: m.descriptor.id })
    }
  }

  if (rows.length > 0) {
    const { error: upErr } = await supabase
      .from('coffee_flavor_descriptors')
      .upsert(rows, { onConflict: 'coffee_id,descriptor_id', ignoreDuplicates: true })
    if (upErr) return { error: upErr.message }
  }

  return { error: null, coffeesWithNotes, links: rows.length }
}
