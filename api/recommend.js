// /api/recommend.js
// Palate recommendation engine. Builds three deterministic candidate shortlists
// from the user's ratings + the approved catalog, then asks Claude to pick the
// best per strategy and write a grounded, varied reason. Caches per user.
// Strategies: unique (novel flavors), explore (new origins), love (taste match).
// Mirrors api/augment.js (auth + model + versioned prompt). See Decision log.

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic();
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const MODEL = 'claude-sonnet-4-6';
const PROMPT_VERSION = 'v1';

// Flavor category -> family (kept in sync with usePalateProfile.ts).
const CATEGORY_TO_FAMILY = {
  Fruit: 'fruity', Floral: 'floral', Sweet: 'sweet',
  'Fermented & Funky': 'sour_ferment', 'Nutty & Cocoa': 'cocoa_nut',
  Spice: 'spice', Roasted: 'roasted', 'Earthy & Wood': 'green', Green: 'green',
  'Body & Mouthfeel': 'sweet', 'Defects & Off-flavors': 'sour_ferment',
};

// A light "off the beaten path" boost for the explore strategy.
const UNCOMMON_ORIGINS = new Set([
  'India', 'Yemen', 'Bolivia', 'Panama', 'China', 'Thailand', 'Myanmar', 'Uganda',
  'Congo', 'DR Congo', 'Democratic Republic of Congo', 'Nepal', 'Hawaii', 'Cuba',
  'Haiti', 'Philippines', 'Malawi', 'Zambia', 'Timor-Leste', 'Papua New Guinea', 'Ecuador',
]);

const topBy = (arr, scoreFn, n) =>
  arr.map((x) => [x, scoreFn(x)]).filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1]).slice(0, n).map(([x]) => x);

const familiesOf = (cfds) => {
  const fams = new Set();
  const descs = new Set();
  for (const cfd of cfds || []) {
    const d = cfd.descriptor;
    if (!d) continue;
    descs.add(d.descriptor.toLowerCase());
    const fam = CATEGORY_TO_FAMILY[d.category];
    if (fam) fams.add(fam);
  }
  return { fams, descs };
};

