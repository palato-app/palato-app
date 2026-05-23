# Palato — Tech Debt

A living list of known imperfections, deferred decisions, and known-fragile patterns. Items get added when surfaced and removed when fixed. Not the same as DECISIONS.md (decisions are append-only history); this is a working backlog, grouped by area.

---

## Infrastructure & Admin

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
- **What:** The admin-only AddCoffeeForm has functional but unrefined visual styling — labels are uppercase, inputs are basic, no responsive layout. (Note: HEIC auto-conversion and file-type validation were added May 18; the styling debt is unchanged.)
- **Why it's debt:** Fine for v0.1 admin tooling, but if non-admin users ever see it (or if Jesse demos screen-sharing the admin flow), it'll look unfinished.
- **Fix:** Style pass aligning the form with the magazine-spread aesthetic from Decision #019. Low priority unless a demo scenario requires it.
- **Surfaced:** Session of May 4, 2026.

### Image rights for catalog-sourced coffee photos
- **What:** Catalog is populated using bag images sourced from roaster websites (copyrighted by roasters).
- **Why it's debt:** Acceptable for prototype dev/testing. Becomes a product policy issue before public launch — Vivino solved this by letting wineries upload official labels themselves.
- **Fix:** Pre-launch product decision needed: (a) Jesse's own photos only, (b) explicit roaster permission, or (c) a roaster-onboarding flow letting roasters upload their own.
- **Surfaced:** Session of May 4, 2026.

### Brand guide v02 not yet written
- **What:** `palato-brand-guide-v01.md` still specifies Fraunces as display face. Decision #019 superseded that with Boldonse + Instrument Serif + Geist.
- **Why it's debt:** Anyone reading the repo gets two contradicting sources of truth on typography.
- **Fix:** Brand guide v02 update — typography section minimum, ideally also in-product translation section.
- **Surfaced:** Decision #019, May 4, 2026.

### No edit capability for catalog coffees
- **What:** The AddCoffeeForm only *creates* coffee records. Once a coffee is saved, no field can be edited through the UI — fixing a typo or a wrong value isn't possible without direct database access.
- **Why it's debt:** A deferred feature more than a fragile pattern, but it gets more acute with the scan flow: if a bag-scan extraction saves with an error and is only noticed later, there's no recovery path in-app. Edit is *update* logic on an existing record — a distinct operation from *create* — so it's deliberately out of scope for the scan build to keep that build tight.
- **Fix:** Add an edit mode to the coffee form (or a dedicated edit route) that loads an existing record and updates rather than inserts, admin-gated for now. Natural to build alongside or just after the scan flow.
- **Surfaced:** May 22, 2026 — scan-flow planning; flagged as adjacent-but-separate scope.

---

## Browse

### Card image proportions — bags get awkwardly cropped at 1:1
- **What:** The browse view uses `aspect-ratio: 1/1` with `object-fit: cover` on bag images. Roaster bag photos are mostly portrait, so the crop chops the top and bottom of the bag in many cases.
- **Why it's debt:** Visual identity of the bag is partly cropped away. At a small enough card size it's fine; at larger sizes it looks bad.
- **Fix:** Either (a) require square crops at upload time in the AddCoffeeForm (force a crop step), or (b) switch the card image to a portrait aspect ratio (3:4 or 4:5) so most bag photos fit naturally, or (c) let the image be its natural aspect ratio with a fixed max-height and `object-fit: contain` (with a cream fill behind it).
- **Surfaced:** May 18, 2026 — visible in first browse view render.

### Browse view filter functionality
- **What:** Browse view currently shows all coffees in a flat grid. No filtering by origin, process, roast level, or roaster.
- **Why it's debt:** Useful at 27 coffees, becomes navigation friction at 50+.
- **Fix:** Add filter chips at top of browse view. State management for active filters. Filters apply to the existing useCoffees data client-side; no schema changes needed.
- **Surfaced:** Browse view build session, May 18, 2026 — filters explicitly deferred per session decision.

### Browse view hero copy ("What's good.")
- **What:** Copy on the browse view hero feels off. "What's good." reads as marketing-language rather than product-language.
- **Why it's debt:** Cosmetic, low priority.
- **Fix:** Product marketing pass on all hero copy across the app once core flows are built and we're not iterating on structure.
- **Surfaced:** May 18, 2026.

---

## Coffee Detail

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

### CoffeeDetail has no community rating signals
- **What:** The detail page now shows the user's own latest rating (per Decision #031) but does not display community average rating or community rating count from other users.
- **Why it's debt:** No multi-user rating data exists yet. Once 30+ ratings exist across users for the same coffees, the detail page is the obvious place to surface "37 community ratings · avg 4.1" alongside the user's own rating.
- **Fix:** Add a community block below or beside the user's own rating block. Compute aggregate rating + count via a Supabase view or SQL function (`coffee_community_ratings`) for efficient querying.
- **Surfaced:** May 18, 2026 — CoffeeDetail v0.1 build, narrowed to community-only after Decision #031.

