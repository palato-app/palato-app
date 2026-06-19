-- ============================================================================
-- 0013_admin_moderation_augmentation.sql
-- Palato — admin model + catalog verification gate + augmentation store
-- Date: June 18, 2026
-- ----------------------------------------------------------------------------
-- Three coupled pieces, all sharing one admin model (see Decision #049):
--   1. profiles.is_admin + an is_admin() helper — the real admin model the app
--      never had (VITE_ADMIN_EMAILS was unused).
--   2. coffees.moderation_status — a verification gate. New coffees enter
--      'pending' and are invisible in the GLOBAL catalog until an admin approves
--      them, so nobody can inject low-quality/inappropriate images into a brand
--      surface. Revises the open-catalog model (#034 sent new coffees straight
--      to global; #045 made them open-edit). Existing rows are grandfathered to
--      'approved' so the live catalog isn't hidden — the gate affects NEW adds.
--   3. augmentations — the pending-proposal store + Competency-A eval seam for
--      the web-augmentation pipeline (mirrors `scans`). Admin-only.
--
-- Enrich-only / never-delete: nothing here deletes a coffee (that would cascade
-- ratings). 'rejected' keeps a coffee OUT of the catalog without removing it.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. Admin model
-- ----------------------------------------------------------------------------

alter table public.profiles
  add column is_admin boolean not null default false;

comment on column public.profiles.is_admin is
  'Grants access to the admin dashboard (verify queue + augmentation review). Set ONLY via the email allowlist below (auto-granted on profile creation + backfilled here); never user-settable. is_admin is the single source of truth — no VITE_ADMIN_EMAILS needed.';

-- SECURITY DEFINER so RLS policies can check the caller''s admin flag without
-- tripping over profiles'' own RLS. STABLE: safe to call many times per query.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- Admin allowlist. is_admin must NOT be user-settable: the profiles UPDATE/INSERT
-- policies (migration 0001) are scoped to your own row with no column guard, so
-- without this a user could self-grant admin and bypass the whole gate. We lock
-- it to a fixed email allowlist instead.
create or replace function public.admin_email_allowlisted(addr text)
returns boolean
language sql
immutable
as $$
  select lower(coalesce(addr, '')) in (
    'jesse@palato.coffee',
    'lucy.e.eshleman@gmail.com',
    'support@palato.coffee',
    'jesse.m.eshleman@gmail.com'
  );
$$;

-- On profile creation: grant admin iff the user''s email is allowlisted; force
-- false otherwise so a hand-crafted insert can''t self-grant.
create or replace function public.set_is_admin_on_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare addr text;
begin
  select u.email into addr from auth.users u where u.id = new.id;
  new.is_admin := public.admin_email_allowlisted(addr);
  return new;
end;
$$;

create trigger trg_set_is_admin_on_insert
  before insert on public.profiles
  for each row execute function public.set_is_admin_on_insert();

-- On update: only an existing admin (or a trusted no-JWT context — migrations,
-- service role, SQL editor, where auth.uid() is null) may change is_admin.
create or replace function public.guard_is_admin_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_admin is distinct from old.is_admin
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'is_admin is not user-settable';
  end if;
  return new;
end;
$$;

create trigger trg_guard_is_admin_update
  before update on public.profiles
  for each row execute function public.guard_is_admin_update();

-- Backfill: grant admin to allowlisted accounts that have ALREADY signed in
-- (existing profiles). Future sign-ins are handled by the insert trigger above.
update public.profiles p
  set is_admin = true
  from auth.users u
  where u.id = p.id
    and public.admin_email_allowlisted(u.email);


-- ----------------------------------------------------------------------------
-- 2. Catalog verification gate
-- ----------------------------------------------------------------------------

create type moderation_status as enum ('pending', 'approved', 'rejected');

-- New column defaults existing rows to 'pending'...
alter table public.coffees
  add column moderation_status moderation_status not null default 'pending';

-- ...then grandfather the existing live catalog to 'approved' (also keep the
-- legacy `verified` boolean coherent: approved == verified).
update public.coffees
  set moderation_status = 'approved', verified = true;

create index idx_coffees_moderation on public.coffees(moderation_status);

-- Replace the "everyone sees everything" SELECT policy with the gate: a coffee
-- is visible if it''s approved, or you created it (so the adder can rate their
-- own pending coffee), or you''re an admin (you review the queue).
drop policy "Authenticated users can view all coffees" on public.coffees;

create policy "View approved coffees, own, or admin"
  on public.coffees for select
  to authenticated
  using (
    moderation_status = 'approved'
    or created_by = auth.uid()
    or public.is_admin()
  );

-- The #045 open-edit UPDATE policy (migration 0007, `using true`) stays — any
-- authenticated user can still correct catalog FACTS. But that policy would also
-- let a non-admin flip their own coffee to 'approved' and bypass the gate, and
-- scribble into the system-managed provenance columns. RLS is row-level, not
-- column-level, so a trigger enforces the column-level rule: only admins may
-- change moderation_status, verified, or the augmentation provenance columns.
create or replace function public.enforce_admin_only_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (
       new.moderation_status is distinct from old.moderation_status
    or new.verified           is distinct from old.verified
    or new.source_url         is distinct from old.source_url
    or new.web_augmented_at   is distinct from old.web_augmented_at
    or new.augmentation_raw   is distinct from old.augmentation_raw
  ) and auth.uid() is not null and not public.is_admin() then
    raise exception 'Only admins can change moderation or augmentation-provenance fields';
  end if;
  return new;
end;
$$;

create trigger trg_enforce_admin_only_columns
  before update on public.coffees
  for each row execute function public.enforce_admin_only_columns();


-- ----------------------------------------------------------------------------
-- 3. augmentations — pending-proposal store + eval seam (mirrors `scans`)
-- ----------------------------------------------------------------------------

create type augmentation_status as enum ('pending', 'approved', 'rejected');

create table public.augmentations (
  id uuid primary key default gen_random_uuid(),
  coffee_id uuid references public.coffees(id) on delete cascade not null,
  status augmentation_status not null default 'pending',

  proposed jsonb,            -- Claude''s proposed field values (the diff to review)
  raw_response jsonb,        -- immutable full payload incl. web-search citations
  source_urls text[],        -- provenance: pages the proposal drew from

  model_version text,
  prompt_version text,

  applied jsonb,             -- which fields were actually written on approval
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,

  created_at timestamptz default now() not null
);

create index idx_augmentations_coffee on public.augmentations(coffee_id);
create index idx_augmentations_status on public.augmentations(status);

alter table public.augmentations enable row level security;

create policy "Admins can view augmentations"
  on public.augmentations for select
  to authenticated
  using (public.is_admin());

create policy "Admins can insert augmentations"
  on public.augmentations for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update augmentations"
  on public.augmentations for update
  to authenticated
  using (public.is_admin());
