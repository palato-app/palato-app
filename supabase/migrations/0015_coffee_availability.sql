-- ============================================================================
-- 0015_coffee_availability.sql
-- Palato — "available for purchase" signal on coffees
-- Date: June 19, 2026
-- ----------------------------------------------------------------------------
-- Commerce augmentation now captures a direct purchase link + price (the dormant
-- 0010 columns), plus this best-effort in-stock read. Availability goes stale
-- quickly for small roasters, so it's paired in the UI with the augmentation
-- timestamp ("checked [date] — confirm on the roaster's site"). Default 'unsure'.
-- Affiliate tracking remains deferred (Decisions #047/#048); this is a plain
-- outbound link to the roaster.
-- ============================================================================

create type availability_status as enum ('yes', 'no', 'unsure');

alter table public.coffees
  add column purchase_availability availability_status not null default 'unsure';

comment on column public.coffees.purchase_availability is
  'Best-effort "is this currently for sale at purchase_url" read from web augmentation: yes/no/unsure. Snapshot only — pair with web_augmented_at for freshness. Admin/system-managed.';
