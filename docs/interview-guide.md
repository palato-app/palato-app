# Palato — User Interview Guide (Round 2)

**Format:** 1:1, 20–30 min, audio recorded → transcript.
**Goal:** (1) find a real, recurring, expensive, *felt* pain in how they discover and decide on coffee (the B2B thesis rests on this — see DECISIONS #058); (2) watch a first-timer move through the **new onboarding** (landing → quiz → reveal → sign-in → seeded palate) and the rate loop, cold.

> This guide grounds the script in what the app *actually does today*. Where it references gating or copy, that reflects the live build (quiz config, `maturity.ts`, the catalog "Start here" rail, the "Rate a coffee" FAB). Keep it in sync when the flow changes.

---

## Before the call — interviewer setup (do this every time)

You need **two account states ready**, because the most interesting tasks are gated:

1. **A fresh / signed-out device** on the Palato landing screen — for the cold onboarding run (Task A). Don't pre-take the quiz.
2. **A pre-seeded demo account with 5+ rated coffees**, signed in (or ready to swap to). This is *required* for the "find it again" and "recommendations" tasks. On a brand-new account those surfaces are **locked by design**: recommendations don't appear until **3 ratings**, sweet-spots/origins until 5. If you run them on a fresh login, your participant hits a locked state and you learn nothing.
3. **A real bag of coffee** to hand them for the rate task.
4. Recording tool tested. Battery/charger. A quiet room.

Have the screener/profile note open so you know their brew method going in — **if they're espresso-only**, the quiz will tell them "we built Palato for pourovers," which colors their whole reaction. Worth knowing before they hit it.

---

## 0. Preamble & consent (~1–2 min) — read aloud, capture consent *on the recording*

> "Thanks for doing this. Quick housekeeping first. I'd like to record the audio so I can actually listen instead of scribbling — it just becomes a transcript I use to spot patterns across interviews. A few things I want to be upfront about:
>
> - Your answers and the recording are used to make Palato better — what we build next.
> - I might quote something you say later in something public, like our website or marketing — but never your last name or anything that identifies you, and I'd check with you before anything attributed. If you'd rather I never quote you publicly, just say the word; it changes nothing about today.
> - Skip any question, or ask me to stop recording, anytime — no reason needed.
> - Palato's an early beta. The most useful thing you can do is be blunt. You won't hurt my feelings — the harsh stuff is the gold.
>
> Good to hit record?"

**[Start recording.]** Then capture consent *on tape*:

> "Just for the record — are you okay being recorded? And okay with me possibly using an anonymized quote in marketing down the line?"

**[Get a clear verbal yes. If they decline marketing use, note it and carry on — it doesn't affect anything else.]**

---

## 1. Their coffee life (~3 min) — warm, concrete, no agenda

Pick **two** of these; don't run all three.

- Walk me through your coffee this morning. What was it, where'd it come from, how'd you make it?
- How would you describe your relationship with coffee to someone who didn't know you?
- How long have you been buying specialty coffee, versus grocery-store stuff?

*(Their brew method will usually surface here. Note it.)*

---

## 2. How they discover and decide (~6 min) — past behavior only, no hypotheticals

- Tell me about the last bag of specialty coffee you bought. What made you reach for *that* one?
- How did you find it? Who or what put it in front of you?
- When you finish a bag you loved, what happens next? How do you decide what's next?
- Have you ever wanted to re-buy a coffee you loved and couldn't remember what it was? What did you do?
- **Show me — on your phone — where you keep track of coffees you've tried, if anywhere.** *(A Notes app or a camera roll full of bag photos = gold. Nothing at all = also data. This is the workaround that validates the core loop — see INTERVIEWS.md Theme 1.)*

---

## 3. The bleed (~6 min) — find the pain, quantify it

- Tell me about the last bag that disappointed you. What happened?
- Of your last 5 bags, how many were hits? How often is a bag a miss?
- What does a bag run these days — and when one's a dud, what do you actually do with it? How does that feel?
- In a normal month: how many bags, from how many roasters, ballpark spend?
- Single most annoying part of finding coffee you'll actually like?

> **Sections 1–3 are the whole ballgame for the B2B thesis.** A real, recurring, expensive, emotionally-felt pain is what makes an engaged audience worth selling to a roaster. No pain → no audience → no B2B. If you're running long, protect this and trim Section 4, not the reverse.

---

## 4. Hands-on (~7–9 min) — hand them the phone, then go quiet

**Transition (read aloud):**
> "I'm going to hand you something and ask you to do a few things. Think out loud. I'm going to stay quiet on purpose — if you get stuck, that's the most useful thing that can happen, so don't rescue me by pretending it's fine."

Don't help unless they're fully stuck. Note every hesitation, misread label, and wrong tap.

### Task A — First run, cold *(NEW — highest priority; fresh/signed-out device)*
Hand them the phone on the **landing screen**.
> "This is Palato for the first time. Get started like you would on your own."

Watch for:
- Do they tap **"Unlock your palate"**, or look for a sign-in / hesitate at a no-account CTA?
- During the **5-question quiz** — do they read the little "value-back" facts after each answer, or skip them? Does any question confuse them (the flavor slider? "what do you want to learn about most?")?
- At the **reveal** ("*Your starting palate: …*") — does it land as "huh, that gets me," or a shrug / horoscope? This moment is the core engagement bet of the whole onboarding.
- Do they understand they're being asked to **sign in to save it**, and why? Any friction at Google sign-in.

### Task B — Rate a coffee *(the atomic action; can stay on the fresh account)*
Hand them the **real bag**.
> "You just got home with this. Show me what you'd do."

Watch the loop: the **"Rate a coffee"** button → **scan** ("take a picture of a new coffee bag") → the form pre-fills from the photo → **do they trust / check the extracted fields?** → the **rating dial** (do they get the radial 1.0–5.0?) → notes + flavor-chip picker. Where do they hesitate or distrust?

### Task C — Find a coffee again *(SEEDED account — swap now)*
> "You want to re-buy a coffee you loved last month. Find it."

*(This is empty on a fresh account by design — that's why we're on the seeded one.)*

### Task D — Decide what's next
- **On the seeded account (3+ ratings):** point them toward Palate → **"What's next."** Watch them react to the three cards (*Try Something Unique / Go Somewhere New / Something You'll Love*) and the reasons attached. Do the reasons feel earned or generic?
- **Quick contrast, fresh account (optional):** "As a brand-new user, how would you decide what to buy?" Watch whether they find the **"Start here: picked for your palate"** rail on the catalog — that's the new-user discovery surface. Note if they go hunting for "recommendations" and find them locked.

---

## 5. Reaction, after using it (~3 min) — sharp, not soft

- In your own words, what is this thing? What's it for? *(Tests whether value landed without you explaining.)*
- Who's it for? Does that sound like you, honestly?
- **Back at the start, you answered five quick questions and we showed you a "starting palate." Was that worth it — did it feel like it understood you, or like a horoscope?** *(Direct read on the onboarding bet.)*
- When in your actual week would you open this — if ever? Walk me through that moment.
- What's missing for this to be something you'd genuinely use? What would make you delete it after a week?

---

## 6. Commitment test (~2 min) — the real signal

- Want me to set you up with it right now? *(Watch: lean in, or polite pass? The pass is data.)*
- If it were free but you had to rate every coffee you drink to get the palate insights — would you? For how long?
- Who's the most coffee-obsessed person you know? Would you tell them about this? *(A specific named person = real enthusiasm. "I could see people liking it" = politeness.)*

---

## Never ask (these manufacture false positives)

- "Do you like it?" / "Isn't this cool?" / "Would you use an app that…?"
- "How much would you pay?" — hypothetical; use the rating-commitment question above instead.
- Anything that explains your vision *before* they've reacted to the thing itself.

## What a strong interview looks like (score each one)

- They described a real, recurring pain **unprompted** — wasted money, forgotten coffees, a system held together with a Notes app.
- They **showed you the workaround** on their phone.
- They **finished the quiz without prompting and the reveal landed** ("huh, that's me").
- During the tasks they "got it" without you explaining.
- They asked to keep using it, or wanted setup on the spot.
- They **named a specific person** to tell.

**Discount these (concept resonance, not demand — the trap that's bitten us before):** "this is awesome," "good idea," "I could see this being useful."

---

*After each interview: drop verbatims + a quick read into INTERVIEWS.md (Round 2 section). Synthesis → DECISIONS.md only after a few are in, not per-interview.*
