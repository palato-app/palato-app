-- ============================================================================
-- 0007 — Broaden the coffees UPDATE policy to any authenticated user
-- ============================================================================
-- The catalog is a global, shared, community-maintained resource (Decision
-- #034). The original policy (0001) let only the row's `created_by` user edit
-- it — which means a typo or wrong value introduced by whoever first added a
-- coffee can never be fixed by anyone else, even though everyone else sees and
-- rates that same row. This replaces the creator-scoped policy with one that
-- lets any authenticated user correct catalog facts, matching the open-edit
-- model of the comparable consumer catalogs (Vivino-style).
--
-- This is a deliberate trust tradeoff appropriate to the whitelisted beta: it
-- opens a vandalism / accidental-overwrite vector once the user base is no
-- longer trusted. The mitigation (edit history, soft moderation, or
-- permission tiers) is tracked in TECH_DEBT under "Catalog edit permission
-- model" and is a v1.1 concern, alongside community ratings. See Decision #045.

drop policy if exists "Users can update coffees they created" on public.coffees;

create policy "Authenticated users can update coffees"
  on public.coffees for update
  to authenticated
  using (true)
  with check (true);
