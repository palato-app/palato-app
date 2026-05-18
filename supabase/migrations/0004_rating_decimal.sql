-- ============================================================================
-- 0004_rating_decimal.sql
-- Palato — switch rating scale from whole integers to one-decimal-place numeric
-- Date: May 18, 2026
-- ----------------------------------------------------------------------------
-- Decision #023: Vivino-style decimal ratings (1.0-5.0, one decimal place).
-- Captures finer preference distinctions than whole-integer ratings.
-- ============================================================================

-- Drop the old integer check constraint
alter table public.ratings
  drop constraint if exists ratings_rating_check;

-- Change column type from smallint to numeric(2,1)
-- Existing integer values cast cleanly (4 -> 4.0, 5 -> 5.0)
alter table public.ratings
  alter column rating type numeric(2,1) using rating::numeric(2,1);

-- Add the new check constraint for 1.0-5.0 range
alter table public.ratings
  add constraint ratings_rating_check check (rating >= 1.0 and rating <= 5.0);

comment on column public.ratings.rating is
  'User rating on a 1.0-5.0 decimal scale (one decimal place). Per Decision #023.';