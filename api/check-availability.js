// /api/check-availability.js
// Scheduled buy-link availability check (Decision #070, revising #068). Runs
// DAILY (Vercel cron) but only re-checks coffees that are DUE: first check 14
// days after a coffee's buy link was verified (purchase_url_set_at), then every
// 7 days, and never again once it's flagged unavailable. Add ?all=1 to force a
// full sweep of every linked coffee regardless of cadence (for a manual run).
//
// It doesn't just check the status code — a 200 can be a sold-out page or a
// redirect to the roaster's "all coffees" listing. It reads the page:
//   * 404/410                                   -> unavailable
//   * redirected to a generic shop/collection   -> unavailable (product removed)
//   * JSON-LD availability OutOfStock/SoldOut    -> unavailable
//   * JSON-LD availability InStock               -> available (confirmed)
//   * live link, no clear signal                 -> leave as-is (never guess)
//
// Unavailable flips purchase_availability -> 'no' (the coffee then reads "Not
// currently available" and drops out of Start here + recommendations, #067/#068).
//
// Runs as the service role (auth.uid() null passes the 0013 trigger). Requires
// SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from '@supabase/supabase-js';

export const config = { maxDuration: 60 };

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const UA = 'Mozilla/5.0 (compatible; PalatoBot/1.0; +https://palato.coffee)';
const FIRST_CHECK_DAYS = 14; // first check this long after the link is verified
const RECHECK_DAYS = 7; // then every this many days
const BATCH = 40; // coffees per invocation — keeps the run inside maxDuration
const CONCURRENCY = 5;
const MAX_HTML_BYTES = 1_500_000;

// A generic listing/home path a removed product often redirects to (Shopify and
// most roaster carts). If a product URL ends up here, the product is gone.
const GENERIC_PATH = /^(\/(collections(\/all)?|shop|store|coffee|products|)\/?)$/i;

// Shopify's per-product JSON endpoint (/products/{handle}.json) is the most
// reliable stock signal: authoritative `available` per variant, present even when
// the storefront renders JSON-LD via JS or bot-blocks the HTML page. Most
// specialty roasters run Shopify. Returns 'available' | 'unavailable' | null
// (not Shopify / couldn't tell).
async function shopifyStock(url) {
  let u;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const handle = u.pathname.match(/\/products\/([^/?#]+)/)?.[1];
  if (!handle) return null;
  try {
    const r = await fetch(`${u.origin}/products/${handle}.json`, {
      headers: { 'User-Agent': UA, Accept: 'application/json' },
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok || !(r.headers.get('content-type') || '').includes('json')) return null;
    const variants = (await r.json())?.product?.variants;
    if (!Array.isArray(variants) || variants.length === 0) return null;
    return variants.some((v) => v.available) ? 'available' : 'unavailable';
  } catch {
    return null;
  }
}

/**
 * Read a buy link and decide availability. Returns:
 *   'unavailable' — dead, redirected off the product, Shopify/JSON-LD sold-out
 *   'available'   — Shopify/JSON-LD confirms in stock
 *   'unknown'     — live but no clear signal, or inconclusive (timeout, 403, 5xx)
 * 'unknown' NEVER flips a coffee — we only act on definite signals so a live
 * coffee is never hidden by mistake.
 */
async function checkAvailability(url) {
  // Most reliable signal first — works even when the HTML is JS-rendered/blocked.
  const shop = await shopifyStock(url);
  if (shop) return shop;

  let res;
  try {
    res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'User-Agent': UA, Accept: 'text/html' },
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return 'unknown'; // network/timeout — inconclusive
  }
  if (res.status === 404 || res.status === 410) return 'unavailable';
  if (!res.ok) return 'unknown'; // 403 bot-block / 5xx — don't false-flag

  // Redirected off the product onto a generic listing/home page => product gone.
  try {
    const finalPath = new URL(res.url).pathname.replace(/\/+$/, '');
    const origPath = new URL(url).pathname.replace(/\/+$/, '');
    if (finalPath !== origPath && GENERIC_PATH.test(finalPath || '/')) return 'unavailable';
  } catch {
    // URL parse issue — fall through to body checks
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) return 'unknown';

  // Read a bounded chunk and look for JSON-LD stock status.
  let html = '';
  try {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let bytes = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      html += decoder.decode(value, { stream: true });
      if (bytes > MAX_HTML_BYTES) {
        reader.cancel();
        break;
      }
    }
  } catch {
    return 'unknown';
  }

  const blocks = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) blocks.push(m[1]);
  const ld = blocks.join(' ');
  if (/"availability"\s*:\s*"[^"]*(OutOfStock|SoldOut|Discontinued)/i.test(ld)) return 'unavailable';
  if (/"availability"\s*:\s*"[^"]*(InStock|LimitedAvailability|PreOrder|BackOrder)/i.test(ld)) return 'available';

  return 'unknown';
}

