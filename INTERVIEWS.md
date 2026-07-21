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
- Interview yeses (no email captured): 1 — Kyle (replied "Sure!" but didn't leave email; **interviewed July 20, 2026** via personal-network follow-up)
- Maybe (business email): 1 — Kevin
- Declined: 1 — Jes (no email left)
- Out-of-band interviews conducted: 2 — Josh S. (May 2, 2026); Joy (July 20, 2026) — both recruited via Jesse's personal network, not the screener

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
- [x] Book Lucy and Jeremy for first interviews (Lucy: June 18; Jeremy: July 13 — see Round 2)
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

First round conducted against the shipped product (onboarding → quiz → add-and-rate → Learn → Palate → recommendations), using the Round 2 script in [docs/interview-guide.md](docs/interview-guide.md). Sessions are think-aloud walkthroughs on the participant's own phone, with a live add-and-rate task using a real bag. Four sessions so far: Jono (7/8), Jeremy (7/13), Joy (7/20), Kyle (7/20). Joy and Kyle were run on the same day and are the **first sessions Jesse did not personally facilitate** (Joy) or that shifted heavily into venture/monetization territory (Kyle).

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
| 3 | Rating dial has no scale anchors (had to ask "5 is great, 1 is terrible?") | **Fixed July 8, 2026** ("Bad"/"Amazing" anchors under 1 and 5) |
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

### Jeremy — July 13, 2026

**Transcript:** [docs/interviews/2026-07-13-jeremy.md](docs/interviews/2026-07-13-jeremy.md) (structured notes + anecdotal observations + full verbatim transcript). Remote (Zoom, own phone, screen-shared). Session itself was efficient once the walkthrough started; ~15 min of catch-up at the top (personal friend).

**Profile:** Jeremy Lupinacci — former Q-grader, part-time coffee influencer ("Jeremymakescoffee"), Fullerton, CA. This is the Round 1 screener Jeremy (self-reported Professional, 2–4 bags/month) finally interviewed. ~95% espresso (black Americanos, 2–3 cups/day) on a full home setup; buys ~10 lbs/month including a weekly church bulk buy; personal spend ~4 bags/month at $23–25, mostly variety. Ethiopian natural/washed for espresso, Guatemala/Mexico for chocolatey profiles; V60 or AeroPress+Prismo for gifted/unusual bags. Quality split: 15% incredible / 65% mid / 20% bad. Priority ranking: 1) bang for buck, 2) joy, 3) palate expansion — "because I also know my taste now." Saves empty bags; ~40 framed as wall art. Recruitment: personal network — same bias caveat as every session so far.

**Top signals:**

