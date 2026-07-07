# Palato — Tech Debt

A living list of known imperfections, deferred decisions, and known-fragile patterns. Items get added when surfaced and removed when fixed. Not the same as DECISIONS.md (decisions are append-only history); this is a working backlog, grouped by area.

---

## Infrastructure & Admin

### Storage policies not fully in version control
- **What:** Supabase Storage policies live in the dashboard. Migrations `0008` (the `bag-images` authenticated own-folder upload policy) and `0009` (dropping the legacy admin-email INSERT policy) brought the *write* side of `bag-images` into `supabase/migrations/`, but the public-read setup (bucket public flag / any SELECT policy) is still dashboard-only.
- **Why it's debt:** Violates Decision #014's migration discipline — schema changes should be reproducible from the repo. If the database is recreated, the un-captured Storage config has to be manually reapplied.
- **Fix:** Capture the remaining `bag-images` read configuration (public-bucket flag and/or SELECT policies) in a migration so the full Storage setup is reproducible from the repo.
- **Surfaced:** Decision #021, May 4, 2026. Largely addressed by Decisions #046 and the `0009` cleanup, June 15, 2026 — only the read config remains.

> **Resolved June 15, 2026** — *"Storage policy hardcodes admin email."* The `bag-images` INSERT policy that checked `auth.jwt() ->> 'email' = 'jesse@palato.coffee'` was dropped in migration `0009` (it became redundant once `0008` opened uploads to all authenticated users). No admin-email reference remains in any `storage.objects` policy. An `is_admin`-based model is no longer needed for bag-image uploads; if admin gating returns for other features, prefer `profiles.is_admin` over a hardcoded email.

> **Resolved July 5, 2026** — *"AddCoffeeForm UI is unstyled."* Moot: `AddCoffeeForm.tsx` was dead code (superseded by `AddAndRateFlow`, imported by nothing) and was deleted. See the resolved dead-code entry under Cross-cutting.

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

### Catalog edit permission model — open-edit is a vandalism vector at scale
- **What:** As of Decision #045, *any authenticated user can edit any coffee* in the global catalog (migration `0007` broadened the `coffees` UPDATE policy from creator-only to `using true`). There is no edit history, no audit trail of who changed what, no moderation, and no optimistic-concurrency guard (concurrent edits are last-write-wins). `with check (true)` also means an update could rewrite `created_by` (the edit form doesn't, but the policy no longer protects it).
- **Why it's debt:** Correct and intentional for the whitelisted beta (matches the open-catalog trust model of Decision #034), but it's a genuine security/data-integrity concern the moment the user base opens up — a single bad or careless actor can silently overwrite catalog facts everyone else relies on, with no way to see or revert the change. Jesse flagged this explicitly as an "important security issue once we grow to more users."
- **Fix:** Revisit alongside community ratings + moderation in v1.1. Candidate pieces: (a) an edit-history / audit table (who, when, before→after) — also unblocks revert; (b) a permission tier (trusted-contributor vs. new user) or a propose-edit → approve flow rather than direct write; (c) tighten the policy so `created_by` can't be reassigned; (d) optionally an optimistic-concurrency check on `updated_at`.
- **Surfaced:** June 15, 2026 — Decision #045, when catalog editing shipped. Supersedes the prior "No edit capability for catalog coffees" item (that feature now exists).

### User location is free-text only — not structured for recommendation/shipping filters
- **What:** `profiles` now has a nullable free-text `location` column (migration `0012`, June 18 — an editable city/region in the More tab), so a user *can* set a location. But it's unnormalized free text ("Portland, OR" / "london" / "PNW"), with no geocoding and no structured country code. The recommendation engine's "Something You'll Love" strategy needs to filter to coffees a user can actually buy/ship to, which needs at least a structured **country** — the free-text field can't reliably drive that, so we still assume **USA-only** for the purchasability filter (price stored as USD in migration `0010`).
- **Why it's debt:** A free-text location can't be queried for a shipping/availability filter without parsing/normalization. The location *UI* exists but isn't usable for targeting, and the US-only assumption bakes a bias into recommendations + commerce data.
- **Fix:** Add a structured **country** field (and optionally normalize the free-text via geocoding) that the purchasability filter can query; generalize `price_usd` toward multi-currency. The existing free-text `location` can stay as a display field. Location is PII — handle accordingly.
- **Surfaced:** June 16, 2026 — Decision #047, recommendation-engine planning. **Updated June 18, 2026** — migration `0012` added a free-text `location` column, superseding the original "no location field" framing; the structured/queryable gap remains.

