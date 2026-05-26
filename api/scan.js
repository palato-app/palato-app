// /api/scan.js
// Bag-scan relay: takes an image URL, asks Claude to extract structured data,
// returns it as JSON. Gated to authenticated Supabase users.

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const MODEL = 'claude-sonnet-4-6';
const PROMPT_VERSION = 'v1';

const EXTRACTION_PROMPT = `You are extracting structured data from a photo of a specialty coffee bag.

Extract ONLY information clearly visible and printed on the bag. Follow these rules strictly:
- If a field is not visible or not printed, return null for it. Do NOT guess, infer, or fill in plausible values.
- Do not use any outside knowledge about the roaster or coffee. Report only what the bag itself shows.
- For tasting notes, return exactly the words printed on the bag, as an array of strings. If none are printed, return an empty array.

Respond with ONLY a valid JSON object — no explanation, no markdown, no code fences — with exactly these keys:

{
  "roaster_name": string or null,
  "coffee_name": string or null,
  "origin_country": string or null,
  "origin_region": string or null,
  "producer": string or null,
  "farm": string or null,
  "variety": string or null,
  "elevation": string or null,
  "processing_method": "washed" | "natural" | "honey" | "anaerobic" | "other" | null,
  "process_detail": string or null,
  "roast_level": "light" | "medium-light" | "medium" | "medium-dark" | "dark" | null,
  "roast_date": string or null,
  "weight": string or null,
  "price": string or null,
  "tasting_notes": array of strings
}`;

export default async function handler(req, res) {
  // 1. Only accept POST requests.
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST.' });
  }

  // 2. Auth gate — require a valid Supabase session.
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  let userScopedClient;
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid session.' });
    }
    // Client scoped to the caller's token, used below for the dedupe RPC.
    userScopedClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
  } catch {
    return res.status(500).json({ error: 'Failed to authenticate.' });
  }

  // 3. Require an image URL in the request body.
  const { imageUrl } = req.body || {};
  if (!imageUrl) {
    return res.status(400).json({ error: 'Missing imageUrl in request body.' });
  }

  // 4. Ask Claude to extract the bag's data and return it.
  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'url', url: imageUrl } },
            { type: 'text', text: EXTRACTION_PROMPT },
          ],
        },
      ],
    });

    const rawText = message.content[0]?.type === 'text' ? message.content[0].text : '';

    let extracted;
    try {
      extracted = JSON.parse(rawText.replace(/```json|```/g, '').trim());
    } catch {
      return res.status(200).json({ model: MODEL, promptVersion: PROMPT_VERSION, parseError: true, rawText });
    }

    // 5. Dedupe match: fuzzy-search the catalog using (roaster + name). Per
    //    Decision #041. Classify the top result into a band the client uses
    //    to decide whether to route to an existing coffee, ask the user to
    //    disambiguate, or fall through to the Add form. If the match call
    //    fails, degrade silently — scan still succeeds, no dedupe surfaced.
    const queryStr = [extracted?.roaster_name, extracted?.coffee_name]
      .filter((s) => typeof s === 'string' && s.trim())
      .join(' ')
      .trim();

    let match = { kind: 'none', candidates: [] };
    if (queryStr) {
      try {
        const { data: candidates } = await userScopedClient.rpc('match_coffees', {
          query: queryStr,
          match_limit: 3,
          min_similarity: 0.5,
        });
        if (candidates && candidates.length > 0) {
          const top = Number(candidates[0].similarity);
          match = { kind: top >= 0.8 ? 'strong' : 'ambiguous', candidates };
        }
      } catch {
        // Silent degrade — scan still returns extracted data.
      }
    }

    return res.status(200).json({ model: MODEL, promptVersion: PROMPT_VERSION, extracted, match });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}