import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Coffee } from '../../lib/useCoffees'

// Admins also see who added the coffee + when, to inform the review.
export type PendingCoffee = Coffee & { created_by: string | null }

/**
 * Coffees awaiting admin verification (moderation_status = 'pending'). Admin RLS
 * (migration 0013) lets admins read pending rows; non-admins never see them.
 */
export function usePendingCoffees() {
  const [coffees, setCoffees] = useState<PendingCoffee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('coffees')
      .select('*')
      .eq('moderation_status', 'pending')
      .order('created_at', { ascending: true })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setCoffees((data as PendingCoffee[]) ?? [])
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data, error } = await supabase
        .from('coffees')
        .select('*')
        .eq('moderation_status', 'pending')
        .order('created_at', { ascending: true })
      if (cancelled) return
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      setCoffees((data as PendingCoffee[]) ?? [])
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { coffees, loading, error, refetch: load }
}

/**
 * Approve a coffee into the global catalog. Sets moderation_status = 'approved'
 * and keeps the legacy `verified` boolean coherent. The enforce_admin_only_columns
 * trigger (0013) permits this only for admins.
 */
export async function approveCoffee(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('coffees')
    .update({ moderation_status: 'approved', verified: true })
    .eq('id', id)
  return { error: error?.message ?? null }
}

/**
 * Reject a coffee — it stays OUT of the global catalog but is NEVER deleted
 * (a delete would cascade its ratings). Enrich-only / never-remove (Decision #049).
 */
export async function rejectCoffee(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('coffees')
    .update({ moderation_status: 'rejected', verified: false })
    .eq('id', id)
  return { error: error?.message ?? null }
}
