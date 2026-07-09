-- Elevation ranges. Bags often print elevation as a range ("1,200–1,650 masl"),
-- but coffees.elevation_masl is a single integer, so the range was collapsed at
-- entry (TECH_DEBT "Elevation as a single int can't represent ranges"; hit live
-- in the July 8, 2026 usability interview — the tester typed 1200 for a
-- 1200–1650 bag). elevation_masl keeps the single stated value, or the low end
-- of a range; elevation_masl_max holds the high end (null = single value).
-- Factual open-edit column like elevation_masl — deliberately NOT added to the
-- admin-only column trigger from 0013.

alter table public.coffees
  add column if not exists elevation_masl_max integer;

comment on column public.coffees.elevation_masl is
  'Growing elevation in masl — the single stated value, or the low end of a range when elevation_masl_max is set.';
comment on column public.coffees.elevation_masl_max is
  'High end of a stated elevation range in masl. Null when the bag states a single elevation.';
