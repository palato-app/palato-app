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

## #015 — May 2, 2026 — Rating architecture: hybrid (bag-level headline + optional brew sessions)
**Decision:** Ratings attach at the bag level by default. Brew sessions exist as optional records underneath any bag rating, capturing the variables that define a specific cup (method, grind, ratio, temperature, etc.).
**Alternatives considered:** Rate the bag only (Vivino-equivalent) — simple but loses extraction-quality signal; rate the brew only — richest data but kills activation speed with multi-step session logging; hybrid (chosen).
**Rationale:** Coffee diverges from wine in a fundamental way — the bag is not the drink. A 3-second bag rating preserves activation speed while brew sessions capture the data that powers personalization and recommendations.
**Tradeoffs accepted:** Increased data model complexity (a `brew_sessions` table joined to `ratings`) and a UI that handles two levels of abstraction.
**Implication:** v1 data model needs a `brew_sessions` table; ratings should be able to attach to either a bag or a specific brew session.
**Linked competency:** A (data foundation for AI features), D (architectural artifact)

---

## #016 — May 2, 2026 — Rating scale: 1–5 dial with 0.1 increments + Claude-extracted SCA score
**Decision:** User-facing rating is a 1–5 dial with 0.1-increment granularity (Vivino-style). Separately, the SCA score printed on the bag is captured as an informational field — extracted by Claude during scanning, never user-entered.
**Alternatives considered:** 1–5 stars (J-curve clustering, dead middle space); 1–10 (marginal improvement, cultural calibration drift); SCA 100-point cupping scale (effectively compresses to 80–100, intimidates Curious Upgrader segment); 1–5 dial with 0.1 increments + SCA capture (chosen).
**Rationale:** The dial answers "how was it?" — emotional, fast, recognizable. Brew session data and flavor tagging carry the precision load. Surfacing SCA scores earns credibility with roasters and pros without forcing every user to think in 87-point terms; doubles as vocabulary-building for Curious Upgraders.
**Tradeoffs accepted:** Two parallel rating numbers may confuse some users initially. Mitigation: visual hierarchy — user dial is primary; SCA appears as a small badge or detail field.
**Linked competency:** D (UX decision with documented rationale)

---

## #017 — May 2, 2026 — Post-rating flow: progressive disclosure + behavioral adaptation
**Decision:** The post-rating flow uses progressive disclosure with smart defaults. Required fields are minimal. Default-visible fields are pre-populated from the user's history. Deeper fields are one tap away. The system observes actual usage and adjusts what's visible over time.
**Alternatives considered:** Uniform flow (same for everyone — floors the ceiling for power users); adaptive-by-segment (paternalistic, unreliable segment assignment); user-chooses-depth ("Quick log" vs "Full session" — adds a meta-decision before the flow); progressive disclosure + behavioral adaptation (chosen).
**Rationale:** Lets every user finish in seconds if they want, and lets any user go deep without being prompted to. Avoids segment guessing. Adaptation is driven by what users actually do: if a user always expands brew detail, surface it earlier; if they never do, hide it harder or invite them back with a contextual prompt.
**Tradeoffs accepted:** More implementation complexity than a static flow. Requires usage telemetry to drive adaptation.
**Linked competency:** B (designed with VoC adaptation built in), D (UX architecture artifact)

---

## #018 — May 2, 2026 — Design principle: every optional question must visibly return as insight
**Decision:** Adopt "insight-return" as the standing constraint on any optional field added to the rating or post-rating flow. If a piece of data we collect doesn't eventually surface back to the user as personal insight, it doesn't earn its place in the flow.
**Alternatives considered:** Maximize data collection (ask everything the recommender might want — corrodes trust over time); minimize friction (Vivino's tendency — optimizes activation but product knows less about you than expected after months); insight-return principle (chosen).
**Rationale:** The Aura/Whoop reframe — users aren't averse to data collection; they're averse to *unrewarded* data collection. Making the user the protagonist of their own taste dashboard, rather than the source material for ours, is the wedge Palato uses to out-design Vivino on the post-rating flow. Concrete test: "what was your grind size?" doesn't earn its slot unless it eventually produces something like "you tend to rate medium-coarse pour-overs higher than fine espresso pulls."
**Tradeoffs accepted:** Every new field requires a paired insight commitment, which adds ongoing design overhead.
**Linked competency:** A (governs what data the AI features need to return), D (design heuristic that constrains future decisions)

---

## #019 — May 2, 2026 — Defer regression-based recommender to v1.1+; design v1 schema to support one
**Decision:** v1 will not include a trained regression model for recommendations. v1's data schema will be designed to capture the user-side, coffee-side, and context-side features that a regression model would require, so one can be trained on real Palato data in v1.1+.
**Alternatives considered:** Build a regression-based recommender into v1 (premature — no training data); skip regression permanently and stay Claude-only (forfeits fast quantitative prediction once data exists); defer build, design schema for it (chosen).
**Rationale:** The disciplined version of the feedback from Josh S. (April 2026 user interview) was not "build a regression model now" — it was "design for one." A regression model trained on no data is worse than no model. Claude serves as the v1 recommender while ratings accumulate. With ~5,000 ratings across ~500 users, there's enough signal to train a meaningful first model. Schema migrations are expensive; getting the fields right from the start is the cheap version of this decision.
**Tradeoffs accepted:** Schema work upfront that won't pay off for months.
**Linked competency:** A (foundational architecture for evolving AI capability), D (technical decision with documented forecasting)
