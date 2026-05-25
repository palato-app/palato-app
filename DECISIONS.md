# Palato — Decision Log

© 2026 Jesse Eshleman. All rights reserved.

A running log of meaningful product, technical, and strategic decisions. Each entry captures what was decided, what was considered, why this path was chosen, and what tradeoffs were accepted. The goal is not exhaustive documentation — it's capturing the moments where a real fork in the road occurred and the reasoning that future-me (and any future case study) will need to reconstruct.

---

## #001 — April 19, 2026 — Created initial PRD before user research
**Decision:** Write PRD before conducting user interviews.
**Alternatives considered:** Wait until after research to document anything.
**Rationale:** Establish a hypothesis to test, not a plan to execute blindly. Pre-research PRDs are also evidence of structured thinking; revising one post-research is more rigorous than writing one from scratch later.
**Tradeoffs accepted:** PRD will need significant revision after Phase 0 research.
**Linked competency:** D (Product Artifacts)

---

## #002 — April 19, 2026 — Descoped social features from V1
**Decision:** No social features (following, feeds, sharing) at launch.
**Alternatives considered:** Launch with lightweight social from day one.
**Rationale:** Social is a retention play, not an activation play. Nail the core loop (rate → learn → discover) first.
**Tradeoffs accepted:** Slower community growth in early months.
**Linked competency:** D

---

## #003 — April 19, 2026 — Chose Claude over OCR + NLP pipeline for bag scanning
**Decision:** Single Claude API call for image → structured data extraction.
**Alternatives considered:** Traditional OCR + NLP pipeline; Google Vision + entity extraction.
**Rationale:** Simpler architecture, better accuracy on varied bag designs, fewer integration points to maintain.
**Tradeoffs accepted:** Higher per-scan cost than traditional OCR.
**Linked competency:** A (AI Workflows)

---

## #004 — April 19, 2026 — Separated coffees (global catalog) from ratings (per-user)
**Decision:** Two tables — `coffees` and `ratings` — not a single combined table.
**Alternatives considered:** One table with user-specific fields.
**Rationale:** Enables community ratings, deduplication, and a shared coffee database that grows as users contribute.
**Tradeoffs accepted:** Requires fuzzy-matching dedup logic when multiple users scan the same coffee.
**Linked competency:** D

---

## #005 — April 19, 2026 — Created scans table to track extraction accuracy
**Decision:** Store raw AI extractions and user corrections in a separate `scans` table.
**Alternatives considered:** Only store the final confirmed coffee data.
**Rationale:** This is the eval dataset for improving the scanning pipeline over time. Without it, there's no measurable AI improvement loop.
**Tradeoffs accepted:** More storage, more schema complexity.
**Linked competency:** A, E (Feedback Loop)

---

## #006 — April 19, 2026 — Deferred monetization to Phase 4
**Decision:** No monetization attempts until September 2026 at earliest.
**Alternatives considered:** Early freemium tier; roaster partnerships from launch.
**Rationale:** Premature monetization kills consumer products. Prove the core loop and retention before extracting value.
**Tradeoffs accepted:** No revenue for 6+ months.
**Linked competency:** D

---

## #007 — April 19, 2026 — Decision log lives in repo as DECISIONS.md
**Decision:** Repo-based markdown file as source of truth for all decisions.
**Alternatives considered:** Notion page; separate doc; embedded in PRD.
**Rationale:** Version-controlled timestamps prove a decision was made before the outcome was known. Lives with the code, signals PM-engineering fluency.
**Tradeoffs accepted:** Less accessible for non-technical collaborators.
**Linked competency:** D

---

