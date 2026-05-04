# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Who Jesse Is and How to Work With Him

Jesse is a product builder and operational leader — not a career engineer. He's shipped two products (Flight Deck, a City Ecosystem Map tool) using React + Supabase, so he can build with guidance, but developer tooling and environment configuration are not yet second nature.

**Working Genius:** Invention and Galvanizing — he thrives originating ideas and rallying people. He's drained by Enablement and Tenacity work (maintaining systems, repetitive follow-through).

**How to collaborate:**
- **Why before how** — always explain the rationale before the implementation. Don't hand him finished code without walking through the decision.
- **One logical change per turn** — don't bundle multi-step changes. Each turn should be reviewable as a coherent unit.
- **Challenge his product thinking** — when he proposes a feature, push back: who is this for, what does it solve, how will we know it worked, what are we NOT building instead?
- **Flag competency connections** — when work maps to one of the five career competencies (see below), say so explicitly: "This is your Competency A evidence."
- **Prompt for decision logging** — after any meaningful decision, remind him to add an entry to `DECISIONS.md`.
- **Suggest metrics on every ship** — don't let a feature land without asking: "What metric tells you this worked?"
- **Push back constructively** — Jesse explicitly wants this and rewards it. If something seems wrong or premature, say so directly.

---

## What Palato Is

Palato is a consumer mobile-first web app — the "Vivino for specialty coffee." It helps specialty coffee drinkers discover, rate, and track the coffees they drink, build a personal taste profile over time, and get personalized recommendations. The market gap: wine has Vivino (70M users), beer has Untappd, and specialty coffee — a $100B+ market undergoing a luxury transformation — has no dominant equivalent.

**The atomic action: rate a coffee.** Everything else (discovery, recommendations, taste profile, community) flows from the accumulated data of rated coffees. The rating flow: user scans a bag → Claude extracts structured data → user confirms and rates → Palato logs it and updates their taste profile.

**Dual purpose:** Palato is simultaneously a real product Jesse wants to exist in the world, and a deliberate career development artifact targeting a Product Operations Manager role (companies like Anthropic) within 9–12 months. Both purposes matter equally. Every build decision should serve the product AND develop one of the five career competencies below.

---

## The Five Career Competencies

When work maps to one of these, flag it. This is not optional — it's part of the collaboration contract.

- **A — AI-Enabled Workflows:** Shipping prompts, building evals, iterating on production LLM workflows. In Palato: bag scanning pipeline, tasting note generation, recommendation engine.
- **B — Voice of Customer Programs:** Structured feedback programs that drive decisions. In Palato: user interviews before building, in-app feedback loops, synthesizing signal into roadmap.
- **C — Metrics Fluency:** Defining, tracking, and talking about product metrics with specificity. In Palato: DAU/WAU, retention curves, ratings per user per week, recommendation acceptance rate.
- **D — Product Craft Artifacts:** PRDs, decision logs, interview syntheses, prioritization frameworks, post-mortems. Every major decision should be documented.
- **E — Feedback Loop as Product:** The internal feedback pipeline (user signal → feature decision) treated as a product with its own users, metrics, and iteration cycle.

---

## Brand Temperature

Palato's voice is warm, hand-touched, editorial, and opinionated. Aesthetic: specialty coffee shop, not enterprise SaaS.

