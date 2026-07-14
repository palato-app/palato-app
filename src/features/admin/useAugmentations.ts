import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

// The coffee fields an augmentation can propose (mirrors api/augment.js).
export type ProposedFields = Partial<{
  roaster_name: string
  coffee_name: string
  origin_country: string
  origin_region: string
  producer: string
  farm: string
  process: string
  process_detail: string
  roaster_stated_roast_level: string
  variety: string[]
  elevation_masl: number
  roaster_tasting_notes_raw: string[]
  purchase_url: string
  retailer_name: string
  price_usd: number
  bag_weight_grams: number
  purchase_availability: string
}>

export type AugmentationCoffee = {
  id: string
  roaster_name: string
  coffee_name: string
} & ProposedFields

export type Augmentation = {
  id: string
  coffee_id: string
  status: 'pending' | 'approved' | 'rejected'
  proposed: ProposedFields
  source_urls: string[] | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw_response: any
  model_version: string | null
  prompt_version: string | null
  created_at: string
  coffee: AugmentationCoffee | null
}

// Must cover every PROPOSABLE_FIELD in api/augment.js — a proposed field missing
// here renders as "NEW" in the review diff even when it overwrites a current value.
const COFFEE_COLS =
  'id, roaster_name, coffee_name, origin_country, origin_region, producer, farm, process, process_detail, roaster_stated_roast_level, variety, elevation_masl, roaster_tasting_notes_raw, purchase_url, retailer_name, price_usd, bag_weight_grams, purchase_availability'

/** Pending augmentation proposals (admin RLS), each joined to its coffee's current values. */
export function usePendingAugmentations() {
  const [items, setItems] = useState<Augmentation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('augmentations')
      .select(`*, coffee:coffees(${COFFEE_COLS})`)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setItems((data as Augmentation[]) ?? [])
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data, error } = await supabase
        .from('augmentations')
        .select(`*, coffee:coffees(${COFFEE_COLS})`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      if (cancelled) return
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      setItems((data as Augmentation[]) ?? [])
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { items, loading, error, refetch: load }
}

/**
 * Trigger augmentation for one coffee via the admin-gated serverless endpoint.
 * `regionVocab` — the canonical Learn region names for the coffee's country —
 * constrains the proposed origin_region so it stays matchable by the Learn
 * globe's fuzzy region link (Decision #062).
 */
export async function runAugment(
  coffeeId: string,
  regionVocab: string[] = [],
): Promise<{ error: string | null; fieldCount?: number; costUsd?: number; reason?: string }> {
  const { data: { session } } = await supabase.auth.getSession()
  try {
    const res = await fetch('/api/augment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token ?? ''}`,
      },
      body: JSON.stringify({ coffeeId, regionVocab }),
    })
    // A serverless timeout (504) or platform error returns HTML, not JSON —
    // surface the status so the failure reason is visible, not swallowed.
    let data: { error?: string; parseError?: boolean; fieldCount?: number; costUsd?: number; reason?: string } = {}
    try {
      data = await res.json()
    } catch {
      return { error: `HTTP ${res.status}${res.status === 504 ? ' (timeout — try again or reduce scope)' : ''}` }
    }
    if (!res.ok) return { error: data.error || `HTTP ${res.status}` }
    if (data.parseError) return { error: 'Claude returned unparseable output.', costUsd: data.costUsd }
    return { error: null, fieldCount: data.fieldCount ?? 0, costUsd: data.costUsd, reason: data.reason }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Network error.' }
  }
}

/**
 * Approve a proposal — applying ONLY the chosen fields (per-field accept/reject).
 * Writes the selected proposed facts onto the coffee, stamps provenance
 * (source_url / web_augmented_at / augmentation_raw — admin-only columns, guarded
 * by the 0013 trigger), and records exactly what was applied. The ONLY place an
 * augmentation mutates a coffee — the never-overwrite invariant (Decision #048/#052).
 */
export async function approveAugmentation(
  aug: Augmentation,
  fields: (keyof ProposedFields)[],
): Promise<{ error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser()

  const applied: Record<string, unknown> = {}
  for (const f of fields) {
    if (f in aug.proposed) applied[f] = aug.proposed[f]
  }

  // Only touch the coffee (and stamp provenance) if at least one field was kept.
  if (Object.keys(applied).length > 0) {
    const patch: Record<string, unknown> = { ...applied }
    patch.source_url = aug.source_urls?.[0] ?? null
    patch.web_augmented_at = new Date().toISOString()
    patch.augmentation_raw = aug.raw_response
    const { error: coffeeErr } = await supabase.from('coffees').update(patch).eq('id', aug.coffee_id)
    if (coffeeErr) return { error: coffeeErr.message }
  }

  const { error: augErr } = await supabase
    .from('augmentations')
    .update({
      status: 'approved',
      applied,
      reviewed_by: user?.id ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', aug.id)
  return { error: augErr?.message ?? null }
}

/** Reject a proposal: discard it (coffee untouched). */
export async function rejectAugmentation(id: string): Promise<{ error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase
    .from('augmentations')
    .update({ status: 'rejected', reviewed_by: user?.id ?? null, reviewed_at: new Date().toISOString() })
    .eq('id', id)
  return { error: error?.message ?? null }
}
