# INTERVIEWS.md

## Purpose
A living record of user research signal for Palato. Each round of interviews adds a new section.

This doc contains both raw signal (verbatim quotes, sample composition) and synthesis (themes, implications, action items). Direct user quotes are kept short and used sparingly.

This is **not** a substitute for full interview transcripts (those live in `docs/interviews/`, one file per session) and **not** a place for product roadmap decisions (those go in DECISIONS.md after synthesis).

Names of respondents who explicitly engaged via personal email: first name only. Anonymized when in doubt. No emails, no last names.

## Method
- **Screener form:** Tally — https://tally.so/r/b52L57
- **Interview script:** see [docs/interview-guide.md](docs/interview-guide.md) (Round 2 — grounded in the shipped onboarding/quiz flow; supersedes palato-prd-v01.md §8)
- **Incentive:** one bag of specialty coffee, contingent on selection for an interview
- **Recruiting (Round 1):** personal DMs to Jesse's network (heavy on coffee professionals)
- **Target sample size:** 5-10 quality interviews per round

## Sample status
- Round 1 screener completions: 5
- Interview yeses (with email): 2 — Lucy, Jeremy
- Interview yeses (no email captured): 1 — Kyle (replied "Sure!" but didn't leave email; needs follow-up)
- Maybe (business email): 1 — Kevin
- Declined: 1 — Jes (no email left)
- Out-of-band interviews conducted: 1 — Josh S. (May 2, 2026; recruited via Jesse's personal network, not screener)

## Round 1 — April 25–26, 2026

### Sample

| Respondent | Self-reported segment | Buying frequency | Interview status |
|---|---|---|---|
| **Lucy** | Deep into it | About once/month | Yes |
| **Jeremy** | Professional | 2-4x/month | Yes |
| **Kevin** | Professional | 2-4x/month | Maybe (business email) |
| **Kyle** | Deep into it | A few times/year | Wants to talk, no email captured |
| **Jes** | Professional | Weekly+ | No interview (no email) |

**Sample skew:** 3 self-reported Professionals, 2 Deep into it. Zero Curious Upgraders, zero Comfortable. Recruitment was through Jesse's existing coffee-industry network — Round 2 needs to target newer-to-specialty drinkers via different channels (specialty grocery shoppers, r/Coffee newcomers, etc.).

**Self-report vs behavior gap (worth flagging):** Kyle self-reports as "Deep into it" but only buys specialty a few times per year. Jesse's contextual read places him closer to Curious Upgrader. That gap — between aspirational identification and purchasing behavior — is itself a useful Round 2 interview question. It also suggests the Q3 categories may be too binary, or that respondents may self-rate aspirationally rather than behaviorally. Worth pressure-testing in Round 2's screener design.

### Top signals

**Theme 1 — Memory friction is universal, even among pros.**
*What we heard:* All 5 respondents described different failed workarounds. "I don't have a system" (Jes, weekly+ buyer who self-identifies as Pro). "Take a picture but it gets lost in my camera roll" (Lucy). "I just remember by emotion" (Kyle). "Save the bags" (Jeremy). Even Q-graders haven't solved this.
*What it means:* The journal/log core loop is validated. The product's value isn't "help me track" (everyone tries) — it's "help me track in a way that doesn't fail." That's the wedge.

**Theme 2 — Discovery cost is real money; behavior is loss-averse.**
*What we heard:* Lucy: "If I buy something I end up not liking, I have to use it because I likely spent $18+ on a 10-12 oz bag." Multiple respondents described using bags they didn't enjoy — pushing through 4 pour-overs (Kyle), switching to drip or cold brew (Kevin), letting it go stale (Jes). Nobody throws coffee away.
*What it means:* Palato's value is reducing the rate of bad purchases. Recommendation accuracy translates to dollars saved. The "$18 stuck bag" is a willingness-to-pay anchor for any future monetization conversation.

**Theme 3 — Trust gaps in roaster-published information.**
*What we heard:* Kevin: "Inaccurate or embellished flavor notes, difficult traceability, not being able to try it in the shop first." Kyle: "Places have different definitions of how developed it is. It's all a crap shoot until I taste it." Jeremy: "I didn't read the roast date and it was super old."
*What it means:* Cross-user tasting notes that contradict roaster marketing copy is a real data product, not just a feature. The schema needs both roaster's claimed notes and user's actual notes as separate fields, so we can compute "users perceive this coffee as more X and less Y than the roaster says."

**Theme 4 — Variety expansion within a known palate.**
*What we heard:* Jes: "I know I like naturals and anaerobics, from Colombia and Ethiopia especially, but don't want to limit myself to that alone."
*What it means:* The recommendation engine isn't "find similar" — it's "find adjacent." Anchor on user's known preferences, surface coffees one parameter away.

**Theme 5 — Concept validation landed strong, with one fair caveat.**
*What we heard:* 4 of 5 said "Yes, immediately" to the app concept. 1 of 5 said "Maybe — depends on how it works" (Kevin, the most skeptical respondent on data quality).
*What it means:* Concept validated. Remaining question is execution quality, particularly tasting note accuracy. Kevin is the most useful interview to book — he'll stress-test the implementation rather than rubber-stamp the idea.

### Verbatim worth keeping

- **Lucy:** "Take a picture of the bag (but it gets lost in my camera roll)." — almost a literal description of the friction Palato solves.
- **Lucy:** "$18+ stuck with a bag I don't like." — willingness-to-pay anchor.
- **Jes:** "I don't have a system."
- **Kyle:** "It's such an emotional experience I just remember."
- **Kyle:** "It's all a crap shoot until I taste it."
- **Kevin:** "Inaccurate or embellished flavor notes, difficult traceability."

### Schema and product implications (going into Round 1 schema work)

1. **Add `roast_date` field to `coffees`** (date, nullable). Directly responsive to Jeremy's regret. Specialty drinkers check this; PRD's schema didn't include it.
2. **Capture roaster's tasting notes separately from user's tasting notes.** PRD already had user notes. The survey makes the case for storing the roaster's claim on the coffee record itself. Trivial to add now, painful to retrofit.
3. **Capture `producer` and `farm` in `coffees` as optional, nullable fields.** Pro respondents (Kevin) remember coffees by producer, sometimes more than by roaster — the producer is where the coffee's identity lives in specialty culture (different roasters often buy from the same producer). Curious Upgraders won't engage with this granularity yet. Implication: include the fields in the schema; design the rating UX to progressively disclose them rather than require them. Schema-wise yes, UI-wise opt-in.
4. **Defer:** A "what did you do with the bag you didn't like" outcome field. Interesting signal but not V1 scope.

### Sample gaps

- **No Curious Upgraders by self-report.** PRD's "transitioning into specialty" segment is unrepresented at the screener level. (See note above on Kyle.)
- **No Comfortable tier** (Intentional Explorer's lower band).
- **Recruitment bias:** DMs went to Jesse's network, heavy on coffee professionals. Round 2 needs deliberately different channels.

---

## Round 1 Interviews — May 2026

### Josh S. — May 2, 2026

**Profile:** Business Analyst, strong tech background. Self-described non-specialist coffee drinker — places him in the **Curious Upgrader** segment (matches PRD definition: transitioning into specialty, not yet deeply in the culture). Notable because the screener sample skewed heavily Professional; Josh is the first confirmed Curious Upgrader in the interview record.

**Concept reaction:** Strongly positive. Unprompted, said he would use the app constantly. Validated without needing much explanation.

**Verbatim worth keeping:**

- "If you don't build this, I will." — strongest unsolicited concept validation in Round 1.
- "This sounds like a powerful app, I would definitely use this all the time."
- "If you can attach a strong regression model, that's what would make this an app worth using again and again, I'd want that kind of data."

**Key signal — the Oura Ring positioning frame:**
Josh suggested repositioning Palato less as a Vivino-for-coffee and more as a **data wearable for coffee** — the Oura Ring or Apple Watch for your morning cup. The analogy: people tolerate daily data entry into fitness apps because the output (trends, insights, personalized analysis) creates a feedback loop they want to return to. If Palato can deliver that kind of personalized data back to the user, the daily rating becomes habitual rather than effortful. He explicitly tied this to retention: more entry → better model → better insight → more entry.

*What it means:* This is a meaningful positioning signal. The "Vivino for coffee" frame anchors Palato in discovery and social proof. The "Oura for coffee" frame anchors it in self-knowledge and personalized analysis. These aren't mutually exclusive, but they suggest different retention loops. Worth pressure-testing in future interviews: which frame resonates more with Curious Upgraders vs Professionals?

**Key signal — regression models:**
Josh (as a BA with quantitative background) pushed hard on integrating regression models early — suggesting they'd be the mechanism that makes the data meaningful over time rather than just a log. He acknowledged Jesse needed to research this further before committing to it. *Treat this as a credible signal from a technically fluent user, not a feature commitment.* The underlying ask: "help me understand what my data means, don't just store it."

*What it means:* Palato's long-term value prop may depend on whether we can surface pattern-level insights ("you consistently rate naturals from Ethiopia 0.8 stars higher than anaerobic Colombians") rather than just logging. This is directionally aligned with Theme 4 from screener synthesis (variety expansion within a known palate) but goes further — the user wants the *app* to discover their palate for them. Needs research before any schema or architecture decisions are made.

**Implication for atomic action + engagement loop:**
Josh's framing suggests the rating flow shouldn't end at "submit." A short set of post-rating questions ("how did you brew this?", "time of day?", "what were you in the mood for?") could be the equivalent of Apple Watch's daily health inputs — low friction individually, high signal in aggregate. Jesse wants to explore this explicitly as a next step (see action items below).

### Round 1 → action items

- [ ] Reach out to ~10 Curious Upgrader prospects via different channels before booking interviews
- [ ] Book Lucy and Jeremy for first interviews
- [ ] Follow up with Kyle for email (he said "Sure!" but didn't leave one)
- [ ] Push to schedule Kevin — most useful skeptic in sample
- [ ] Add `roast_date`, separated tasting notes, and `producer`/`farm` fields to schema (informs tonight's migration)
- [ ] Pressure-test the Q3 categories in Round 2 screener design (self-report vs behavior mismatch)
- [ ] Research regression models in the context of taste profiling — understand what's feasible and what data schema would be required before committing to a direction (Josh's signal; credible but needs grounding)
- [ ] Explore the post-rating engagement loop: what are the 3–5 "daily input" questions a user could answer after rating that would build enough signal to generate personalized insights? Map these to the atomic action flow.
- [ ] Test the Oura/Apple Watch positioning frame in the next 2 interviews — does it resonate across segments or is it specific to data-oriented users like Josh?
- [ ] Log a DECISIONS.md entry on the positioning tension: "Vivino for coffee" vs "Oura for coffee" — not a decision yet, but the frame is worth documenting so it can be pressure-tested deliberately.

---

## Round 2 — In-app usability interviews (July 2026)

First round conducted against the shipped product (onboarding → quiz → add-and-rate → Learn → Palate → recommendations), using the Round 2 script in [docs/interview-guide.md](docs/interview-guide.md). Sessions are think-aloud walkthroughs on the participant's own phone, with a live add-and-rate task using a real bag.

### Jono — July 8, 2026

**Transcript:** [docs/interviews/2026-07-08-jono.md](docs/interviews/2026-07-08-jono.md) (includes full verbatim transcript + anecdotal observations). 46 minutes — tighten future sessions.

**Profile:** 13 years in specialty; daily V60 (40g @ 1:17, two people); ~3 bags/month from 2+ roasters, ~$66/month. NYC, brick-and-mortar buyer (Big Mouth, Bird & Branch). Buying criteria in order: price-to-value, roast date, origin, tasting notes. Hard ceiling ~$24/12oz. Estimates 15% of bags "incredible," 15% "awful." Segment read: behaviorally **Deep into it**, but motivationally a **value-maximizer** — a flavor of enthusiast our segments don't yet name (skilled and engaged, but explicitly *not* chasing quality at any price). Recruited via personal network (family) — same recruitment-bias caveat as Round 1.

**Top signals:**

1. **Selective logging, not habitual logging.** Would only log coffees he's genuinely impressed by; a gifted/one-off bag isn't worth the effort because the memory isn't *actionable* ("I know I'm not going to get my hands on it again"). Flat no to rating every coffee even if the app were free. Consistent with Round 1 Theme 1 (memory friction) but sharpens it: the log's value is proportional to re-acquirability. Tension to watch: the palate engine assumes rating volume; this user will supply sparse, positively-biased data.
2. **Rating-form fatigue is real and mid-form.** "Man, this is a lot of info for a coffee I'm never going to have again" — plus real-life time pressure (child at home) → skipped "add more details." Independently reproduces Jesse's own May self-test findings (Decisions #027/#028 territory). Second confirmed voice; this is now validated debt, not opinion.
3. **Per-brew vs. per-bag ambiguity.** Couldn't tell if the form captures one brew session or the whole-bag experience. New finding; goes to the heart of what a "rating event" means in the schema.
4. **Learn: depth before framing.** Overwhelming as a flat wall; wants collapsible region groups (click "Caribbean" → countries). Globe expectations are absolute: must spin freely and pinch-zoom ("It's not a globe if it doesn't spin"). Wrong scroll position on region click compounds it. Also: a globe on the *Palate* tab reads as misplaced ("my mouth is not a globe").
5. **Recommendations: general > hyper-specific, and never a dead end.** A specific-bag rec he can't get locally is ignored ("not already in my lifestyle of how I shop"); a region/style rec is welcome. But a specific rec **with a working purchase link** flips him to yes — even as an in-person shopper. Price shown must match the roaster's site exactly; "don't lead me to a 404 or a sold-out coffee." Shipping info explicitly not expected. Local-shop recs ("go try this shop in the West Village") would resonate strongly — the urban brick-and-mortar case is underserved.
6. **App identity readback:** "a diary of coffee" + educational tool + palate tracker — and palate tracking is the part he's *least* interested in. Not social, not commerce (yet). Would consolidate his existing web-browsing behavior if community ratings/notes-vs-roaster-claims + browsing + purchasing lived in one place (echoes Round 1 Theme 3). Trust in recs must be *earned* through his own logged data.
7. **Starting palate landed flat.** "It wasn't wrong at all… it wasn't data that moved me in any way." Onboarding itself "painless," but factoids were skimmed. The quiz reveal is accurate-but-inert for this segment.

**Verbatim worth keeping:**

- "Man, this is a lot of info for a coffee I'm never going to have again." — the rating-cost ceiling.
- "It's not a globe if it doesn't spin."
- "My mouth is not a globe." — on the Palate tab's map.
- "I don't want another information silo." — recs must terminate in a purchasable page.
- "Don't lead me to a 404 or a sold-out coffee."
- "It wasn't wrong at all. But it wasn't data that moved me in any way." — starting palate.
- "I can't afford to be that picky." — the value-maximizer thesis in one line.
- "I feel stuck." — searching the catalog with intent to buy, no purchase path visible (coffee not yet augmented).

**Issue inventory (replication status noted; prioritization → DECISIONS.md / TECH_DEBT.md, not here):**

| # | Issue | Status |
|---|---|---|
| 1 | Learn region click lands at wrong scroll position | **Fixed July 8, 2026** (scroll reset on Learn drill-down + all AuthedApp view changes) |
| 2 | Palate map country click → catalog jumps to top instead of the country section | **Fixed July 8, 2026** (origin-filtered catalog arrivals land on the results bar) |
| 3 | Rating dial has no scale anchors (had to ask "5 is great, 1 is terrible?") | **Fixed July 8, 2026** ("Bad"/"Incredible" anchors under 1 and 5) |
| 4 | Globe: no free spin, no pinch-zoom | **Fixed July 8, 2026** (zoom enabled with clamped bounds + drag inertia) |
| 5 | Add-coffee form doesn't mark required fields (hit validation stop on roast level) | **Fixed July 8, 2026** (legend + live "Still needed: …" hint on add + edit forms) |
| 6 | Elevation field can't take a range — user typed 1200 for "1200–1650" | **Fixed July 8, 2026** (migration 0017 + range parsing everywhere; Decision #063) |
| 7 | Rating form fatigue / length | **Confirms known debt** (Decisions #027/#028; Jesse's self-test) — now 2 voices |
| 8 | Per-brew vs. per-bag ambiguity in rating form | New, n=1, structural |
| 9 | Learn wall-of-buttons → wants collapsible region groups | New, n=1 |
| 10 | Non-creator "Edit details" on any coffee felt wrong | **Conflicts with Decision #045** (open-edit intentional for beta); TECH_DEBT already flags it at scale |
| 11 | Body/acidity slider hard to drag (mobile Chrome) | New, n=1, needs repro |
| 12 | Rate-field mis-tap jumped page to Body section | New, n=1, needs repro |
| 13 | Descriptor matcher: "chocolate covered almonds" → almond matched, chocolate didn't | New, n=1, needs repro |
| 14 | Couldn't navigate back to a recommendation card after leaving it | New, n=1, needs repro (may be discoverability, not a bug) |
| 15 | No visible purchase path from catalog search ("I feel stuck") | Known gap — commerce block only on augmented coffees; fix = finish augmentation backlog |
| 16 | Logo reads "Po-too" (L+A → U) | New, n=1, brand-sensitive |
| 17 | Onboarding factoids skimmed | New, n=1 |
| 18 | Starting palate accurate but inert | New, n=1, product question not bug |
| 19 | Post-quiz dead end at night (nothing to do without a coffee to rate) | New, n=1, activation-gap design question |
| 20 | Globe on Palate tab feels misplaced | New, n=1 |
| 21 | OAuth consent screen shows the raw Supabase URL ("Sign in to Scroggs Freedom" gibberish) — trust-killer at the moment of asking for trust | Jesse called it live; config task (Supabase custom domain / Google consent-screen branding), not code |
| 22 | No in-app feedback that a submitted coffee is pending admin approval ("Well, I hope it gets approved" — learned only verbally) | New, n=1; small copy add on the post-save confirmation |
| 23 | No visible progress toward the 3-rating threshold after rating ("Your starting palette hasn't changed, but I'm on my way") | New, n=1; a "1 of 3" marker would close the loop |
| 24 | Scan-prefilled jargon lands unexplained ("S9. I don't know what that is" / "I have no idea what these hills are") | New, n=1, wait for replication |
| 25 | "Add more flavors" section invisible — skipped without seeing it | New; fold into the #7 form redesign, not a standalone fix |

### Round 2 → action items

- [ ] Move confirmed UX fixes into TECH_DEBT.md / a fix session; log any model changes (e.g. edit-permission reversal vs. Decision #045) in DECISIONS.md
- [ ] Take the strategic threads (general-vs-specific recs, local-shop recs, community ratings, palate-tracking disinterest, value-maximizer segment) to the Claude.ai project chat — build direction, not build mechanics
- [ ] Tighten the script toward ~30 min; the add-and-rate task + Learn + recs Q&A is the high-yield core
- [ ] Watch for replication in the next 2–3 sessions: logo readability, factoid skimming, inert starting palate, per-brew vs. per-bag confusion, globe-on-Palate placement
- [ ] Fix the script line "I'm going to hand you…" (remote/own-phone sessions don't hand anything)
- [ ] Continue recruiting outside the personal network — Jono extends the Round 1 bias (family, coffee-fluent)
