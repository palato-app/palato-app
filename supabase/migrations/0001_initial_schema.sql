-- ============================================================================
-- 0001_initial_schema.sql
-- Palato — Phase 0 schema
-- Date: May 2, 2026
-- ----------------------------------------------------------------------------
-- Creates: profiles, coffees, ratings, scans, flavor_descriptors,
--          coffee_flavor_descriptors, rating_flavor_descriptors,
--          descriptor_suggestions
-- Enables: RLS on all tables with explicit policies
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ENUM TYPES (from palato-coffee-attributes-v01.md)
-- ----------------------------------------------------------------------------

create type roast_level as enum (
  'light', 'medium_light', 'medium', 'medium_dark', 'dark', 'unspecified'
);

create type process_method as enum (
  'washed', 'natural', 'honey', 'anaerobic', 'carbonic_maceration',
  'pulped_natural', 'wet_hulled', 'experimental', 'other', 'unspecified'
);

create type brew_method as enum (
  'espresso', 'v60', 'chemex', 'kalita', 'aeropress', 'french_press',
  'moka_pot', 'cold_brew', 'drip', 'siphon', 'other'
);

create type grind_size as enum (
  'extra_fine', 'fine', 'medium_fine', 'medium', 'medium_coarse',
  'coarse', 'extra_coarse'
);

create type extraction_quality as enum (
  'under', 'ideal', 'over', 'unsure'
);

create type experience_level as enum (
  'beginner', 'amateur', 'comfortable', 'confident', 'professional'
);

create type suggestion_status as enum (
  'pending', 'accepted', 'merged', 'rejected'
);


-- ----------------------------------------------------------------------------
-- profiles — app-specific user data, 1:1 with auth.users
-- ----------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  experience_level experience_level,
  preferred_brew_methods brew_method[],
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);


-- ----------------------------------------------------------------------------
-- coffees — global catalog, intrinsic attributes
-- ----------------------------------------------------------------------------

create table public.coffees (
  id uuid primary key default gen_random_uuid(),

  -- Identification
  roaster_name text not null,
  coffee_name text not null,

  -- Origin
  origin_country text,                                 -- ISO-3166 code (validation in app, not DB)
  origin_region text,
  producer text,                                       -- Round 1 addition (Kevin)
  farm text,                                           -- Round 1 addition

  -- Coffee characteristics
  process process_method,
  process_detail text,                                 -- "72hr anaerobic, yeast-inoculated"
  roaster_stated_roast_level roast_level default 'unspecified',
  variety text[],                                      -- arrays for blends (Typica + Bourbon)
  elevation_masl integer,
  roast_date date,                                     -- Round 1 addition (Jeremy)

  -- Notes (raw fallback; structured notes via coffee_flavor_descriptors)
  roaster_tasting_notes_raw text[],
  sca_score numeric(4,2) check (sca_score >= 0 and sca_score <= 100),

  -- Catalog metadata
  created_by uuid references auth.users(id) on delete set null,
  verified boolean default false not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create index idx_coffees_roaster on public.coffees(roaster_name);
create index idx_coffees_origin on public.coffees(origin_country);

alter table public.coffees enable row level security;

create policy "Authenticated users can view all coffees"
  on public.coffees for select
  to authenticated
  using (true);

create policy "Authenticated users can add coffees"
  on public.coffees for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "Users can update coffees they created"
  on public.coffees for update
  to authenticated
  using (auth.uid() = created_by);


-- ----------------------------------------------------------------------------
-- ratings — per-user rating events
-- ----------------------------------------------------------------------------

create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  coffee_id uuid references public.coffees(id) on delete cascade not null,

  -- The rating itself
  rating smallint not null check (rating between 1 and 5),
  user_tasting_notes text,                             -- free-text, structured tags via rating_flavor_descriptors

  -- User's perception (the community-vs-roaster signal)
  user_perceived_roast_level roast_level,

  -- Brew variables (causal — what made the cup taste this way)
  brew_method brew_method,
  dose_grams numeric(5,2),
  yield_grams numeric(6,2),
  water_temp_celsius numeric(4,1),
  grind_size grind_size,
  brew_time_seconds integer,
  extraction_quality extraction_quality,

  -- Contextual (Oura-style)
  setting text check (setting in ('home', 'cafe', 'work', 'travel', 'other')),
  paired_with text,

  -- Media
  photo_url text,

  created_at timestamp with time zone default now() not null
);

create index idx_ratings_user on public.ratings(user_id);
create index idx_ratings_coffee on public.ratings(coffee_id);
create index idx_ratings_user_created on public.ratings(user_id, created_at desc);

alter table public.ratings enable row level security;

create policy "Users can view their own ratings"
  on public.ratings for select
  using (auth.uid() = user_id);

create policy "Users can insert their own ratings"
  on public.ratings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own ratings"
  on public.ratings for update
  using (auth.uid() = user_id);

create policy "Users can delete their own ratings"
  on public.ratings for delete
  using (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- scans — AI extraction events for the eval pipeline (Competency A)
-- ----------------------------------------------------------------------------

create table public.scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,

  photo_url text not null,
  raw_extraction jsonb,
  corrections jsonb,
  matched_coffee_id uuid references public.coffees(id) on delete set null,

  scan_accuracy_score numeric(3,2) check (scan_accuracy_score between 0 and 1),
  model_version text,
  prompt_version text,

  created_at timestamp with time zone default now() not null
);

