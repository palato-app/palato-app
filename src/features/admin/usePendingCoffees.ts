import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Coffee } from '../../lib/useCoffees'

// Admins also see who added the coffee + when, to inform the review.
export type PendingCoffee = Coffee & { created_by: string | null }

/**
 * Admin-only view of coffees in one moderation state. Admin RLS (migration 0013)
 * lets admins read pending/rejected rows; non-admins never see them.
 */
function useCoffeesByStatus(
  status: 'pending' | 'rejected',
  orderColumn: 'created_at' | 'updated_at',
  ascending: boolean,
) {
  const [coffees, setCoffees] = useState<PendingCoffee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('coffees')
      .select('*')
      .eq('moderation_status', status)
      .order(orderColumn, { ascending })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setCoffees((data as PendingCoffee[]) ?? [])
    setError(null)
    setLoading(false)
  }, [status, orderColumn, ascending])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      await load()
      if (cancelled) return
    })()
    return () => {
      cancelled = true
    }
  }, [load])

  return { coffees, loading, error, refetch: load }
}

/** Coffees awaiting review — oldest first (FIFO queue). */
export function usePendingCoffees() {
  return useCoffeesByStatus('pending', 'created_at', true)
}

/** Rejected coffees — most recently rejected first, so a just-rejected coffee is on top. */
export function useRejectedCoffees() {
  return useCoffeesByStatus('rejected', 'updated_at', false)
}

/**
 * Approve a coffee into the global catalog. Sets moderation_status = 'approved'
 * and keeps the legacy `verified` boolean coherent. The enforce_admin_only_columns
 * trigger (0013) permits this only for admins.
 *
 * `sourceUrl` (optional) is the roaster's product page, pasted by the admin at
 * review time — it becomes the coffee's provenance (`source_url`, also admin-only
 * per 0013) and lets augmentation fetch the page directly instead of paying for
 * a discovery search.
 */
export async function approveCoffee(id: string, sourceUrl?: string): Promise<{ error: string | null }> {
  const patch: Record<string, unknown> = { moderation_status: 'approved', verified: true }
  if (sourceUrl) patch.source_url = sourceUrl
  const { error } = await supabase
    .from('coffees')
    .update(patch)
    .eq('id', id)
  return { error: error?.message ?? null }
}

/**
 * Reject a coffee — it stays OUT of the global catalog but is NEVER deleted
 * (a delete would cascade its ratings). Enrich-only / never-remove (Decision #052).
 */
export async function rejectCoffee(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('coffees')
    .update({ moderation_status: 'rejected', verified: false })
    .eq('id', id)
  return { error: error?.message ?? null }
}

/**
 * Restore a rejected coffee back into the review queue (moderation_status =
 * 'pending'). Makes Reject reversible — e.g. when a coffee was only rejected for
 * a bad photo, not because it doesn't belong. It returns to 'pending' (not
 * straight to 'approved') so it gets a fresh look before entering the catalog.
 */
export async function restoreCoffee(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('coffees')
    .update({ moderation_status: 'pending' })
    .eq('id', id)
  return { error: error?.message ?? null }
}
