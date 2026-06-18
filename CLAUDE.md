# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## How the Three Docs Relate

- **CLAUDE.md** (this file) — the stable operating manual: who Jesse is, how to work with him, hard rules, and an accurate current map of the app. Read first.
- **DECISIONS.md** — append-only history of *why*. Every meaningful product/technical decision, with alternatives and rationale. Read before any architectural choice; don't re-litigate settled decisions without flagging the conflict.
- **TECHDEBT.md** — the working backlog of *what's broken or deferred*. Read before building so you don't re-solve a known item or collide with one.

These are three different instruments, not duplicates. CLAUDE.md points at the other two; it does not absorb them.

---

## Who Jesse Is and How to Work With Him

Jesse is a product builder and operational leader — not a career engineer. He's shipped products with React + Supabase, so he can build with guidance, but developer tooling and environment configuration are not yet second nature.

**Working Genius:** Invention and Galvanizing — he thrives originating ideas and rallying people. He's drained by Enablement and Tenacity work (maintaining systems, repetitive follow-through).

**How to collaborate:**
- **Why before how** — always explain the rationale before the implementation. Don't hand over finished code without walking through the decision.
- **One logical change per turn** — don't bundle multi-step changes. Each unit should be reviewable on its own.
- **Challenge his product thinking** — when he proposes a feature, push back: who is this for, what does it solve, how will we know it worked, what are we NOT building instead?
- **Flag competency connections** — when work maps to one of the five career competencies, say so explicitly: "This is your Competency A evidence."
- **Prompt for decision logging** — after any meaningful decision, remind him to add a `DECISIONS.md` entry. If he skips it, push back.
- **Suggest metrics on every ship** — don't let a feature land without asking: "What metric tells you this worked?"
- **Push back constructively** — Jesse explicitly wants this and rewards it. If something seems wrong or premature, say so directly.

---

## What Palato Is

Palato is a consumer mobile-first web app — the "Vivino for specialty coffee." It helps specialty coffee drinkers discover, rate, and track the coffees they drink, build a personal taste profile over time, and get personalized recommendations. The market gap: wine has Vivino (70M users), beer has Untappd, and specialty coffee — a $100B+ market undergoing a luxury transformation — has no dominant equivalent.

**The atomic action: rate a coffee.** Everything else (discovery, recommendations, taste profile, community) flows from the accumulated data of rated coffees.

**Dual purpose:** Palato is simultaneously a real product Jesse wants to exist, and a deliberate career-development artifact targeting a Product Operations Manager role (companies like Anthropic) within 9–12 months. Both purposes matter equally. Every build decision should serve the product AND develop one of the five competencies below.

---

## The Five Career Competencies

When work maps to one of these, flag it. This is part of the collaboration contract.

- **A — AI-Enabled Workflows:** Shipping prompts, building evals, iterating on production LLM workflows. In Palato: the bag-scanning pipeline + its eval, future tasting-note detection and recommendations.
- **B — Voice of Customer Programs:** Structured feedback programs that drive decisions. In Palato: user interviews, in-app feedback loops, synthesizing signal into roadmap. (Not yet started — the biggest open competency.)
- **C — Metrics Fluency:** Defining and tracking product metrics with specificity. In Palato: DAU/WAU, retention curves, ratings per user per week, scan accuracy, recommendation acceptance.
- **D — Product Craft Artifacts:** PRDs, decision logs, interview syntheses, prioritization frameworks, post-mortems.
- **E — Feedback Loop as Product:** The internal feedback pipeline (user signal → feature decision) treated as a product with its own users, metrics, and iteration cycle.

---

## Brand Temperature

Warm, hand-touched, editorial, opinionated. Aesthetic: specialty coffee shop, not enterprise SaaS.