## #008 — April 24, 2026 — Interview incentive: bag of coffee for selected interviewees
**Decision:** Offer one bag of specialty coffee to anyone selected for a 30-min interview, contingent on selection (not on completing the screener).
**Alternatives considered:** $20 gift card to a roaster of their choice; no incentive.
**Rationale:** On-brand (we're building a coffee thing, so we give coffee), caps cost at the number of interviews actually conducted (~$125–175 for 5), signals the interviewer is a coffee insider rather than a market researcher buying signal.
**Tradeoffs accepted:** Slightly more fulfillment friction (manually ordering 5 bags vs. sending one gift-card link).
**Linked competency:** B (Voice of Customer)

---

## #009 — April 25, 2026 — Enabled automatic Row Level Security on Supabase
**Decision:** Turn on automatic RLS at project creation so every new table starts locked-down by default.
**Alternatives considered:** Leave RLS off (Supabase default for new projects); enable per-table manually as needed.
**Rationale:** Multi-user app with personal data (ratings, notes, taste profiles) requires per-user data isolation. Forcing the discipline of writing access policies for every new table from day one is easier than retrofitting after a leak. Demonstrates security-aware thinking for any future case study.
**Tradeoffs accepted:** Slightly more friction per new table — must write a policy before queries return data. Learning curve on RLS syntax.
**Linked competency:** D (artifact rigor); tangentially A (foundation for safe AI pipelines downstream)

---

## #010 — April 25, 2026 — Hardened .gitignore to exclude all .env variants
**Decision:** Add explicit ignore rules for `.env`, `.env.local`, and `.env.*.local` after Vite's default scaffold did not cover plain `.env`.
**Alternatives considered:** Trust Vite's defaults (caught at first commit attempt — would have leaked anon key).
**Rationale:** Secrets management hygiene is non-negotiable for a multi-service app (Supabase now, Anthropic API soon, more later). Explicit defense beats trusting any framework's defaults.
**Tradeoffs accepted:** None meaningful.
**Linked competency:** D; tangentially A (secret leaks in AI pipelines are a real production risk)

---

## #011 — April 25, 2026 — Use VITE_ prefix convention for client-exposed environment variables
**Decision:** Adopt Vite's `VITE_` prefix convention for any environment variable the React client needs. Server-only secrets (Anthropic API key, future service-role keys) will deliberately *not* use the prefix.
**Alternatives considered:** Use a generic prefix and remember which vars are safe for the client; expose all vars to the client.
**Rationale:** The prefix is a security firewall — Vite literally cannot expose a non-`VITE_` var to the browser bundle. Adopting the discipline now means future server-only secrets cannot accidentally leak to client code.
**Tradeoffs accepted:** None.
**Linked competency:** D, A

---

## #012 — April 25, 2026 — Made GitHub repo public to enable free Vercel deployment
**Decision:** Change `palato-app/palato-app` from private to public to qualify for Vercel's Hobby (free) tier.
**Alternatives considered:** Pay $20/mo for Vercel Pro; transfer repo from org to personal account; switch host to Cloudflare Pages or Netlify.
**Rationale:** Vercel Hobby deploys public org repos for free but gates private org repos behind Pro — a structural cost we didn't anticipate when creating the `palato-app` org for branding reasons. Public is the cheapest path with zero architecture changes. Doubles as a portfolio artifact: a documented public repo (PRD, brand guide, decisions, working code) is a stronger signal to a hiring manager than the same repo hidden. `.gitignore` already protects secrets. Reversible — visibility toggles back at any time.
**Tradeoffs accepted:** Code, documents, and commit history are publicly visible. Acknowledged trade we'd want to revisit if the project ever develops genuine competitive IP.
**Linked competency:** D (work-as-portfolio); also a small Competency C signal (cost-aware infrastructure choices)

---

## #013 — April 25, 2026 — Decided against bringing on a co-founder for Phase 0 and Phase 1.
**Decision:** I decided against it for Phase 0 and Phase 1.
**Alternatives considered:** Approaching Jono, Jeremy, or Matt about becoming co-founders; seeking a technical co-founder through the FaithTech network.
**Rationale:** The impulse was driven by confidence-seeking and isolation-avoidance, not by an unfilled strategic gap.
**Mitigation:** Build a scaffolding of thought partners (Jono, Matt, Jeremy) with defined, scoped engagement. Revisit after Phase 1 launch with evidence of where the actual gap is.
**Tradeoffs accepted:** All founder risk — blind spots, hard calls, accountability — lands on one person with no real-time pressure-test from a partner.
**Linked competency:** Founder self-awareness (outside the A–E set).

---

## #014 — April 26, 2026 — Adopted versioned SQL migrations via Supabase CLI for schema management
**Decision:** Manage all Supabase schema changes via versioned `.sql` files in `supabase/migrations/`, executed through the Supabase CLI. Schema design conversations happen in Claude.ai, schema spec is committed to the repo, migrations run via CLI.
**Alternatives considered:** Supabase SQL Editor (UI-driven, faster but no version control); raw SQL files run manually via psql.
**Rationale:** Version-controlled migrations are a Competency D artifact and standard professional practice. Every schema change becomes durable, reversible, reviewable, and visible to future hires or hiring managers reading the repo. Trade is ~10 min of one-time CLI setup.
**Tradeoffs accepted:** More setup overhead; schema changes now require a commit, not just a click.
**Linked competency:** D (Product Artifacts); also a small A (foundation for safe AI-pipeline data eval work).

---

## #015 — May 2, 2026 — Applied initial schema + v01 flavor taxonomy via Supabase CLI
**Decision:** Migrate the Phase 0 database schema and seed the 168-row flavor taxonomy as two versioned SQL files (`0001_initial_schema.sql`, `0002_seed_flavor_taxonomy.sql`), executed via `supabase db push`. This realizes Decision #014's commitment to versioned migrations.
**Alternatives considered:** Run schema as raw SQL in Supabase's SQL Editor (faster but bypasses the version-control commitment from #014); split migrations more granularly per table.
**Rationale:** Two migration files keeps schema and seed data as separate logical units while remaining a single coherent change set. Wrapping the seed in a transaction makes it atomic — either all 168 descriptors land or none do. The CLI workflow now becomes the only path for schema changes going forward, which is the discipline #014 was designed to enforce.
**Tradeoffs accepted:** ~30 minutes of CLI setup overhead (login, link, password retrieval) before any schema work could happen tonight; a more complex local toolchain than SQL Editor; one-time learning curve on `supabase migration list` / `supabase db push` semantics.
**Linked competency:** D (versioned migrations as a portfolio artifact); A (the `scans` table now exists with `model_version` and `prompt_version` columns, foundational for AI-pipeline eval work).

---

## #016 — May 2, 2026 — Adopted v01 flavor taxonomy as canonical schema input
**Decision:** Honor the prior `palato-coffee-attributes-v01.md` and `palato-flavor-taxonomy-v01.csv` work as the authoritative source for tonight's schema design, rather than improvising flavor-note storage from screener-round signal alone.
**Alternatives considered:** Improvise tasting-note storage from scratch (text arrays only, no controlled vocabulary); defer the SCA flavor wheel integration to v1.1.
**Rationale:** A previous Claude session produced a fully designed 168-descriptor taxonomy with category colors, aliases, defects flagging, and rationale documentation — work that almost got skipped in tonight's session. Catching that gap before writing the migration was a real save. The v01 design holds up: hierarchy via category/subcategory, descriptor uniqueness via slug, alias-based deduplication for scan extraction, defects flagged separately, and color/sort metadata baked in for future UI work. This decision also surfaces the broader pattern: prior project artifacts in the repo are durable; conversation context in Claude.ai chats is not. Always check the repo before designing.
**Tradeoffs accepted:** Tonight's schema is more complex than a minimal "ratings + tasting_notes text[]" shape would have been (3 extra tables: `flavor_descriptors`, `coffee_flavor_descriptors`, `rating_flavor_descriptors`, plus `descriptor_suggestions`). Worth it: the structured taxonomy enables aggregation, search, recommendations, and the user-contribution pipeline that no other coffee app has.
**Linked competency:** D (preserving and applying prior product artifacts); B (the `descriptor_suggestions` table is the user-contribution pipeline made concrete — first VoC feature in the schema itself).

---

## #017 — May 3, 2026 — Kept Supabase email confirmation enabled even with Google OAuth
**Decision:** Leave Supabase's "Confirm email" setting ON for sign-ups, even though Google OAuth already verifies email ownership.
**Alternatives considered:** Disable email confirmation since Google has already verified the email (Anthropic-recommended; reduces signup friction by ~1 step).
**Rationale:** Defense-in-depth. Even if a Google account is compromised, the second confirmation step adds a verification layer. Aligns with Jesse's instinct to keep the auth flow strict at v0.1; relaxing it later is easier than tightening.
**Tradeoffs accepted:** Slight onboarding friction (users see a confirmation email after signing in with Google). UX needs to handle "you signed in AND got an email" without confusing the user.

---

## #018 — May 3, 2026 — Configured Google OAuth as the sole auth provider for v0.1
**Decision:** Use Google OAuth via Supabase Auth as the only sign-in method for v0.1. No email/password fallback. Test mode in Google Cloud Console with explicit test-user whitelist.
**Alternatives considered:** Google + email/password (broader user coverage, more onboarding flows to maintain); Supabase magic-link email (no Google dependency, but adds a 60-second roundtrip).
**Rationale:** Specialty coffee enthusiasts skew tech-comfortable, so Google covers ~95% of the target audience. One auth path means one set of edge cases to handle, faster path to a working sign-in flow. Test mode means no Google verification process required (no privacy policy/ToS yet) while still allowing real interviewees to sign in.
**Tradeoffs accepted:** Users without a Google account (small minority) cannot sign in until we add email/password. The OAuth consent screen shows "Sign in to sroncfxyueuofcpzeztm.supabase.co" rather than "Palato" — looks unpolished but is fixable later via custom domain on Supabase Pro tier ($25/mo) or full Google verification. Test users must be explicitly whitelisted, which adds friction when scheduling interviews.
**Linked competency:** D (auth as a documented infrastructure choice, with explicit scope boundaries).

---

## #019 — May 4, 2026 — Locked visual design direction for v0.1: magazine-spread aesthetic
**Decision:** Replace the brand guide's recommended Fraunces display face with **Instrument Serif** (Google Fonts, free) for working display headings. Keep **Boldonse** for the "Palato" wordmark only. **Geist** stays as body. Light-to-dark category ordering with **Fermented & Funky promoted to position #3** (the descriptors inside it skew bright/fruit-derived, not heavy). **Body & Mouthfeel separated visually** as its own perceptual register (italic title, *feel* divider above). The aesthetic register is magazine-spread (Apartamento, Drift Magazine) — asymmetric hero, oversized italic headlines, paper-grain background, Ember as eyebrow accent.
**Alternatives considered:** Stay with Fraunces (rejected — read as "1990s wine professor" in practice, despite reading well in the brand guide); zine/poster aesthetic (too rough for a product UI); coffee-shop chalkboard aesthetic (too informal); pill-grid layout (mockup B — felt more product-shaped but less editorial).
**Rationale:** The brand guide's "Black Keys came by my coffee shop" voice didn't survive Fraunces in execution — the typeface read literary rather than confident. Instrument Serif sits in the same editorial-magazine register but reads modern rather than academic. Boldonse as wordmark-only is the right scope for that font (it's too aggressive for working display use). The Body & Mouthfeel separation reflects a real taxonomic distinction: flavor (gustatory) vs. mouthfeel (tactile) are different perceptual systems and shouldn't render as siblings.
**Tradeoffs accepted:** The brand guide v01 is now formally out of sync with the live UI on the typography decision. Brand guide v02 will need to be updated to reflect Instrument Serif as the working display face. Mobile responsiveness has not been pressure-tested — the asymmetric hero and 240px sticky meta column will need reworking at narrow widths.
**Linked competency:** D (design direction documented as a deliberate departure from the brand guide, with rationale); B (the "wine professor" rejection was a real Voice-of-Self check — the founder's own taste as a sample of one).

---

## #020 — May 4, 2026 — Deferred flavor wheel UI to the rating flow
**Decision:** The logged-in homepage taxonomy view renders as a flat reference list (categories → subcategories → descriptors). The interactive flavor wheel — the canonical SCA wheel as a tappable SVG — is deferred to the rating flow as its own focused build.
**Alternatives considered:** Build the wheel now as the primary taxonomy display on the homepage (rejected — overscope for tonight, and the wheel has no job to do on a reference page).
**Rationale:** A flavor wheel is a *judgment-making* UI, not a *reference* UI. On the homepage, the user is seeing "here is the language we use." In the rating flow, the user is making active choices about what they tasted — that's where the wheel earns its complexity. Building it on the homepage means half-implementing the rating-flow interaction without the data model behind it. Better to wait until the wheel has a job.
**Tradeoffs accepted:** Homepage doesn't visually showcase the wheel structure interviewers might expect to see in a "Vivino for coffee" demo. Mitigation: the categorized list still communicates the structure (Fruit → Berry → Blueberry/Blackberry/Raspberry…) — just statically.
**Linked competency:** D (scope discipline made explicit); A (correctly placing the wheel as a rating-flow UI puts it in the AI-enabled-workflow path, where descriptor selection becomes data the recommendation engine reads).

---

## #021 — May 4, 2026 — Built admin-only coffee entry form as catalog-seeding bridge to AI scan flow
**Decision:** Build a simple admin-gated form to manually populate the coffees catalog with bag image upload. Image uploads land in Supabase Storage (`bag-images` bucket); coffee records land in `coffees` with a `bag_image_url` column added via migration `0003_add_bag_image_to_coffees.sql`. Admin gate is enforced two ways: client-side via `VITE_ADMIN_EMAILS` env var (UI hiding) and server-side via Storage policy hardcoded to `jesse@palato.coffee` (security boundary).
**Alternatives considered:** Hand-seed coffees via SQL migrations (faster tonight, but requires editing migration files for every new coffee — friction for catalog growth); build the full AI bag-scanning pipeline (the eventual right answer, but a 4-6 hour focused build that deserves its own session for proper prompt versioning, eval design, and human-in-the-loop correction tracking — would have been rushed in tonight's window); skip catalog population entirely (would leave interviewees seeing an empty catalog).
**Rationale:** Manual entry tonight unblocks catalog population *now* without compromising the AI scan flow's career-artifact value. The form's plumbing — image upload to Storage, public URL retrieval, insert into `coffees` — is the same pattern the eventual scan flow will use, so it's not throwaway code; it's the manual-correction fallback that any production AI extraction pipeline needs anyway. Defers Competency A milestone (bag-scanning prompt + eval design) to a focused future session where it can be done with proper rigor.
**Tradeoffs accepted:** Storage policy hardcodes `jesse@palato.coffee` — brittle if Jesse changes emails or adds admins; should migrate to `profiles.is_admin boolean` checked by the policy. Form UI is functional but unstyled (admin-only, low-priority). Policy is not in version control (lives in Supabase dashboard only) — exception to Decision #014's migration discipline because Storage policies aren't supported by the migrations workflow yet.
**Linked competency:** D (catalog infrastructure documented as a deliberate bridge artifact, not a workaround); A (the manual entry form is the fallback layer the AI scan pipeline will need for human-in-the-loop correction).

---

## #022 — May 18, 2026 — Standardize bag photo input to square crops going forward
**Decision:** All bag photos added through the AddCoffeeForm (and eventually the bag-scan flow) should be square-cropped (1:1) at the upload step. Square crops match the existing `aspect-ratio: 1/1` styling on browse view cards and avoid awkward auto-cropping that loses the top/bottom of portrait bag photos.
**Alternatives considered:** Change the card aspect ratio to portrait (3:4 or 4:5) to fit natural bag photo dimensions; let images render in their natural aspect ratio without cropping. Both alternatives push complexity into the UI rather than the data — every render of every coffee photo across the entire app would need to handle variable-aspect images.
**Rationale:** Standardizing the *input* makes the *output* predictable everywhere — browse cards, eventual coffee detail page, eventual rating flow card, eventual journal thumbnail. One constraint at upload time, simpler everywhere downstream. Square crops also force more deliberate framing (center the bag in the photo) which improves catalog visual consistency.
**Tradeoffs accepted:** Manual cropping adds an upload step. Coffees already in the catalog have non-square images that remain awkwardly cropped until re-uploaded — captured as tech debt.
**Linked competency:** D (design constraint documented so future contributors don't reinvent the call).

---

## #023 — May 18, 2026 — Rating scale: decimal 1.0-5.0 input (Vivino-style)
**Decision:** Users enter ratings on a continuous 1.0-5.0 scale with one decimal place (4.2, 3.8, 4.7, etc.). Match Vivino's input pattern. Schema migration required: change `ratings.rating` from `smallint check (between 1 and 5)` to `numeric(2,1) check (between 1.0 and 5.0)`.
**Alternatives considered:** Whole-star input only (simpler UI, less expressive); half-star input with decimal aggregates (closer to early Vivino but less granular); 1-10 scale (more granular but loses the 5-star familiarity).
**Rationale:** Decimal granularity captures real preference distinctions ("this is a 4.3, not a 4 — it's better than the average 4 but not as good as the 4.5s"). Specialty coffee enthusiasts, like Vivino users, often have strong opinions about the difference between a 4.0 and a 4.3 cup. Single decimal place keeps the cognitive load manageable (10× the granularity of whole stars; not 100× like full numeric).
**Tradeoffs accepted:** UI requires a continuous input (slider or fine-grained selector) rather than 5 simple star buttons — more code, more design care. Schema migration needed before the rating flow can ship.
**Linked competency:** D (rating scale documented as a deliberate design choice with reference to a known reference product).

---

## #024 — May 18, 2026 — Rating input is a horizontal slider for v0.1
**Decision:** The decimal rating input (1.0–5.0, one decimal place, per #023) is a native HTML range slider with the value displayed beside it in large italic serif. The slider position defaults to 3.0 visually but the rating value is null until the user interacts; submit stays disabled until the slider is touched.
**Alternatives considered:**
- Vivino-style dial/wheel with haptic feedback (mobile gestures, more tactile, closer to the reference product)
- 5 tap-stars + a fine-tune slider/stepper underneath (hybrid coarse + fine)
**Rationale:** The dial is the destination but requires a custom component, gesture handling, and accessibility work that doesn't pay off without user data. The slider ships tonight, works on all input modes, and is replaceable.
**Tradeoffs accepted:** Native range styling is browser-default ugly. Tech-debted for a styled track + thumb pass.
**Linked competency:** D (input design documented as deliberate v0.1 → v1.1 sequence).

---

## #025 — May 18, 2026 — Flavor descriptor selection is type-to-filter chips for v0.1
**Decision:** The rating form surfaces all 168 descriptors as toggleable chips, color-coded by category, with a single search input that filters by descriptor name, category, subcategory, or alias. Chips are grouped by category with small headers for scannability. No category-first navigation, no "popular" chips section.
**Alternatives considered:**
- Category-first navigation (tap a category → see its chips, like a flavor wheel)
- Both: search bar plus persistent category browser
**Rationale:** Search-and-filter is one good component. Iterate from real user behavior — if users struggle to find descriptors without category navigation, add it in v1.1.
**Tradeoffs accepted:** 168 chips is visually heavy on first render. Acceptable cost for the speed of build and the discoverability advantage over hidden-by-default search.
**Linked competency:** B (taxonomy UX as testable design choice).

---

## #026 — May 18, 2026 — Post-submit confirmation interstitial with auto-redirect
**Decision:** Submitting a rating shows a brief interstitial — "Logged." in italic ember serif, plus a dynamic stat ("That's coffee #X for you") — then auto-redirects to the browse view after 2 seconds.
**Alternatives considered:**
- Snap back to coffee detail page (problem: detail doesn't surface user's rating yet)
- Snap back to browse without ceremony
**Rationale:** Submission is the most important interaction in the app. It deserves a moment of acknowledgement that gestures at user progress. v0.1 framing is minimal but the *direction* matters: this is the seed of a Whoop-style "your palate is getting sharper" insight surface that should grow over time.
**Tradeoffs accepted:** 2-second forced wait isn't optional. Users who hate it will tell us. Adjust to 1.5s or add a "skip" affordance based on feedback.
**Linked competency:** E (feedback loop as product — this is the user-facing receipt that the rating system is alive).
**Linked next-action:** Long-term direction is a Whoop-for-coffee insight panel — flavor profile evolution, palate-sharpening signals, evidence the app is doing something for the user. The interstitial is the seed, not the destination.

---

## #027 — May 18, 2026 — Split rating sensory input into "How did it taste?" vs "How did it feel?"
**Decision:** Future versions of the rating form will split the sensory section into two distinct questions:
- **"How did it taste?"** — flavor descriptors only (fruity, floral, sweet, nutty, spices, roasted, sour/fermented, and **defects/off-flavors elevated to this section**). Defects are flavor characteristics and belong here, not hidden.
- **"How did it feel?"** — body/mouthfeel descriptors (full-bodied, silky, drying, astringent, etc.). Tactile, not flavor.
**Alternatives considered:**
- Keep all 10 categories under one "What did you taste?" section (current v0.1 — what's live now)
- Hide defects entirely
**Rationale:** Aligns with the SCA cupping form's structural distinction between taste and tactile. Separating them produces cleaner downstream data — flavor preference and body preference are different signals worth tracking independently. Defects are taste data and should be promoted, not hidden in a scroll.
**Tradeoffs accepted:** Two sections is more visual weight than one. Descriptors need a structural grouping field beyond `category` — could be inferred from category name (treat "Body/Mouthfeel" specially) or stored as a new `sensory_type` column ('taste' | 'feel').
**Linked competency:** B (taxonomy structure as deliberate UX choice).
**Linked next-action:** When the merged-prose-with-detection form (#028) is built, this taste/feel split is built with it.

---

## #028 — May 18, 2026 — Long-term direction: merged prose + auto-detected descriptors
**Decision:** The rating form's tasting input will evolve from "type prose + tap chips separately" to a single Vivino-style textarea that detects flavor descriptors inline as the user writes. Matched words highlight in their category color and auto-record into `rating_flavor_descriptors`. Tap a highlight to unselect. Chip browser remains as a fallback for descriptors the user didn't write about (especially defects, which users may not voluntarily use in prose).
**Alternatives considered:**
- Keep separate prose + chips (current v0.1)
- Replace chips entirely with inline detection (would miss descriptors users don't write about)
**Rationale:** The natural way a coffee drinker describes a cup is as a sentence. The system should extract structure from natural language, not force the user to translate their experience into two formats. Closer to how Vivino handles wine descriptors. Bonus: produces richer data (raw prose + structured tags from the same input) which is exactly the kind of text-to-structured workflow Claude can refine over time.
**Tradeoffs accepted:** Real engineering lift — tokenization, multi-word phrase matching ("cane sugar" → "cane sugar" descriptor), alias matching, stem matching ("lemony" → "lemon"), and either a contenteditable or styled-textarea-with-overlay for inline highlighting. Not a v0.1 fit.
**Linked competency:** A (AI-enabled workflows — text-to-structured-tags is exactly the kind of thing Claude could power and we could measure accuracy on, parallel to bag scanning).
**Linked next-action:** v1.1+. The v0.1 form proves users want to capture flavor data; #028 makes the capture feel native.

---

## #029 — May 18, 2026 — Custom radial dial replaces the slider in v0.1.1
**Decision:** Replaced the native HTML range slider with a custom SVG-based radial dial component (`RatingDial.tsx`). The dial sweeps 270° from bottom-left (min) to bottom-right (max), with integer tick marks, an Ochre→Ember gradient on the filled portion, and the value displayed in the center. Built using SVG arcs + Pointer Events with pointer capture for unified mouse/touch handling.
**Alternatives considered:**
- Stay with the native slider and add a scale visualization behind it (Decision #024's path)
- Defer the dial to v1.1+ as originally planned
**Rationale:** First-user feedback was immediate and specific — the slider "lacks scale" and "feels too naked." A custom dial gives both the visual gradation AND the emotional weight the rating moment deserves. This is the atomic action of the entire product; it earns the engineering investment now rather than later.
**Tradeoffs accepted:**
- No keyboard support yet (mouse/touch only — accessibility debt)
- No haptic feedback (mobile)
- Single linear gradient — not the multi-stop Vivino has
- v0.1 polish, not v1.0 polish — will need visual iteration
**Linked competency:** D (custom component shipped tonight, design rationale documented).
**Linked next-action:** Iterate visual treatment; add keyboard support; add haptic feedback on mobile.

---

## #030 — May 18, 2026 — Ship Journal view in v0.1 to close the rating loop
**Decision:** Built a Journal ("Your journal / The cups.") view as the third top-nav item between Coffees and Flavors. Reverse-chronological feed of the user's own ratings with coffee context, rating value, optional tasting notes, and selected descriptor chips. Hero stat shows ratings count, unique roasters, total flavor notes, first-rating date.
**Alternatives considered:**
- Wait for the next session (original plan)
- Build it as "My Coffees" in the user's profile area only (more hidden)
**Rationale:** Without the Journal, the rating flow is open-loop — users rate but can't see their own data. The interstitial's "coffee #X for you" copy implies a history the user can't navigate to. Journal closes that loop and validates the persistence work that shipped earlier in the session.
**Tradeoffs accepted:** Cards aren't clickable yet, no edit/delete, no filters or sort. All tech-debted.
**Linked competency:** D (third user-facing view shipped tonight).
**Linked next-action:** Tap-to-detail once CoffeeDetail surfaces the user's own rating; edit/delete; filter by rating/roaster; group by week or month.

---

## #031 — May 18, 2026 — Surface user's latest rating on CoffeeDetail; allow multiple ratings per coffee
**Decision:** The CoffeeDetail page now shows the user's most recent rating (value, date, notes, descriptors) above the Rate button in a left-bordered ember block that visually distinguishes "your data" from the coffee's public facts. When a prior rating exists, the CTA flips from "Rate this coffee" → "Rate it again," and submitting creates a new rating row rather than updating the old one. Journal cards become clickable and navigate to coffee detail. Multiple ratings per user per coffee are explicitly supported.
**Alternatives considered:**
- One rating per user per coffee, with edit-in-place (would require update logic, a unique constraint, and a "are you sure you want to overwrite?" UX)
- Show all the user's ratings of this coffee inline on detail page (richer but visually noisy at low counts)
**Rationale:** Coffee changes — the bag oxidizes, your brew method evolves, your palate shifts. Locking a user to one rating per coffee misrepresents how people actually experience the same bag over a week. Each rating is a moment-in-time event; the journal preserves the full history; the detail page surfaces the latest as the "current sentiment." This matches Vivino's model for repeat-tasted wines.
**Tradeoffs accepted:** Detail page shows only the latest, not the user's full per-coffee history. Surfacing per-coffee history is its own design problem (could be a small "you've rated this 3 times" pill that expands) — deferred.
**Linked competency:** D (loop-closing product decision, schema interpreted as a feature).
**Linked next-action:** "View all your ratings of this coffee" pill on detail when count > 1; eventual edit/delete affordances on past ratings.

## #032 — May 22, 2026 — Anthropic API calls routed through a Vercel serverless function (server-side relay)
**Decision:** All Anthropic API calls (starting with bag-scan extraction) go through a server-side relay implemented as a Vercel Function in the existing repo (`/api`), not from the browser. The Anthropic API key is stored as a non-`VITE_`-prefixed Vercel environment variable so it never enters the client bundle. Requests are authenticated by passing the caller's Supabase session token to the function and verifying it server-side.
**Alternatives considered:** Supabase Edge Function (Deno runtime, separate CLI deploy, separate secrets store, but tighter native Supabase auth integration); calling Anthropic directly from the browser (rejected outright — exposes the secret key, violates Decision #011's `VITE_` firewall).
**Rationale:** Vercel Functions add zero new toolchain — same repo, same Node/TypeScript language, same git-push deploy, secrets in the same Vercel settings already in use. The Edge Function's one real advantage (native auth context) is outweighed by introducing a second deploy pipeline, a second secrets location, and the Deno dialect all at once, for a builder still ramping on dev workflows. The token-verification wiring is minor and reusable across all future users (it's authentication, not admin-specific authorization). Also a cleaner architecture to explain in an interview: client → own API route → Anthropic, key never touches the browser.
**Tradeoffs accepted:** Must manually pass + verify the Supabase session token in the function (Edge Functions would do this more natively). First server-side component in Palato — introduces a backend surface that didn't exist before.
**Reversibility:** Two-way door. The relay is self-contained; moving it to a Supabase Edge Function later (if backend logic consolidates in Supabase) is a contained change, not a rewrite.
**Linked competency:** A (foundation of the AI scan pipeline); D (documented infrastructure choice with explicit reversibility framing).

## #033 — May 22, 2026 — Bag-scan extraction pulls all visible fields; raw tasting notes stored as text; taxonomy matching deferred
**Decision:** The bag-scan prompt extracts every field visibly printed on the bag — roaster, coffee name, origin country/region, producer, farm, variety, elevation, processing method, process detail, roast level, roast date, weight, price — into the existing structured `coffees` columns. The roaster's printed tasting notes are stored as raw text in `roaster_tasting_notes_raw`. Auto-matching those printed notes to the structured 168-descriptor taxonomy (`coffee_flavor_descriptors`) is explicitly deferred.
**Alternatives considered:** Core identity fields only (roaster, name, origin, process, roast) — rejected as needlessly conservative, since the schema columns already exist and the marginal prompt cost of more fields is near zero; full extraction *including* auto-matching printed notes to the taxonomy — deferred because note-to-descriptor matching is a separate, harder normalization problem that can corrupt structured data when wrong, and overlaps with the already-deferred inline-detection work in Decision #028.
**Rationale:** Broad extraction is nearly free (one prompt, columns already present), enriches the catalog, and *improves the eval* — per-field accuracy across many fields is a stronger Competency A artifact than accuracy on five. The taxonomy-matching step is the genuinely hard, error-prone part and earns its own focused build later. Storing raw notes now preserves the data losslessly for that future matching pass.
**Tradeoffs accepted:** More extracted fields = more surface for hallucination (inventing an elevation or varietal not printed). Mitigation: the extraction prompt must instruct strict visible-only extraction — null when absent, never infer or guess — and hallucination rate becomes an explicit eval dimension alongside per-field accuracy.
**Linked competency:** A (extraction breadth + eval design); D (scope call documented with alternatives).

## #034 — May 22, 2026 — Global shared catalog during beta (revisit after beta)
**Decision:** During the beta-user phase, Palato runs a single global coffee catalog that any user can contribute to via the scan/add flow — not per-user private catalogs, and not an admin-only catalog that depends solely on Jesse. This is explicitly a beta-phase choice, not the permanent model.
**Alternatives considered:** Admin-only catalog (Jesse curates every coffee — a bottleneck, and it surrenders the chance to observe real contribution behavior); per-user private catalogs (no shared data, which defeats the community-ratings and dedup value the two-table design in Decision #004 was built for).
**Rationale:** A shared catalog during beta is itself a learning instrument — watching how real users contribute coffees teaches more about actual user behavior than any amount of solo curation, and that learning has genuine value in the prototype phase. Letting users populate the catalog also surfaces the messy edges (duplicates, partial entries, sloppy corrections) early, while the stakes are low.
**Tradeoffs accepted:** The deduplication / canonical-entry problem (PRD open question #4, Decision #004's fuzzy-matching note) goes deliberately unsolved during beta — duplicate coffee records are likely and accepted. Eval ground-truth also gets noisier once non-expert users correct scans rather than Jesse alone (ties to Decision #033's eval design, where Jesse-as-validator is the clean ground-truth source).
**Reversibility:** Two-way door, time-boxed. The contribution model is revisited after beta; the long-term answer (canonical entries, dedup, who can write to the global catalog) is the deferred piece, not the global-vs-private question.
**Linked competency:** B (user contribution behavior as Voice-of-Customer signal); D (product call documented with an explicit expiry).
**Linked next-action:** Post-beta, design the dedup / canonical-coffee model before opening the catalog beyond the beta cohort.

## #035 — May 23, 2026 — Defer web-augmentation of scanned bag data to v1.1 (incl. price → average-cost feature)
**Decision:** The bag-scan pipeline extracts only what is visible on the bag (per #033). Augmenting that with web data — the roaster's product page, etc. — is deferred to v1.1. The highest-value target is **price**, which would enable a Vivino-style "average cost" signal (Vivino shows average bottle price; Palato could show typical bag price) — a strong user-value and monetization hook.
**Alternatives considered:** Build augmentation into v1 now (richer catalog immediately, but adds per-scan API cost and an entity-matching problem); never augment (loses price/origin/process enrichment that many bags don't print).
**Rationale:** Two unknowns gate it. (1) Cost — web search adds search calls + result tokens to every scan; must be measured, not assumed. (2) Matching risk — a roaster has many similar coffees, and pulling the *wrong* one's data yields confident-but-wrong fields, worse than a clean null. For v1, the human-in-the-loop form is the enrichment path (admin fills website-only fields by hand), which carries neither risk. Augmentation becomes a v1.1 experiment gated by its own cost + accuracy eval.
**Tradeoffs accepted:** v1 won't auto-capture website-only fields for bags that don't print them; the human fills these.
**Linked competency:** A (future augmentation experiment with its own eval); C (price → average-cost insight → monetization, ties to #006).
**Linked next-action:** v1.1 — measure per-scan cost of augmentation and the wrong-match rate before committing.

## #036 — May 23, 2026 — Treat coffee_name as a human-canonicalized field, not a prompt target
**Decision:** The bag-scan extracts a best-guess coffee_name from the most prominent name-like text on the bag; the human canonicalizes it in the review step. We will NOT prompt-engineer to "fix" coffee_name, because there is no consistent right answer extractable from the bag alone.
**Evidence:** Three bags, three roasters (Be Bright, Heart, Prodigal). The bag's prominent name matched Jesse's canonical preference only once (Prodigal → "Finca Las Delicias"). The others he'd canonicalize differently — "Honduras Benjamin Paz La Salsa" (origin + producer + bag name), "Nelson Flores" (producer). Roasters name inconsistently: by producer, region, farm, lot, product line, or fanciful name.
**Consequence for the eval:** coffee_name corrections must be read as *inherent ambiguity*, not prompt weakness. Its per-field correction rate measures a human-judgment field, not prompt quality. Keep this category of correction separate from prompt-fixable ones.
**Alternatives considered:** Aggressive coffee_name prompting (no consistent ground truth to aim at); multi-candidate name extraction surfaced to the human (possible future aid, deferred).
**Open thread:** Jesse's canonicalization leans composite (origin + producer + name). Worth exploring whether Palato's coffee *identity* should be a derived composite of structured fields rather than a single free-text "name" — to be tackled with the parked canonical-identity / dedup question (#004, open Q4).
**Linked competency:** A/B (eval-framework refinement: separating ambiguity corrections from prompt-weakness corrections).

---

## #037 — May 24, 2026 — Palate Dashboard: presentation-first build on mock data

**Decision:** Build the full Palate dashboard — 7 modules (fingerprint radar, roast/process sweet spots, origins, palate evolution, recommendation, stats strip), typed data contract (`PalateProfile`), cold-start/maturity states, editorial reads — on a mock data layer before real ratings exist. The mock adapter (`getPalateProfile`) is the single seam; swapping it for a Supabase aggregation query touches no component code.

**Alternatives considered:** Wait for real rating data and then design the views around what exists (loses the back-design payoff — the output surface wouldn't constrain the input flow); build a minimal version with fewer modules (loses the cold-start design, which is the hardest part to retrofit).

**Rationale:** Designing the output surface first back-designs the data requirements for the rating flow. Every field in the `PalateProfile` type — fingerprint axes (from `rating_flavor_descriptors` rolled up to family), roast/process buckets (from `coffees` joined to `ratings`), origins, evolution points — maps to a specific aggregation the rating flow must produce. Cold-start states (full/forming/locked per module, with tunable thresholds) are designed into the architecture rather than retrofitted, which matters because the dashboard must never fake precision it hasn't earned. The editorial reads ("charts that talk") come from the data layer, not components, leaving a clean seam for Claude-generated copy later.

**Technical choices:** Recharts (SVG, React-idiomatic, themeable to brand tokens). All brand colors centralized in `palateTheme.ts` — zero hex literals in components. Maturity thresholds centralized in `maturity.ts` — components never hardcode numbers. Instrumentation stubs (`palate_viewed`, `palate_recommendation_clicked`) fire via a no-op `track()` utility to capture the dashboard's success question (does seeing the palate pull users back into rating?) from day one.

**Tradeoffs accepted:** Mock data could diverge from what real aggregations produce; the data contract may need revision once real queries land. Recharts adds ~120KB to the production bundle (acceptable for SVG chart quality over canvas). The headline text ("Bright & fruit-forward" / "Taking shape") is currently derived from maturity state in the component rather than from a data field — captured as tech debt.

**Linked competency:** A (presentation layer for future Claude-generated copy — `summary` and `recommendation.reason` are the seams); C (instrumentation stubs for dashboard-view → next-rating conversion measurement); D (spec-driven build with typed contract, mock → real swap designed in).

**Note:** CLAUDE.md references a Decision #037 for scan endpoint auth verification (`/api/scan` session token check) that was never logged in this file. That decision predates this one chronologically. Jesse: backfill it or renumber.