# Palato — Product Requirements Document (v0.1)

**Author:** Jesse Eshleman
**Date:** April 19, 2026
**Status:** Draft — Pre-Research
**Decision Log Entry #001:** Created initial PRD before user research. Will revise after 10 user interviews. Rationale: establish a hypothesis to test, not a plan to execute blindly.

---

## 1. Problem Statement

Specialty coffee is a $50B+ market experiencing rapid premiumization. Consumers are spending $18-28 per bag on single-origin, small-lot coffees — but they have no structured way to track what they've tried, discover what they'd love next, or learn from a community of fellow enthusiasts.

Wine drinkers have Vivino (70M users). Beer drinkers have Untappd. Coffee drinkers have... a Notes app and Instagram.

The result: consumers waste money on bags they don't enjoy, struggle to remember what they liked, can't articulate their preferences, and miss coffees they'd love from roasters they've never heard of.

**Hypothesis (to be validated through user interviews):** Specialty coffee drinkers want a simple, beautiful way to log the coffees they drink, understand their own palate over time, and discover their next favorite bag — and they'd use an app that made this effortless.

---

## 2. Target User

**Primary:** The "Intentional Explorer" — someone who buys specialty coffee 2-4x per month, cares about origin and process, has a preferred brew method, and is actively trying to expand their palate. They're not a professional roaster or Q grader, but they know the difference between a washed Ethiopian and a natural Brazilian. Age 25-45, urban, digitally native.

**Secondary:** The "Curious Upgrader" — someone transitioning from commercial coffee to specialty. They've had a few great cups but don't have vocabulary for what they like yet. Palato helps them build that vocabulary.

