-- ============================================================================
-- 0009 — Remove the dead admin-email Storage policy on bag-images
-- ============================================================================
-- Migration 0008 (Decision #046) made bag-image uploads work for any
-- authenticated user, which made the original dashboard-created policy
-- (`auth.jwt() ->> 'email' = 'jesse@palato.coffee'`) redundant. This removes
-- it, resolving TECH_DEBT "Storage policy hardcodes admin email" / "Redundant
-- admin-email INSERT policy on bag-images (leftover)".
--
-- The policy's dashboard-assigned name was never in version control and
-- couldn't be introspected from this environment (`supabase db dump` needs
-- Docker). So instead of dropping by a guessed name, this finds every
-- storage.objects policy whose USING/WITH CHECK references the hardcoded admin
-- email and drops it by its real name — name-agnostic and idempotent (no-op if
-- already gone). The 0008 own-folder upload policy does not reference the email
-- and is left untouched; reads are unaffected (bag-images is a public bucket).

do $$
declare
  pol record;
  dropped int := 0;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and (coalesce(qual, '') like '%jesse@palato.coffee%'
        or coalesce(with_check, '') like '%jesse@palato.coffee%')
  loop
    execute format('drop policy %I on storage.objects', pol.policyname);
    raise notice 'Dropped storage.objects policy: %', pol.policyname;
    dropped := dropped + 1;
  end loop;
  raise notice 'admin-email storage policies dropped: %', dropped;
end $$;