export default async function handler(req, res) {
  // Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. Reject anything else.
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  if (!SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured.' });
  }

  const forceAll = req.query?.all === '1' || req.query?.all === 'true';
  const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  const now = Date.now();
  const firstDue = new Date(now - FIRST_CHECK_DAYS * 86400_000).toISOString();
  const reDue = new Date(now - RECHECK_DAYS * 86400_000).toISOString();

  // Currently-buyable coffees (has a link, not already flagged 'no' — we stop
  // once unavailable) that are due a check. `forceAll` ignores the cadence.
  let q = db
    .from('coffees')
    .select('id, purchase_url, purchase_availability, unavailable_since')
    .not('purchase_url', 'is', null)
    .neq('purchase_availability', 'no');
  if (!forceAll) {
    // First check FIRST_CHECK_DAYS after the link was set; then every RECHECK_DAYS.
    q = q.or(
      `and(purchase_checked_at.is.null,purchase_url_set_at.lte.${firstDue}),purchase_checked_at.lte.${reDue}`,
    );
  }
  const { data: coffees, error } = await q
    .order('purchase_checked_at', { ascending: true, nullsFirst: true })
    .limit(BATCH);

  if (error) return res.status(500).json({ error: error.message });

  const nowIso = new Date().toISOString();
  let markedUnavailable = 0;
  let confirmedAvailable = 0;
  let inconclusive = 0;

  for (let i = 0; i < (coffees || []).length; i += CONCURRENCY) {
    const chunk = coffees.slice(i, i + CONCURRENCY);
    await Promise.all(
      chunk.map(async (c) => {
        const verdict = await checkAvailability(c.purchase_url);
        const patch = { purchase_checked_at: nowIso };
        if (verdict === 'unavailable') {
          patch.purchase_availability = 'no';
          patch.unavailable_since = c.unavailable_since ?? nowIso;
          markedUnavailable++;
        } else if (verdict === 'available') {
          patch.purchase_availability = 'yes';
          confirmedAvailable++;
        } else {
          inconclusive++; // leave availability untouched, just record the check
        }
        await db.from('coffees').update(patch).eq('id', c.id);
      }),
    );
  }

  // Backlog still due after this batch (0 in force-all mode's accounting sense).
  let remainingDue = 0;
  if (!forceAll) {
    const { count } = await db
      .from('coffees')
      .select('id', { count: 'exact', head: true })
      .not('purchase_url', 'is', null)
      .neq('purchase_availability', 'no')
      .or(
        `and(purchase_checked_at.is.null,purchase_url_set_at.lte.${firstDue}),purchase_checked_at.lte.${reDue}`,
      );
    remainingDue = Math.max(0, (count ?? 0) - (coffees?.length ?? 0));
  }

  return res.status(200).json({
    forceAll,
    checked: coffees?.length ?? 0,
    markedUnavailable,
    confirmedAvailable,
    inconclusive,
    remainingDue,
  });
}
