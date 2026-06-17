-- ============================================================================
-- 0010_coffee_web_augmentation.sql
-- Palato — dormant columns for web-augmented coffee data (purchase + provenance)
-- Date: June 16, 2026
-- ----------------------------------------------------------------------------
-- Prepares the `coffees` table to hold web-sourced augmentation: a purchase
-- link, price, and the provenance/fact-check trail for data pulled from the
-- web. NO data is populated here and NO pipeline writes these yet — the live
-- augmentation flow is gated behind a legal/security review (see Decision #047
-- and docs/web-augmentation-research.md). These columns are inert until that
-- review resolves and a server-side write path is built.
--
-- All columns are nullable; existing rows remain valid. USA-only assumption for
-- now: price is stored as USD (location handling deferred — see TECH_DEBT).
--
-- SECURITY NOTE (tracked in TECH_DEBT): the `coffees` UPDATE policy is
-- permissive (Decision #045, migration 0007 — any authenticated user can
-- update). That means these augmentation columns are currently user-writable.
-- The augmentation/provenance fields (augmentation_raw, source_url,
-- web_augmented_at) are meant to be system-managed and should only be written
-- by a server-side/service-role path. Column-level protection (a trigger, or
-- routing augmentation writes through a service-role endpoint) is part of the
-- pipeline build, NOT this migration.
-- ============================================================================

alter table public.coffees
  add column purchase_url      text,
  add column retailer_name     text,
  add column price_usd         numeric(6,2),
  add column bag_weight_grams  integer,
  add column source_url        text,
  add column web_augmented_at  timestamptz,
  add column augmentation_raw  jsonb;

comment on column public.coffees.purchase_url is
  'Canonical buy link for this coffee (often the roaster''s own product page). User- or augmentation-populated.';
comment on column public.coffees.retailer_name is
  'Who sells the coffee at purchase_url (frequently the roaster itself).';
comment on column public.coffees.price_usd is
  'Bag price in USD. USA-only assumption for now; currency generalization deferred (see TECH_DEBT). Pair with bag_weight_grams for a normalized per-gram / average-cost signal.';
comment on column public.coffees.bag_weight_grams is
  'Bag weight in grams — normalizes price_usd into a per-gram / Vivino-style average-cost signal.';
comment on column public.coffees.source_url is
  'Provenance: the web page a web-augmentation run drew this coffee''s data from. The fact-check trail.';
comment on column public.coffees.web_augmented_at is
  'Timestamp of the last web-augmentation run for this coffee. System-managed — see security note in migration 0010.';
comment on column public.coffees.augmentation_raw is
  'Immutable raw payload from a web-augmentation run, kept for eval/fact-checking (mirrors scans.raw_extraction). Never silently overwrites user-entered fields. System-managed — see security note in migration 0010.';
