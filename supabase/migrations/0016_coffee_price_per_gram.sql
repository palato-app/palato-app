-- ============================================================================
-- 0016_coffee_price_per_gram.sql
-- Palato — derived $/gram on coffees
-- Date: June 19, 2026
-- ----------------------------------------------------------------------------
-- A normalized cost stat so buyers can compare across bag sizes (a 1lb bag is
-- captured as ~454g by augmentation, so this is apples-to-apples). Generated/
-- STORED so it's always consistent with price_usd + bag_weight_grams — no app
-- code maintains it. Null when either input is missing. Not displayed yet;
-- captured from the start as a useful stat.
-- ============================================================================

alter table public.coffees
  add column price_per_gram numeric(8,4)
    generated always as (round(price_usd / nullif(bag_weight_grams, 0), 4)) stored;

comment on column public.coffees.price_per_gram is
  'Derived USD per gram = price_usd / bag_weight_grams (STORED generated column). Null if either input is missing.';
