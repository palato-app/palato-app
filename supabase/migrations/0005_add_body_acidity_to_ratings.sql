-- ============================================================================
-- 0005_add_body_acidity_to_ratings.sql
-- Palato — add body and acidity sliders to ratings
-- Date: May 25, 2026
-- ----------------------------------------------------------------------------
-- Continuous 0.00–1.00 sliders for body (light→full) and acidity (low→bright).
-- Both nullable — these are optional during the rating flow.
-- ============================================================================

ALTER TABLE public.ratings ADD COLUMN body numeric(3,2);
ALTER TABLE public.ratings ADD COLUMN acidity numeric(3,2);

ALTER TABLE public.ratings
  ADD CONSTRAINT ratings_body_range CHECK (body >= 0 AND body <= 1);
ALTER TABLE public.ratings
  ADD CONSTRAINT ratings_acidity_range CHECK (acidity >= 0 AND acidity <= 1);

COMMENT ON COLUMN public.ratings.body IS
  'Body perception on a 0.00 (light) to 1.00 (full) continuous scale. Nullable/optional.';
COMMENT ON COLUMN public.ratings.acidity IS
  'Acidity perception on a 0.00 (low) to 1.00 (bright) continuous scale. Nullable/optional.';
