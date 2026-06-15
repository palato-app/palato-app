-- ============================================================================
-- 0008 — Let any authenticated user upload bag images (unblock the add/scan flow)
-- ============================================================================
-- Bug: the add-a-coffee / bag-scan flow failed for every non-admin user with
-- "new row violates row-level security policy" the moment it tried to upload
-- the bag photo. Root cause: the `bag-images` Storage INSERT policy was scoped
-- to a single hardcoded admin email (`auth.jwt() ->> 'email' = 'jesse@palato.coffee'`,
-- created in the dashboard, see TECH_DEBT "Storage policy hardcodes admin email").
-- Decisions #034 (global shared catalog for all beta users) and #037 (scan
-- endpoint serves all authenticated users) opened the add flow to everyone, but
-- this Storage gate was never broadened — so only the admin could actually
-- upload. Reported by Lucy, Palato's first external tester: she could not add a
-- coffee at all.
--
-- Fix: a permissive INSERT policy letting any authenticated user write into
-- their OWN folder. Bag objects are stored at `${auth.uid()}/<timestamp>.<ext>`
-- (see lib/bagImage.ts), so we scope the write to the first path segment =
-- the caller's uid (least-privilege: a user can't write into someone else's
-- folder). This is the first Storage policy captured in version control, a
-- partial dent in TECH_DEBT "Storage policies not in version control".
--
-- Reads are unaffected: `bag-images` is a public bucket, so SELECT bypasses RLS.
-- The legacy admin-email INSERT policy is left in place — it is now redundant
-- (this policy also covers the admin) and is harmless because permissive
-- policies are OR'd. Removing it cleanly needs its dashboard-assigned name,
-- which isn't in version control; tracked in TECH_DEBT. See Decision #046.

drop policy if exists "Authenticated users can upload bag images" on storage.objects;

create policy "Authenticated users can upload bag images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'bag-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
