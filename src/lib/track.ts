/**
 * Analytics event stub.
 *
 * No analytics pipeline exists yet — this is a no-op that logs to console in dev.
 * When a real analytics SDK is wired up, swap the implementation here.
 *
 * Events defined for the Palate dashboard (Competency C):
 *   palate_viewed           — { ratingCount, maturityState }
 *   palate_recommendation_clicked — when What's-next is tapped
 *   palate_module_viewed    — optional, per module
 */
export function track(
  event: string,
  properties?: Record<string, unknown>
): void {
  if (import.meta.env.DEV) {
    console.log(`[track] ${event}`, properties ?? '')
  }
}
