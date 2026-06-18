import { useEffect, useState } from 'react'
import { useAuth } from '../../../lib/auth'
import { fetchPalateProfile, type PalateProfileRow } from '../../quiz/palateProfile'

/**
 * Reads the user's quiz-seeded palate profile (§8). Returns null when the
 * user hasn't taken the quiz yet.
 */
export function usePalateProfileRow() {
  const { user } = useAuth()
  const [row, setRow] = useState<PalateProfileRow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    fetchPalateProfile(user.id).then((r) => {
      if (cancelled) return
      setRow(r)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [user])

  return { row, loading }
}
