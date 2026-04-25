# Palato — Brand Guide v0.1

**Author:** Jesse Eshleman
**Date:** April 19, 2026
**Status:** Living document — evergreen foundations, revised as the brand matures
**Purpose:** The principles that decide every choice about how Palato looks, sounds, and feels.

---

## The one-line

**Palato is a hand-drawn field journal for specialty coffee drinkers — warm, rooted, and opinionated.**

Everything below serves that sentence. If something doesn't, we cut it.

---

## Brand principles

Five rules. When in doubt, these decide.

**1. Warm, never cold.**
Cream over white. Matte over glossy. Terracotta over neon. The brand exists at the temperature of a mug held in two hands on a Sunday morning. If something feels like it was made in Figma's default color picker, it isn't Palato.

**2. Hand-touched, always.**
Every illustration, pattern, and icon should look like a person drew it — not a machine rendered it. Imperfect lines are a feature. Vector-perfect smoothness is a bug.

**3. Editorial confidence.**
Palato is not neutral. It has opinions about coffee, about taste, about what's worth your $22. Big type. Specific words. No corporate hedging. We would rather be interesting and slightly wrong than safe and forgettable.

**4. Rooted in the physical.**
Coffee is dirt, water, cherries, fire, and time. The brand references the real world — origins, landscapes, suns, the hands that grew and roasted the beans. Palato is not a digital-native brand. It's a physical brand that happens to live on a screen.

**5. Craft over polish.**
Better to feel like a well-printed zine than a well-designed dashboard. If the choice is between "more refined" and "more alive," choose alive.

---

## Color

Five colors. That's the whole system. You shouldn't need a sixth.

### The three that do 90% of the work

**Ember** · `#D94E1F`
The brand's heart. A burnt persimmon — warm, earthy, a little retro, never neon. Primary accent, primary CTA, primary shouting color. Used sparingly for maximum heat.

**Raw Cream** · `#F4EAD5`
The brand's ground. This is our "white" — warm, slightly yellow, never sterile. Backgrounds, cards, negative space. If you're tempted to use `#FFFFFF`, stop. Raw Cream is the floor the whole brand stands on.

**Espresso** · `#1E1410`
The brand's ink. Deep brown-black, never pure `#000`. All primary text, heavy type, borders when needed. Pure black is too cold; espresso has soul.

### Two supporting accents

**Ochre** · `#C89040`
The mustard-sun note. Accents, illustrations, the occasional callout. Never as a primary CTA — that's Ember's job.

**Forest** · `#2F4A38`
The deep botanical note. Used rarely — state indicators, illustration accents, secondary CTAs when we need an alternative to Ember.

### Rules

- Every color pairing used for body text must pass WCAG AA contrast. Ember on Raw Cream passes at large sizes only — don't set 14px body copy in Ember on Cream.
- Default background: Raw Cream. Pure white is banned outside of images that require it.
- Default text: Espresso. Pure black is banned.
- Use Ember like hot sauce — small quantities, big impact.

---

## Typography

Three voices. Not more.

### Display — Fraunces

Use for logo wordmark aspiration, marketing headlines, section headers, app H1/H2s, anything that needs to be seen from across the room.

Fraunces has the warmth, weight, and editorial personality the brand needs. It can be chunky and confident or restrained and literary. Lean into its weight — Fraunces at 700+ with tight tracking is the brand's loudest voice. Free via Google Fonts. Variable.

### Body — Geist (free) or Söhne (when budget allows)

Use for UI, paragraphs, labels, anything that needs to be read quickly.

Geist is clean, warm-leaning, legible at small sizes. Söhne is the premium upgrade. Both avoid the sterility of Inter or Helvetica. Do not use Fraunces for body copy — it's too hot to read in paragraphs.

### Hand-drawn — custom, used sparingly

Use for the Palato wordmark (custom-lettered, not typeset) and rare accent moments (signatures, stickers, merch details).

