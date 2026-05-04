-- ============================================================================
-- 0003_add_bag_image_to_coffees.sql
-- Palato — add canonical bag image URL to coffees
-- Date: May 4, 2026
-- ----------------------------------------------------------------------------
-- Each coffee gets one canonical bag photo. URL points at Supabase Storage.
-- Nullable — coffees added before image upload existed should remain valid.
-- ============================================================================

alter table public.coffees
  add column bag_image_url text;

comment on column public.coffees.bag_image_url is
  'Public URL to the canonical bag photo for this coffee, stored in the bag-images bucket';