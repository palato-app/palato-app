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

### Card image proportions — bags get awkwardly cropped at 1:1
- **What:** The browse view uses `aspect-ratio: 1/1` with `object-fit: cover` on bag images. Roaster bag photos are mostly portrait, so the crop chops the top and bottom of the bag in many cases.
- **Why it's debt:** Visual identity of the bag is partly cropped away. At a small enough card size it's fine; at larger sizes it looks bad.
- **Fix:** Either (a) require square crops at upload time in the AddCoffeeForm (force a crop step), or (b) switch the card image to a portrait aspect ratio (3:4 or 4:5) so most bag photos fit naturally, or (c) let the image be its natural aspect ratio with a fixed max-height and `object-fit: contain` (with a cream fill behind it).
- **Surfaced:** May 18, 2026 — visible in first browse view render.

### Browse view filter functionality
- **What:** Browse view currently shows all coffees in a flat grid. No filtering by origin, process, roast level, or roaster.
- **Why it's debt:** Useful at 13 coffees, becomes navigation friction at 30+.
- **Fix:** Add filter chips at top of browse view. State management for active filters. Filters apply to the existing useCoffees data client-side; no schema changes needed.
- **Surfaced:** Browse view build session, May 18, 2026 — filters explicitly deferred per session decision.

### Browse view hero copy ("What's good.")
- **What:** Copy on the browse view hero feels off. "What's good." reads as marketing-language rather than product-language.
- **Why it's debt:** Cosmetic, low priority.
- **Fix:** Product marketing pass on all hero copy across the app once core flows are built and we're not iterating on structure.
- **Surfaced:** May 18, 2026.

### CoffeeDetail v0.1 — secondary fields not yet surfaced
- **What:** The detail page renders bag image, roaster, coffee name, origin, process, roast level, variety, elevation, and SCA score. It does NOT render `producer`, `farm`, `process_detail`, `roast_date`, `roaster_tasting_notes_raw` (the array of roaster-stated flavor notes), or the curated Palato flavor descriptor chips from `coffee_flavor_descriptors`.
- **Why it's debt:** These fields exist in the schema and belong on the detail page eventually. Producer and farm are origin-story info that specialty drinkers actually read. Roaster flavor notes vs. Palato descriptor chips is a design decision (which representation wins, or do both live there?) we haven't made yet.
- **Fix:** Two passes. (1) Add producer, farm, process_detail, roast_date as additional fact-grid entries (cheap). (2) Decide the flavor-notes design — likely chips for Palato descriptors with raw roaster notes as fallback / secondary — and build the chip component.
- **Surfaced:** May 18, 2026 — CoffeeDetail v0.1 build.

### CoffeeDetail desktop-only layout
- **What:** The detail page hero uses a two-column grid (image | details) that will look squished on mobile.
- **Why it's debt:** Palato is mobile-first eventually. Two-column desktop layouts that don't stack on narrow viewports are a known regression.
- **Fix:** Add a media query (or CSS Grid `minmax`) that collapses the hero to a single column under ~720px. Apply same treatment to BrowseCoffees hero, which has the same issue.
- **Surfaced:** May 18, 2026 — CoffeeDetail v0.1 build.

### CoffeeDetail has no community or personal rating signals
- **What:** The detail page does not display community average rating, rating count, or the current user's prior ratings on this coffee.
- **Why it's debt:** No rating data exists yet. Once the rating flow ships and accumulates data, the detail page is the obvious place to surface "your last rating: 4.2" and "37 community ratings · avg 4.1".
- **Fix:** After 30+ ratings exist across the catalog, add a "your rating" block (above or beside the Rate button) and a community block below the fact grid.
- **Surfaced:** May 18, 2026 — CoffeeDetail v0.1 build.

### Rating slider styled with browser defaults
- **What:** The rating slider in RateCoffee uses native `<input type="range">` with `accent-color: #D94E1F` and a thin track. No custom thumb or fill styling.
- **Why it's debt:** Native range inputs look different across browsers (Safari vs Chrome vs Firefox) and don't match the editorial brand polish.
- **Fix:** Style ::-webkit-slider-thumb, ::-webkit-slider-runnable-track, ::-moz-range-track, ::-moz-range-thumb. Or replace with a custom slider component when the Vivino-style dial work happens (#024).
- **Surfaced:** May 18, 2026 — RateCoffee v0.1 build.

### Rating + descriptor inserts are not transactional
- **What:** Submitting a rating runs two sequential Supabase inserts: first into `ratings`, then into `rating_flavor_descriptors` for each selected descriptor. If the descriptor insert fails, the rating still exists without its tags.
- **Why it's debt:** Data inconsistency. A rating without its flavor descriptors is partial. Today we `console.error` and proceed; the user sees a successful submit.
- **Fix:** Move to a Postgres RPC function (`create_rating_with_descriptors`) that wraps both inserts in a transaction. Either both succeed or both roll back.
- **Surfaced:** May 18, 2026 — RateCoffee v0.1 build.

### Descriptor search is substring, not fuzzy
- **What:** The descriptor search filters by `String.includes()` against descriptor name, category, subcategory, and aliases. "lmon" won't match "lemon."
- **Why it's debt:** Typo tolerance and stem matching ("lemony" → "lemon") would meaningfully improve UX, especially on mobile where typing is error-prone.
- **Fix:** Lightweight fuzzy match library (fuse.js or similar) on the client. 168 rows is small enough that client-side fuzzy ranking is free.
- **Surfaced:** May 18, 2026 — RateCoffee v0.1 build.

### No "My Coffees" / journal view yet — submitted ratings persist but aren't visible to the user
- **What:** Ratings save to Supabase correctly, but there's no UI for a user to see their list of rated coffees. The interstitial ("That's coffee #X for you") implies a history exists, but the user can't navigate it.
- **Why it's debt:** The product loop is open — users rate but can't review. Closing the loop is the highest-value next feature.
- **Fix:** Build a "Journal" or "My Coffees" view. Chronological feed of user's ratings, with the coffee context, rating, tasting notes, and selected descriptors visible. Filterable by rating, sortable by date. Likely needs a new top-nav entry.
- **Surfaced:** May 18, 2026 — surfaced by the absence of UI after RateCoffee ships. Highest priority for next session.

### CoffeeDetail does not show the current user's rating on this coffee
- **What:** The coffee detail page does not display "your rating: 4.2" or surface the user's prior tasting notes for this coffee.
- **Why it's debt:** Detail page is the natural place to land after a rating; without surfacing the user's own rating it feels like nothing happened.
- **Fix:** Query `ratings` for `(user_id, coffee_id)` on detail page load; if a rating exists, show it in a small "your rating" block above the Rate button. Change "Rate this coffee" button copy to "Update rating" when one already exists.
- **Surfaced:** May 18, 2026 — surfaced alongside RateCoffee.

### Interstitial is a placeholder for a Whoop-for-coffee insight surface
- **What:** The confirmation interstitial is one line of italic serif plus a count. Decision #026 frames it as a placeholder for a much richer "your palate is getting sharper" experience.
- **Why it's debt:** The framing in the decision log promises more than the v0.1 UI delivers. Right now it's a confirmation, not insight.
- **Fix:** Once 20+ ratings exist per active user, design and ship a real insight surface — flavor profile growth, dominant categories, palate-sharpening trend lines. Likely a multi-week design + build effort, not a quick win.
- **Surfaced:** May 18, 2026 — surfaced by Decision #026 framing.