This is not a font you install. It's a letterer you commission. For v1, a single custom "Palato" wordmark is enough. Don't stretch it into a full alphabet.

### Hierarchy

- **H1** — Fraunces 700, 48–72px, tight tracking
- **H2** — Fraunces 600, 32–40px
- **H3** — Fraunces 500, 20–24px
- **Body** — Geist 400, 16px, line-height 1.6
- **Caption / meta** — Geist 400, 13–14px, Espresso at 70% opacity

---

## Logo system

Palato's mark is a **symbol + wordmark** pair. Both must work alone.

### The symbol

Hand-drawn. Single-weight line. Readable at 16px (favicon) and 16ft (merch). The concept space to explore: **a radiant sun with a coffee cherry at its center** — the brand's two origin stories (the plant, the star that ripened it) fused into one mark.

Alternative directions worth sketching: a simplified coffee plant with a sun rising behind it; a stylized cup with sunrays; a folk-art sunburst with a cherry motif at the center (see the FOLK FEST and Córdoba tiles on the mood board).

The symbol should feel like it was carved, printed, or drawn — never rendered.

### The wordmark

Custom-lettered "Palato." **Not** Fraunces set large. The wordmark has character that only hand-lettering can give. Reference points: Mint, sando, hiatus from the mood board — all hand-drawn, all unmistakable.

### Lockups

- **Horizontal** — Symbol left, wordmark right, aligned optically (not mathematically)
- **Vertical** — Symbol top, wordmark bottom; use for square formats (app icon, social avatar)
- **Symbol alone** — App icon, favicon, loading states, merch details, profile accents
- **Wordmark alone** — Headers where the symbol already exists nearby

### Clear space

Minimum clear space around the logo equals the height of the "P" in Palato.

### Don't

- Don't recolor outside the palette
- Don't apply effects (no shadows, gradients, glows)
- Don't typeset "Palato" in Fraunces and call it a logo
- Don't outline the wordmark

---

## Iconography & illustration

**Icons.** Hand-drawn, single-weight strokes, slightly imperfect. Linocut, not Lucide. At 24px they should still feel drawn.

**Illustrations.** Folk-art-adjacent. Suns, coffee cherries, mountains, hands, cups, plants. Color limited to the palette — often just Ember + Espresso, or Ember + Cream. No gradients, no 3D, no vector-perfect smoothness.

**Patterns.** When you need a pattern, make it from the illustrations — a field of suns, a field of cherries. Reference the FOLK FEST and Córdoba tiles.

**What not to use.** Lucide. Heroicons. Phosphor. Material. Any icon set that ships in a Figma UI kit. These will instantly kill the brand — don't use them even as placeholders, because they will ship.

---

## Photography

Shoot like the brand lives outside. Warm light, natural grain, real hands, real bags, real cups, real places. Never flat studio-white product photography. Never stock.

If we don't have a photo, we use an illustration. We don't fill the gap with stock.

---

## Texture

The brand is textured. Default backgrounds (Raw Cream) should have a *very subtle* paper grain — so subtle you feel it more than see it. Patterns, halftones, and gradient washes are welcome in marketing contexts. In the app, texture should whisper, not shout — a hint of grain, not a wallpaper.

---

## Voice

**Palato sounds like the owner of the coffee shop you love.**

Curious. Hospitable. Opinionated. Knowledgeable. Punchy. A magnetic personality. Someone who remembers what you ordered last time and has a strong take on whether the new Ethiopian is worth it.

### Voice principles

**Specific, not generic.** "Sour cherry, dark chocolate, a finish like lemon peel" — not "balanced flavor profile."

**Confident, not hedged.** "This is the best Gesha we've tasted this quarter" — not "This might be a coffee you'll enjoy."

**Warm, not corporate.** "Your palate is coming along" — not "Your taste profile has been updated."

**Short, not bloated.** Cut the adverbs. Kill "just" and "simply." Say the thing.