**Anti-target (who we're NOT building for):** Professional cuppers and roasters (they have tools), casual drip coffee drinkers (they don't care enough to log), and coffee shop reviewers (that's Yelp/Google, not us).

---

## 3. The Atomic Action

**The single thing a user does every time they open Palato: Rate a coffee.**

This is our "scan a wine label" moment. Everything else — discovery, recommendations, community, purchasing — flows from the accumulated data of rated coffees. If we nail the rating experience (fast, satisfying, informative), the product works. If we don't, nothing else matters.

**The rating flow (v1 hypothesis):**
1. User opens app → taps "+" → scans the coffee bag (or enters manually)
2. Claude extracts: roaster, coffee name, origin, process, roast level, tasting notes
3. User rates the coffee (simple 1-5 scale) and optionally adds their own tasting notes
4. Palato logs it, updates their taste profile, and surfaces a "you might also like" recommendation

**Why scanning is the unlock:** Manually entering coffee details is friction that kills retention. If Claude can extract structured data from a bag photo in <3 seconds, we remove the biggest barrier to habitual use.

---

## 4. V1 Feature Set (Hypothesis — Pre-Research)

### Must Have (Launch)
- **Coffee logging with AI-powered bag scanning:** Photo → Claude extracts structured data → user confirms and rates
- **Personal coffee journal:** Chronological feed of every coffee rated, with ratings, notes, and photos
- **Taste profile:** Visual representation of what you like (origins, processes, roast levels, flavor notes) that evolves with each rating
- **Basic recommendations:** "Based on your ratings, you might like..." powered by Claude analyzing your taste profile against a growing database
- **Search and browse:** Find coffees by roaster, origin, process, or flavor notes

### Should Have (V1.1, first iteration)
- **Community ratings:** See aggregate ratings from other Palato users on any coffee
- **Follow roasters:** Get notified when a roaster you love releases something new
- **Brew method tracking:** Log how you brewed each coffee (pour-over, espresso, Aeropress, etc.) alongside your rating

### Won't Have (V1 — explicitly descoped)
- E-commerce / purchasing integration
- Social features (following other users, sharing, feeds)
- Subscription management
- Café/shop discovery
- Barista tools or professional cupping features

**Decision Log Entry #002:** Descoped social features from V1. Rationale: social is a retention play, not an activation play. We need to nail the core loop (rate → learn → discover) before adding social layers. Risk: slower community growth. Mitigation: community ratings provide passive social proof without requiring active social engagement.

---

## 5. AI Integration Architecture

### 5a. Bag Scanning Pipeline (Competency A: AI-Enabled Workflows)

**Input:** User photo of a coffee bag
**Process:**
1. Image sent to Claude with structured prompt
2. Claude extracts: roaster name, coffee name, origin country, region, processing method, roast level, listed tasting notes, weight, price (if visible)
3. Response returned as structured JSON
4. User reviews and confirms extracted data (human-in-the-loop)
5. Corrections fed back to improve prompt accuracy over time

**Eval Design:**
- Accuracy metric: % of fields correctly extracted per scan (target: >85% on first pass)
- Measure: manually validate 50 scans against ground truth, track accuracy by field
- Track: user correction rate (which fields do users fix most often?)
- Iterate: use correction patterns to refine the extraction prompt

**Decision Log Entry #003:** Chose Claude over OCR + NLP pipeline. Rationale: Claude handles the full chain (image understanding → entity extraction → structured output) in a single call, reducing complexity. Tradeoff: higher per-scan cost vs. traditional OCR, but dramatically simpler architecture and better accuracy on varied bag designs.

### 5b. Recommendation Engine

**Input:** User's rated coffees (ratings + metadata)
**Process:**
1. Claude analyzes the user's taste profile (preferred origins, processes, flavor notes, ratings distribution)
2. Compares against all coffees in the database rated 4+ by other users
3. Returns ranked recommendations with explanations ("You loved fruity naturals from Ethiopia — this Kenyan washed has similar citrus notes but with more body")

**Eval Design:**
- Track: recommendation click-through rate
- Track: did the user eventually rate the recommended coffee? If so, how?
- Track: recommendation acceptance rate (% of recs rated 4+)
- A/B test: Claude recommendations vs. simple collaborative filtering — which produces higher satisfaction?

### 5c. Feedback Synthesis Pipeline (Competency E: Feedback Loop as Product)

**Input:** In-app feedback submissions, app store reviews, user interview transcripts
**Process:**
1. Claude ingests all feedback sources
2. Tags by theme, urgency, user segment, and feature area
3. Clusters related feedback into trackable issues
4. Surfaces weekly digest: top 5 themes, trending issues, verbatim quotes worth reading

**Eval Design:**
- Compare Claude's clustering against manual human clustering (agreement rate)
- Track: time from feedback submission to product team awareness
- Track: % of shipped features that trace back to synthesized feedback
- Iterate: refine tagging taxonomy based on what's actually useful for prioritization

---

## 6. Success Metrics (Competency C: Metrics Fluency)

### North Star Metric
**Coffees rated per user per week.** This measures the health of the core loop. If users are rating regularly, they're engaged, building a taste profile, and generating data that powers recommendations.

### Activation Metrics
- **Activation rate:** % of signups who rate their first coffee within 24 hours (target: >40%)
- **Time to first rating:** median minutes from signup to first coffee rated (target: <5 min)
- **Scan success rate:** % of bag scans that produce usable data without manual entry (target: >80%)

### Retention Metrics
- **Day 1 retention:** % of users who return the day after signup (target: >30%)
- **Day 7 retention:** % of users who return within 7 days (target: >20%)
- **Day 30 retention:** % of users who return within 30 days (target: >12%)
- **Weekly active raters:** % of all registered users who rate at least 1 coffee per week

### Engagement Metrics
- **Ratings per user per month:** average number of coffees rated (target: >4, matching bag purchase frequency)
- **Recommendation engagement:** % of recommendations clicked (target: >15%)
- **Recommendation satisfaction:** % of recommended coffees later rated 4+ (target: >50%)
- **Profile completeness:** % of users who have rated 5+ coffees (the threshold for useful recommendations)

### Feedback Loop Health (Competency E)
- **Time to triage:** hours from user feedback to tagged + categorized
- **Signal quality:** % of synthesized insights rated "useful" by me (the PM)
- **Roadmap influence:** % of v1.1 features that trace directly to user feedback
- **Feedback volume:** submissions per week (growing = good, but quality > quantity)

---

## 7. Data Model (Supabase)

### Core Tables

**users**
- id (uuid, PK)
- email, display_name, avatar_url
- created_at, updated_at
- preferred_brew_methods (text[])
- experience_level (enum: beginner, intermediate, advanced)

**coffees** (the global catalog)
- id (uuid, PK)
- roaster_name, coffee_name
- origin_country, origin_region
- processing_method (enum: washed, natural, honey, anaerobic, other)
- roast_level (enum: light, medium-light, medium, medium-dark, dark)
- tasting_notes (text[])
- variety (text) — e.g., Gesha, Bourbon, SL28
- elevation_masl (int)
- sca_score (decimal, nullable)
- avg_rating (decimal, computed)
- rating_count (int, computed)
- created_by (uuid, FK → users)
- verified (boolean, default false)

**ratings**
- id (uuid, PK)
- user_id (uuid, FK → users)
- coffee_id (uuid, FK → coffees)
- rating (int, 1-5)
- user_tasting_notes (text)
- brew_method (text, nullable)
- photo_url (text, nullable)
- created_at

**scans**
- id (uuid, PK)
- user_id (uuid, FK → users)
- photo_url (text)
- raw_extraction (jsonb) — Claude's raw output
- corrections (jsonb) — user corrections
- matched_coffee_id (uuid, FK → coffees, nullable)
- scan_accuracy_score (decimal) — computed post-correction
- created_at

**recommendations**
- id (uuid, PK)
- user_id (uuid, FK → users)
- coffee_id (uuid, FK → coffees)
- reason (text) — Claude's explanation
- clicked (boolean)
- rated (boolean)
- rating_given (int, nullable)
- created_at

**feedback**
- id (uuid, PK)
- user_id (uuid, FK → users, nullable)
- source (enum: in_app, app_store, interview, support)
- raw_text (text)
- ai_tags (text[])
- ai_theme (text)
- ai_urgency (enum: low, medium, high)
- ai_feature_area (text)
- status (enum: new, triaged, actioned, closed)
- created_at

### Design Rationale

**Decision Log Entry #004:** Separated `coffees` (global catalog) from `ratings` (per-user). Rationale: allows community ratings, deduplication, and a growing coffee database that any user can contribute to. Tradeoff: requires dedup logic when two users scan the same coffee. Mitigation: fuzzy matching on roaster + coffee name + origin, with manual merge capability.

**Decision Log Entry #005:** Created `scans` table to track extraction accuracy separately from ratings. Rationale: this is the eval data for the AI pipeline. By storing raw extractions and user corrections, we can measure and improve scan accuracy over time. This is the "closed-loop improvement" system the Anthropic role describes.

---

## 8. User Interview Plan (Competency B: Voice of Customer)

### Objective
Validate (or invalidate) our core hypotheses before building. Specifically:
1. Do specialty coffee drinkers actually want to track what they drink? (Problem validation)
2. What's their current workaround? (Competitive landscape)
3. Would scanning a bag be their preferred entry method? (Solution validation)
4. What would make them come back weekly? (Retention hypothesis)

### Participants
10 people who buy specialty coffee at least 2x/month. Mix of:
- 4 "Intentional Explorers" (already knowledgeable)
- 4 "Curious Upgraders" (transitioning into specialty)
- 2 "Power Users" (roasters, baristas, or Q graders who can stress-test our assumptions)

### Interview Script (30 minutes)

**Warm-up (3 min)**
- Tell me about your coffee routine. What did you brew this morning?

**Current behavior (8 min)**
- How do you decide what coffee to buy?
- When you find a coffee you love, what do you do? How do you remember it?
- Have you ever tried to keep track of coffees you've tried? What happened?

**Pain points (8 min)**
- Tell me about the last time you bought a bag of coffee you didn't enjoy. What happened?
- What's hardest about discovering new coffees you'll actually like?
- If you could change one thing about how you explore coffee, what would it be?

**Solution reaction (8 min)**
- [Show Palato concept/wireframe] What's your first reaction?
- If you could scan this bag right now and it pulled up everything about this coffee — origin, process, tasting notes, community ratings — would you use that?
- What would make you open this app every week?
- What's missing?

**Closing (3 min)**
- Would you want to be a beta tester?
- Is there anyone else you think I should talk to?

### Synthesis Template
After all 10 interviews, produce a one-page research synthesis:
- Top 3 validated hypotheses
- Top 3 surprises (things I didn't expect)
- Top 3 feature requests (unprompted)
- Recommended changes to V1 scope
- Direct quotes worth remembering (max 5)

---

## 9. Competitive Landscape

| Product | Model | Scale | Weakness |
|---------|-------|-------|----------|
| Coffunity | Community reviews, scan bags | Won SCA Best in Show 2022, available iOS + Android | Small user base, limited AI, no recommendation engine |
| Fika | Social coffee journal | Niche third-wave community | Discovery-focused, no scanning, minimal data |
| TheBeanGeek | "Vivino for coffee" positioning | Early stage, SCA member | Algorithm-first marketing, unclear traction |
| Angel's Cup | Subscription + rating app | Tied to their own subscription | Closed ecosystem, not a general-purpose platform |
| Trade Coffee | Subscription aggregator | Well-funded, strong partnerships | Subscription-only, no community, no scanning |

**Our differentiation:** AI-native from day one (scanning, recommendations, taste profiling), product-quality design (not a utility), and a feedback loop architecture that gets smarter with every rating.

---

## 10. Roadmap — Career-Aligned Phases

### Phase 0: Foundation (April – May 2026)
**Career output:** Product brief, user interview synthesis, decision log

- [ ] Finalize this PRD (you're reading it)
- [ ] Design and conduct 10 user interviews
- [ ] Write one-page research synthesis
- [ ] Revise V1 scope based on findings
- [ ] Define data model in Supabase
- [ ] Set up project infrastructure (repo, Vercel, Supabase)
- [ ] Design the AI extraction prompt and run initial eval (50 bag photos)

**Competencies developed:** B (VoC programs), D (product artifacts)

### Phase 1: Core Loop (May – June 2026)
**Career output:** Shipped V1, scan accuracy eval report, initial metrics dashboard

- [ ] Build the rating flow (scan → extract → confirm → rate)
- [ ] Build the coffee journal (personal feed of rated coffees)
- [ ] Build basic taste profile visualization
- [ ] Implement the scan pipeline with Claude API
- [ ] Run scan accuracy eval: 50 bags, measure per-field accuracy
- [ ] Deploy to Vercel, soft launch to 20 beta testers
- [ ] Set up basic analytics (DAU, ratings/user, scan success rate)

**Competencies developed:** A (AI workflows), C (metrics), D (artifacts)

### Phase 2: Intelligence Layer (July – August 2026)
**Career output:** Recommendation engine eval, feedback synthesis pipeline, 100+ users

- [ ] Build Claude-powered recommendation engine
- [ ] Design recommendation eval: track click-through and eventual rating
- [ ] Build in-app feedback mechanism
- [ ] Build Claude-powered feedback synthesis pipeline (intake → tag → cluster → digest)
- [ ] Expand to 100+ users through targeted outreach (Reddit r/coffee, specialty coffee Instagram, local roaster partnerships)
- [ ] Run first monthly metrics review: document what's working and what's not
- [ ] Write first "State of Palato" post-mortem / review

**Competencies developed:** A (AI workflows + evals), C (metrics), E (feedback loops)

### Phase 3: Growth & Polish (September – October 2026)
**Career output:** Growth experiment log, retention analysis, community ratings launch

- [ ] Launch community ratings (see what other users think)
- [ ] Build "follow a roaster" notifications
- [ ] Run 3 growth experiments (document hypothesis → test → result for each)
- [ ] Conduct second round of 5 user interviews (existing users, not prospects)
- [ ] Analyze retention curves (Day 1/7/30) and identify biggest drop-off point
- [ ] Iterate on feedback synthesis pipeline based on 8 weeks of data
- [ ] Publish scan accuracy improvement over time (eval v1 vs eval v3)

**Competencies developed:** B (VoC), C (metrics), E (feedback loops)

### Phase 4: Monetization Exploration & Career Prep (November – December 2026)
**Career output:** Monetization experiment report, polished case study, resume-ready portfolio

- [ ] Test one monetization hypothesis (premium recommendations? Roaster partnerships? Pro tier?)
- [ ] Write the comprehensive Palato case study: problem → research → build → metrics → learnings
- [ ] Compile all decision log entries into a narrative
- [ ] Compile all AI pipeline evals into a summary showing improvement over time
- [ ] Update resume with Palato as a shipped product with real metrics
- [ ] Draft "Why Anthropic" application with Palato as primary evidence
- [ ] Apply to target roles

**Competencies developed:** All five, fully documented

---

## 11. Revenue Model Hypotheses (To Be Tested in Phase 4)

**Hypothesis A — Roaster Partnerships:** Roasters pay for featured placement in recommendations. Risk: compromises recommendation integrity.

**Hypothesis B — Premium Tier:** Free users get 5 scans/month, unlimited journal. Pro ($4.99/mo) gets unlimited scans, advanced taste analytics, and priority recommendations.

**Hypothesis C — Affiliate/Referral:** Link to purchase coffees you've discovered. Take a referral fee. Closest to Vivino's actual model.

**Hypothesis D — Data Licensing:** Aggregate anonymized taste trend data to roasters. "Your Ethiopian Yirgacheffe is trending with light-roast enthusiasts in the Northeast."

**Decision Log Entry #006:** Deferring monetization to Phase 4. Rationale: premature monetization kills consumer products. Build value first, extract value second. The first 6 months are about proving the core loop works and that users retain. Revenue can wait.

---

## 12. Open Questions (To Be Resolved Through Research)

1. **What's the atomic action?** We hypothesize "rate a coffee." Interviews may reveal it's actually "find my next coffee" or "remember what I had." Stay open.
2. **Is scanning the killer feature?** Or do users prefer manual entry because they want to slow down and be intentional? Test this.
3. **What's the right rating scale?** 1-5 stars? 1-10? Thumbs up/down? SCA-style flavor wheel? Simpler is probably better for activation but less useful for recommendations.
4. **How do we handle deduplication?** When 50 users scan the same bag from the same roaster, how do we merge into one canonical coffee entry?
5. **What's the social tipping point?** How many rated coffees on a single bag before the community rating becomes meaningful?
6. **Does the "Curious Upgrader" segment actually exist at scale?** Or are they better served by a subscription service like Trade Coffee?

---

*This PRD is a living document. It will be revised after user research (Phase 0), after beta launch (Phase 1), and after each monthly review. Every revision should be logged in the decision log with rationale for what changed and why.*