const compact = (kind, list) =>
  list.map((c) => {
    const { descs } = familiesOf(c.coffee_flavor_descriptors);
    return {
      coffeeId: c.id,
      roaster: c.roaster_name,
      name: c.coffee_name,
      origin: c.origin_country || null,
      process: c.process || null,
      roast: c.roaster_stated_roast_level || null,
      notes: [...descs].slice(0, 8),
    };
  });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });

  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Not authenticated.' });

  let userScoped, user;
  try {
    const sb = createClient(supabaseUrl, supabaseAnonKey);
    const auth = await sb.auth.getUser(token);
    user = auth.data.user;
    if (auth.error || !user) return res.status(401).json({ error: 'Invalid session.' });
    userScoped = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
  } catch {
    return res.status(500).json({ error: 'Failed to authenticate.' });
  }

  try {
    // --- Fetch ratings (taste history) + approved catalog (candidates) ---
    const [{ data: ratings }, { data: coffees }] = await Promise.all([
      userScoped
        .from('ratings')
        .select(`rating, coffee:coffees ( id, origin_country, process, roaster_stated_roast_level ),
                 rating_flavor_descriptors ( descriptor:flavor_descriptors ( descriptor, category ) )`)
        .eq('user_id', user.id),
      userScoped
        .from('coffees')
        .select(`id, roaster_name, coffee_name, origin_country, process, roaster_stated_roast_level, bag_image_url,
                 purchase_url, purchase_availability,
                 coffee_flavor_descriptors ( descriptor:flavor_descriptors ( descriptor, category ) )`)
        .eq('moderation_status', 'approved'),
    ]);

    // --- Build the user's taste profile (standout cups 4.5+ weighted harder) ---
    const ratedIds = new Set();
    const userDescs = new Set();
    const familyW = {}, roastW = {}, processW = {}, originW = {};
    const standouts = [];
    for (const r of ratings || []) {
      const w = (r.rating || 0) + (r.rating >= 4.5 ? 2 : 0);
      const c = r.coffee;
      if (c) {
        ratedIds.add(c.id);
        if (c.origin_country) originW[c.origin_country] = (originW[c.origin_country] || 0) + w;
        if (c.roaster_stated_roast_level) roastW[c.roaster_stated_roast_level] = (roastW[c.roaster_stated_roast_level] || 0) + w;
        if (c.process) processW[c.process] = (processW[c.process] || 0) + w;
      }
      const notes = [];
      for (const rfd of r.rating_flavor_descriptors || []) {
        const d = rfd.descriptor;
        if (!d) continue;
        userDescs.add(d.descriptor.toLowerCase());
        notes.push(d.descriptor);
        const fam = CATEGORY_TO_FAMILY[d.category];
        if (fam) familyW[fam] = (familyW[fam] || 0) + w;
      }
      if (r.rating >= 4.5) standouts.push({ rating: r.rating, notes });
    }
    const likedFamilies = new Set(Object.entries(familyW).filter(([, w]) => w > 0).map(([f]) => f));
    const userOrigins = new Set(Object.keys(originW));

    // catalog origin frequency (for explore rarity)
    const originFreq = {};
    for (const c of coffees || []) if (c.origin_country) originFreq[c.origin_country] = (originFreq[c.origin_country] || 0) + 1;

    // Only recommend coffees the user can actually buy (Decision #067): a
    // purchase link must be on file, and not flagged sold-out. No buy link =
    // treated as unavailable, so it never reaches a recommendation card — this
    // is exactly the "don't lead me to a 404 or a sold-out coffee" ask.
    const candidates = (coffees || []).filter(
      (c) => !ratedIds.has(c.id) && c.purchase_url && c.purchase_availability !== 'no',
    );

    // Favor the little guys (Decision #071). A roaster with many coffees in the
    // buyable catalog is a proxy for "big" (Onyx, Blue Bottle carry deep
    // lineups), so its coffees are down-weighted; a 1–2-coffee independent keeps
    // full weight. sqrt keeps it gentle — palate fit still leads, this just
    // tilts ties and near-ties toward small roasters.
    const roasterCount = {};
    for (const c of candidates) roasterCount[c.roaster_name] = (roasterCount[c.roaster_name] || 0) + 1;
    const roasterWeight = (c) => 1 / Math.sqrt(roasterCount[c.roaster_name] || 1);

    // --- Deterministic shortlists ---
    const uniqueList = topBy(candidates, (c) => {
      const { fams, descs } = familiesOf(c.coffee_flavor_descriptors);
      const novel = [...descs].filter((d) => !userDescs.has(d)).length;
      if (novel === 0) return 0;
      const sharesLiked = [...fams].some((f) => likedFamilies.has(f));
      return (novel * (sharesLiked ? 2 : 1) + (sharesLiked ? 1 : 0)) * roasterWeight(c);
    }, 6);

    const exploreList = topBy(candidates, (c) => {
      if (!c.origin_country || userOrigins.has(c.origin_country)) return 0;
      return (1 / (originFreq[c.origin_country] || 1) + (UNCOMMON_ORIGINS.has(c.origin_country) ? 1 : 0) + 0.01) * roasterWeight(c);
    }, 6);

    const loveList = topBy(candidates, (c) => {
      const { fams } = familiesOf(c.coffee_flavor_descriptors);
      let s = 0;
      for (const f of fams) s += (familyW[f] || 0) * 2; // flavor neighborhood (family level)
      s += roastW[c.roaster_stated_roast_level] || 0;
      s += processW[c.process] || 0;
      s += originW[c.origin_country] || 0;
      return s * roasterWeight(c);
    }, 6);

    const shortlists = {
      unique: compact('unique', uniqueList),
      explore: compact('explore', exploreList),
      love: compact('love', loveList),
    };

    // --- Claude: pick one per non-empty shortlist + write a grounded reason ---
    const tasteSummary = {
      topFamilies: Object.entries(familyW).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([f]) => f),
      topOrigins: Object.entries(originW).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([o]) => o),
      standoutCups: standouts.slice(0, 5),
      ratingCount: (ratings || []).length,
    };

    const askKinds = ['unique', 'explore', 'love'].filter((k) => shortlists[k].length > 0);
    let picks = {};
    if (askKinds.length > 0) {
      const prompt = `You write Palato's coffee recommendations. Below is a user's taste profile and up to three shortlists of candidate coffees. For each shortlist provided, pick the SINGLE best coffee and write one grounded sentence (under 30 words) explaining why, citing their actual taste.

PRINCIPLES:
- Recommend within their flavor NEIGHBORHOOD, not their exact notes — if they love blueberry, raspberry or stone-fruit are great too. Favor adjacency and a little variety; don't just echo one note.
- Weight their standout cups (rated 4.5+) most heavily.
- "unique" = something with flavors new to them; "explore" = a new origin to taste; "love" = a safe favorite they'll likely score high.
- Each coffeeId MUST come from that strategy's shortlist.

USER TASTE: ${JSON.stringify(tasteSummary)}

SHORTLISTS: ${JSON.stringify(Object.fromEntries(askKinds.map((k) => [k, shortlists[k]])))}

Respond with ONLY valid JSON, no markdown:
{${askKinds.map((k) => `"${k}": { "coffeeId": "...", "reason": "..." }`).join(', ')}}`;

      try {
        const msg = await anthropic.messages.create({
          model: MODEL,
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        });
        const text = (msg.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n');
        const first = text.indexOf('{');
        const last = text.lastIndexOf('}');
        picks = JSON.parse(text.slice(first, last + 1));
      } catch {
        picks = {}; // fall through to deterministic fallback below
      }
    }

    // --- Hydrate picks; fall back to the top deterministic candidate per kind ---
    const byId = new Map(candidates.map((c) => [c.id, c]));
    const TEMPLATES = {
      unique: 'Flavors you haven’t tried yet — a fresh direction from what you usually reach for.',
      explore: 'A new origin to add to your map, picked to widen where your palate has been.',
      love: 'Close to the coffees you already score highly — a safe bet for your taste.',
    };
    const PROC = { natural: 'natural', honey: 'honey', anaerobic: 'anaerobic', washed: 'washed' };
    // Enforce roaster diversity across the three cards (Decision #071) — never two
    // picks from the same roaster. Built in order; each card takes the first
    // candidate from a not-yet-used roaster, preferring Claude's pick then the
    // shortlist order. Falls back to the top pick if every candidate's roaster is
    // already taken (better a repeat than an empty card).
    const usedRoasters = new Set();
    const build = (kind) => {
      const list = shortlists[kind];
      if (!list.length) return null;
      const pick = picks[kind];
      const claudeId = pick && list.some((c) => c.coffeeId === pick.coffeeId) ? pick.coffeeId : null;
      const order = claudeId
        ? [claudeId, ...list.map((c) => c.coffeeId).filter((id) => id !== claudeId)]
        : list.map((c) => c.coffeeId);

      let chosen = byId.get(order[0]) || null;
      for (const id of order) {
        const c = byId.get(id);
        if (c && !usedRoasters.has(c.roaster_name)) {
          chosen = c;
          break;
        }
      }
      if (!chosen) return null;
      usedRoasters.add(chosen.roaster_name);

      // Claude's reason describes its picked coffee — only reuse it if diversity
      // didn't move us to a different coffee.
      const reason = claudeId === chosen.id && pick.reason ? pick.reason : TEMPLATES[kind];
      return {
        kind,
        coffeeId: chosen.id,
        imageUrl: chosen.bag_image_url || null,
        coffeeName: chosen.coffee_name,
        roaster: chosen.roaster_name,
        process: PROC[chosen.process] || chosen.process || 'other',
        roastLevel: (chosen.roaster_stated_roast_level || 'medium').replace(/_/g, '-'),
        reason,
      };
    };

    const recommendations = { unique: build('unique'), explore: build('explore'), love: build('love') };

    // --- Cache (upsert one row per user) ---
    await userScoped.from('recommendations').upsert({
      user_id: user.id,
      recommendations,
      rating_count_at_generation: (ratings || []).length,
      model_version: MODEL,
      prompt_version: PROMPT_VERSION,
      generated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    return res.status(200).json({ model: MODEL, promptVersion: PROMPT_VERSION, recommendations });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
