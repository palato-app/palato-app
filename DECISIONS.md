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