1. **The value-maximizer segment now includes a Q-grader.** Bang-for-buck ranked #1 even by the most credentialed palate in the sample — same rationale as Jono ("because I've had so much coffee"). Nearly identical quality splits too (Jeremy 15/65/20, Jono ~15/70/15). Two voices, opposite coasts, opposite brew methods: expertise seems to *converge* on value-maximizing, not diverge from it. The "expanding my palate" pitch is the *weakest* hook for exactly the users with the most data to give.
2. **The journal is the personal draw — and the quiz can't express it.** Unprompted: "I wish I could remember more of the experiences with some of these bags… I would value some type of track record." The one quiz option he wanted and couldn't find: "keep track of my coffee memories." His strongest re-buy story (the Iceland strawberry coffee) is a memory with the roaster attached but the *data* missing — a literal spec for the log. Extends Round 1 Theme 1 with a new nuance: for high-volume drinkers the failure isn't losing the coffee, it's losing the *experience*.
3. **Per-brew vs. per-bag: replicated, and he designed the fix.** Independently proposed the exact structure Jono's confusion pointed at: keep flavor/body/acidity/score as the *bag* rating; move extraction, brew method, and dosing into dated per-cup journal entries under the bag ("this is the cup of coffee I had on July 13th, with this bag") or a collapsible advanced section. Issue #8 is now n=2 and comes with a structural proposal. He also tied per-cup entries to the future social layer ("What did Lance Hedrick brew this morning?") and to espresso (where journaling brew parameters is the value, since flavor scoring is unreliable — supports filter-first).
4. **Form length: third voice, but with a Q-grader's calibration of the floor.** Core fields = "exactly what information I would be thinking of if I'm scoring a coffee"; everything after acidity is past the line ("the Q grading system itself is like too much"). Issue #7 now has 3 voices *and* a validated minimum: how-was-it, flavor notes, body, acidity. Everything else is journal territory. Also wants all fields editable after the fact (they are — worth confirming that's discoverable).
5. **Body/acidity sliders need numeric anchors (1–5).** Loves the dial's decimal specificity; the sliders below it are "eyeballing" — can't compare across bags ("this was slightly more of a light body… you might miscategorize it"). New issue, distinct from Jono's dial-anchor fix.
6. **The globe landed — but the July 8 fix may have overshot.** "No notes, this is sick" on the origin pages; Harvest and Elevation called out as highlights. But spin sensitivity is now too high on mobile ("I'm barely moving my finger") — likely a regression from the July 8 drag-inertia fix, needs a mobile pass. Feature request with a clear why: **regional elevation** (not just country-level), because elevation predicts profile ("if it's Huila, I'll have much more of an affinity because of the elevation"). Varietal walls are fine as skim-reference ("same way as a Wikipedia page") — matches Jono's "depth before framing" but with more tolerance.
7. **Counter-signals to Jono — segment-dependent, not settled:** factoids *landed* ("fun factoids… feels very conversational" vs. Jono's skim); the starting palate *landed* ("it feels accurate for what I know my profile to be" vs. "accurate but inert"); pronunciation read fine ("Palato probably makes most sense"). One-for-one on each — keep watching, don't act yet.
8. **Trust-killer replicated:** joked about the raw Supabase URL at sign-in — "saving my information to a Russian farm. But I trust you." Second session in a row where the OAuth screen burned trust at the exact moment of asking for it (Jono issue #21, now n=2). He trusted it *because he knows Jesse personally* — a real user won't.
9. **Recommendation filters:** wants both lenses explicitly — "what does the community rate highest" *and* "what would be most aligned with my preference." Complements Jono's general-vs-specific finding; community ratings are now requested by both Round 2 participants.
10. **Gamification and profile as retention/commerce levers:** Letterboxd-style top-4 favorites on a public profile; check-off coffees by country *and region* — explicitly tied to buying behavior ("I would get more into rating and scoring and buying bags if there was that kind of dopamine incentive") and, his suggestion, to monetization (promoted placements in those discovery surfaces).

**Beyond the interview (logged here, decided elsewhere):** Jesse floated formal collaboration — Jeremy is genuinely interested, thinking it over during a 2-week Europe trip; committed as a sounding board regardless. Jesse named the gaps: distribution, marketing, biz dev/revenue modeling. Monetization options discussed: affiliate per-bag commission vs. subscription w/ trial vs. promoted placements. Jeremy joins the WhatsApp beta community. These are venture-track threads for the Claude.ai project chat, not build mechanics.

**Verbatim worth keeping:**

- "I wish I could remember more of the experiences with some of these bags of coffee." — the memory gap, from the highest-volume drinker yet.
- "The most annoying thing is knowing that it's going to run out." — seasonality as the pain, not discovery.
- "As a Q grader, this is exactly what information I would be thinking of… [but] the Q grading system itself is like too much." — the form-length floor and ceiling in one breath.
- "This is like the cup of coffee I had on July 13th, with this bag." — the per-cup journal, designed by a user.
- "No notes, this is sick." — the origin pages.
- "Saving my information to a Russian farm. But I trust you." — the OAuth screen, surviving on personal trust alone.
- "I would love to check off all the boxes and regions in the world." — gamification as purchase driver.
- "Number one priority is probably bang for my buck… because I also know my taste now." — value-maximizer thesis, second voice.

**Issue inventory (replication status noted; prioritization → DECISIONS.md / TECH_DEBT.md, not here):**

| # | Issue | Status |
|---|---|---|
| J1 | Quiz origin question is single-select; should be multi-select | Confirmed live by Jesse ("I meant to add multi-select") |
| J2 | Post-quiz lands on catalog's "Start here" rail; should default to Palate | Confirmed live by Jesse ("that's not really where I want you to start") |
| J3 | Body/acidity sliders lack numeric labels (1–5) for cross-bag comparison | New, n=1, low-cost |
| J4 | Extraction/brew/dosing too heavy for the bag rating → collapsible advanced section or per-cup journal entries | **Replicates #7 (now 3 voices) + #8 (now n=2)** — with a structural proposal |
| J5 | Globe spin sensitivity too high on mobile | New; likely regression from the July 8 inertia fix (Jono #4) |
| J6 | Raw Supabase URL on OAuth consent screen | **Replicates Jono #21 (n=2)** — config task, rising urgency |
| J7 | Scan didn't extract the cursive coffee name (everything else pre-filled) | New, n=1; expected failure mode, feeds the scan eval |
| J8 | Newly added coffee doesn't surface at the top of the catalog | Jesse called it live ("it should go to the top") |
| J9 | Chocolate descriptor granularity — wanted "milk chocolate," felt limited to milk/dark | New, n=1 (adjacent to Jono #13 descriptor-matcher miss) |
| J10 | Quiz motivation question has no "track my coffee memories" option | New, n=1; journal motivation is invisible to the quiz |
| J11 | Regional (sub-country) elevation data on origin pages | Feature request, n=1, clear rationale (elevation → profile targeting) |
| J12 | Profile "favorite coffees" showcase (Letterboxd top-4) | Feature request, n=1, social-layer track |
| J13 | Country/region check-off gamification | Feature request, n=1, retention/commerce track |

### Joy — July 20, 2026

**Transcript:** [docs/interviews/2026-07-20-joy.md](docs/interviews/2026-07-20-joy.md) (structured notes + anecdotal observations + full verbatim transcript). In person, own phone. **First Round 2 session Jesse did not facilitate** — a teammate ran it, narrating on-screen actions for the recording.

**Profile:** Joy — 62, ~10 years into specialty (introduced by Jono, ex-Intelligentsia; gateway was Bridgeport in Chicago). Daily pour over on a Hario Switch, 1:16 @ 205°F, 40g→640g. Passenger subscriber (3 bags/mo, ~$65–70) supplemented from Big Mouth (1–2/mo, $18–27); ~$100–115/mo for two. Palate shifting dark→medium; leans chocolatey/nutty, recoils from "bitey"/acidic. Quality split ~10/80/10. Recruited via personal network (coffee-fluent, Jesse/Jono's circle) — same recruitment-bias caveat as every session so far. Segment read: a **joy-first spender**, not a value-maximizer — she'll happily pay more ("it's our habit… I don't mind spending more") and ranks *experiencing joy* above uniqueness and well above value ("I'm just not going to" buy a $65 Geisha, but not out of thrift). The first clear counter to the Jono/Jeremy value-maximizer convergence.

**Top signals:**

1. **"Like having your colors done" — a positioning line for the non-technical enthusiast.** Joy's own, unprompted, repeated twice: the app tells you what suits your palate the way a color analyst tells you which yellows suit you, so you stop "buying blindly." This is the Oura/Vivino framing debate answered in a *third* register — self-knowledge as personal-styling, not data-wearable and not social-proof. Lands emotionally for an older, non-quantified user in a way the "starting palate" reveal (which she found "limited right now") did not.
2. **Café-cup logging, not just bags (new, strong).** Her most animated feature ask: log a coffee she loved *at a shop* — "that one cup may be more information for me than a bag I'm buying blindly." She'd ask the barista, photograph the bag, and enter the brew method manually. Distinct from the add-a-bag flow the product assumes; goes to the same per-brew-vs-per-bag question Jono/Jeremy raised, from the demand side (she *wants* a per-cup record of a non-purchasable experience).
3. **Learn as a brew-education destination + expert brew recs per coffee (new, strong).** Wants Learn to teach brew *methods* and *ratios* (Kalita vs. V60; "it's not always 1:16?"), not just origins — because that's what she actually struggles with. And a per-coffee expert brew recommendation ("a barista-award winner: here's my ratio") — "takes the guesswork out and I'm not wasting coffee." Trust mechanism: credentials alone suffice ("you've got a title behind your name"). Explicit tone requirement: approachable, straight-answer, *not* pretentious (the anti-Onyx-barista).
4. **OAuth Supabase-URL trust-killer — now n=3.** "Rolfo Sousa was in the Supabase… it's crazy." Third consecutive session where the consent screen burns trust at the ask (Jono #21, Jeremy J6, Joy). Urgency rising.
5. **Globe: outlines too dark + spins too fast.** Country/continent outlines are illegible ("unless you know your geography, I don't know what that is" — wants faint/dashed continent traces); zooming in helped. Spin-too-fast replicates the Jeremy J5 / Jono #4 globe-feel thread — now the sensitivity complaint spans both Learn *and* the Palate map.
6. **Two new activation-flow bugs at the very start.** "Unlock Your Palate" didn't read as *create an account* ("doesn't seem clear this is where I create an account") — n=1 but it's the primary CTA. And **"Rate Your First Coffee" routed to the catalog, not the rating flow** — a concrete misroute, distinct from Jeremy's J2 (post-quiz *landing*), here it's the empty-state CTA.
7. **Flavor-notes list overwhelms → search-first.** Faced with the descriptor grid: "this feels overwhelming… I'm tasting all these things." Preferred to type ("cherry"→matched "red cherry"), wanted the list collapsed. Reinforces the descriptor-entry redesign (Jono #25, the "add more flavors" thread) with a clean "type, don't scroll" vote.
8. **Origin-affinity fallback "somewhere else" reads as inert/incomplete** — she picked it because her palate is mid-migration (Ethiopian→medium, origin-agnostic) and the label gave nothing back. Adjacent to Jono's "accurate but inert" starting palate (#18), but here it's the *fallback copy* specifically.
9. **"Cheating" tell — users treat rating as a self-test.** She asked whether reading the bag's notes first is cheating. The app should explicitly bless subjectivity ("you don't have to taste what they say"); it currently relies on the facilitator to say it.
10. **Counter-signals to the value-maximizer thesis** (see profile): joy-first, spend-willing, seasonal-grief-driven. Her re-buy pain is for *unre-acquirable* seasonal coffees (Big Shoulders Ugandan Bugisu; Onyx Chalbesa Anaerobic) — so her recommendation need is "find me something *similar*," not "buy this again." She also volunteered a sharp critique of the wine analogy: bottled wine "lives on a shelf longer," so coffee's seasonality is *less* predictable than wine's — the "Vivino for coffee" frame has a demand-side seam.

**Verbatim worth keeping:**

- "Not too different from somebody who had their colors done." — the positioning line.
- "As I add to my library it's going to expand and show what I really lean towards… it dials into my palate." — the product thesis in a non-technical user's words.
- "That one cup of coffee may be more information for me than a bag of beans that I'm buying blindly." — the café-logging ask.
- "I just want a good cup of coffee." / "Just tell me the answer." — the anti-pretentious tone requirement (re: the snarky Onyx barista).
- "It takes the guesswork out of it for me and I'm not wasting coffee." — why an expert per-coffee brew rec would land.
- "Rolfo Sousa was in the Supabase." — the OAuth trust-killer, n=3.
- "Unlock your palette doesn't seem clear to me that this is where I create an account." — the primary-CTA gap.
- "Experiencing joy when I taste coffee would be first." — the joy-first segment, against the value-maximizer grain.

**Issue inventory (replication status noted; prioritization → DECISIONS.md / TECH_DEBT.md, not here):**

| # | Issue | Status |
|---|---|---|
| Y1 | "Unlock Your Palate" CTA doesn't signal account creation | New, n=1, primary-CTA copy |
| Y2 | "Rate Your First Coffee" empty-state CTA routes to catalog, not the rating flow | New, n=1; misroute (distinct from Jeremy J2's post-quiz landing) |
| Y3 | OAuth consent screen exposes raw Supabase URL | **Replicates Jono #21 / Jeremy J6 — now n=3**, config task, rising urgency |
| Y4 | Globe country/continent outlines too dark to distinguish | New, n=1; wants faint/dashed continent traces |
| Y5 | Globe spins too fast (Learn + Palate map) | **Replicates Jeremy J5 / Jono #4 globe-feel** |
| Y6 | "MASL" abbreviation unexplained on origin pages | New, n=1; wants an info tooltip |
| Y7 | Flavor-notes list overwhelming as a scroll; wants type/search-first | **Reinforces Jono #25 / descriptor-entry redesign** |
| Y8 | Origin-affinity fallback label "somewhere else" reads as inert | New, n=1 (adjacent to Jono #18 inert starting palate) |
| Y9 | No brew-method / ratio education in Learn | Feature request, n=1, clear rationale |
| Y10 | No expert brew recommendation per coffee (ratio/temp) | Feature request, n=1, purchase-confidence lever |
| Y11 | No café/per-cup logging path (log a great shop cup, not just a bag) | Feature request, n=1; ties to per-brew-vs-per-bag (Jono #8 / Jeremy J4) |
| Y12 | Advanced brew fields (extraction) unexplained for newer users | New, n=1; inline education |

### Kyle — July 20, 2026

**Transcript:** [docs/interviews/2026-07-20-kyle.md](docs/interviews/2026-07-20-kyle.md) (structured notes + anecdotal observations + full verbatim transcript). Remote (Zoom, own phone, screen-shared), photo-from-library for the add-and-rate task. This is the Round 1 screener Kyle (self-reported "Deep into it," buys a few times/year) finally interviewed — the self-report-vs-behavior gap the Round 1 sample flagged. Session ran long into venture/monetization territory.

**Profile:** Kyle — 34, Shift Lead at [Kuppa Joy](https://kuppajoy.com/). Chemex at home (currently jerry-rigged: filter in a baking sieve over a Pyrex, pending real filters); Fellow kettle named the single best home investment. Prefers going *out* for coffee to brewing at home; home routine is "utilitarian… I just need caffeine in my veins" (Trader Joe's in the pantry). Buying specialty on/off ~6–8 years, ~$25–50/mo, 1–2 bags; most memorable recent buy Cat and Cloud (Santa Cruz). Quality split ~5–10% incredible, rest fine-to-disappointing (sometimes brew execution, not the bean). Recruited via personal network — same bias caveat. Segment read: a coffee *professional* with a *casual-at-home* behavior — the "expertise doesn't equal home spend" case the Round 1 self-report gap predicted, now confirmed in the room.

**Top signals:**

1. **The quiz's motivation set is a replicated gap (n=2).** Kyle's actual motivation — *"I want to get better at knowing what I like"* — is not an option; Jeremy's ("track my coffee memories") wasn't either. Two Round 2 users, two different core motivations, both invisible to the motivation question. The fixed answer set is now validated debt (Jeremy J10 → n=2, different missing option).
2. **The product thesis, tested by its natural skeptic.** Kyle is the sample's clearest "pour-over flavor reward is marginal" voice — the notes "have to be appreciated with a different part of your brain… that part gets over the novelty really fast"; "I've never craved an Ethiopian to get through a stressful day." And *he* raised the question the whole app is a bet on: "if I really focused on my palate… would it actually get there?" Jesse: "That's what I'm building." He's the ideal longitudinal validation-or-refutation case — if Palato can move *Kyle's* flavor reward, the thesis holds.
3. **Show a fleshed-out example palate before the 3-rating unlock (new, strong).** His strongest unprompted ask: "I'm craving to see what someone else's palate looks like… bait it, here's what you're growing into." Sample/demo data doubles as (a) an activation fix for the empty state (the flip side of Jono's post-quiz dead-end #19) and (b) his on-ramp into the social layer.
4. **Lead the rec cards with "Something You'll Love."** Reading the three cards, he hit "Try Something Unique" first and couldn't tell it was personalized ("this could be anywhere… is this connected to me?"). Putting "Something You'll Love" first would immediately signal *this is from your data*. Cheap ordering change, clear rationale.
5. **Social = follow specific people + similarity nudges (n=2 for a social layer).** Explicitly *not* Instagram/Venmo. Wants to search a profile ("what's Jesse been drinking?") and a notification — *"Jesse just drank a coffee super similar to one you rated highly — you should try it."* Grounded in the data-richness of the profile. Complements Jeremy's Letterboxd-style profile ask (J12); the social-layer signal is now converging across Round 2.
6. **Back-button bug after the duplicate warning.** Duplicate detection *worked* (clear "already in your catalog" message), but hitting back sent him to the **login screen**, and the bottom nav briefly vanished. New, concrete, n=1.
7. **Variety-as-barrier → a personalized-subscription monetization idea.** Boredom with two weeks of one coffee → wants mix-and-match / multi-bag packs → his invented ~$20/mo profile-matched subscription with a pre-ship "match my profile or surprise me" prompt. Notably he reinvented the app's own three-rec framing as a fulfillment model. He'd *pay* for this ("existing subs like Blue Bottle lack the personalization") — a rare willingness-to-pay signal in the round, but for *fulfillment*, not for the app itself.
8. **Trade Coffee is the competitor to study.** Jesse walked Trade's quiz-to-subscription flow live; Kyle's read is it already does this "less detailed," and Jesse's is that Trade's quality skews "lackluster mega-roaster" (Stumptown-tier). Differentiation wedge Kyle names: personalization depth + small-roaster curation ("Palato Certified"). Action-item'd for research.
9. **OAuth screen was a *non*-issue for Kyle — a counter-signal.** "Is that link really scary to you?" → "No." Where Jono/Jeremy/Joy read the raw Supabase URL as a trust-killer, Kyle (a more technical user) shrugged. Doesn't lower the fix priority — the trust-killer stands at n=3 among *non*-technical users — but it bounds the claim: it burns trust for the mainstream user, not the developer-literate one.
10. **Scan sparse-text failure feeds the eval.** OCR pre-filled some fields but not all; the flow demanded process/wash that "isn't always on the bag." His pro instinct surfaced the catalog-quality question directly ("is there some way to validate the data? you could end up with duplicates that are incorrect") — the exact concern the moderation gate exists to answer.

**Verbatim worth keeping:**

- "If I really focused on my palate… would it actually get there?" — the skeptic asking the product's core question (Jesse: "That's what I'm building").
- "I've never craved an Ethiopian to get through a stressful day." — the marginal-flavor-reward thesis, vividly.
- "I have a sense of hope and trust in this app currently that hasn't let me down yet." — trust signal from a professional, mid-critique.
- "I'm craving to see what someone else's palette looks like… here's what you're growing into." — the example-palate ask.
- "Something you love first would make me understand you're showing me something based on my data." — the rec-label reorder.
- "Jesse just drank a coffee that is super similar to one you rated highly. You should try it." — the social similarity-nudge, user-designed.
- "The nomenclature is not absolutely specific… it says mango, there's no guarantee you're actually going to taste that." — the trust-in-notes pain (echoes Round 1 Theme 3).
- "I would use Duolingo every day… but I won't pay for it." — why he's against the app subscription but not against a fulfillment subscription.

**Issue inventory (replication status noted; prioritization → DECISIONS.md / TECH_DEBT.md, not here):**

| # | Issue | Status |
|---|---|---|
| K1 | Quiz motivation lacks "get better at knowing what I like" | **Replicates the missing-motivation gap (Jeremy J10) — now n=2**, different option |
| K2 | No example/demo palate before the 3-rating unlock | New, n=1; activation + social on-ramp (flip side of Jono #19) |
| K3 | Rec cards should lead with "Something You'll Love," not "Try Something Unique" | New, n=1; ordering, clear rationale |
| K4 | Back button after duplicate warning → login screen; bottom nav vanishes | New, n=1, bug |
| K5 | Wants lightweight social: follow people, view palates, similarity nudges | **Complements Jeremy J12 — social layer now n=2** |
| K6 | Scan didn't fill all fields (sparse bag text); flow needs process not on bag | New; expected scan failure mode, feeds the scan eval |
| K7 | Raw Supabase URL on OAuth screen — **not** alarming to this (technical) user | **Counter-signal to Jono #21 / Jeremy J6 / Joy Y3** — bounds the trust-killer to non-technical users |
| K8 | Wants an interpretive/"personality-test" layer on the palate reveal | New, n=1 (adjacent to Joy's "colors done" framing) |

### Round 2 → action items

- [ ] Move confirmed UX fixes into TECH_DEBT.md / a fix session; log any model changes (e.g. edit-permission reversal vs. Decision #045) in DECISIONS.md
- [ ] Take the strategic threads (general-vs-specific recs, local-shop recs, community ratings, palate-tracking disinterest, value-maximizer segment) to the Claude.ai project chat — build direction, not build mechanics
- [ ] Tighten the script toward ~30 min; the add-and-rate task + Learn + recs Q&A is the high-yield core
- [ ] Watch for replication in the next 2–3 sessions: logo readability (Jeremy: fine — 1 for, 1 against), factoid skimming (Jeremy: landed — 1 for, 1 against), inert starting palate (Jeremy: landed — 1 for, 1 against), globe-on-Palate placement (Jeremy: no signal). ~~Per-brew vs. per-bag confusion~~ → **replicated 7/13 (Jeremy, with structural fix proposed)** — ready for a DECISIONS.md call on the rating-flow split
- [ ] Mobile pass on globe spin sensitivity — Jeremy reports the July 8 inertia fix overshot on touch (J5)
- [ ] Prioritize the OAuth consent-screen branding config task — trust-killer now **n=3** among non-technical users (Jono #21 / Jeremy J6 / Joy Y3); Kyle (technical) shrugged (K7), so the fix is about mainstream trust, not universal
- [ ] Fix the empty-state onboarding CTAs: "Rate Your First Coffee" misroutes to the catalog (Joy Y2) and "Unlock Your Palate" doesn't read as account creation (Joy Y1)
- [ ] Fix the back-button-after-duplicate → login-screen bug + disappearing bottom nav (Kyle K4)
- [ ] Reorder the recommendation cards to lead with "Something You'll Love" (Kyle K3) — signals personalization
- [ ] Design the pre-unlock example/demo palate — activation fix + social on-ramp, requested by Kyle (K2), and the flip side of Jono's post-quiz dead-end (#19)
- [ ] Widen the quiz motivation set — "get better at knowing what I like" (Kyle K1) and "track my coffee memories" (Jeremy J10); the fixed set is now a **n=2** gap
- [ ] The social layer is now requested by two Round 2 participants (Kyle K5 follow-people/similarity-nudges; Jeremy J12 profiles) — take the go/no-go to the Claude.ai project chat with this evidence
- [ ] New product threads for the project chat: café/per-cup logging (Joy Y11), brew-method + expert-ratio education in Learn (Joy Y9/Y10), the joy-first vs. value-maximizer segment split (Joy vs. Jono/Jeremy), and the personalized-subscription / "Palato Certified" monetization model + a Trade Coffee competitive teardown (Kyle)
- [ ] Mobile pass on globe spin sensitivity — now n=2 (Jeremy J5 / Joy Y5); Joy also flags illegible continent outlines (Y4)
- [ ] Fix the script line "I'm going to hand you…" (remote/own-phone sessions don't hand anything)
- [ ] Continue recruiting outside the personal network — Joy and Kyle both extend the Round 1 bias (personal network, coffee-fluent); still zero cold Curious Upgraders
