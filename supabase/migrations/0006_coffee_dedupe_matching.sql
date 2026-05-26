-- ============================================================================
-- 0006_coffee_dedupe_matching.sql
-- Palato — fuzzy duplicate detection for the coffees catalog
-- Date: May 25, 2026
-- ----------------------------------------------------------------------------
-- Decision #041: Match-on-scan dedupe. After the bag-scan pipeline extracts a
-- coffee, we fuzzy-match (roaster_name + coffee_name) against the existing
-- catalog before allowing an insert. Same function is also called from the
-- manual-entry Save path. The 3 known duplicates in the catalog (Sey Coffee /
-- Los Naranjos rows with punctuation/accent drift on producer + region) would
-- all be caught by trigram similarity on the (roaster + name) pair alone.
-- ============================================================================

-- pg_trgm provides the similarity() function and trigram-based GIN indexing.
create extension if not exists pg_trgm;

-- Trigram index on the lowercased (roaster + ' ' + name) concatenation.
-- This is the exact expression used by match_coffees() below — so the index
-- can be used for the similarity lookup.
create index if not exists coffees_dedupe_trgm_idx
  on public.coffees using gin (
    (lower(roaster_name) || ' ' || lower(coffee_name)) gin_trgm_ops
  );

-- match_coffees(query, match_limit, min_similarity)
-- Returns the top-N existing coffees ranked by trigram similarity against
-- the lowercased (roaster + name) of the query. The caller (scan endpoint
-- and manual-entry save) decides what thresholds map to "strong match",
-- "ambiguous", or "no match" — this function just returns ranked candidates
-- above a similarity floor.
create or replace function public.match_coffees(
  query text,
  match_limit int default 3,
  min_similarity numeric default 0.4
)
returns table (
  id uuid,
  roaster_name text,
  coffee_name text,
  origin_country text,
  bag_image_url text,
  similarity numeric
)
language sql
stable
as $$
  select
    c.id,
    c.roaster_name,
    c.coffee_name,
    c.origin_country,
    c.bag_image_url,
    similarity(lower(c.roaster_name) || ' ' || lower(c.coffee_name), lower(query))::numeric as similarity
  from public.coffees c
  where similarity(lower(c.roaster_name) || ' ' || lower(c.coffee_name), lower(query)) >= min_similarity
  order by similarity desc
  limit match_limit
$$;

-- Authenticated users (and the scan service relay) can call the matcher.
grant execute on function public.match_coffees(text, int, numeric) to authenticated, service_role;

comment on function public.match_coffees(text, int, numeric) is
  'Trigram fuzzy match against (roaster_name + coffee_name) on coffees. Used by the bag-scan and manual-add flows to detect duplicates before insert. Per Decision #041.';