### CoffeeDetail does not surface per-coffee rating history (count > 1)
- **What:** When a user has rated the same coffee more than once, the detail page shows only the most recent rating. There's no UI affordance to see "you've also rated this 2 other times" or expand to view past ratings.
- **Why it's debt:** Repeat ratings are a real signal — taste evolution over a single bag matters. The journal shows all ratings chronologically, but you can't currently see them grouped by coffee.
- **Fix:** Add a small pill or count above the "your rating" block when there's more than one rating ("3 ratings since May 12 · view all"). Tap expands to a small history list or jumps to a coffee-filtered view of the journal.
- **Surfaced:** May 18, 2026 — Decision #031, surfaced by allowing multiple ratings per coffee.

---

## Rating Flow

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

### Interstitial is a placeholder for a Whoop-for-coffee insight surface
- **What:** The confirmation interstitial is one line of italic serif plus a count. Decision #026 frames it as a placeholder for a much richer "your palate is getting sharper" experience.
- **Why it's debt:** The framing in the decision log promises more than the v0.1 UI delivers. Right now it's a confirmation, not insight.
- **Fix:** Once 20+ ratings exist per active user, design and ship a real insight surface — flavor profile growth, dominant categories, palate-sharpening trend lines. Likely a multi-week design + build effort, not a quick win.
- **Surfaced:** May 18, 2026 — surfaced by Decision #026 framing.

### RateCoffee — structural improvements pending (taste/feel split, merged input)
- **What:** First end-to-end self-test (May 18, 2026) surfaced structural issues with the rating form, three of which remain open:
  1. **"Anything specific?" prose and "What did you taste?" chips feel redundant.** The user types descriptors in the prose, then is asked to tag them again from chips. Same data, two formats.
  2. **Body & Mouthfeel is mis-categorized as flavor.** Tactile/sensation, not taste. Belongs in its own "How did it feel?" section.
  3. **Defects & Off-flavors are hidden.** They're flavor characteristics and should live up front with taste, not buried.
  (A fourth issue — the slider lacking visual scale — was resolved by replacing the slider with the RatingDial component, Decision #029.)
- **Why it's debt:** Direct first-user UX feedback, structural rather than cosmetic.
- **Fix:** Decision #027 (taste/feel split, defects elevated) and Decision #028 (merged prose + inline descriptor auto-detect) define the path. Both are strong next-session candidates.
- **Surfaced:** May 18, 2026 — first self-test of RateCoffee v0.1.

### RatingDial — accessibility and platform polish
- **What:** The radial dial component has known gaps:
  - **No keyboard support.** Can't tab to the dial and arrow-key to set a value. Screen readers won't see it as an interactive control.
  - **No haptic feedback on mobile.** Real Vivino-style dials have a soft tick on each step. We have nothing.
  - **Single linear gradient.** Vivino uses a multi-stop gradient that telegraphs intensity more vividly. Ours is functional, not polished.
  - **No "snap" animation when releasing the handle.** Currently the handle stops wherever it lands.
- **Why it's debt:** Accessibility is non-negotiable for any rating control that ships to real users. The rest is polish that compounds the brand.
- **Fix:**
  - Add `tabIndex={0}`, `role="slider"`, `aria-valuenow/min/max`, and onKeyDown handler for arrow keys (← →, ↑ ↓, PageUp/PageDown).
  - Add `navigator.vibrate(10)` on each step change on touch devices (Web Vibration API).
  - Define a multi-stop gradient on the dial path mirroring the Vivino color story (cool → warm → hot).
  - Add a small CSS transition on the handle position (~150ms ease-out) for non-drag updates.
- **Surfaced:** May 18, 2026 — Decision #029, dial v0.1.1 ships without these.

---

## Journal

### Journal v0.1 — known omissions
- **What:** The Journal ships with intentional v0.1 limitations:
  - **No edit or delete on past ratings.** Once submitted, ratings can only be inserted, not modified. Users will eventually want to fix typos, update flavor descriptors, change a rating, or delete an embarrassing one.
  - **No filters or sort.** Only reverse-chronological. No "show me only 4+ ratings", "only this roaster", "this month".
  - **No grouping.** A long journal will become hard to navigate without month/week dividers.
  - **No empty-state CTA.** "No ratings yet. Pop the bag." sits there with no button to take the user to Coffees. A "Browse coffees" CTA would close the loop.
  - **Date format is en-US locale only.**
- **Why it's debt:** All are real UX gaps that emerge once the user has more than a handful of ratings. None block v0.1 ship.
- **Fix:** Add each progressively. Edit/delete is a meaningful schema + UI design effort (consider a rating-detail page or modal). Filters/sort/grouping can be client-side with the existing data. Empty-state CTA is a 5-minute add.
- **Surfaced:** May 18, 2026 — Decision #030, Journal v0.1 build.

---

## Cross-cutting

### Date formatting + utility duplication
- **What:** A `formatDate` helper now lives identically in `CoffeeDetail.tsx` and `Journal.tsx`. Same with `ROAST_LABELS` (now in three places: CoffeeDetail, Journal, BrowseCoffees).
- **Why it's debt:** Divergence risk — same constant, multiple places to keep aligned. Easy to forget when adding a new roast level enum value.
- **Fix:** Extract to `src/lib/format.ts` (formatDate) and `src/lib/labels.ts` (ROAST_LABELS and other enum→display maps). Cheap refactor, ~5 minutes.
- **Surfaced:** May 18, 2026 — second copy of formatDate created in CoffeeDetail build.