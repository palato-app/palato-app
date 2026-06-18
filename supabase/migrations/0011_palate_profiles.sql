-- ============================================================================
-- 0011_palate_profiles.sql
-- Palato — palate quiz results (onboarding §7)
-- Date: June 17, 2026
-- ----------------------------------------------------------------------------
-- Creates `palate_profiles`: a 1:1-with-user store for the pre-auth palate
-- quiz (§3). Written once on the first authenticated load after a visitor
-- completes the quiz (the sessionStorage → DB hydration, §3d), and overwritten
-- when a user retakes the quiz (More tab, §9). Drives the seeded v0 Palate tab
-- (§8), the catalog "Start here" rail (§4), and aspiration personalization (§5).
--
-- TYPE NOTES (deliberate divergences from 0001, do not "fix" to match):
--   * experience_level is TEXT with values beginner|intermediate|advanced,
--     per §7 — NOT the existing `experience_level` ENUM (beginner/amateur/
--     comfortable/confident/professional). The quiz derives a coarser 3-bucket
--     value from Q1; reusing the enum would force a lossy mapping. Kept as a
--     checked text column local to this table.
--   * roast_preference uses hyphenated 'medium-light'/'medium-dark' to match
--     the client-side RoastLevel type in src/features/palate (NOT the
--     underscore `roast_level` enum). null = "not sure" (Q3 escape).
--   * brew_methods is text[] of raw quiz option labels (Q5), NOT the
--     `brew_method` enum — Q5 includes non-enum options ("However the café
--     makes it", "Other").
-- ============================================================================

create table public.palate_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,

  quiz_version text not null default 'v1',
  raw_responses jsonb,                                  -- full answer payload (source of truth)

  -- Q1 — motivation / intrigue
  motivation text,
  experience_level text check (experience_level in ('beginner', 'intermediate', 'advanced')),

  -- Q2 — aspiration (drives §5 personalization)
  aspiration text,

  -- Q3 — flavor lean (the one seeded palate datum) + roast inference
  flavor_lean smallint check (flavor_lean between 0 and 100),   -- null if unsure
  flavor_unsure boolean not null default false,
  roast_preference text check (roast_preference in ('medium-light', 'medium-dark')),  -- null if unsure

  -- Q4 — origin affinity
  origin_affinity text,

  -- Q5 — brew methods
  brew_methods text[],

  -- Optional reveal archetype (only if used)
  archetype text,

  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

alter table public.palate_profiles enable row level security;

create policy "Users can view their own palate profile"
  on public.palate_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert their own palate profile"
  on public.palate_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own palate profile"
  on public.palate_profiles for update
  using (auth.uid() = user_id);

create trigger palate_profiles_updated_at
  before update on public.palate_profiles
  for each row execute function public.handle_updated_at();

comment on table public.palate_profiles is
  'Pre-auth palate quiz results (onboarding §3/§7), 1:1 with auth.users. Written on first authed load after the quiz; overwritten on retake.';
comment on column public.palate_profiles.raw_responses is
  'Full quiz answer payload as captured client-side. Source of truth; the typed columns are denormalized projections for querying.';
comment on column public.palate_profiles.experience_level is
  'Coarse 3-bucket derivation from Q1 (beginner|intermediate|advanced). Intentionally NOT the experience_level enum — see migration header.';
comment on column public.palate_profiles.flavor_lean is
  'Q3 slider, 0 (fruity & floral) → 100 (chocolatey & nutty). null when the user chose "I''m not sure yet".';
comment on column public.palate_profiles.roast_preference is
  'Inferred from flavor_lean: fruity/floral end → medium-light, chocolatey/nutty end → medium-dark. null when flavor is unsure.';
comment on column public.palate_profiles.brew_methods is
  'Raw Q5 option labels (text[]), not the brew_method enum — Q5 includes non-enum options.';
