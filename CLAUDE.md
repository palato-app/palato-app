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

## Brand Temperature (and Why We're Not Using It Yet)

Palato's eventual voice is warm, hand-touched, editorial, and opinionated. Typography: Fraunces (display) + DM Sans (body). Aesthetic: specialty coffee shop, not enterprise SaaS.

**For the current prototype build: deliberately unfinished.** User interviewees during Phase 0 should critique flows and information architecture, not visuals. Premature brand polish biases feedback toward aesthetics. Full brand layers in at v1.1, post-interview synthesis.

For prototype UI, default to system fonts, Raw Cream `#F4EAD5` for backgrounds, Espresso `#1E1410` for text, and minimal styling. The temperature can be present without the polish. Do not suggest custom fonts, illustrations, or styled components until explicitly asked.

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

Live at `palato-app.vercel.app`, talking to Supabase. See `git log` and `DECISIONS.md` for the authoritative current state of commits and logged decisions.

**Phase:** Phase 0 — Foundation. Infrastructure is wired. Next task: database schema migration — `coffees`, `ratings`, `scans`, and `profiles` tables, with RLS policies on each.

---

## Architecture

**Stack:** React 19 + TypeScript, Vite, Supabase (auth/db/storage), Vercel (deployment), Anthropic API (Claude) for AI features — same stack as Flight Deck.

**Entry points:**
- `src/main.tsx` → React root
- `src/App.tsx` → app shell (currently just a Supabase connection check)
- `src/lib/supabase.ts` → singleton Supabase client; throws at startup if env vars are missing

**Planned data model** (not yet migrated):
- `coffees` — global catalog (roaster, name, origin, process, roast level, tasting notes)
- `ratings` — per-user ratings linked to `coffees`
- `scans` — raw AI extractions + user corrections (eval dataset for measuring and improving pipeline accuracy — Competency A)
- `profiles` — per-user taste preferences and metadata

Separating `coffees` from `ratings` enables community aggregation and deduplication as multiple users scan the same bag.

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
