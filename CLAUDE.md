# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## How the Three Docs Relate

- **CLAUDE.md** (this file) — the stable operating manual: who Jesse is, how to work with him, hard rules, and an accurate current map of the app. Read first.
- **DECISIONS.md** — append-only history of *why*. Every meaningful product/technical decision, with alternatives and rationale. Read before any architectural choice; don't re-litigate settled decisions without flagging the conflict.
- **TECH_DEBT.md** — the working backlog of *what's broken or deferred*. Read before building so you don't re-solve a known item or collide with one.

These are three different instruments, not duplicates. CLAUDE.md points at the other two; it does not absorb them.

---

## Who Jesse Is and How to Work With Him

Jesse is a product builder and operational leader — not a career engineer. He's shipped products with React + Supabase, so he can build with guidance, but developer tooling and environment configuration are not yet second nature.

**Working Genius:** Invention and Galvanizing — he thrives originating ideas and rallying people. He's drained by Enablement and Tenacity work (maintaining systems, repetitive follow-through).

**How to collaborate:**
- **Why before how** — always explain the rationale before the implementation. Don't hand over finished code without walking through the decision.
- **One logical change per turn** — don't bundle multi-step changes. Each unit should be reviewable on its own.
- **Challenge his product thinking** — when he proposes a feature, push back: who is this for, what does it solve, how will we know it worked, what are we NOT building instead? Increasingly, also: how does this move Palato toward a real, profitable venture?
- **Note skill-building lightly** — Palato is now driven as a real venture, not a career artifact (see *What Palato Is*). The five competencies below are still a useful lens; mention one only when work genuinely exemplifies it, and don't make it the focus.
- **Prompt for decision logging** — after any meaningful decision, remind him to add a `DECISIONS.md` entry. If he skips it, push back.
- **Suggest metrics on every ship** — don't let a feature land without asking: "What metric tells you this worked?" (This matters more now, not less — a real venture lives or dies on its numbers.)
- **Push back constructively** — Jesse explicitly wants this and rewards it. If something seems wrong or premature, say so directly.

---

## What Palato Is

Palato is a consumer mobile-first web app — the "Vivino for specialty coffee." It helps specialty coffee drinkers discover, rate, and track the coffees they drink, build a personal taste profile over time, and get personalized recommendations. The market gap: wine has Vivino (70M users), beer has Untappd, and specialty coffee — a $100B+ market undergoing a luxury transformation — has no dominant equivalent.

**The atomic action: rate a coffee.** Everything else (discovery, recommendations, taste profile, community) flows from the accumulated data of rated coffees.

**Purpose (updated June 2026):** Palato is the product Jesse intends to grow into a **real, profitable, and redemptive venture** — that is the driver. Earlier in the project it carried an equal second purpose as a career-development artifact for a Product-Operations role (the five competencies below); that has since become a *secondary* frame. Palato should still make a strong portfolio piece, and the competencies remain useful lenses worth an occasional nod — but build decisions are driven by what makes Palato a better, more sustainable, more redemptive product (and eventually a profitable one), not by competency-development.

---

## The Five Competencies (a secondary lens)

These were the original career-development frame for Palato. Per the updated purpose above they're now a **secondary lens, not the goal** — worth a light mention when work genuinely exemplifies one, but not something to force onto every change. Kept here because they're still a useful way to name the *kind* of value a piece of work creates.

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
- **Decision logging** — every meaningful decision gets a `DECISIONS.md` entry: date, decision, alternatives, rationale, tradeoffs (a linked competency is optional now, no longer required).
- **Least-privilege by default** — prefer security-aware patterns; restrict access and open it deliberately.

---

## Working Agreement

- **When uncertain about product direction, stop and ask** — don't build toward an assumed answer.
- **Read `DECISIONS.md` and `TECH_DEBT.md` before architectural work** — they document what was considered, why, and what's already known-broken.
- **One logical change per turn** — so every unit is reviewable.
- **Constructive pushback is expected.**
- **For product/strategy questions, interview synthesis, or "should we build this?" debates, Jesse takes those to the Claude.ai project chat, not here.** This file describes how to build, not what to build.

---

## Current State

