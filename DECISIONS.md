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