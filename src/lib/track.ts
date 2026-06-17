/**
 * Analytics pipe (PostHog).
 *
 * `track()` is the single entry point used across the app. It sends events to
 * PostHog when configured, and falls back to a dev console log otherwise — so
 * local development without a PostHog key still works and stays quiet in prod.
 *
 * Config (client-exposed, so VITE_ prefix — these are publishable, not secret):
 *   VITE_POSTHOG_KEY   — project API key. If absent, analytics is disabled.
 *   VITE_POSTHOG_HOST  — ingestion host. Defaults to PostHog US cloud.
 *
 * PostHog autocaptures pageviews and sessions, which gives retention curves and
 * funnels for free once a user is identified. The domain events below are the
 * ones autocapture can't infer:
 *   rating_saved                  — { coffeeId, rating, ratingCount } (activation)
 *   scan_started                  — bag image submitted for AI extraction
 *   scan_completed                — { success, durationMs, matchKind, ... } (scan funnel)
 *   palate_viewed                 — { ratingCount, previewMode }
 *   palate_recommendation_clicked — when What's-next is tapped
 */
import posthog from 'posthog-js'

const KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined
const HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? 'https://us.i.posthog.com'

let enabled = false

/** Initialize PostHog once, at app startup. No-op if no key is configured. */
export function initAnalytics(): void {
  if (enabled || !KEY) return
  posthog.init(KEY, {
    api_host: HOST,
    // Only create a person profile once a user is identified — keeps anonymous
    // traffic from inflating monthly tracked-user counts.
    person_profiles: 'identified_only',
    capture_pageview: true,
  })
  enabled = true
}

/** Tie subsequent events to a known user. Call on sign-in. */
export function identifyUser(userId: string, properties?: Record<string, unknown>): void {
  if (!enabled) return
  posthog.identify(userId, properties)
}

/** Clear the identified user. Call on sign-out. */
export function resetAnalytics(): void {
  if (!enabled) return
  posthog.reset()
}

/** Record a behavioral event. */
export function track(event: string, properties?: Record<string, unknown>): void {
  if (enabled) {
    posthog.capture(event, properties)
    return
  }
  if (import.meta.env.DEV) {
    console.log(`[track] ${event}`, properties ?? '')
  }
}
