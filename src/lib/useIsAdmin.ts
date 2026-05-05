import { useAuth } from './auth'

/**
 * Returns true if the current user's email is in the VITE_ADMIN_EMAILS allowlist.
 *
 * Admin status is enforced server-side via Supabase Storage policies (see
 * 0003_add_bag_image_to_coffees migration + bag-images bucket policies).
 * This hook is for UI gating only — hiding the AddCoffeeForm from non-admins.
 */
export function useIsAdmin(): boolean {
  const { user } = useAuth()
  if (!user?.email) return false

  const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS ?? '')
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean)

  return adminEmails.includes(user.email.toLowerCase())
}