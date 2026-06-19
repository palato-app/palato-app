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

## #037 — May 23, 2026 — Scan endpoint requires authenticated Supabase session

**Decision:** The `/api/scan` Vercel serverless function verifies the caller's Supabase session token before forwarding the image to Claude. Unauthenticated requests are rejected with 401. The function extracts the `Authorization: Bearer <token>` header, calls `supabase.auth.getUser(token)` server-side, and only proceeds if it resolves to a valid user.

**Alternatives considered:** No auth check (rejected — would allow anyone with the endpoint URL to burn Anthropic credits); API-key-based auth (adds a separate credential to manage, misaligned with the existing Supabase auth flow); admin-only gating (too restrictive — Decision #034 opens the catalog to all beta users, so the scan endpoint must serve them too).

**Rationale:** The scan endpoint holds the Anthropic API key (Decision #032). Without auth verification, it's an open relay to a paid API. Supabase session tokens are already present on the client (the user is logged in), so passing them through is zero additional UX cost. Server-side verification via `getUser()` is the Supabase-recommended pattern — it validates the JWT against the auth server rather than trusting a client-decoded token.

**Tradeoffs accepted:** Adds a server-side Supabase client dependency to the Vercel function (the `service_role` key, stored as a non-`VITE_` env var). The auth check adds ~50ms latency per scan request.

**Linked competency:** A (securing the AI pipeline endpoint); D (infrastructure decision documented).

---

## #038 — May 24, 2026 — Palate Dashboard: presentation-first build on mock data

**Decision:** Build the full Palate dashboard — 7 modules (fingerprint radar, roast/process sweet spots, origins, palate evolution, recommendation, stats strip), typed data contract (`PalateProfile`), cold-start/maturity states, editorial reads — on a mock data layer before real ratings exist. The mock adapter (`getPalateProfile`) is the single seam; swapping it for a Supabase aggregation query touches no component code.

**Alternatives considered:** Wait for real rating data and then design the views around what exists (loses the back-design payoff — the output surface wouldn't constrain the input flow); build a minimal version with fewer modules (loses the cold-start design, which is the hardest part to retrofit).

**Rationale:** Designing the output surface first back-designs the data requirements for the rating flow. Every field in the `PalateProfile` type — fingerprint axes (from `rating_flavor_descriptors` rolled up to family), roast/process buckets (from `coffees` joined to `ratings`), origins, evolution points — maps to a specific aggregation the rating flow must produce. Cold-start states (full/forming/locked per module, with tunable thresholds) are designed into the architecture rather than retrofitted, which matters because the dashboard must never fake precision it hasn't earned. The editorial reads ("charts that talk") come from the data layer, not components, leaving a clean seam for Claude-generated copy later.

**Technical choices:** Recharts (SVG, React-idiomatic, themeable to brand tokens). All brand colors centralized in `palateTheme.ts` — zero hex literals in components. Maturity thresholds centralized in `maturity.ts` — components never hardcode numbers. Instrumentation stubs (`palate_viewed`, `palate_recommendation_clicked`) fire via a no-op `track()` utility to capture the dashboard's success question (does seeing the palate pull users back into rating?) from day one.

**Tradeoffs accepted:** Mock data could diverge from what real aggregations produce; the data contract may need revision once real queries land. Recharts adds ~120KB to the production bundle (acceptable for SVG chart quality over canvas). The headline text ("Bright & fruit-forward" / "Taking shape") is currently derived from maturity state in the component rather than from a data field — captured as tech debt.

**Linked competency:** A (presentation layer for future Claude-generated copy — `summary` and `recommendation.reason` are the seams); C (instrumentation stubs for dashboard-view → next-rating conversion measurement); D (spec-driven build with typed contract, mock → real swap designed in).

---

## #039 — May 24, 2026 — Dashboard voice: grounded and educational over dramatic; report patterns, never manufacture causation

**Decision:** The palate dashboard's editorial copy states observed patterns in the user's own rating data, plainly and specifically. Where it teaches, it uses only verifiable, sourced coffee facts (e.g., natural processing yields more fruit character) — never model-generated statistics. It does not assert causation the data can't support; instead it surfaces confounds and, where useful, suggests an experiment.

**Alternatives considered:** The original punchy/poetic voice (rejected as performative and, in the Brazil case, factually overreaching — "Ethiopia is home" asserts identity from a sample; "you've never loved a Brazil" manufactures causation when the confound is roast level); fully LLM-generated educational facts (rejected — unsourced model output risks shipping confident-but-false coffee claims, brand-poison for a roaster-built product).

**Rationale:** Palato's edge is that a real roaster built it; accuracy is the brand. Copy that interprets the user's own data is grounded by definition; external facts must come from a verified source or retrieval, not free-form generation. Reporting patterns rather than causes keeps the product honest and more useful — "origin and roast are tangled here; a light-roast Brazil would settle it" is both more accurate and more actionable than "you've never loved a Brazil."

**Tradeoffs accepted:** Less viral-quotable copy; the educational layer needs a verified knowledge source before the v1.1 dynamic-copy feature can generate it safely.

**Linked competency:** A (dynamic-copy generation + grounding eval — the seam for Claude-generated copy now has a quality bar: grounded, sourced, pattern-not-cause); D (artifact — voice principles documented as a product decision, not a style preference). Also amends the Brand Guide voice section: in data/insight surfaces, lead with grounded specificity over performance.

---

## #040 — May 25, 2026 — Palate dashboard: progression-gated with real data, mock as opt-in preview

**Decision:** Replace the mock-data-first Palate dashboard (Decision #038) with a progression-gated experience powered by real user data. The screen itself is locked until 3 coffees are rated. Once unlocked, all modules are visible but individually gated — locked modules show dashed-border teasers ("X more coffees to unlock") rather than hiding. Mock data remains available as an opt-in "Preview with sample data" toggle, not the default view. Lowered thresholds from #038: fingerprint forming at 3 (full at 15), sweet spots at 5, origins at 5, evolution at 10+2 weeks, recommendation at 8.

**Alternatives considered:** (1) Keep mock data as default with a "your data" toggle — rejected because it undermines the earn-it loop; users see the payoff before investing, so there's no pull to rate. (2) Add badges and notifications to drive engagement — deferred; assumes extrinsic motivation without user signal. The specialty coffee audience may be more motivated by intrinsic insight ("I didn't know I scored naturals a full star higher") than by gamification. User interviews will test this.

**Rationale:** The core product loop is: rate with clarity → earn insight → see patterns you didn't know you had → want to rate the next one more carefully. The progression system makes this loop explicit — every rating visibly moves you closer to the next unlock. The contract with the user is: you invest clarity, we invest insight. Showing mock data by default broke this contract by giving away the payoff for free. The "all visible, locked teasers" approach (vs. progressive reveal) was chosen so users see the full roadmap of what they're building toward from day one.

**Open questions for user interviews:** "What would cause you to log a coffee monthly, weekly, or daily? What would you look for each time?" — the answer directly informs whether these thresholds reward or frustrate, and whether the lever for engagement is motivation (badges) or value (better insights earlier).

**Tradeoffs accepted:** Thresholds are hypothesis-level, not data-validated. If users stall at a particular tier, the fix might be lowering the threshold, making early modules more compelling, or adding nudges — unknown until real usage data and interviews land. The real aggregation is computed client-side from the full ratings query; this will need optimization if rating counts grow large.

**Linked competency:** B (the interview question about engagement frequency is a structured VoC input — the first question designed to inform a specific product decision); C (progression thresholds are measurable — track where users stall to validate or revise); D (decision documents the earn-it philosophy as a product principle, not just a UI choice).

---

## #041 — May 25, 2026 — Match-on-scan dedupe: fuzzy-match the catalog before inserting a new coffee

**Decision:** After the bag-scan pipeline extracts a coffee (and on the manual-entry Save path), fuzzy-match the proposed `(roaster_name + coffee_name)` against the existing `coffees` catalog using `pg_trgm` trigram similarity, via a new `match_coffees(query, match_limit, min_similarity)` Postgres function. The client interprets results in three bands: **strong match (similarity ≥ 0.8)** skips the Add form entirely and routes the user to the existing CoffeeDetail with "Rate it" primed; **ambiguous (0.5–0.8, or multiple weak hits)** presents up to three candidate cards alongside the scanned bag photo for visual disambiguation, plus an explicit "None of these — add new" escape; **no match (< 0.5)** falls through to the current Add form, pre-filled. The bag image the user just scanned sits next to the candidate(s) so they can visually confirm before accepting.

**Alternatives considered:** (1) *Search-first gate before Add* — require users to search the catalog before reaching the Add form. Rejected: punishes the happy path, asks users to do work they've already done (the scan IS the search), and breaks the one-shot flow of scan → rate. (2) *Save-time-only check with warning modal* — let the user fill in the Add form, then warn on Save if a dupe exists. Rejected as the primary intervention: still wastes the user's time filling a form for what's actually a duplicate, and squanders the structured signal the scan already produced. Retained as a secondary safeguard for the manual-entry path where there's no scan to leverage. (3) *No-op (status quo)* — rejected because a 5-coffee catalog has already produced 3 duplicates of the same Sey Coffee "Los Naranjos" row; the failure mode will compound brutally as the catalog grows. (4) *Exact-match unique constraint on (roaster, name)* — rejected because the actual failure mode is *near*-duplicates (punctuation/accent drift, "Antiquia" vs "Antioquia"), which a unique constraint wouldn't catch and which would cause arbitrary insert failures with no path to recovery.

**Rationale:** The scan IS the search. After Claude extracts `roaster_name + coffee_name`, the dedupe lookup is a single indexed trigram query — invisible when it works, and surfaced only when ambiguity is real. The three known dupes in the production catalog have *identical* `(roaster + name)` strings, so they'd land at similarity ≈ 1.0 and be caught with massive margin — confirming the matcher is well-targeted at the actual failure mode. Reuses the existing `scans` row machinery from #033: when the user accepts a match, `matched_coffee_id` is set and `corrections` stays empty; when they reject it and add new, the new row is created and the rejected candidates become a recordable false-positive signal. The eval pipeline thus gains three new measurable signals — match-rate, match-acceptance-rate, and false-positive-match-rate — without any new instrumentation tables.

**Tradeoffs accepted:** (a) The 0.8/0.5 thresholds are empirical starting points; they will need tuning as the catalog grows and edge cases (multi-roaster collabs, same coffee released in successive years, very short or very common names like "Ethiopia") emerge. (b) Wrong-match acceptance (user accepts an offered candidate that's actually a *different* coffee from the same roaster) corrupts their journal with a rating attached to the wrong row — strictly worse than a dupe. The bag-image-side-by-side confirmation card is the primary mitigation, but it's not foolproof and we should track this as a distinct failure category. (c) Trigram matching is language-and-script-naive — it will work well for Latin-script roasters but degrade on names with significant transliteration variance. Acceptable for the current US-specialty-focused catalog; revisit if the catalog goes international.

**Open questions for user interviews:** When a strong match is offered, do users trust the system to route them correctly, or do they want a confirmation step even at high confidence? The current design forces an explicit "Rate it" tap rather than auto-routing — that may be too cautious (extra friction on the happy path) or appropriately cautious (prevents the worst-case wrong-rating). Watch what users actually do with the confirmation card; if acceptance is near 100% at high confidence, the tap is friction we can remove.

**Linked competency:** A (the matcher and its outcomes are part of the bag-scan eval surface — match-rate becomes a first-class scan metric alongside per-field accuracy and hallucination rate); D (this entry).

---

## #042 — May 26, 2026 — Consolidate rating UX into a single `<RatingForm>` component

**Decision:** Extract a shared `src/components/RatingForm.tsx` that owns every interactive element of a rating: the radial dial, the highlighted tasting-notes textarea with auto-matched flavor chips, the collapsed "+ Add more flavors" panel, body & acidity sliders, extraction selector, brew method, and brew details. The three existing entry points — `RateCoffee` (new rating from CoffeeDetail), `EditRatingFlow` (edit existing rating from Journal), and `AddAndRateFlow`'s rate step (post-scan handoff) — all render `<RatingForm>` and remain responsible only for chrome (back link, step indicator, coffee context header) and DB persistence. The form fires a normalized `onSubmit(payload)` callback; each parent translates that payload into its specific Supabase write.

**Alternatives considered:** (1) *Patch the regressed surface in place* — copy the better UX from `EditRatingFlow` back into `RateCoffee` and call it done. Rejected: this is exactly how we got here. The "unified add + rate flow" commit (ea22579) improved the edit path's UX but left the new-rating path frozen in the old design; the divergence wasn't malicious, it was a maintenance gap that compounds every time the surface gets touched. A second copy means a third drift event is now expected, not surprising. (2) *Use a render-prop or compound-component API* (`<RatingForm><RatingForm.Dial /><RatingForm.Notes />...</RatingForm>`) — rejected for v1: there are no current callers that need to compose subsets of the form, and the abstraction would cost clarity without buying flexibility we have a use for. Revisit if a fourth caller surfaces that genuinely needs to omit sections. (3) *Server-driven form schema* — laughable for the current scale; flagged only to document that it's been considered and dismissed.

**Rationale:** The regression that triggered this — Jesse noticed the new-rating screen had reverted to a pre-redesign UX (separate "Anything specific?" textarea, always-visible full chip grid, no inline flavor detection) — was a symptom of the underlying duplication, not a bug to fix locally. Three near-identical 250+ line render blocks across three files means any future XP improvement requires three coordinated edits or it ships as a regression-by-omission. Extracting the form reduces the surface area to one place where rating UX evolves; the parents' DB-persistence concerns stay distinct and don't get conflated with form structure. The normalized `RatingFormSubmitPayload` shape (rating, descriptorIds, body, acidity, extraction, brew\*) is what each parent already needed to construct anyway — moving the construction into the form removes triplicate normalization logic (brew-time parsing, °F→°C conversion, descriptor-set merging) and standardizes empty-value handling (`""` → `null`).

**Tradeoffs accepted:** (a) Parents lose direct control over individual field state. If we ever need a per-caller validation (e.g., "edit cannot reduce a rating below 3 once shared publicly"), the form's controlled-state model will need a refactor — uncontrolled with `onChange(fieldValues)` exposure, or a more granular controlled API. Acceptable now; flagged for the day it matters. (b) Style ownership now lives inside `RatingForm`'s style object. Parents can still wrap or surround it, but they can't reach into the section-spacing or chip styling without prop drilling. Deliberate — keeps the visual identity consistent across all three entry points. (c) The `useFlavorDescriptors` hook now fires inside `RatingForm`, meaning it loads even on entry paths that previously didn't need it until the user reached the form. No measurable cost (cached after first load, ~168 rows) and the load happens during user reading time anyway. (d) The submit-error string is local to the form and not exposed to parents; parents that need to log errors centrally would currently have to wrap `onSubmit` themselves. Acceptable; revisit if we add a global error reporter.

**Open questions for user interviews:** This decision is about engineering hygiene, not user-facing behavior — the UX itself doesn't change for users who were already on the EditRatingFlow path, and the *intended* UX is now restored for the new-rating path. The interview-worthy question that the regression surfaced: how strongly do users notice and value the inline-flavor-detection feature vs. the explicit chip grid? If detection is invisible labor (users don't notice it's happening), the always-visible chip grid might be the better default; if users actively type tasting notes and watch words light up, the inline pattern is the win. Watch what they do in the rating step.

**Tradeoffs to revisit if a 4th caller appears:** If we add (say) a "quick-rate" affordance from a notification or a coffee-card hover that only needs the dial + descriptors and not body/acidity/brew, the form will need a `sections={['dial', 'flavors']}` prop or similar. Don't preemptively add that prop now — we don't have the fourth caller, and predicting which sections it'd want is harder than just adding the prop when it shows up.

**Linked competency:** D (Product Craft Artifacts — this is a structural decision that prevents recurring UX regressions across rating paths; the consolidation IS the artifact). Adjacent to E in spirit: treating "the rating XP" as a single product with one owner-component is the same instinct as treating "the feedback loop" as a product, just at component scale.

---

## #043 — May 26, 2026 — Dev-only email/password sign-in to unblock browser-preview verification

**Decision:** Add a second sign-in path — `supabase.auth.signInWithPassword` against a fixed, manually-created Supabase user (`dev@palato.local`) — exposed as a "Dev sign-in (local only)" button on the logged-out screen. The button is gated by a two-factor check: `import.meta.env.DEV === true` AND both `VITE_DEV_USER_EMAIL` / `VITE_DEV_USER_PASSWORD` are set. The credentials live in local `.env` (already gitignored) and are explicitly *not* added to Vercel's environment configuration. Google OAuth remains the only sign-in path on the deployed site; in `vite build`, the dev branch is statically dead code and tree-shaken from the bundle.

**Alternatives considered:** (1) *Pure client-side auth stub* — inject a fake `User` object into AuthContext behind a flag, bypass Supabase entirely. Rejected: the user has no real Supabase session, so RLS-scoped reads return nothing and most of the app renders empty; useful for layout-only verification but not for anything data-driven, which is most of the app. (2) *Whitelist localhost in the Google OAuth redirect config* — the OAuth flow already works on localhost; the problem is that the browser-preview tool can't drive a real Google sign-in (no human at the keyboard to complete the consent screen). The OAuth callback itself isn't the blocker. Rejected. (3) *Supabase anonymous sign-ins* — gives a fresh UID every session, breaks persistence (no continuity of ratings/journal across sessions), and the resulting user has no `profiles` row. Rejected for poor fit to a multi-rating data model. (4) *Status quo (verify blind)* — every UI change behind the auth wall ships without observation. Rejected as the explicit reason for taking this on; the verification gap was the bottleneck.

**Rationale:** Nearly the entire Palato app lives behind the sign-in wall — Browse, Coffee Detail, Rating, Journal, Palate, Flavors, Add. Without a way to drive a real authenticated session from the preview tool, every UI-touching change either gets pushed to production unverified or relies on Jesse to manually open a browser and confirm. Both are inferior to direct in-loop verification by the agent making the change. Adding a real Supabase user (not a stub) preserves the full data path: RLS is exercised normally, queries return real rows, the same code paths run as in production. The two-factor gate (`DEV` build flag + env-var presence) means the affordance is impossible to render in a Vercel build, and the credentials never get bundled into client JS — Vite only inlines `import.meta.env.VITE_*` values that exist at build time, and they only exist in local `.env`.

**Tradeoffs accepted:** (a) *Local dev no longer exercises the Google OAuth callback path.* OAuth-specific regressions (redirect URL, profile bootstrap on first OAuth sign-in, session refresh) will only surface on the deployed site. Acceptable because OAuth is stable, rarely modified, and a deliberate manual smoke-test before auth-adjacent ships is cheap. (b) *The dev user is real and lives in the same Supabase project as the production users.* Any ratings, scans, or coffee additions made under the dev account are real rows. They're RLS-scoped to the dev UID and won't show in Jesse's journal, but they share the global `coffees` and `scans` catalogs — meaning agent-driven test runs *can* dirty the catalog. Mitigation: don't leave admin email enabled for the dev user (it isn't); be deliberate about catalog writes during automated testing. (c) *Password sits in plaintext in `.env`.* Standard for local dev. Risk vector is `.env` accidentally being committed; the `.gitignore` rule and the project hard-rule both already cover this. (d) *Env-var leak to Vercel would embed the password string in the production JS bundle, even though the dev button itself can't render.* Documented as a deployment hazard: `VITE_DEV_USER_*` must stay strictly local; treating these as never-Vercel vars is the operational discipline. (e) *No `profiles` row was auto-created for the dev user* (it was created via the Supabase dashboard, not via the OAuth-driven first-sign-in flow that bootstraps profiles for real users). Empirically this didn't break the read paths I tested, but it's a soft gotcha — if a feature later assumes every authenticated user has a `profiles` row, the dev path will diverge from the OAuth path and surface bugs that don't exist in production, or miss bugs that do. Manageable; flagged.

**Linked competency:** E (Feedback Loop as Product) — the most direct mapping. The internal build-verify loop is itself a product whose users are the human-agent collaboration pair; this decision tightens that loop materially. Before: every UI change behind auth required a separate human verification step or shipped unverified. After: the agent can drive the full UI and confirm behavior in the same turn as the change. Adjacent to A in that this also unblocks agent-driven verification of the bag-scan extraction UI (which lives in the admin-gated Add flow) once the dev user is granted admin — a precondition for the eval pipeline work in #033.

---

## #044 — June 3, 2026 — Constrain the rating dial's touch target to the arc band so the page can scroll through it

**Decision:** Move touch-ownership off the full 320×320 `RatingDial` SVG and onto a single invisible band that traces the arc. Concretely: the `<svg>` loses its pointer handlers and its `touch-action: none` (it now reports `touch-action: auto` and scrolls normally); a transparent `<path>` following the background arc, stroked at 44px with `pointer-events: stroke` and `touch-action: none`, becomes the only element that carries `onPointerDown/Move/Up`; the handle `<circle>` is set to `pointer-events: none` so a press on the thumb passes through to the band beneath it. `setPointerCapture` (already in place) keeps a drag glued to the finger once it starts, even if the finger wanders off the band. The existing "tap anywhere on the arc to jump to that value" behavior is preserved — the band is just a thicker, invisible version of the visible ring.

**Alternatives considered:** (1) *Distance-gate the existing single SVG handler* (an annular hit region: ignore touches whose distance from center isn't near `RADIUS`). Rejected as a standalone fix because the browser decides scroll-vs-gesture *before* our JavaScript runs — so while `touch-action: none` covers the whole box, an early-return in `pointerDown` still can't hand the gesture back to the page for scrolling. To actually free the center to scroll you must move `touch-action: none` off the box onto a smaller region, at which point the distance check collapses into the band approach anyway. The band is the same idea expressed as a hit shape instead of math, and it's the part that does the real work. (2) *Handle-only dragging — drop tap-on-arc-to-jump.* Rejected: rating is the atomic action of the entire app; making the user precisely grab and drag a small thumb is a slower, fussier gesture than tapping where they want. Tap-to-jump is the fast path and worth keeping. (3) *`touch-action: pan-y` on the container.* Rejected: `pan-y` lets the browser claim vertical-looking drags for scrolling, but a circular drag on the *left and right* sides of the arc is near-vertical — so the browser would steal exactly those drags and cancel the dial mid-gesture. It would make the dial draggable only near the top. (4) *Status quo.* Rejected — this is the reported bug.

**Rationale:** The trigger was Lucy's first external user test (2026-05-25 round, reported 06-03): "whenever I try to scroll past the sliding scale, it would jump around to different places on the scale." Root cause was two coupled properties of the old component — `touch-action: none` on a 320px square suppressed page scrolling anywhere a finger landed in that square, and `handlePointerDown` fired on a tap *anywhere* in the square and immediately snapped the value to that finger's angle. So a finger placed on the dial to scroll couldn't scroll (suppressed) and simultaneously dragged the rating around (greedy hit area). On the rating screen the dial spans nearly the full width, so the center and the page margins are the main places a thumb can land to scroll — and those were precisely the dead zones hijacking the gesture. Because of the browser-timing constraint above, the fix has to *shrink the touch-owning region* rather than gate it in JS; the 44px arc band is the smallest region that keeps tap-to-set working while freeing the center, the outer corners, and the bottom gap (which the arc never covers) to scroll the page.

**Tradeoffs accepted:** (a) *The actual reported symptom — touch scroll-through — is not verified on touch hardware.* Desktop browser preview only drives a mouse, so verification here was structural (`svg` now `touch-action: auto`; band is `touch-action: none` + `pointer-events: stroke`; handle is `pointer-events: none`) plus behavioral via synthetic pointer events (a press on the ring still sets the value; a press dead-center is inert and lands on the bare `svg`). The real iOS-Safari scroll-through, and Safari's historically inconsistent honoring of `touch-action` on SVG *child* elements, remain unproven until a real-iPhone smoke test — which is Lucy's exact device. Pointer capture covers the mid-drag case; the residual risk is the initial-touch classification. The smoke test: rest a finger on the center number and scroll — page should move, value should not. (b) *The 44px band width is a reasoned constant, not a measured one.* Too thin and the ring is hard to hit on a phone; too wide and it re-eats the scroll zones. 44px is a starting point to tune on-device if hit-rate feels off. (c) *Tapping the dead center now does nothing.* That's the point (it's a scroll zone), but a user who expected to tap the middle to set a mid value gets no response. Low cost — the visible ring and handle are the obvious targets — but a minor discoverability change worth watching.

**Open questions for user interviews:** Did this actually resolve it for Lucy on her phone? (Re-test is the real verification.) And separately: is tap-on-arc-to-jump the right default, or do users expect a rating to require a more deliberate drag so they don't set it by accident? Watch whether accidental value changes resurface once the scroll-hijack is gone.

**Linked competency:** B (Voice of Customer Programs) — this is the first build-side action taken directly on structured feedback from Palato's first external tester; the report → diagnosis → fix is exactly the signal-to-change path Competency B is meant to exercise. Adjacent to E (Feedback Loop as Product): Lucy reported → diagnosed root cause → shipped fix → pending her re-test is the loop closing on itself, with the re-test as the open end.

---

## #045 — June 15, 2026 — Catalog coffees are editable post-save; any authenticated user can edit (open-edit catalog)

**Decision:** Make catalog coffees editable after creation, and broaden the `coffees` UPDATE RLS policy from creator-only to any authenticated user. Two parts: (1) a new `EditCoffeeForm` reachable from a subtle "Edit details" affordance on `CoffeeDetail`, which loads the existing row, lets the user correct the same field set the add flow exposes, and writes via `update().eq('id', …)` rather than `insert`; (2) migration `0007` drops the original `"Users can update coffees they created"` policy (`using auth.uid() = created_by`) and replaces it with `"Authenticated users can update coffees"` (`using true with check true`). The `scans` table is deliberately left untouched — a post-save catalog edit is a different correction signal from a scan-time correction and is not folded into the Competency A eval dataset.

**Alternatives considered:** (1) *Keep the creator-only policy and just add the edit UI.* This would have solved Jesse's specific reported case (he created the typo'd coffee via scan, so `created_by` is his) with zero security loosening. Rejected as the primary model because the catalog is global and shared (Decision #034): under creator-only, a coffee added by user A with a typo can never be fixed by user B, who sees and rates the same row — the catalog can't be community-maintained, which defeats the shared-catalog premise. (2) *Admin-only edit gate.* Matches the AddCoffeeForm's original admin gating, but too restrictive for the same reason #034 opened the catalog to all beta users — and it recreates a curation bottleneck on Jesse. (3) *Fold catalog edits into the `scans` row as a delayed correction signal.* Rejected: `scans` should stay scoped to the extraction event (raw extraction + the correction made at save time). A post-save edit is a distinct signal — it can happen long after the scan, by a different user, on a coffee that was never scanned at all — and deserves its own surface (edit history) if/when we want to measure it. Keeping `scans` clean preserves the integrity of the eval ground truth (ties to #033, #036). (4) *Route the add-flow dedup card's "Rate this" coffee into edit too.* Deferred to a follow-up change rather than bundled here, to keep this unit reviewable; the dedup card ("Already in Palato", Decision #041) is the exact surface where the need was reported, so an "Edit details" entry point there is the natural next step.

**Rationale:** The trigger was Jesse's own self-test: he added a coffee with a typo ("Banjo" for "Banko"), and on trying to fix it, re-entered the add flow — which correctly fired the dedup card (Decision #041) and dead-ended him, because there was no edit path anywhere in the app and the duplicate detector (correctly) refused to let him add it again. The instinct that brought him back into the add flow ("I'll just re-add it correctly") had nowhere productive to land. Edit is *update* on an existing record — a genuinely distinct operation from *create*, which is why it was explicitly scoped out of the scan build (TECH_DEBT "No edit capability for catalog coffees") and is now being filled. `CoffeeDetail` is the natural home: it's where you look at a coffee's facts, so it's where you'd fix them. Broadening the RLS policy is what actually makes the shared catalog self-healing rather than create-only-correct.

**Tradeoffs accepted:** (a) *Open-edit is a vandalism / accidental-overwrite vector once the user base is no longer trusted.* Acceptable now because the beta is whitelisted (the same trust model that justified the open catalog in #034), but it's a real security concern at scale — logged in TECH_DEBT as "Catalog edit permission model," to be revisited alongside community ratings and moderation in v1.1. (b) *No edit history / audit trail.* An edit overwrites the prior values with no record of who changed what. For a shared catalog this is the first thing a moderation model would need; deferred with the permission work. (c) *`with check (true)` lets an update set `created_by` to anything.* The edit form doesn't touch `created_by`, so in practice the field is preserved, but the policy itself no longer protects it — a non-issue at beta trust, noted for the v1.1 hardening. (d) *The migration must be `supabase db push`ed for the live save to work* — until then the edit form renders and validates but the write hits the still-creator-scoped policy. (e) *No optimistic-concurrency guard*: two users editing the same coffee is last-write-wins. Vanishingly unlikely at current scale; flagged with the permission work.

**Linked competency:** Primarily product craft (D) — closing a known UX dead-end surfaced by a self-test, with the decision and its security tradeoff documented rather than silently shipped. Adjacent to B (Voice of Customer): this is a self-test finding, the same signal-to-change muscle Lucy's reports exercise. The deferred permission-model question is the kind of thing real user behavior in beta will inform.

---

## #046 — June 15, 2026 — Any authenticated user can upload bag images (fix the admin-only Storage gate)

**Decision:** Add a permissive `storage.objects` INSERT policy (migration `0008`) letting any authenticated user upload into the `bag-images` bucket, scoped to their own `${auth.uid()}/…` folder. This unblocks the add-a-coffee / bag-scan flow for all beta users. The legacy admin-email INSERT policy (`auth.jwt() ->> 'email' = 'jesse@palato.coffee'`, created in the dashboard) is left in place — now redundant and harmless, since permissive policies are OR'd.

**Alternatives considered:** (1) *Edit the policy in the Supabase dashboard.* Fastest, but perpetuates TECH_DEBT "Storage policies not in version control" — the schema would drift further from the repo, against Decision #014's migration discipline. Rejected in favor of capturing it as a migration (the first Storage policy in version control). (2) *Drop the admin-email policy and replace it.* The clean end-state, but its dashboard-assigned name isn't in version control and couldn't be introspected this session (`supabase db dump` needs Docker, which wasn't running). Dropping blind risks a no-op (wrong name) with no way to confirm. Deferred: leaving the redundant policy is safe (OR semantics), and removing it is tracked in TECH_DEBT. (3) *Unscoped `bucket_id = 'bag-images'` (any authenticated user writes anywhere in the bucket).* Rejected on least-privilege grounds (a CLAUDE.md hard rule): scoping to the caller's own folder means one user can't overwrite or plant objects in another user's namespace. Verified both directions — own-folder upload succeeds, cross-folder upload is rejected with the same RLS error.

**Rationale:** Reported by Lucy, Palato's first external tester (Competency B): she tried to add a coffee and hit "Scan issue: new row violates row-level security policy" the moment the flow uploaded her bag photo (`lib/bagImage.ts` → `bag-images` bucket). Root cause was a consistency gap: Decisions #034 (global shared catalog for all beta users) and #037 (scan endpoint serves all authenticated users) opened the add flow to everyone, but the Storage upload policy was still pinned to the single admin email from the app's earliest days — so every non-admin user was silently walled off from the app's atomic contribution action. The fix realigns Storage with the access model the rest of the stack already assumes. Reads were never the problem (`bag-images` is a public bucket, so SELECT bypasses RLS).

**Tradeoffs accepted:** (a) *The redundant admin-email INSERT policy still exists.* Functionally harmless (OR semantics) but untidy; full cleanup needs its dashboard name and is tracked in TECH_DEBT. (b) *Own-folder scoping trusts the client to keep writing under `${uid}/`* — which `uploadBagImage` does. The policy enforces it server-side regardless, so a hand-crafted request to another folder is rejected (verified). (c) *No upload quota / rate limit / size cap at the policy layer* — a user could upload many objects into their own folder. App-side validation caps file size/type (`prepareImage`); a Storage-level guard is a scale concern, not a beta one. (d) *Same open-edit trust posture as #045* — broadening write access is correct for a whitelisted beta and revisited with moderation in v1.1.

**Linked competency:** B (Voice of Customer Programs) — second build-side fix driven directly by external-tester signal (after #044), and a hard blocker this time: Lucy literally could not perform the app's core contribution action. Report → root-cause → fix → verified-as-her-user-role is the signal-to-change loop. Adjacent to E (Feedback Loop as Product): the dev-user-as-non-admin-proxy let the fix be verified against Lucy's exact permission role without waiting on her to re-test.

---

## #047 — June 16, 2026 — Web-augmentation is the data foundation for recommendations; build the schema now, gate the pipeline behind a legal/security review

**Decision:** Before building the Palate recommendation engine, lay its **data foundation** — web-augmented coffee data (purchase link, price, provenance, fact-check trail) — but split that foundation into "build now" and "research first." Build now: (1) migration `0010` adds seven dormant, nullable columns to `coffees` (`purchase_url`, `retailer_name`, `price_usd`, `bag_weight_grams`, `source_url`, `web_augmented_at`, `augmentation_raw`) that nothing populates yet; (2) `docs/web-augmentation-research.md`, a legal/security research doc that must be resolved before any live augmentation pipeline is built. Defer: the actual augmentation pipeline (a `/api/augment.js`-style flow), any scraping/fetching, and affiliate links — all gated on the research doc. This revisits Decision #035, which deferred web-augmentation wholesale to v1.1: the *schema and the research* move up now (because recommendations depend on trustworthy, purchasable catalog data), while the *live build* stays deferred until the legal/security questions are answered. The recommendation engine itself (hybrid: deterministic candidate filtering + Claude selection/copy, three strategies — "Try Something Unique," "Go Somewhere New," "Something You'll Love") is the next build, sequenced after this foundation.

**Alternatives considered:** (1) *Build the recommendation engine first, augmentation later.* Two of the three planned recommendation cards ("Try Something Unique," "Go Somewhere New") need **zero** new data and are buildable today; only "Something You'll Love"'s purchasability filter needs augmentation. So engine-first was viable and would have shipped value sooner. Rejected per Jesse's explicit sequencing call: he wants the catalog data to be trustworthy and purchasable *before* surfacing recommendations that nudge users toward buying, and "Something You'll Love" (the purchase-driving, flagship card) is the one that needs it. The two zero-data cards wait with it rather than shipping ahead. (2) *Build a basic Claude web-search augmentation now.* Rejected: the highest-risk item is **prompt injection from fetched web pages into Claude**, whose output writes back into a shared, community-wide catalog (#034) — a single poisoned page could corrupt data everyone sees. Plus copyright (storing roaster prose/photos) and FTC affiliate-disclosure duties. These warrant a deliberate review before any live fetch, not a fast first cut. (3) *Defer the whole thing, schema included (status quo of #035).* Rejected: writing the dormant schema and the research doc now is cheap, reversible, and unblocks the engine the moment the review resolves — it front-loads the thinking without front-loading the risk. (4) *Capture user location now to power the "ship to their country" filter.* Rejected for this round: location is PII, needs a profile-settings surface, and isn't on the critical path while we assume USA-only. Deferred to TECH_DEBT.

**Rationale:** The recommendation engine's value depends on the catalog being both *complete* (gaps filled) and *actionable* (a user can actually buy the recommended coffee). Web-augmentation is what makes the catalog those things, so it's genuinely foundational rather than a parallel nicety — which is why Jesse reordered it ahead of the engine. But it's also the single most legally- and security-sensitive surface Palato has touched: it fetches untrusted third-party content, redisplays roaster-owned material, and (eventually) earns referral money — three independent risk axes (injection/SSRF, copyright, FTC). The cheap, safe move is to commit the *schema* (dormant columns cost nothing and let the eventual pipeline land without a migration scramble) and the *research* (so the risk decisions are made deliberately, by Jesse, with the tradeoffs written down) while holding the *live build*. This mirrors how the scan pipeline already separates the immutable raw payload (`scans.raw_extraction`) from corrections — `augmentation_raw` + `source_url` give every augmented value a provenance trail and a fact-check seam, so augmentation can *suggest* and *flag discrepancies* rather than silently overwrite user data.

**Tradeoffs accepted:** (a) *Two ready-to-ship recommendation cards are held behind a legal review they don't technically need.* "Try Something Unique" and "Go Somewhere New" use only existing data; sequencing them behind augmentation delays value that could ship now. Accepted as Jesse's product call (trustworthy-data-before-nudge), and reversible — if he later wants those two live sooner, they can be cut forward independently. (b) *The dormant columns sit unused and user-writable under the open-edit policy (#045).* Until a server-side write path exists, any authenticated user could in principle write `augmentation_raw`/`source_url`/`web_augmented_at` — fields meant to be system-managed. Low risk at whitelisted-beta trust, but flagged in TECH_DEBT as needing column-level protection (trigger or service-role-only path) when the pipeline lands. (c) *The migration must be `supabase db push`ed to take effect* (Decision #014 discipline); until then the columns don't exist live. Harmless while nothing reads them. (d) *The research doc is a draft, not legal advice* — it surfaces the questions a real review (and, pre-launch, a lawyer) must answer; shipping on it without that review would be acting on an incomplete analysis. (e) *USA-only price assumption* bakes a US bias into the commerce data until location + multi-currency are built (deferred to TECH_DEBT).

**Linked competency:** A (AI-Enabled Workflows) — the augmentation pipeline is a new production LLM workflow whose injection/provenance design and `augmentation_raw` eval seam are core Competency A craft, and the foundation it lays feeds the recommendation engine (also A). Strong secondary D (Product Craft Artifacts) — the legal/security research doc is exactly the kind of decision-supporting artifact the competency calls for: alternatives, risks, and a recommendation written down before the build, not after. Adjacent to C (Metrics): the recommendation engine this unblocks carries the acceptance metric (click-through, downstream "rated a recommended coffee") defined for the next build.

---

## #048 — June 16, 2026 — Resolved web-augmentation posture: human-review-all, Claude hosted search, no scraping ToS-prohibited sites, store tasting-note lists not prose, no affiliates yet

**Decision:** Work through the open questions in `docs/web-augmentation-research.md` (raised by Decision #047) and lock the operating posture for the eventual augmentation pipeline. The resolved set: (1) **No bot access to ToS-prohibited sites** — where a site prohibits automated access we don't scrape it; such coffees go to a **manual-verification backlog** (a required, not-yet-built feature) for Jesse/Lucy to handle by hand. (2) **Store structured facts + our taxonomy tags + the roaster's tasting-note *list*** (`roaster_tasting_notes_raw`, already captured), but **not** the roaster's long-form marketing prose — link out to the source for that. (3) **No affiliates for now**, and deliberately **not Amazon Associates / large networks** (Palato serves smaller roasters that wouldn't use Amazon on principle); when affiliates eventually land, **FTC disclosure sits at the point of the link** in the recommendation/purchase UI, not in T&Cs. (4) **Approach A (Claude hosted web-search/fetch) now**, moving toward **C (third-party retail/affiliate API)** if Palato scales. (5) **Admin/batch trigger**, auth-gated and rate-limited — no per-user on-demand augmentation. (6) **Reconciliation invariant confirmed:** never silently overwrite, write provenance to `augmentation_raw`/`source_url`/`web_augmented_at`, flag disagreements; **all reviews route to Jesse** with Lucy as second reviewer, and **all** new/augmented coffees are human-reviewed while volume is low. (7) **Provenance is shown to users** ("sourced from [roaster] · price as of [date]"). (8) **Bag-photo rights deferred** to the existing TECH_DEBT "Image rights" pre-launch decision, not re-decided here. Added a fifth augmentation purpose: **normalize/typo-correct listings** to Palato's syntax for catalog homogeneity (lowest-risk, uses existing fields).

**Alternatives considered:** (1) *Automate augmentation now with confidence-tiered auto-fill (no blanket human review).* Rejected for now: while small, full human review is the strongest guard against prompt injection (poisoned pages writing into the shared catalog, #034) and bad data, and it's the "above-reproach" posture Jesse explicitly wants. The confidence-tier auto-suggest model is held in reserve for when intake crosses ~10+ new coffees/day and manual review becomes the bottleneck. (2) *Scrape broadly and rely on the never-overwrite invariant to contain bad data.* Rejected on the legal axis specifically — ToS-prohibited scraping is the clearest exposure (§2.1), and the invariant addresses data integrity, not the access-legality question. Hence the no-bot rule + manual backlog for those sites. (3) *Store roaster prose verbatim for richness.* Rejected: long-form marketing copy is copyrightable expression; the tasting-note *list* (short descriptors ≈ factual product claims) carries the critical signal at far lower risk, so we keep the list and link out for prose. (4) *Pursue affiliates (Amazon/aggregator) now for early monetization.* Rejected: poor specialty-roaster coverage, principle misfit with Palato's small-roaster audience, and it would pull FTC-disclosure UI onto the critical path prematurely. (5) *Build our own server-side fetch (Approach B).* Rejected as the v1 path on SSRF grounds — Claude's hosted web tool keeps the fetch in Anthropic's infra. (6) *Keep provenance internal-only.* Rejected: showing source + price-date is the user-facing half of the fact-check story and a trust signal; the cost is minor UI.

**Rationale:** Web-augmentation is Palato's most legally- and security-sensitive surface (untrusted third-party content → a shared catalog → eventual referral money). Jesse's governing instinct here was "above reproach while small," and every resolution flows from it: don't access what we're not clearly allowed to (no-bot + manual backlog), don't store what we don't clearly have rights to (facts + note-list, not prose; photos deferred), don't monetize before we can disclose it properly (no affiliates yet, FTC-at-the-link when they come), and don't trust machine output into a shared catalog without a human in the loop (review-all now). Approach A (hosted search) and the admin/batch trigger keep the technical blast radius small. These are deliberately conservative defaults chosen to be loosened later from a position of evidence (volume, traction) rather than tightened after a problem.

**Tradeoffs accepted:** (a) *Human-review-all doesn't scale* — it's a deliberate throughput ceiling that becomes the bottleneck around 10+/day; the auto-suggest tiers are designed but dormant until then. (b) *The manual-verification backlog is now a committed build dependency* — augmentation can't safely run without it, so it's on the critical path for the pipeline even though it's unglamorous (Enablement/Tenacity work, which Jesse is drained by — worth being realistic about who maintains it). (c) *No-bot-on-ToS-prohibited-sites means uneven coverage* — coffees from stricter sites get slower, manual augmentation; correct on the legal axis, but the catalog won't augment uniformly. (d) *The tasting-note-list/prose line is a reasoned posture, not legal certainty* — a real review (pre-launch, ideally a lawyer) should still confirm it. (e) *Deferring photos* leaves a known copyright gap open under the existing tech-debt item rather than closing it here. (f) *Choosing small-roaster affiliates later over Amazon now* forgoes the easy (if poorly-fitting) monetization path in favor of one that requires per-roaster onboarding — a values-driven call that costs near-term revenue optionality.

**Linked competency:** D (Product Craft Artifacts) — this is the research doc doing its job: a structured set of risk decisions with alternatives and tradeoffs written down *before* the build, resolved deliberately rather than defaulted into. Strong secondary A (AI-Enabled Workflows) — the resolved posture (hosted search, untrusted-content handling, never-overwrite + provenance, human-in-the-loop) is the safety design of a production LLM workflow, and the human-review backlog is the labeling/quality seam that will feed its eval. Adjacent to B/E — routing all reviews to Jesse/Lucy makes the augmentation review loop a Voice-of-Customer-adjacent signal surface (where do users, roasters, and the web disagree?).

---

## #049 — June 18, 2026 — Catalog verification gate: coffees aren't global until an admin approves them (revises the open-catalog model); real admin model via profiles.is_admin

**Decision:** Add an admin-only moderation gate at catalog entry, built on the app's first real admin model, alongside the data store for the web-augmentation pipeline — all in migration `0013`. Three coupled pieces: (1) `profiles.is_admin` + a `SECURITY DEFINER` `is_admin()` helper — the actual admin model the app never had (`VITE_ADMIN_EMAILS` existed but was unused, and there was no `useIsAdmin`/server admin check anywhere). (2) `coffees.moderation_status` enum (`pending` | `approved` | `rejected`, default `pending`): a new coffee is **invisible in the global catalog until an admin approves it**. The `coffees` SELECT RLS is rewritten from "authenticated users see everything" to "see it if it's `approved`, OR you created it, OR you're an admin" — so the adder can still see and rate their own pending coffee while it's hidden from everyone else. Existing rows are **grandfathered to `approved`** so the live catalog isn't suddenly hidden; the gate affects only *new* additions. A `BEFORE UPDATE` trigger makes `moderation_status`/`verified` (and the system-managed augmentation provenance columns) **admin-only writable**, because the #045 open-edit UPDATE policy (`using true`) would otherwise let a non-admin self-approve. (3) An `augmentations` table (mirrors `scans`): the pending-proposal store and Competency-A eval seam for the augmentation pipeline, admin-only via RLS. **Enrich-only / never-delete** holds throughout: `rejected` keeps a coffee *out* of the catalog without deleting it (a delete would cascade its ratings). Admins are Jesse + Lucy (seeded manually post-migration, kept in sync with `VITE_ADMIN_EMAILS`).

**Alternatives considered:** (1) *Keep the open catalog (#034) — no entry gate.* This was the status quo: any beta user's coffee went straight to the global, shared catalog. Rejected because Jesse flagged image quality/appropriateness as brand-critical — a single bad or inappropriate bag image in a shared brand surface is a real risk as the user base grows, and there was no way to keep it out. The gate is the direct answer. (2) *Hard-delete bad coffees instead of a `rejected` state.* Rejected on the enrich-only rule: `coffees → ratings` is `on delete cascade`, so deleting a coffee destroys its ratings and any palate signal built on it. A `rejected` status keeps the row (and its ratings) while keeping it out of the catalog. (3) *Default existing rows to `pending` too (review the whole catalog).* Rejected: that hides the entire live catalog mid-beta until Jesse clears a queue. Grandfathering to `approved` keeps the catalog live and scopes the gate to new adds; he can still selectively re-review existing coffees. (4) *Service-role key + locked-down `augmentations`, no DB admin flag.* Rejected: adds a Vercel secret and extra endpoints, and the app needed a real `is_admin` model anyway (for the verify queue RLS and future admin features). `profiles.is_admin` + RLS is leaner and reusable. (5) *Rely on the permissive #045 UPDATE policy for approvals.* Rejected — it would let any authenticated user flip their own coffee to `approved`, defeating the gate. RLS is row-level, so a column-level trigger is the right tool to keep facts open-edit while locking moderation/provenance to admins.

**Rationale:** Two needs converged on one admin surface. The augmentation pipeline (Decision #047/#048) needed an admin-gated place to review web-sourced proposals; Jesse's brand/trust concern needed an admin-gated place to vet new coffees before they go public. Both are "an admin reviews catalog quality," so they share one dashboard and one `is_admin` model — building the model twice would be waste. The verification gate is also the more *foundational* of the two (it protects the brand surface itself), which is why it ships in the same slice rather than after. The trigger is the load-bearing detail: without it, the open-edit policy that makes the catalog self-healing (#045) silently also makes the gate bypassable, so the gate's integrity depends on locking exactly two things (moderation + provenance) to admins while leaving factual fields open. As a bonus it resolves the TECH_DEBT item about the `0010` provenance columns being user-writable — they're now admin-only.

**Tradeoffs accepted:** (a) *This revises two prior decisions* — #034 (new coffees go straight to global) and the trust posture of #045 (fully open catalog). The catalog is now moderated-at-entry, not open-at-entry; that's a deliberate tightening for brand safety, logged here rather than silently changed. (b) *Adds a human bottleneck* — coffees added by non-admins now wait on Jesse/Lucy to approve. Acceptable at beta volume; becomes a throughput concern at scale (ties to the augmentation human-review ceiling in #048). (c) *`is_admin` is seeded manually, not in the migration* — emails are kept out of version-controlled SQL, so an explicit post-push `UPDATE` sets the admins; the risk is forgetting it (then no one can see the verify queue or admin views). Documented in the migration comment and the PR. (d) *`is_admin` (DB, for RLS) and `VITE_ADMIN_EMAILS` (client/endpoint gating) are two sources of truth that must agree* — fine for a two-person admin set, a smell at scale. (e) *The grandfather `UPDATE` flips every existing row to approved sight-unseen* — if any currently-live coffee has a bad image, it stays live until separately re-reviewed; accepted to avoid hiding the catalog. (f) *The migration must be `supabase db push`ed and the admins seeded before the dashboard works* — until then the verify queue is empty and admin views are ungated-empty.

**Linked competency:** Primarily D (Product Craft) — a brand/trust-protecting moderation gate with its RLS and reversal/never-delete tradeoffs reasoned out and logged, revising prior decisions deliberately. Strong A (AI-Enabled Workflows) — the `augmentations` table is the data foundation and eval seam for the augmentation pipeline. Adjacent to B/E — the verify queue and augmentation review are the same human-in-the-loop quality surface that routes catalog/roaster/web disagreements to Jesse and Lucy.

---
## #049 — June 16, 2026 — PostHog as the analytics sink; behavioral event taxonomy (activation + scan funnel)

**Decision:** Wire **PostHog** (US Cloud, `posthog-js`) as the product-analytics pipeline, replacing the no-op `track.ts` stub. `track()` stays the single capture entry point; users are **identified on sign-in and reset on sign-out** (in `auth.tsx`); `person_profiles: 'identified_only'` so anonymous traffic doesn't inflate tracked-user counts; `capture_pageview` on (gives pageviews/sessions/retention for free). Manual domain events instrument what autocapture can't infer: **`rating_saved`** (activation — `ratingCount === 1` is the activation moment; fired on *both* rating-save paths, browse→rate and scan→add→rate), **`scan_started` + `scan_completed`** (scan funnel, with `success`/`durationMs`/`matchKind`), plus the pre-existing `palate_viewed` and `palate_recommendation_clicked` now actually flowing. Config via `VITE_POSTHOG_KEY` / `VITE_POSTHOG_HOST` (publishable key, so `VITE_` prefix is correct). `track()` degrades to a no-op + dev console log when no key is set, so local dev and key-less environments are unaffected.

**Alternatives considered:** (1) *Supabase `events` table.* Own the raw data, no new vendor, SQL access, consistent with treating Supabase as the data warehouse (`scans`). Rejected as the default because it front-loads dashboard- and query-building — Enablement/Tenacity work Jesse is explicitly drained by — whereas PostHog yields funnels and retention curves out of the box. Reversible: `track()` is the single seam, and events can be piped to Supabase later. (2) *PostHog setup wizard (`npx @posthog/wizard`).* Rejected because the integration was already hand-wired to auth identify/reset and domain events; the wizard would inject a duplicate `posthog.init()` and fight the tailored setup. The wizard is the path you take *instead of* a manual integration, not after one. (3) *Structure-only (typed taxonomy, log-only, decide sink later).* Rejected as insufficient for the moment — the urgent need is events actually flowing before Lucy's interview cohort generates behavior.

**Rationale:** `track.ts` already had call sites but captured nothing — the database tells you the *score* (rows that exist), events tell you the *game* (the journey, and the non-events like abandoned scans where activation/retention problems hide). With the real-use cohort imminent, getting events flowing is the highest-leverage pre-cohort fix. PostHog over a self-hosted table specifically because it minimizes the ongoing maintenance Jesse dislikes while delivering the retention/funnel analysis that the interview program needs to be paired with behavioral truth.

**Tradeoffs accepted:** (a) *Adds a third-party vendor and a tracking cookie* — user behavior leaves the platform; acceptable at whitelisted-beta trust, and a consent notice is deferred to TECH_DEBT (Privacy & Compliance) for public launch (Jesse's stance: the cookie stays, disclose it). (b) *US region is baked in at project creation* — correct for a US company/user base regardless of current travel location. (c) *Vendor coupling* — capture goes through `posthog-js`; mitigated by `track()` being the only seam, so swapping sinks touches one file. (d) *Partial instrumentation* — only the two rating-save paths and the scan flow are covered now; broader funnel events (e.g. `coffee_added` without a rating, in-flow drop-off) are follow-ups.

**Linked competency:** C (Metrics Fluency) — this is the instrumentation that turns DAU/WAU, activation rate, retention curves, and ratings-per-user-per-week from aspirations into measurable series; the event taxonomy *is* the metric definitions made concrete, and it's the behavioral half that the Competency-B interview program must be read against. Secondary A (AI-Enabled Workflows) — `scan_completed`'s `success`/`durationMs`/`matchKind` feeds the scan eval (#033, #036) with live production funnel signal alongside the `scans`-table accuracy data.

---
## #050 — June 17, 2026 — Adopt `react-router-dom`; split the app into public (`/`, `/quiz`) and auth-gated routes

**Decision:** Add `react-router-dom` and introduce real URLs, replacing the single `useState<View>` switch in `App.tsx` as the *top-level* router. Two public routes — `/` (landing) and `/quiz` (the pre-auth palate quiz) — sit outside the auth wall; everything else (catalog, add-a-coffee, rating flow, Palate, Learn, More) lives behind a `RequireAuth` guard that redirects unauthenticated visitors to `/`. `App.tsx` is now a thin `<Routes>` shell; the existing logged-in experience moved verbatim into `AuthedApp.tsx` and keeps its internal view-state for now. This is the foundation for the onboarding rework (landing → quiz → reveal → sign-in) and directly flips the "no router library yet" note that stood in CLAUDE.md.

**Alternatives considered:** (1) *Hand-roll routing on the History API* on top of the existing view-state switch — no new dependency, but it means reimplementing redirects, back-button semantics, and deep-linkable URLs by hand, which is more fragile and more code over time than a battle-tested library. Rejected. (2) *Keep the pure view-state model and fake "public vs. gated" with a flag* — rejected because the spec requires genuine shareable URLs (`/`, `/quiz`) and a real redirect on gated paths, which the in-memory model can't provide (no URL to share, no address to redirect from). (3) *Convert every existing surface (coffee-detail, rating, add-flow) to its own route in the same pass* — rejected as too large for one reviewable unit; those ephemeral flows stay as `AuthedApp` internal state and can be promoted to routes incrementally as later units touch them.

**Rationale:** The onboarding redesign is fundamentally about a *pre-auth* experience (land, take the quiz, see value, then sign in). That is impossible without a routing layer that distinguishes public from authenticated URLs and survives the Google OAuth full-page redirect. `react-router-dom` is the lowest-long-term-complexity way to get real URLs, a declarative gate, and redirect handling. Mounting the gate as a `*` splat means *any* unknown or gated path while signed out redirects to `/` — a security boundary by default (the catalog and add-a-coffee must not be publicly reachable), not an allowlist we have to remember to extend.

**Tradeoffs accepted:** (a) *New dependency* (~14kb gzipped) and a bundle already over Vite's 500kb warning — acceptable; code-splitting is a separate, pre-existing concern (the build warned before this change). (b) *Hybrid navigation model* — top-level destinations are now URLs but `AuthedApp`'s sub-views (detail/rating/add) are still in-memory state, so those aren't yet deep-linkable or back-button-aware; deliberate, to keep this unit reviewable, with a clear path to promote them later. (c) *Two parallel "loading" treatments* (one in `RootRoute`, one in `RequireAuth`) until the landing/quiz units consolidate the shell.

**Linked competency:** D (Product Craft Artifacts) — the routing split is the structural prerequisite that makes the whole onboarding arc (a deliberate, sequenced product experience) buildable, and logging the architectural fork here keeps the decision history honest about why the "no router" stance was reversed.

---
## #051 — June 18, 2026 — Onboarding rework: aspiration-first quiz, quiz-seeded palate, and a Catalog·Learn·Palate·More IA

**Decision:** Ship the full onboarding rework (build spec v2) as ten staged units on top of Decision #050's routing split. The shape that landed: (1) a **pre-auth landing → 5-question palate quiz → reveal → sign-in** arc, with the quiz deliberately optimized for *engagement and aspiration*, not maximum data capture — it seeds exactly one palate datum (a flavor lean + derived roast) and otherwise builds motivation. (2) Quiz answers persist to **`sessionStorage` across the OAuth redirect**, then hydrate into a new **`palate_profiles`** table on first authed load (insert-if-absent; never clobber an existing palate). (3) The **Palate tab is reframed from locked-from-zero to a seeded v0** a quiz-taker already owns ("sharpening," not "unlocking"), with the journal **nested inside it** as "Your most recent ratings" (+ a real empty state with a ghosted sample). (4) **Q2 "aspiration" drives post-sign-in emphasis** (§5): stored, echoed at the reveal, surfaced as a "What you're here for" card on Palate, and — for "find the best coffee" — reflected in the catalog "Start here" rail. (5) **Bottom + desktop nav both become Catalog · Learn · Palate · More**: Journal loses its top-level slot (nested in Palate, still reachable via "See all"), **Learn** takes the vacated slot, and **More** becomes a full-page settings shell that absorbs Flavors and Sign out (the old mobile More bottom-sheet, `MobileMoreMenu`, is deleted). (6) **Learn** ships as static editorial origin cards/pages (no interactive globe). (7) A second small migration (`0012`) adds `profiles.location` for the More tab's editable Location.

**Alternatives considered:** (1) *A data-capture-maximizing quiz* (more questions, full taste profile up front). Rejected per the spec's explicit design intent — the palate is meant to fill in through real ratings over time; a long survey suppresses completion and conversion, and the reveal's job is desire, not a filled database. (2) *Persist quiz state in React/URL instead of sessionStorage.* Rejected: Google OAuth is a full-page redirect that destroys in-memory and most URL state; `sessionStorage` under a versioned key (`palato_quiz_v1`) is the only reliable carrier across it. (3) *Keep Journal as a top-level tab.* Rejected: a rating history is empty for every user on day one, so it can't earn a primary slot — but it's valuable the moment ratings exist, so nesting it one tap inside Palate (with a "See all" escape to the full view) fits the actual usage curve. (4) *Build the illustrated origin heroes the spec asked for.* Deferred: CLAUDE.md's brand section explicitly holds illustrations/custom icons to v1.1, which directly conflicts with §6's "illustrated hero." Resolved brand-safely with **typographic heroes** (large display-serif origin name over a brand-tinted band) — no stock photos, no hand-drawn art — leaving the architecture open to swap in real illustrations at v1.1. (5) *Build the recommendation engine for the "Start here" rail.* Rejected as out of scope — a transparent heuristic (origin-affinity bias + roast-preference closeness + sca_score nudge, with a highest-rated fallback when flavor is unsure) is enough to test the "did a personalized rail help activation?" hypothesis now. (6) *experience_level reusing the existing enum.* Rejected — the quiz derives a coarse beginner/intermediate/advanced bucket that doesn't map cleanly onto the 5-value `experience_level` enum, so `palate_profiles.experience_level` is a checked text column (documented in migration 0011).

**Rationale:** The cold sign-in wall asked for commitment before delivering any value; the whole rework inverts that — *experience value first (take the quiz, see your starting palate), commit second (sign in to keep it)*. Every sub-decision serves either that conversion arc (aspiration-first quiz, sessionStorage survival, the reveal) or the day-one-empty problem (seeded v0 palate, Learn as a forward-looking discovery surface that has value with zero ratings, nested journal with a shaped empty state). The aspiration loop (§5) is the retention bet: the user names what they want and the app visibly bends toward it, so the relationship feels responsive rather than extractive. Staging it as ten reviewable units (per Jesse's one-logical-change-per-turn working agreement) kept each surface verifiable in isolation.

**Tradeoffs accepted:** (a) *The "Start here" matcher is a heuristic, not a recommender* — it can surface a weak pick when a user's origin/roast combo is thin in the catalog; acceptable for a hypothesis test, and the fallback keeps the rail populated. (b) *Sub-views inside the authed app (coffee detail, rating, Learn detail, the More story) are still in-memory state, not URLs* — not deep-linkable or back-button-aware yet (inherited from #050's hybrid model). (c) *Learn content is static and hand-written* — it will drift from the catalog and needs a content owner; deliberately cheaper than a CMS or data-driven origin pages for v1. (d) *Typographic origin heroes are a stand-in* for the illustrated direction the brand eventually wants — a known visual debt, flagged for v1.1. (e) *"Send feedback" routes to a PostHog `feedback_submitted` event*, not a managed inbox/triage — functional and on-brand for Competency B/E, but it needs a review ritual to be a real feedback loop. (f) *The quiz seeds only a flavor lean* — the rest of the palate (fingerprint, sweet spots) still requires real ratings, so a brand-new user's profile is honestly thin until they rate.

**Linked competency:** D (Product Craft Artifacts) — this is a sequenced, intent-driven product experience built and logged deliberately. Strong secondary E (Feedback Loop as Product) and B (Voice of Customer) — the aspiration loop and the in-app feedback capture are the first structural pieces of treating user signal as a product input. Adjacent C (Metrics Fluency) — the rework is explicitly instrumented around activation (quiz completion → sign-in → first rating) and gives the funnel its top.

---
