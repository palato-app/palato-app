# Palato — Tech Debt

A living list of known imperfections, deferred decisions, and known-fragile patterns. Items get added when surfaced and removed when fixed. Not the same as DECISIONS.md (decisions are append-only history); this is a working backlog.

---

## Active

### Storage policy hardcodes admin email
- **What:** The `bag-images` Storage policy in Supabase checks `auth.jwt() ->> 'email' = 'jesse@palato.coffee'` directly.
- **Why it's debt:** Brittle if email changes, can't easily add admins, lives in the dashboard rather than version control.
- **Fix:** Add `profiles.is_admin boolean` via migration, set self to true, update policy to check `profiles.is_admin` instead.
- **Surfaced:** Decision #021, May 4, 2026.

### Storage policies not in version control
- **What:** Supabase Storage policies live in the dashboard only, not in `supabase/migrations/`.
- **Why it's debt:** Violates Decision #014's migration discipline — schema changes should be reproducible from the repo. If the database is recreated, Storage policies have to be manually reapplied.
- **Fix:** When Supabase CLI supports Storage policies in migrations (or via raw SQL using `storage.policies`), port the existing policies into a migration file.
- **Surfaced:** Decision #021, May 4, 2026.

### AddCoffeeForm UI is unstyled
- **What:** The admin-only AddCoffeeForm has functional but unrefined visual styling — labels are uppercase, inputs are basic, no responsive layout.
- **Why it's debt:** Fine for v0.1 admin tooling, but if non-admin users ever see it (or if Jesse demos screen-sharing the admin flow), it'll look unfinished.
- **Fix:** Style pass aligning the form with the magazine-spread aesthetic from Decision #019. Low priority unless a demo scenario requires it.
- **Surfaced:** Session of May 4, 2026.

### Image rights for catalog-sourced coffee photos
- **What:** Catalog will be populated using bag images sourced from roaster websites (copyrighted by roasters).
- **Why it's debt:** Acceptable for prototype dev/testing. Becomes a product policy issue before public launch — Vivino solved this by letting wineries upload official labels themselves.
- **Fix:** Pre-launch product decision needed: (a) Jesse's own photos only, (b) explicit roaster permission, or (c) a roaster-onboarding flow letting roasters upload their own.
- **Surfaced:** Session of May 4, 2026.

### CLI version drift
- **What:** Local Supabase CLI is v2.95.4; latest is v2.98.1.
- **Why it's debt:** Minor version skew is fine, but staying on outdated CLI can surface bugs that have already been fixed upstream.
- **Fix:** `brew upgrade supabase` next time we're at a clean checkpoint.
- **Surfaced:** Session of May 4, 2026.

### Brand guide v02 not yet written
- **What:** `palato-brand-guide-v01.md` still specifies Fraunces as display face. Decision #019 superseded that with Boldonse + Instrument Serif + Geist.
- **Why it's debt:** Anyone reading the repo gets two contradicting sources of truth on typography.
- **Fix:** Brand guide v02 update — typography section minimum, ideally also in-product translation section.
- **Surfaced:** Decision #019, May 4, 2026.

### HEIC images don't render in browser
- **What:** Some coffees in the catalog have `bag_image_url` pointing at `.heic` files uploaded from iPhone Photos via the AddCoffeeForm. Browsers can't display HEIC, so the images render as broken icons even though the files exist in Storage.
- **Why it's debt:** Catalog looks half-broken when displaying these coffees. Will surface in any interview or demo.
- **Fix (two parts):**
  - **Prevention:** Add file-type validation to AddCoffeeForm — reject files outside `image/jpeg`, `image/png`, `image/webp`. ~5 min.
  - **Cleanup:** Either re-upload existing HEIC coffees as JPEGs (manual, ~20 min) or add server-side HEIC→JPEG conversion (overscope).
- **Surfaced:** May 18, 2026 — first time the browse view rendered real catalog photos and the HEICs appeared as broken.