Live at `palato.coffee` (primary) and `palato-app.vercel.app`, talking to Supabase. Auth via Google OAuth (test mode, whitelisted users). The app uses **react-router** (Decision #050): two routes are public — `/` (landing) and `/quiz` (the pre-auth palate quiz) — and everything else is gated, redirecting unauthenticated visitors to `/`. The authed experience (`AuthedApp`) is still an internal view-state router holding `selectedCoffeeId`. The onboarding rework (landing → quiz → seeded palate, plus the IA below) shipped per Decision #051. Bottom and desktop nav both read **Catalog · Learn · Palate · More**.

- **Landing** (`Landing`, public `/`) — promise + a no-account "Unlock your palate" CTA into the quiz; sign-in is demoted to a returning-user link.
- **Palate quiz** (`PalateQuiz`, public `/quiz`) — 5-question pre-auth quiz (motivation, aspiration, flavor slider, origin, brew) with value-back copy and a reveal. Persists to `sessionStorage` across the OAuth redirect, then hydrates into `palate_profiles` on first authed load (§3d).
- **Catalog** (`BrowseCoffees`) — grid of the global catalog, plus a quiz-seeded **"Start here"** rail and a scan how-it-works strip; the primary action reads **"Rate a coffee"**. Tap a coffee → detail.
- **Coffee detail** (`CoffeeDetail`) — bag image (or the playful placeholder) + facts; the user's latest rating; **a commerce block when augmented** — price, a "Buy from {roaster}" outbound link, and a "Checked {date} — confirm on the roaster's site" freshness line (Decision #054); "Rate it" / "Rate it again".
- **Rating flow** (`RateCoffee` + `RatingDial`) — the atomic action: custom radial dial (decimal 1.0–5.0), prose notes, type-to-filter flavor descriptor chips over the 168-row taxonomy, then a post-submit interstitial.
- **Palate** (`PalateTab`) — a quiz-seeded **v0 profile** (or the full ratings-driven `PalateDashboard` at 3+ ratings, or a take-the-quiz prompt); an aspiration card; the **journal nested** here; and the **live recommendation engine** in the dashboard's "What's next" module — three cards (**Try Something Unique / Go Somewhere New / Something You'll Love**) with bag photos and grounded reasons, unlocked at 3 ratings (Decision #053).
- **Learn** (`Learn`) — editorial origin cards + short origin pages (static v1); each links into the catalog filtered by that origin.
- **Flavors** (`TaxonomyView`) — magazine-spread render of the 168-descriptor taxonomy. Reached from inside More.
- **More** (`MoreTab`) — settings shell: Profile (display name, experience level, location), brew methods, aspiration, retake quiz, flavor taxonomy, The story, send-feedback, sign out; plus `Coming Soon` stubs.
- **Add a coffee** (`AddAndRateFlow`, via the "Rate a coffee" FAB) — **the bag-scan AI pipeline.** Scan a bag → Claude extracts structured JSON via `/api/scan` → form pre-fills → human corrects → save inserts the coffee + writes the correction diff/accuracy to `scans` → optional "Rate it now" handoff. **New coffees now enter `moderation_status = 'pending'`** and are invisible in the global catalog until an admin approves them (the verification gate, #052). Manual entry is the fallback.
- **Admin dashboard** (`AdminDashboard`, admin-only nav; gated by `profiles.is_admin`) — the catalog-quality surface built this session. Two sections: **Verify queue** (approve/reject pending coffees, with image review — approve enters the catalog, reject keeps it out but never deletes) and **Augment** (run web-augmentation per coffee/batch, review proposals as a per-field accept/reject diff, "re-augment" toggle), plus a **Rebuild flavor links** maintenance action.

**Major systems shipped this session (see DECISIONS #047–#054):**
- **Catalog verification gate (#052):** new coffees aren't global until an admin approves them, so nobody can inject low-quality/inappropriate images into the brand surface. Revises the old open-catalog model (#034/#045).
- **Web-augmentation pipeline (#047/#048):** admin-gated `/api/augment` uses Claude with hosted web search to normalize/gap-fill a coffee's facts **and commerce** (purchase link, price, weight, availability) from the roaster's page. Never auto-overwrites — writes a *pending proposal* an admin approves per-field; provenance + freshness stored; the `augmentations` table is the eval seam. Accuracy is still being tuned (constructed-URL + price drift fixes in prompt v4 + a server-side dead-link check).
- **Recommendation engine (#053):** `/api/recommend` builds three deterministic candidate shortlists from the user's ratings + approved catalog, then Claude picks one per strategy and writes a grounded reason (matching the flavor *neighborhood*, leaning on 4.5+ standout cups), with a templated fallback. Cached per user.
- **Commerce (#054):** direct "buy from the roaster" links + price on coffee detail. **No affiliate yet** (deferred to the legal track); a plain link that drives traffic to roasters.
- **Placeholder system:** an animated "imagine a nice coffee bag" tile on a random non-white background (stable per coffee) for any coffee with no bag photo, used across every coffee surface.

**Phase:** the v1 core loop (catalog → rate → palate, scan → add → rate) plus the admin/moderation, augmentation, recommendation, and commerce systems are all **live**. **Remaining near-term work is mostly validation + venture-readiness, not net-new features:** re-augment the catalog under prompt v4 and clean the live data; a first **augmentation-accuracy eval** (per-field accuracy / hallucination rate from `augmentations` + `scans`); the deferred **user interviews**; and the path toward profitability (structured user location so "Something You'll Love" can filter to shippable coffees; the recommendation-card UI redesign Jesse is leading; eventually affiliate revenue once the legal track clears).

See `git log`, `DECISIONS.md` (#047–#054 are this session), and `TECH_DEBT.md` for the authoritative detail.

---

## Architecture

**Stack:** React 19 + TypeScript, Vite, Supabase (auth/db/storage), Vercel (deployment + serverless functions), Anthropic API (Claude) for AI features.

**Client entry points (`src/`):**
- `main.tsx` — React root; wraps `<App />` in `<BrowserRouter>` then `<AuthProvider>`.
- `App.tsx` — router shell (Decision #050): public routes `/` (`Landing`) and `/quiz` (`Quiz` → `PalateQuiz`), plus a `*` splat behind `RequireAuth` that renders `AuthedApp`. Holds the splash.
- `AuthedApp.tsx` — the authenticated experience; internal view-state router (`browse | learn | palate | flavors | more | journal | coffee-detail | rating | add-flow | admin`) holding `selectedCoffeeId`; runs quiz hydration; the **Admin** nav entry + view render only when `useIsAdmin()` is true.
- `components/RequireAuth.tsx` — gates non-public routes; redirects signed-out visitors to `/`.
- All views live under `features/` (as of July 5, 2026 — Decision #060 slice 5; root holds only `main.tsx`, `App.tsx`, `AuthedApp.tsx`): `features/landing/Landing` (public `/`), `features/quiz/Quiz` (the `/quiz` route shell), `features/catalog/BrowseCoffees`, `features/coffee/` (`CoffeeDetail`, `EditCoffeeForm`), `features/rating/` (`RateCoffee`, `RatingForm`, `RatingDial`, `EditRatingFlow`, `Journal`), `features/scan/AddAndRateFlow` (the bag-scan add flow), `features/flavors/TaxonomyView`. (`AddCoffeeForm.tsx` was deleted July 5, 2026 — dead code absorbed by `AddAndRateFlow`.)
- `lib/theme.ts` — brand tokens (`theme`: colors, fonts, chart fills); `lib/labels.ts` — canonical enum→display maps (roast/process) + the underscore↔hyphen roast-key seam (`toRoastBucketKey`); `lib/format.ts` — shared formatters. Palate-only chart helpers stay in `features/palate/palateTheme.ts`.
- `features/quiz/` — `PalateQuiz` (the 5-question flow), `quizConfig.ts` (copy, derivations, sessionStorage persistence, aspiration mappings), `palateProfile.ts` (`palate_profiles` read/write), `useQuizHydration.ts` (sessionStorage → DB on first authed load).
- `features/palate/` — `PalateTab` (decides seeded-v0 / dashboard / prompt), `PalateSeededV0`, `RecentRatings` (nested journal), `StartHereRail` (catalog rail + heuristic matcher), `PalateDashboard` + chart components, `components/WhatsNext` (the three recommendation cards), `data/` hooks incl. `useRecommendations` (reads the `recommendations` cache, regenerates via `/api/recommend` when stale).
- `features/admin/` — the admin dashboard: `AdminDashboard` (Verify + Augment sections + maintenance), `usePendingCoffees` (+ approve/reject), `useAugmentations` + `AugmentSection` (trigger/review/approve augmentation proposals), `flavorBackfill.ts` + `MaintenanceTools` (rebuild `coffee_flavor_descriptors`).
- `features/learn/` — `Learn` (origin cards + pages) and `originData.ts`.
- `features/more/` — `MoreTab` (settings shell), `TheStory`, `settings.ts` (`profiles` read/write).
- `lib/supabase.ts` — singleton Supabase client. `lib/auth.tsx` — AuthContext, Google OAuth.
- `lib/useIsAdmin.ts` — reads `profiles.is_admin` (the single source of truth; the email allowlist that sets it lives in migration `0013`).
- `lib/coffeeImage.ts` + `components/CoffeePlaceholder.tsx` — the missing-bag-photo placeholder (animated WebP on a random non-white background, stable per coffee).
- `lib/useFlavorDescriptors.ts`, `lib/descriptorMatcher.ts`, `lib/useCoffee.ts`, `lib/useCoffees.ts`, `lib/useUserRatings.ts` — data hooks + the raw-notes→taxonomy matcher.
- `lib/bagImage.ts` — image validation, HEIC→JPG, Storage upload to `bag-images`.

**Server (`/api/`)** — three Vercel serverless relays, all verifying the caller's Supabase session token and holding the Anthropic key server-side (versioned `PROMPT_VERSION` per endpoint):
- `scan.js` (#032/#037) — bag image → Claude extraction → JSON; feeds the `scans` eval dataset.
- `augment.js` (#047/#048/#052) — **admin-gated**; Claude + hosted web search normalizes/gap-fills a coffee's facts + commerce from the roaster's page; writes a *pending* `augmentations` row (never mutates the coffee); validates purchase links (drops 404s).
- `recommend.js` (#053) — deterministic shortlists + Claude pick/copy → three recommendation cards; upserts the `recommendations` cache.

**Database (live in Supabase, see `supabase/migrations/` — through `0016`):**
- `profiles` — 1:1 with `auth.users` (display_name, experience_level, preferred_brew_methods, free-text location, **`is_admin`** — the admin model, allowlist-seeded in `0013`).
- `palate_profiles` — the palate quiz results (seeds Palate v0, the catalog rail, aspiration personalization; #051).
- `coffees` — global catalog. Intrinsic facts (roaster, name, origin, producer, farm, process(+detail), roast, variety, elevation, raw tasting notes, sca_score, bag_image_url) **plus `moderation_status` (pending/approved/rejected — the gate, `0013`), web-augmented commerce/provenance columns (`purchase_url`, `retailer_name`, `price_usd`, `bag_weight_grams`, `purchase_availability`, `source_url`, `web_augmented_at`, `augmentation_raw`; `0010`/`0015`) and a generated `price_per_gram` (`0016`).** A trigger locks moderation + provenance columns to admins.
- `ratings` — per-user rating events (decimal 1.0–5.0, #023) with brew + context.
- `scans` — bag-scan extraction events (the scan eval dataset).
- `augmentations` — web-augmentation proposals (immutable `raw_response`, `proposed` diff, `source_urls`, status, model/prompt version) — the augmentation eval seam; admin-only RLS.
- `recommendations` — per-user recommendation cache (the three cards JSON + rating-count/generated-at staleness markers); own-rows RLS.
- `flavor_descriptors` (168 rows), `coffee_flavor_descriptors` (now populated via the admin backfill), `rating_flavor_descriptors`, `descriptor_suggestions`.

All tables have RLS with explicit policies. Schema changes go through versioned migrations: write `.sql` → commit → `supabase db push` (Decision #014). Note: Storage policies are not yet fully in version control (TECHDEBT).

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
- Local `.env` (client): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (plus `VITE_DEV_USER_EMAIL`/`VITE_DEV_USER_PASSWORD` for the dev-only sign-in path, #043). Admin access is now `profiles.is_admin` (allowlist-seeded in migration `0013`), **not** `VITE_ADMIN_EMAILS`.
- Vercel (server, non-`VITE_`): `ANTHROPIC_API_KEY` — used by all three `/api/*` relays, never exposed to the client. Still on a temporary test account (TECHDEBT).