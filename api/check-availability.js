// /api/check-availability.js
// Scheduled buy-link liveness check. Runs DAILY (Vercel cron) but only re-checks
// coffees whose purchase_url hasn't been verified in ~14 days — so each coffee is
// re-checked roughly biweekly and the work is spread across days.
//
// A 404/410 flips purchase_availability -> 'no' (the coffee then reads "Not
// currently available" and drops out of recommendations, Decision #067). A live
// link keeps it active, and restores a coffee THIS job previously took down.
// "Available to buy" is defined purely as: purchase_url present AND
// purchase_availability != 'no'.
//
// Runs as the service role (no user session): the 0018 admins-only UPDATE policy
// is bypassed by service_role, and the 0013 enforce_admin_only_columns trigger
// permits it because auth.uid() is null. Requires SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from '@supabase/supabase-js';

export const config = { maxDuration: 60 };

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const UA = 'Mozilla/5.0 (compatible; PalatoBot/1.0; +https://palato.coffee)';
const RECHECK_AFTER_DAYS = 14;
const BATCH = 40; // coffees per invocation — keeps the run inside maxDuration
const CONCURRENCY = 5;

// A link is "dead" only on a definitive not-found. Everything inconclusive
// (timeout, 403 bot-block, 5xx) is treated as alive so we never false-drop a
// real link — same conservative posture as augment.js:isLivePurchaseUrl.
async function isDeadLink(url) {
  try {
    const r = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(8000),
    });
    return r.status === 404 || r.status === 410;
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  // Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. Reject anything else
  // so the endpoint isn't publicly triggerable.
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  if (!SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured.' });
  }

  const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const dueBefore = new Date(Date.now() - RECHECK_AFTER_DAYS * 86400_000).toISOString();

  // Coffees with a buy link that are due a re-check: never checked, or checked
  // more than RECHECK_AFTER_DAYS ago. Oldest/never first.
  const { data: coffees, error } = await db
    .from('coffees')
    .select('id, purchase_url, purchase_availability, unavailable_since')
    .not('purchase_url', 'is', null)
    .or(`purchase_checked_at.is.null,purchase_checked_at.lt.${dueBefore}`)
    .order('purchase_checked_at', { ascending: true, nullsFirst: true })
    .limit(BATCH);

  if (error) return res.status(500).json({ error: error.message });

  const now = new Date().toISOString();
  let markedUnavailable = 0;
  let restored = 0;
  let stillLive = 0;

  // Small concurrency so a batch of 40 finishes well inside maxDuration.
  for (let i = 0; i < (coffees || []).length; i += CONCURRENCY) {
    const chunk = coffees.slice(i, i + CONCURRENCY);
    await Promise.all(
      chunk.map(async (c) => {
        const dead = await isDeadLink(c.purchase_url);
        const patch = { purchase_checked_at: now };
        if (dead) {
          patch.purchase_availability = 'no';
          // Stamp the transition once; keep the original timestamp on repeat deads.
          patch.unavailable_since = c.unavailable_since ?? now;
          if (c.purchase_availability !== 'no' || !c.unavailable_since) markedUnavailable++;
        } else if (c.unavailable_since) {
          // This job had previously taken it down; the link is back — restore it.
          // (A 'no' with no unavailable_since came from augmentation's in-stock
          // read, not us, so we leave that alone.)
          patch.purchase_availability = 'yes';
          patch.unavailable_since = null;
          restored++;
        } else {
          stillLive++;
        }
        await db.from('coffees').update(patch).eq('id', c.id);
      }),
    );
  }

  // How many still await a check after this batch — surfaces backlog in logs.
  const { count: remainingDue } = await db
    .from('coffees')
    .select('id', { count: 'exact', head: true })
    .not('purchase_url', 'is', null)
    .or(`purchase_checked_at.is.null,purchase_checked_at.lt.${dueBefore}`);

  return res.status(200).json({
    checked: coffees?.length ?? 0,
    markedUnavailable,
    restored,
    stillLive,
    remainingDue: Math.max(0, (remainingDue ?? 0) - (coffees?.length ?? 0)),
  });
}
