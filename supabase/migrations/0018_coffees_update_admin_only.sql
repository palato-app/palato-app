-- ============================================================================
-- 0018_coffees_update_admin_only.sql
-- Palato — lock coffee edits to admins (revises the #045 open-edit model)
-- Date: July 11, 2026
-- ----------------------------------------------------------------------------
-- Migration 0007 (Decision #045) let ANY authenticated user update ANY coffee
-- ("using (true)") so the community could correct catalog facts. First real
-- user test (Jono, July 2026) surfaced the problem: a brand-new user can open
-- any coffee and rewrite its details — on a moderated brand surface where
-- admins now curate quality (#052), that's an integrity hole, not a feature.
--
-- New rule: only admins may UPDATE coffees. Regular users still ADD coffees
-- (insert → 'pending' → verify queue) and rate them; corrections go through
-- admins. The scan/add flow never updates coffees post-insert, so nothing
-- user-facing breaks.
--
-- The enforce_admin_only_columns trigger (0013) stays — redundant under this
-- policy, but harmless defense-in-depth if UPDATE access is ever widened again.
-- ============================================================================

drop policy if exists "Authenticated users can update coffees" on public.coffees;

create policy "Admins can update coffees"
  on public.coffees for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