> **Resolved June 18, 2026** — *"Web-augmentation provenance columns are user-writable."* Migration `0013` adds a `BEFORE UPDATE` trigger (`enforce_admin_only_columns`) on `coffees` that rejects non-admin changes to `source_url`, `web_augmented_at`, and `augmentation_raw` (and `moderation_status` / `verified`). The columns stay on the row, but only admins (or the admin-gated augmentation endpoint acting as an admin) can write them — closing the forge/inject hole while keeping factual fields open-edit (#045). See Decision #052.

### Anthropic key is on a temporary test account. 
- **What:** We'll need to switch from a separate user account and generate API Calls from Palato.coffee directly. 
- **Why it's debt:** Need to research if the API call feature via Anthropic demands having a Pro account or not. 
- **Fix:** Research the question above and switch costs to the best account.
- **Surfaced:** May 23, 2026 — scan-flow planning; flagged as adjacent-but-separate scope.

---

## Browse

### Card image proportions — bags get awkwardly cropped at 1:1
- **What:** The browse view uses `aspect-ratio: 1/1` with `object-fit: cover` on bag images. Roaster bag photos are mostly portrait, so the crop chops the top and bottom of the bag in many cases.
- **Why it's debt:** Visual identity of the bag is partly cropped away. At a small enough card size it's fine; at larger sizes it looks bad.
- **Fix:** Either (a) require square crops at upload time in the add flow (`AddAndRateFlow`) (force a crop step), or (b) switch the card image to a portrait aspect ratio (3:4 or 4:5) so most bag photos fit naturally, or (c) let the image be its natural aspect ratio with a fixed max-height and `object-fit: contain` (with a cream fill behind it).
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

### Elevation as a single int can't represent ranges
- **What:** `coffees.elevation_masl` is an integer, but bags often print elevation as a range (e.g., "1,800–2,100 masl"). The scan prompt captures it as a string, so the range survives extraction — but it can't land in an int column losslessly.
- **Why it's debt:** Collapsing a range to one int (midpoint or low end) loses real signal that a future recommender could use.
- **Fix:** Decide at Step 3 (extraction→DB mapping): (a) `elevation` as text, (b) `elevation_min_masl` + `elevation_max_masl` ints, or (c) single int + accept the loss.
- **Surfaced:** May 23, 2026 — Step 1 prompt review.

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

### RatingDial — gradient polish (accessibility resolved)
- **What:** Vivino uses a multi-stop gradient that telegraphs intensity more vividly (cool → warm → hot). Ours is a single linear gradient — functional, not polished.
- **Why it's debt:** Brand-compounding polish; also a visual/brand decision Jesse should drive, which is why it wasn't bundled into the accessibility fix.
- **Fix:** Define a multi-stop gradient on the dial path mirroring the Vivino color story.
- **Surfaced:** May 18, 2026 — Decision #029, dial v0.1.1 ships without these.

> **Resolved July 5, 2026** — *"RatingDial — no keyboard/screen-reader support, no haptics, no snap animation."* The dial is now a WAI-ARIA slider: `role="slider"` + `tabIndex` + `aria-valuemin/max/now/valuetext` on the SVG, arrow keys step ±0.1, PageUp/PageDown ±1.0, Home/End jump to min/max, with a `:focus-visible`-gated soft Ember halo behind the handle as the keyboard-focus indicator (pure CSS, in `index.css`; pointer/touch users never see it — a first-pass outline ring around the whole dial looked bad and was replaced same-day). `navigator.vibrate(10)` ticks each step change on devices that support it, and the handle snaps (~150ms ease-out) on non-drag updates. The center value display is `aria-hidden` so the value isn't double-announced. Only the gradient polish remains (entry above).

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

> **Resolved July 5, 2026** — *"Date formatting + utility duplication."* `src/lib/labels.ts` and `src/lib/format.ts` are now the single home for enum→display maps (ROAST_LABELS, ROAST_LABELS_COMPACT, ROAST_OPTIONS, ROAST_FROM_SCAN, PROCESS_OPTIONS/VALUES/LABELS) and `formatDate`; all former per-file copies import from there, including the palate surfaces that previously used palateTheme's hyphen-keyed maps. The dual roast vocabulary (DB `medium_light` vs. palate-domain `medium-light`) is **retained by design** — both forms are persisted (`palate_profiles.roast_preference`, cached `/api/recommend` JSON) — but the conversion is now one named helper (`toRoastBucketKey`) documented in `lib/labels.ts`, not scattered inline `.replace()` hacks. (Earlier note claimed WhatsNext likely mislabeled cached roast values — incorrect: `api/recommend.js` converts to hyphen form server-side, so lookups always matched.) See Decision #060.

> **Resolved July 5, 2026** — *"AddCoffeeForm.tsx is dead code."* Deleted (was 450 unreachable lines; `AddAndRateFlow` absorbed the flow). CLAUDE.md references corrected; the stale "unstyled" entry retired. Recoverable from git history if ever needed. See Decision #060.

---

## Palate Dashboard

### Headline text hardcoded in component instead of data layer
- **What:** `PalateDashboard.tsx` derives the headline ("Bright & fruit-forward" vs "Taking shape") from the maturity state with inline JSX rather than from a field in the `PalateProfile` data contract.
- **Why it's debt:** Every other piece of editorial copy flows through the data layer (summary, reads, recommendation reason). The headline is the exception, which breaks the single-seam design. When Claude-generated copy lands, both summary and headline need to be data-layer fields.
- **Fix:** Add a `headline` field to `PalateProfile` (or to `PalateReads`). Move the headline text into `mockProfiles.ts`. Component renders the field, not a conditional.
- **Surfaced:** May 24, 2026 — Decision #037, Palate Dashboard build.

### Dev variant switch (`?variant=early`) ships to production
- **What:** `getPalateProfile.ts` reads a `?variant=early` URL query param to toggle between established and early mock fixtures. This is a dev-only preview feature that has no production use.
- **Why it's debt:** Harmless but unnecessary in production. Any user who stumbles onto the param sees mock data.
- **Fix:** Remove the variant check when real Supabase aggregation replaces the mock data layer. Marked with `// TODO(jesse): remove when real aggregation lands`.
- **Surfaced:** May 24, 2026 — Palate Dashboard build spec §10.

### ESLint broken by orphaned worktrees — RESOLVED (June 18, 2026)
- **What:** `npm run lint` failed on every file with "No tsconfigRootDir was set, and multiple candidate TSConfigRootDirs" because `.claude/worktrees/` contains orphaned worktree directories, each with their own `tsconfig.json`.
- **Why it's debt:** Can't run ESLint. Pre-existing issue, not caused by any recent build.
- **Resolution:** Added `.claude` to ESLint's `globalIgnores` (PR #3), so lint no longer recurses into agent worktrees — durable against future ones too. The three stale worktrees were also pruned. Note: with lint working again, it surfaced ~10 pre-existing `react-hooks/set-state-in-effect` findings that were previously masked — see the new entry below.
- **Surfaced:** May 24, 2026 — discovered during Palate Dashboard build verification. Resolved June 18, 2026.

### Pre-existing `set-state-in-effect` lint findings (newly visible)
- **What:** With lint unblocked, ~10 `react-hooks/set-state-in-effect` errors are now reported across existing data hooks (e.g. `useUserRatings.ts`, `usePalateProfile.ts`) and the new onboarding hooks (`usePalateProfileRow.ts`, `useQuizHydration.ts`, the quiz funnel effects). They were always there; the parse failure hid them.
- **Why it's debt:** The rule flags `setState` called synchronously in an effect body (cascading-render smell). Most are benign loading-state toggles, but a few could be restructured (e.g. derive during render, or move the set into the async callback only).
- **Fix:** A focused pass: audit each finding, fix the genuine ones, and `// eslint-disable-next-line` the intentional loading toggles with a one-line justification. Don't bulk-suppress.
- **Surfaced:** June 18, 2026 — became visible once the ESLint worktree issue above was resolved.
---

## Catalog & Recommendations

### "Start here" rail over-relies on the quiz → low variety
- **What:** The catalog's "Start here: picked for your palate" rail (onboarding §4, `StartHereRail.tsx` / `pickStartHere`) is a heuristic: origin-affinity bias + roast-preference closeness + an sca_score nudge. In practice it weights the quiz answers so heavily that the picks collapse to a single profile — e.g. a quiz that said "Colombia / fruity" surfaces 4–5 *Colombia Light* coffees with no spread across origin, roaster, or roast.
- **Why it's debt:** The rail is meant to be an inviting, varied "start here," not five near-duplicates. Over-fitting to the quiz makes discovery feel narrow and undercuts the point of a curated rail. It's also a weak proxy for real recommendations.
- **Fix:** Add a diversity/variety pass over the ranked candidates before taking the top N — e.g. cap picks per origin and per roaster, interleave a "stretch" pick or two outside the dominant lean, and blend in highest-rated/newest regardless of quiz match. Longer term this is the seam where the real recommender (v1.1, Decision #027/#028 territory) plugs in; keep the heuristic honest until then.
- **Surfaced:** June 18, 2026 — Jesse flagged the rail showing all Colombia Light roasts on the live catalog.

---

## Privacy & Compliance

### No cookie-consent banner for PostHog analytics + session replay
- **What:** PostHog (wired June 16, 2026) sets a tracking cookie, builds person profiles on identified users, **and has session replay ON** (decision: keep it on — it's a primary signal source for the Nielsen usability rounds). There is no consent banner or opt-out anywhere in the app.
- **Why it's debt:** Fine for the current closed cohort (≈15 known friends, OAuth-whitelisted) — *provided testers are told they're being recorded* (see interim measure below). Becomes a real compliance gap the moment the app opens to the public: GDPR/ePrivacy (any EU visitor) and similar US state laws expect notice + opt-in *before* non-essential tracking cookies and especially before session recording starts. Jesse's stance: Palato is a data company, the cookie and replay stay — this is about disclosing them properly, not removing them.
- **Interim measure (done):** Testers are disclosed-to verbally (Lucy's interview intro) and in writing (tester onboarding) that sessions are recorded. This closes the research-ethics gap for the closed cohort. No code; copy lives with the interview protocol.
- **Trigger:** Build the banner **before flipping Google OAuth from Testing → In Production** (the moment non-whitelisted public users can sign in). Not before — gating capture now would suppress the testers' own replays and kneecap the usability signal.
- **Fix:** A single dismissible consent banner wired to PostHog's `opt_out_capturing_by_default: true` + `opt_in_capturing()` on accept (and `opt_out_capturing()` on decline). Disclosure should name session replay explicitly, not just "cookies." A full preferences center is overkill for v1.
- **Surfaced:** June 16, 2026 — PostHog analytics integration. Updated June 16, 2026 — session replay confirmed staying on; staged consent posture (disclose now, gate at OAuth-production) decided.

---

## Learn & Globe

### Globe is web-only WebGL — won't port to the native iOS app
- **What:** The Learn globe uses `react-globe.gl` + `three` (Decision #055). When Palato moves to a native iOS app, this rendering layer does not port — it needs a SceneKit/MapKit (or RN equivalent) reimplementation.
- **Why it's debt:** A known, accepted limitation of the v1 web bet, surfaced so the iOS migration estimate accounts for it rather than being surprised. The *region data* (`data/regionData.ts`, plain structs) and the *matcher* (`lib/matchRegion.ts`) port cleanly; only the globe component (`components/LearnGlobe.tsx`) is throwaway. The WebGL-unavailable fallback path (country grid) is a permanent maintenance requirement.
- **Fix:** On the iOS track, reimplement the globe natively; reuse the region data + matcher as-is.
- **Surfaced:** Decision #055, June 24, 2026.

### Region→coffee link is fuzzy string matching, not a structured FK
- **What:** A region surfaces its catalog coffees by normalized fuzzy matching (`coffeeMatchesRegion` in `lib/matchRegion.ts`): exact `origin_country` + any diacritic-normalized `matchTerm` contained in free-text `coffees.origin_region`. There is no `region_id` foreign key.
- **Why it's debt:** Breaks silently when catalog `origin_region` spellings drift outside a region's `matchTerms` (e.g. a new municipality), and a coffee can only ever map to regions whose aliases someone remembered to author. Fine at current catalog scale; fragile as the catalog grows.
- **Fix:** A structured region catalog + `region_id` FK on `coffees` (with a backfill), later branch. Until then, keep `matchTerms` current as new regions/spellings appear.
- **Mitigated (July 6, 2026, Decision #062):** augmentation prompt v5 now constrains proposed `origin_region` values to the Learn canonical vocabulary ("Canonical (Locality)" format), so web-augmented rows land inside the match net by construction. Scan-sourced free text and pre-v5 rows remain fuzzy-only; the FK is still the real fix.
- **Surfaced:** Decision #055, June 24, 2026.

### Catalog has no region filter
- **What:** `BrowseCoffees` filters by `origin_country` only. The region detail page's "Browse all {country} coffees" CTA therefore deep-links to the *country* filter, not the region — so a user can't see a region-filtered catalog view.
- **Why it's debt:** Minor UX gap; the region page shows the matched list inline, so the information is reachable, just not as a catalog filter.
- **Fix:** Add an `initialRegion` / region filter to `BrowseCoffees` and wire the region-page CTA to it.
- **Surfaced:** Decision #055, June 24, 2026.

### Globe dependency weight + single maintainer
- **What:** `react-globe.gl` + `three` add ~509 KB gzip, isolated to a lazy `LearnGlobe` chunk (only loaded on Learn). `react-globe.gl` is effectively a single-maintainer project.
- **Why it's debt:** Bundle/maintenance risk to monitor; acceptable given the lazy boundary keeps it off every other surface.
- **Fix:** Watch chunk size and upstream health; revisit if the dependency stalls.
- **Surfaced:** Decision #055, June 24, 2026.

### Non-Colombia region coverage is thinner
- **What:** Colombia ships with 5 regions (Huila deep); Ethiopia/Kenya/Guatemala/Brazil/Panama ship with ~2 representative regions each, authored from general coffee knowledge rather than Jesse's editorial voice.
- **Why it's debt:** Uneven depth across origins; the lighter entries should be reviewed/expanded to parity (and against Jesse's authored markdown).
- **Fix:** Backfill region content per country in `data/regionData.ts` as the markdown source lands.
- **Surfaced:** Decision #055, June 24, 2026.

### Origins data: deferred backfills and parser fragility (Standard v1)
- **What:** The Learn origins now parse from `palato-coffee-origins-verified.md` (Decision #056). Outstanding: (a) per-entry `sources[]` backfill (primary sources first) is not yet populated; (b) a few general-reference figures (e.g. Venezuela's altitude band) should be re-verified against a national-board or importer source before being treated as load-bearing; (c) the markdown parser (`originsParser.ts`) is tolerant but prose-based, so a formatting drift can drop a country, caught only by the dev-time parse-warning; (d) secondary parsing collapses some grouped roster lines into a single chip (e.g. "Gabon, Republic of the Congo, Benin").
- **Why it's debt:** Sources behind a disclosure are part of the standard but not yet wired; unverified figures violate the "verify before load-bearing" principle; silent parser breakage is only visible in dev.
- **Fix:** Backfill `sources[]` in the markdown; re-verify flagged figures; consider a CI check that fails the build if any primary origin parses with zero regions (promote the dev warning to an error in CI).
- **Surfaced:** Decision #056, June 25, 2026.

### Globe has no region (or country) coordinates from the verified data
- **What:** The verified origins markdown carries no lat/lng (correctly, per the no-invented-data / no-DEM-as-altitude rule). So the globe highlights countries by polygon name and flies to click coordinates, but cannot place region pins, and a handful of origins are intentionally not highlighted (US states like Hawaii, small islands like Puerto Rico / Réunion) because there is no faithful 110m polygon.
- **Why it's debt:** The original vision included drilling into where regions sit on the map; that needs a separately-verified coordinate source, not synthesized points.
- **Fix:** Source verified region centroids (or a labeled terrain/DEM context layer) as a future enrichment; until then the drill-down stays country to region-as-cards.
- **Surfaced:** Decision #056, June 25, 2026.

> **Resolved June 25, 2026** — *"Non-Colombia region coverage is thinner."* The Origins Data Standard v1 (Decision #056) replaced the hand-authored 6-country seed with verified global coverage (every major producing country across all sections), parsed from the canonical markdown. Region-level depth is now uniform by standard (country-level varietals, growing-band elevation with basis), so the parity gap is closed; what remains is the per-entry source backfill tracked above.

### "By the Numbers" figures are verify-seeds (and farm/producer counts still missing)
- **What:** The block now shows status, species, world rank + annual production (`countryProduction.ts`, USDA FAS/ICO 2024/25, top 20), altitude band, growing-region count, harvest window (`countryHarvest.ts`), "coffee since" founding year (`countryFounding.ts`), and a live catalog count. The production/harvest/founding tables are **curated SEEDS to verify against primary sources before launch** — production tail ranks were omitted as noisy, harvest windows are a representative main-crop window (regional/fly crops vary), and founding years are grounded in our markdown but not exhaustively cross-checked. Still missing: # farms / # producers (no clean verifiable source yet).
- **Why it's debt:** Seeded figures are presented as fact on a trust surface; they need a verification pass, and a couple of edge cases are imperfect (e.g. Vietnam's altitude band parses to the Robusta elevation 500-800 m rather than its high-grown Arabica).
- **Fix:** Verify the production/harvest/founding seeds against USDA/ICO/national-board primaries; add # farms/producers if a citable source exists; consider sourcing per-entry citations (the standard's deferred "Sources" disclosure).
- **Surfaced:** June 25, 2026; expanded June 26, 2026.

### Region locator maps: coverage gaps + admin-1 file sizes
- **What:** Region locator maps draw from vendored Natural Earth admin-1 boundaries (`public/geo/admin1/<country>.geojson`, one per country, lazy-loaded). They render only when a growing region matches an official province by name. After the admin-2 (geoBoundaries) + curated-parent-province pass, coverage is ~92% (229/249). The ~20 still-unmapped are non-administrative: coffee-board zones (Costa Rica's Brunca, Dominican coffee regions), Ethiopian woredas (Yirgacheffe, Kochere, Gedeb), grade tiers (Jamaica Low Mountain/Supreme), and multi-province islands (Indonesia's Java/Flores). Some per-country files are large (China ~764KB, Brazil ~513KB, India ~444KB) even after coordinate rounding to 2 decimals; total ~5.6MB across 47 countries.
- **Why it's debt:** Partial map coverage (by design for v1 — non-province zones were deferred to a later boundary-sourcing task); and the heavier country files are a chunky (though lazy + cached) fetch for a small locator.
- **Fix:** Hand-source verified boundaries (or centroids) for the non-province growing zones; run a geometry simplification pass (Douglas-Peucker / topojson) on the admin-1 files to shrink the large ones. Then layer topographic relief (the next maps step).
- **Surfaced:** June 26, 2026 (maps track).

### Regional card variability (revisit before launch)
- **What:** Region cards on the country page are uneven. The masl line was removed in favor of a region "output / characteristics" descriptor, but we have no verified data for it yet, so that field is null/absent for now. Card detail text also varies in quality (some regions have rich sub-region notes, some have terse or awkward fragments inherited from the markdown), and the card mini-map is present only where the region matches an admin-1 province (~63% of regions; see REGION_MAP_COVERAGE.md).
- **Why it's debt:** Inconsistent cards read as unfinished; the missing characteristics descriptor is a real content gap ("every word earns its place"). Acceptable to iterate during the beta, but should be evened out before a wider launch.
- **Fix:** Source a short per-region characteristics/flavor phrase (verifiable), normalize card detail copy, and close the map-coverage gap (hand-source boundaries for non-province zones). Work through it during beta.
- **Surfaced:** June 26, 2026.
