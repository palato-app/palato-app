-- ============================================================================
-- 0014_recommendations.sql
-- Palato — per-user cache for the Palate recommendation engine
-- Date: June 19, 2026
-- ----------------------------------------------------------------------------
-- One row per user, upserted by /api/recommend. Caches the three strategy cards
-- (Try Something Unique / Go Somewhere New / Something You'll Love) so we don't
-- re-run the LLM on every dashboard load; regenerated when the user's rating
-- count changes or the cache is stale (>24h). Doubles as the Competency-A eval
-- seam (model/prompt versioned), mirroring `scans` and `augmentations`.
-- ============================================================================

create table public.recommendations (
  user_id uuid primary key references auth.users(id) on delete cascade,

  recommendations jsonb,                 -- { unique, explore, love } each a rec or null
  rating_count_at_generation integer,    -- staleness check vs current rating count
  model_version text,
  prompt_version text,

  generated_at timestamptz default now() not null,
  created_at timestamptz default now() not null
);

alter table public.recommendations enable row level security;

create policy "Users can view their own recommendations"
  on public.recommendations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own recommendations"
  on public.recommendations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own recommendations"
  on public.recommendations for update
  using (auth.uid() = user_id);
