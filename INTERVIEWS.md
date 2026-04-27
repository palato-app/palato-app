# INTERVIEWS.md

## Purpose
A living record of user research signal for Palato. Each round of interviews adds a new section.

This doc contains both raw signal (verbatim quotes, sample composition) and synthesis (themes, implications, action items). Direct user quotes are kept short and used sparingly.

This is **not** a substitute for full interview transcripts (those live elsewhere) and **not** a place for product roadmap decisions (those go in DECISIONS.md after synthesis).

Names of respondents who explicitly engaged via personal email: first name only. Anonymized when in doubt. No emails, no last names.

## Method
- **Screener form:** Tally — https://tally.so/r/b52L57
- **Interview script:** see palato-prd-v01.md §8 (script will be revised after Round 1)
- **Incentive:** one bag of specialty coffee, contingent on selection for an interview
- **Recruiting (Round 1):** personal DMs to Jesse's network (heavy on coffee professionals)
- **Target sample size:** 5-10 quality interviews per round

## Sample status
- Round 1 screener completions: 5
- Interview yeses (with email): 2 — Lucy, Jeremy
- Interview yeses (no email captured): 1 — Kyle (replied "Sure!" but didn't leave email; needs follow-up)
- Maybe (business email): 1 — Kevin
- Declined: 1 — Jes (no email left)

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

### Round 1 → action items

- [ ] Reach out to ~10 Curious Upgrader prospects via different channels before booking interviews
- [ ] Book Lucy and Jeremy for first interviews
- [ ] Follow up with Kyle for email (he said "Sure!" but didn't leave one)
- [ ] Push to schedule Kevin — most useful skeptic in sample
- [ ] Add `roast_date`, separated tasting notes, and `producer`/`farm` fields to schema (informs tonight's migration)
- [ ] Pressure-test the Q3 categories in Round 2 screener design (self-report vs behavior mismatch)
