-- ============================================================================
-- 0020_purchase_url_set_at.sql
-- Palato — "buy link verified at" timestamp to drive the availability cadence
-- Date: July 19, 2026
-- ----------------------------------------------------------------------------
-- The availability job's cadence (Decision #070, revising #068): first re-check
-- 14 days AFTER a coffee is verified with a URL, then every 7 days, until it's
-- flagged unavailable. That needs a known "clock start" — when purchase_url was
-- set — which we didn't record. This adds it, stamped centrally by a trigger so
-- every write path (approval, the Augment-tab paste tool, an approved
-- augmentation proposal) gets it for free.
-- ============================================================================

alter table public.coffees
  add column purchase_url_set_at timestamptz;

comment on column public.coffees.purchase_url_set_at is
  'When purchase_url was most recently set/changed (the buy link "verified at" time). Starts the availability re-check clock: first check 14 days later, then every 7. System-managed by a trigger.';

-- Stamp purchase_url_set_at whenever purchase_url becomes set or changes. Runs
-- for every writer (admin UPDATE, service role) — auth-independent by design.
create or replace function public.set_purchase_url_set_at()
returns trigger
language plpgsql
as $$
begin
  if new.purchase_url is not null
     and (tg_op = 'INSERT' or old.purchase_url is distinct from new.purchase_url) then
    new.purchase_url_set_at := now();
  end if;
  return new;
end;
$$;

create trigger trg_set_purchase_url_set_at
  before insert or update on public.coffees
  for each row execute function public.set_purchase_url_set_at();

-- Backfill existing linked coffees so the cadence has a start point. Use
-- web_augmented_at when we have it (closest proxy for when the link was captured);
-- otherwise 14 days ago, so the first smart check runs on the next sweep rather
-- than waiting two more weeks on a link we've never actually read.
update public.coffees
  set purchase_url_set_at = coalesce(web_augmented_at, now() - interval '14 days')
  where purchase_url is not null
    and purchase_url_set_at is null;
