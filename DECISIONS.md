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