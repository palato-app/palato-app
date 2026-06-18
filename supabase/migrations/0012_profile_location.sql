-- ============================================================================
-- 0012_profile_location.sql
-- Palato — add a free-text location to profiles (onboarding §9, More tab)
-- Date: June 18, 2026
-- ----------------------------------------------------------------------------
-- The "More" settings shell exposes an editable Location (city/region) field.
-- profiles had no home for it; add a nullable free-text column. No backfill —
-- existing rows stay valid. RLS already governs profiles (users read/write
-- their own row, migration 0001), so no policy change is needed.
-- ============================================================================

alter table public.profiles
  add column location text;

comment on column public.profiles.location is
  'User-entered city/region (free text, §9 More tab). Optional; v1 has no geocoding or normalization.';