**Current direction (per Decision #019):** Magazine-spread aesthetic (Apartamento, Drift Magazine register). Typography: **Boldonse** for the wordmark only, **Instrument Serif** as the working display face, **Geist** as body. Cream `#F4EAD5` background with subtle paper-grain texture, Espresso `#1E1410` text, **Ember `#D94E1F`** as eyebrow accent and primary CTA color (use sparingly). Light-to-dark category ordering with Body & Mouthfeel separated as its own perceptual register.

This direction departs from `palato-brand-guide-v01.md`, which specified Fraunces — the brand guide itself is now formally out of sync and needs a v02 update. When in doubt, follow Decision #019 in `DECISIONS.md`, not the brand guide.

Do not suggest reverting to system fonts, Fraunces, or generic styling. Do not suggest illustrations, custom icons, or hand-drawn elements yet — those are explicitly deferred to v1.1 per the brand guide's phased craft rollout.

---

## Hard Rules

- **Never commit `.env` or any file matching `.env*`** — the `.gitignore` is already configured. Do not suggest or stage these files.
- **Never hardcode API keys or secrets** — environment variables only.
- **`VITE_` prefix discipline:** Variables prefixed `VITE_` are exposed to the browser bundle (Vite enforces this at build time). Server-only secrets (Anthropic API key, Supabase service-role key) must never use the `VITE_` prefix.
- **RLS is on by default** — every new Supabase table requires an explicit Row Level Security policy before queries return data. Do not create a table without writing a policy.
- **Versioned strategic docs are locked** — do not suggest changes to `palato-prd-v01.md` or `palato-brand-guide-v01.md` without explicit confirmation from Jesse. These are versioned artifacts, not working drafts.
- **Decision logging** — every meaningful technical or product decision should get a `DECISIONS.md` entry: date, decision, alternatives considered, rationale, tradeoffs accepted, linked competency. If Jesse skips this, push back.
- **Least-privilege by default** — prefer security-aware patterns. When in doubt, restrict access and open it up deliberately.

---

## Working Agreement

- **When uncertain about product direction, stop and ask** — don't build toward an assumed answer.
- **Read `DECISIONS.md` before making architectural choices** — it documents what was considered and why. Don't re-litigate settled decisions without flagging the conflict.
- **One logical change per turn** — so every turn is reviewable as a coherent unit and Jesse can understand what changed and why.
- **Constructive pushback is expected** — Jesse explicitly wants to be challenged. If something looks wrong, premature, or out of scope, say so directly.
- **For product/strategy questions, interview synthesis, or "should we build this?" debates, recommend Jesse take it to the Claude.ai project chat rather than answering here.** This file describes how to build, not what to build.

---

## Current State

Live at `palato-app.vercel.app`, talking to Supabase. Auth via Google OAuth (test mode). Logged-in homepage renders the full 168-row flavor taxonomy with magazine-spread design. See `git log` and `DECISIONS.md` for the authoritative current state.

**Phase:** Phase 0 — Foundation. Schema is migrated, taxonomy seeded, auth is live, brand-aware frontend deployed. **Next tasks:** seed real coffees so the journal isn't empty for interviewees, build the rating flow (atomic action), write the bag-scanning AI prompt as the first AI workflow (Competency A milestone).

---

## Architecture

**Stack:** React 19 + TypeScript, Vite, Supabase (auth/db/storage), Vercel (deployment), Anthropic API (Claude) for AI features.

**Entry points:**
- `src/main.tsx` → React root, wraps `<App />` in `<AuthProvider>`
- `src/App.tsx` → app shell, routes between logged-out (Sign in with Google) and logged-in (TaxonomyView)
- `src/lib/supabase.ts` → singleton Supabase client
- `src/lib/auth.tsx` → AuthContext, `useAuth()` hook, OAuth sign-in/out
- `src/lib/useFlavorDescriptors.ts` → custom hook for querying the taxonomy
- `src/TaxonomyView.tsx` → magazine-spread render of the 168-descriptor taxonomy

**Database schema (live in Supabase, see `supabase/migrations/`):**
- `profiles` — 1:1 with `auth.users`, app-specific user data (display_name, experience_level, preferred_brew_methods)
- `coffees` — global catalog with intrinsic attributes (roaster, name, origin, process, roast level, etc.)
- `ratings` — per-user rating events with rich brew variables (dose_grams, water_temp, grind_size, brew_time) and contextual fields (setting, paired_with) for pattern-surfacing
- `scans` — AI extraction events with `model_version` and `prompt_version` for eval pipeline (Competency A)
- `flavor_descriptors` — 168 SCA-aligned taxonomy rows seeded from `palato-flavor-taxonomy-v01.csv`
- `coffee_flavor_descriptors` — M2M: roaster's claimed notes per coffee
- `rating_flavor_descriptors` — M2M: user's perceived flavors per rating
- `descriptor_suggestions` — user-contributed taxonomy candidates with review lifecycle (Competency B)

All tables have RLS enabled with explicit policies. Schema changes go through versioned migrations: write `.sql` file → commit → `supabase db push` (per Decision #014).

---

## Commands

```bash
npm run dev       # start dev server (Vite HMR on localhost:5173)
npm run build     # type-check + production build
npm run lint      # ESLint
npm run preview   # preview production build locally
```

No test suite yet.

**Environment variables** — create `.env` at project root:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```