create index idx_scans_user on public.scans(user_id);
create index idx_scans_model_version on public.scans(model_version, created_at);

alter table public.scans enable row level security;

create policy "Users can view their own scans"
  on public.scans for select
  using (auth.uid() = user_id);

create policy "Users can insert their own scans"
  on public.scans for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own scans"
  on public.scans for update
  using (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- flavor_descriptors — the 168-row Palato flavor taxonomy
-- (Seeded via 0002_seed_flavor_taxonomy.sql)
-- ----------------------------------------------------------------------------

create table public.flavor_descriptors (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  subcategory text not null,
  descriptor text not null,
  slug text not null unique,
  aliases text[],
  is_defect boolean default false not null,
  description text,
  category_icon_color text,
  category_pill_tint text,
  sort_order integer not null,
  created_at timestamp with time zone default now() not null
);

create index idx_descriptors_category on public.flavor_descriptors(category);
create index idx_descriptors_slug on public.flavor_descriptors(slug);

alter table public.flavor_descriptors enable row level security;

-- Taxonomy is read-only public data for any authenticated user
create policy "Anyone authenticated can read the taxonomy"
  on public.flavor_descriptors for select
  to authenticated
  using (true);


-- ----------------------------------------------------------------------------
-- coffee_flavor_descriptors — many-to-many: roaster's claimed notes
-- (Populated from scan extraction, mapped to canonical descriptors via aliases)
-- ----------------------------------------------------------------------------

create table public.coffee_flavor_descriptors (
  coffee_id uuid references public.coffees(id) on delete cascade not null,
  descriptor_id uuid references public.flavor_descriptors(id) on delete cascade not null,
  primary key (coffee_id, descriptor_id),
  created_at timestamp with time zone default now() not null
);

create index idx_cfd_descriptor on public.coffee_flavor_descriptors(descriptor_id);

alter table public.coffee_flavor_descriptors enable row level security;

create policy "Authenticated users can view coffee descriptors"
  on public.coffee_flavor_descriptors for select
  to authenticated
  using (true);

create policy "Authenticated users can add coffee descriptors"
  on public.coffee_flavor_descriptors for insert
  to authenticated
  with check (true);


-- ----------------------------------------------------------------------------
-- rating_flavor_descriptors — many-to-many: user's perceived flavors per rating
-- ----------------------------------------------------------------------------

create table public.rating_flavor_descriptors (
  rating_id uuid references public.ratings(id) on delete cascade not null,
  descriptor_id uuid references public.flavor_descriptors(id) on delete cascade not null,
  primary key (rating_id, descriptor_id),
  created_at timestamp with time zone default now() not null
);

create index idx_rfd_descriptor on public.rating_flavor_descriptors(descriptor_id);

alter table public.rating_flavor_descriptors enable row level security;

create policy "Users can view descriptors on their own ratings"
  on public.rating_flavor_descriptors for select
  using (
    exists (
      select 1 from public.ratings
      where ratings.id = rating_flavor_descriptors.rating_id
      and ratings.user_id = auth.uid()
    )
  );

create policy "Users can add descriptors to their own ratings"
  on public.rating_flavor_descriptors for insert
  with check (
    exists (
      select 1 from public.ratings
      where ratings.id = rating_flavor_descriptors.rating_id
      and ratings.user_id = auth.uid()
    )
  );

create policy "Users can delete descriptors from their own ratings"
  on public.rating_flavor_descriptors for delete
  using (
    exists (
      select 1 from public.ratings
      where ratings.id = rating_flavor_descriptors.rating_id
      and ratings.user_id = auth.uid()
    )
  );


-- ----------------------------------------------------------------------------
-- descriptor_suggestions — user-contributed taxonomy candidates (Competency B)
-- ----------------------------------------------------------------------------

create table public.descriptor_suggestions (
  id uuid primary key default gen_random_uuid(),
  suggested_by uuid references auth.users(id) on delete set null,
  suggested_text text not null,
  suggested_category text,
  context_rating_id uuid references public.ratings(id) on delete set null,
  status suggestion_status default 'pending' not null,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamp with time zone,
  reviewer_notes text,
  resulting_descriptor_id uuid references public.flavor_descriptors(id) on delete set null,
  created_at timestamp with time zone default now() not null
);

create index idx_suggestions_status on public.descriptor_suggestions(status, created_at);

alter table public.descriptor_suggestions enable row level security;

create policy "Users can view their own suggestions"
  on public.descriptor_suggestions for select
  using (auth.uid() = suggested_by);

create policy "Users can submit suggestions"
  on public.descriptor_suggestions for insert
  with check (auth.uid() = suggested_by);


-- ----------------------------------------------------------------------------
-- Function + trigger to keep updated_at fresh on profiles and coffees
-- ----------------------------------------------------------------------------

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger coffees_updated_at
  before update on public.coffees
  for each row execute function public.handle_updated_at();