**Current direction (per Decision #019):** Magazine-spread aesthetic (Apartamento, Drift register). Typography: **Boldonse** for the wordmark only, **Instrument Serif** as the working display face, **Geist** as body. Cream `#F4EAD5` background with subtle paper-grain texture, Espresso `#1E1410` text, **Ember `#D94E1F`** as eyebrow accent and primary CTA (used sparingly).

This direction departs from `palato-brand-guide-v01.md`, which still specifies Fraunces — the brand guide is formally out of sync and needs a v02. When in doubt, follow Decision #019, not the brand guide. Do not suggest reverting to system fonts, Fraunces, or generic styling. Do not suggest illustrations, custom icons, or hand-drawn elements yet — deferred to v1.1.

---

## Hard Rules

- **Never commit `.env` or any `.env*` file** — `.gitignore` is configured. Don't suggest or stage these.
- **Never hardcode API keys or secrets** — environment variables only.
- **`VITE_` prefix discipline:** `VITE_`-prefixed vars are exposed to the browser bundle. Server-only secrets (Anthropic API key, Supabase service-role key) must never use the `VITE_` prefix.
- **RLS is on by default** — every new Supabase table requires an explicit Row Level Security policy before queries return data. Don't create a table without a policy.
- **Versioned strategic docs are locked** — do not change `palato-prd-v01.md` or `palato-brand-guide-v01.md` without explicit confirmation from Jesse.
- **Decision logging** — every meaningful decision gets a `DECISIONS.md` entry: date, decision, alternatives, rationale, tradeoffs, linked competency.
- **Least-privilege by default** — prefer security-aware patterns; restrict access and open it deliberately.

---

## Working Agreement

- **When uncertain about product direction, stop and ask** — don't build toward an assumed answer.
- **Read `DECISIONS.md` and `TECHDEBT.md` before architectural work** — they document what was considered, why, and what's already known-broken.
- **One logical change per turn** — so every unit is reviewable.
- **Constructive pushback is expected.**
- **For product/strategy questions, interview synthesis, or "should we build this?" debates, Jesse takes those to the Claude.ai project chat, not here.** This file describes how to build, not what to build.

---

## Current State

Live at `palato.coffee` (primary) and `palato-app.vercel.app`, talking to Supabase. Auth via Google OAuth (test mode, whitelisted users). The app uses **react-router** (Decision #050): two routes are public — `/` (landing) and `/quiz` (the pre-auth palate quiz) — and everything else is gated, redirecting unauthenticated visitors to `/`. The authed experience (`AuthedApp`) is still an internal view-state router holding `selectedCoffeeId`. The onboarding rework (landing → quiz → seeded palate, plus the IA below) shipped per Decision #051. Bottom and desktop nav both read **Catalog · Learn · Palate · More**.

- **Landing** (`Landing`, public `/`) — promise + a no-account "Unlock your palate" CTA into the quiz; sign-in is demoted to a returning-user link.
- **Palate quiz** (`PalateQuiz`, public `/quiz`) — 5-question pre-auth quiz (motivation, aspiration, flavor slider, origin, brew) with value-back copy and a reveal. Persists to `sessionStorage` across the OAuth redirect, then hydrates into `palate_profiles` on first authed load (§3d).
- **Catalog** (`BrowseCoffees`) — grid of the global catalog, plus a quiz-seeded **"Start here"** rail and a scan how-it-works strip; the primary action reads **"Rate a coffee"**. Tap a coffee → detail.
- **Coffee detail** (`CoffeeDetail`) — bag image + facts; surfaces the user's latest rating; "Rate it" / "Rate it again".
- **Rating flow** (`RateCoffee` + `RatingDial`) — the atomic action: custom radial dial (decimal 1.0–5.0), prose notes, type-to-filter flavor descriptor chips over the 168-row taxonomy, then a post-submit interstitial.
- **Palate** (`PalateTab`) — a quiz-seeded **v0 profile** (or the full ratings-driven `PalateDashboard` at 3+ ratings, or a take-the-quiz prompt); an aspiration "what you're here for" card (Decision #051 §5); and the **journal nested** here as "Your most recent ratings" with a real empty state (the full `Journal` is reachable via "See all").
- **Learn** (`Learn`) — editorial origin cards + short origin pages (static v1, no globe); each links into the catalog filtered by that origin.
- **Flavors** (`TaxonomyView`) — magazine-spread render of the 168-descriptor taxonomy (reference list; interactive wheel deferred per #020). Reached from inside More.
- **More** (`MoreTab`) — settings shell: functional Profile (display name, experience level, location), preferred brew methods, aspiration, retake quiz, flavor taxonomy, The story, send-feedback (→ analytics), sign out; plus `Coming Soon` stubs (notifications, units, follows, data export).
- **Add a coffee** (`AddCoffeeForm` / `AddAndRateFlow`, reached via the "Rate a coffee" FAB) — **the bag-scan AI pipeline is live here.** Scan a bag → Claude extracts structured JSON via the `/api/scan` relay → form pre-fills → human corrects → save inserts the coffee AND writes the correction diff + accuracy back to the `scans` table → optional one-tap "Rate it now" handoff into the rating flow. Manual entry is the fallback path.

**Phase:** Phase 0 — Foundation, build essentially complete, plus the onboarding rework (landing → quiz → seeded palate → first rating; Decision #051). The v1 core loop (catalog → rate → palate, plus scan → add → rate) works end to end. **Remaining v1 work is validation, not building:** seed a real catalog, run the long-deferred user interviews (Competency B), and do the first eval pass on the `scans` table (per-field accuracy, correction rate, hallucination rate — see DECISIONS.md #033, #036). v1.1 features (recommender, community ratings, taste/feel split #027, inline descriptor detection #028) come after.

See `git log`, `DECISIONS.md`, and `TECHDEBT.md` for the authoritative detail.

---

## Architecture

**Stack:** React 19 + TypeScript, Vite, Supabase (auth/db/storage), Vercel (deployment + serverless functions), Anthropic API (Claude) for AI features.

**Client entry points (`src/`):**
- `main.tsx` — React root; wraps `<App />` in `<BrowserRouter>` then `<AuthProvider>`.
- `App.tsx` — router shell (Decision #050): public routes `/` (`Landing`) and `/quiz` (`Quiz` → `PalateQuiz`), plus a `*` splat behind `RequireAuth` that renders `AuthedApp`. Holds the splash.
- `AuthedApp.tsx` — the authenticated experience; internal view-state router (`browse | learn | palate | flavors | more | journal | coffee-detail | rating | add-flow`) holding `selectedCoffeeId`; runs quiz hydration; mounts `AddCoffeeForm` admin-only on Browse.
- `components/RequireAuth.tsx` — gates non-public routes; redirects signed-out visitors to `/`.
- `Landing.tsx`, `Quiz.tsx`, `BrowseCoffees.tsx`, `CoffeeDetail.tsx`, `RateCoffee.tsx`, `RatingDial.tsx`, `Journal.tsx`, `TaxonomyView.tsx`, `AddCoffeeForm.tsx` — the views above.
- `features/quiz/` — `PalateQuiz` (the 5-question flow), `quizConfig.ts` (copy, derivations, sessionStorage persistence, aspiration mappings), `palateProfile.ts` (`palate_profiles` read/write), `useQuizHydration.ts` (sessionStorage → DB on first authed load).
- `features/palate/` — `PalateTab` (decides seeded-v0 / dashboard / prompt), `PalateSeededV0`, `RecentRatings` (nested journal), `StartHereRail` (catalog rail + heuristic matcher), `PalateDashboard` + chart components, `data/` hooks.
- `features/learn/` — `Learn` (origin cards + pages) and `originData.ts` (static editorial content).
- `features/more/` — `MoreTab` (settings shell), `TheStory`, `settings.ts` (`profiles` read/write).
- `lib/supabase.ts` — singleton Supabase client.
- `lib/auth.tsx` — AuthContext, `useAuth()`, Google OAuth sign-in/out.
- `lib/useIsAdmin.ts` — client-side admin check (via `VITE_ADMIN_EMAILS`).
- `lib/useFlavorDescriptors.ts`, `lib/useCoffee.ts`, `lib/useCoffees.ts`, `lib/useUserRatings.ts` — data hooks.
- `lib/bagImage.ts` — shared image helpers: validation, HEIC→JPG conversion, Storage upload to `bag-images`. Used by `AddCoffeeForm`.

**Server (`/api/`):**
- `scan.js` — Vercel serverless relay (Decision #032). Verifies the caller's Supabase session token (authenticated users only, #037), sends the bag image URL to Claude with the extraction prompt, returns structured JSON `{ model, promptVersion, extracted }`. Holds the Anthropic key server-side; the browser never sees it. Prompt is versioned via `PROMPT_VERSION` for the eval (#033).

**Database (live in Supabase, see `supabase/migrations/`):**
- `profiles` — 1:1 with `auth.users` (display_name, experience_level, preferred_brew_methods, location).
- `palate_profiles` — 1:1 with `auth.users`; the palate quiz results (motivation, derived experience_level [text], aspiration, flavor_lean + derived roast_preference, origin_affinity, brew_methods, raw_responses). Seeds the Palate v0, the catalog rail, and aspiration personalization (Decision #051).
- `coffees` — global catalog (roaster, name, origin, producer, farm, process + process_detail, roast level, variety, elevation_masl, roaster_tasting_notes_raw, sca_score, bag_image_url).
- `ratings` — per-user rating events (decimal 1.0–5.0 per #023) with brew + context fields.
- `scans` — AI extraction events: `raw_extraction` (immutable), `corrections`, `matched_coffee_id`, `scan_accuracy_score`, `model_version`, `prompt_version`. The Competency A eval dataset.
- `flavor_descriptors` — 168 SCA-aligned rows.
- `coffee_flavor_descriptors`, `rating_flavor_descriptors` — M2M flavor links.
- `descriptor_suggestions` — user-contributed taxonomy candidates (Competency B).

All tables have RLS with explicit policies. Schema changes go through versioned migrations: write `.sql` → commit → `supabase db push` (Decision #014). Note: Storage policies are not yet in version control (TECHDEBT).

---

## Commands

```bash
npm run dev       # Vite dev server (localhost:5173)
npm run build     # type-check + production build
npm run lint      # ESLint
npm run preview   # preview production build
```

No test suite yet.

**Environment variables:**
- Local `.env` (client): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ADMIN_EMAILS`.
- Vercel (server, non-`VITE_`): `ANTHROPIC_API_KEY` — used by `/api/scan.js`, never exposed to the client. Currently on a temporary test account (TECHDEBT).