**Human, not product-speak.** "We've been noticing" — not "Our algorithms have identified."

### Do / Don't

**Rating prompt**
- ✅ "How was it?"
- ❌ "Please rate your coffee experience."

**Recommendation**
- ✅ "You love fruity naturals. This Kenyan washed has the same brightness with more body — we think it'll land."
- ❌ "Based on your rating history, we recommend the following coffee."

**Empty state**
- ✅ "No coffees yet. Pop the bag."
- ❌ "You haven't added any coffees to your journal yet. Click below to get started."

**Error**
- ✅ "That didn't work. Try again?"
- ❌ "An error occurred. Please try again later."

**Onboarding**
- ✅ "Welcome. Let's find out what you love."
- ❌ "Welcome to Palato! We're excited to help you discover amazing coffees!"

### Never

- Exclamation points in UI. (Rare exceptions in marketing.)
- Emoji in product copy. (Sparingly in marketing.)
- "Delighted." "Excited." "Revolutionary." "Seamless." "Leverage." "Unlock."
- Questions the coffee shop owner wouldn't ask: "How was your experience?" → "How was it?"

---

## In-the-product translation

You chose **full immersion** for the UI — the app should feel like the mood board, not like a Material Design shell with an orange accent.

Concretely:

- **Background** — Raw Cream, with a whisper of paper texture. Never `#FFFFFF`.
- **Cards & surfaces** — Raw Cream on Raw Cream, separated by subtle shadow or a 1px Espresso border at 15% opacity. No heavy card shadows.
- **Buttons** — Primary: Ember fill, Cream text, slightly-rounded corners (8–12px, not mathematically perfect). Secondary: Espresso outline, Espresso text on Cream.
- **Typography** — Fraunces for all display/headers, Geist for all UI and body.
- **Icons** — Custom hand-drawn. No icon library. (Budget 1–2 weeks to draw the v1 set.)
- **Empty states** — Each major empty state gets its own illustration. "No coffees yet" → a drawn coffee cherry. "No recommendations yet" → a drawn sun rising. "Profile is empty" → a drawn cup.
- **Loading** — A custom animation. A sun slowly rotating, a cherry's leaf swaying. Not a spinner.
- **Transitions** — Warm and soft (300–400ms ease-out). Never snappy. Never mechanical.
- **Motion** — When things move, they move like ink on paper, not like glass on glass.

### The honest tradeoff

Full immersion is the right brand call. It's also the most expensive UI decision you can make. Every custom icon, illustration, and animation is craft time you could spend shipping features.

**Recommendation:** Ship v1 with full-immersion *colors and typography* (cheap — just setup) plus **2–3 hero illustrations** in the highest-leverage spots: onboarding, the empty-state-after-signup, and the first rating confirmation. Layer in the rest of the hand-drawn iconography over v1.1–v1.3 as you have time. This gets you ~80% of the brand feel for ~20% of the craft cost — and gives you a reason to keep improving the app visually after launch.

---

## What Palato is NOT

A short anti-brand list, so we know what we're resisting.

- Not Material Design, Apple HIG default, or any UI kit aesthetic
- Not pure white backgrounds, ever
- Not Lucide, Heroicons, Phosphor, or Material icons
- Not Inter as a primary face
- Not stock photography
- Not emoji-forward
- Not neon, gradient, glassmorphism, or Web3
- Not corporate hedged voice
- Not "delightful," "seamless," or "revolutionary"

If a design decision looks like any of the above, it isn't Palato.

---

## Revision history

- **v0.1** (April 19, 2026) — Initial draft based on mood board analysis and three strategic calls: UI immersion (full), logo (symbol + wordmark), voice (coffee shop owner). Pre-design, pre-research. Revise after user interviews confirm or challenge brand assumptions in practice.

---

*This is a living document. Every decision that changes it gets a line in the decision log.*
