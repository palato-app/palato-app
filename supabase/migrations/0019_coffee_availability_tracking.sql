-- ============================================================================
-- 0019_coffee_availability_tracking.sql
-- Palato — biweekly availability re-check bookkeeping on coffees
-- Date: July 13, 2026
-- ----------------------------------------------------------------------------
-- Commerce is only honest if the buy links stay live. A scheduled job
-- (api/check-availability.js) re-fetches each coffee's purchase_url on a ~14-day
-- cadence: a 404/410 flips purchase_availability -> 'no' (the coffee then reads
-- "Not currently available" on its detail and drops out of recommendations,
-- Decision #067); a live link keeps/sets it 'yes'.
--
-- Two timestamps support that loop and the weekly ops email (api/weekly-report.js):
--   * purchase_checked_at — when the job last verified this coffee's link, so the
--     daily cron can pick only coffees due for a re-check (null or > 14 days old).
--   * unavailable_since   — when the coffee most recently went unavailable (null
--     while it's available). Powers the "coffees no longer available this week"
--     metric without a separate history table.
--
-- Both are system-managed and written by the service-role cron (auth.uid() is
-- null there, so the 0013 enforce_admin_only_columns trigger permits it). No new
-- RLS needed — the 0018 admins-only UPDATE policy already covers interactive edits.
-- ============================================================================

alter table public.coffees
  add column purchase_checked_at timestamptz,
  add column unavailable_since   timestamptz;

comment on column public.coffees.purchase_checked_at is
  'When the availability job last re-fetched purchase_url. Null = never checked (due for a check). System-managed by api/check-availability.js.';

comment on column public.coffees.unavailable_since is
  'When the coffee most recently became unavailable (purchase_availability -> no) via the availability check. Null while available. Powers the weekly "no longer available" metric. System-managed.';

-- The daily cron scans for coffees due a re-check; index the fields it filters on.
create index if not exists coffees_purchase_check_due_idx
  on public.coffees (purchase_checked_at)
  where purchase_url is not null;
