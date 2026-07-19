// /api/weekly-report.js
// Weekly ops email (Vercel cron, Sundays). Three health indicators for the
// commerce/availability system so Jesse can confirm it's working without being
// pinged about individual coffees:
//   1. New coffees added this week (created_at in the last 7 days)
//   2. Avg cost per gram across the buyable catalog
//   3. Coffees that went unavailable this week (unavailable_since in last 7 days)
//
// Runs as the service role (read-only here). Sends via Resend's REST API — no
// SDK dependency. Requires SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, and a
// Resend-verified sender domain (palato.coffee).

import { createClient } from '@supabase/supabase-js';

export const config = { maxDuration: 30 };

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Sender must be on the Resend-verified domain — the reports.palato.coffee
// SUBDOMAIN (not the bare domain). Any local-part works once the domain verifies.
const FROM = 'Palato Weekly <noreply@reports.palato.coffee>';
const TO = ['jesse.m.eshleman@gmail.com', 'jesse@palato.coffee'];

const money = (n) => (n == null ? '—' : `$${n.toFixed(4)}/g`);

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  if (!SERVICE_ROLE_KEY) return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured.' });
  if (!RESEND_API_KEY) return res.status(500).json({ error: 'RESEND_API_KEY not configured.' });

  const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const weekAgo = new Date(Date.now() - 7 * 86400_000).toISOString();

  // 1. New coffees added this week.
  const { count: newCoffees } = await db
    .from('coffees')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', weekAgo);

  // 3. Coffees that went unavailable this week (the availability job stamps this).
  const { count: wentUnavailable } = await db
    .from('coffees')
    .select('id', { count: 'exact', head: true })
    .gte('unavailable_since', weekAgo);

  // 2. Avg cost/gram over the currently-buyable catalog (has a live buy link and
  //    a derived price_per_gram). Averaged in JS — the set is small.
  const { data: priced } = await db
    .from('coffees')
    .select('price_per_gram')
    .eq('moderation_status', 'approved')
    .not('purchase_url', 'is', null)
    .neq('purchase_availability', 'no')
    .not('price_per_gram', 'is', null);
  const vals = (priced || []).map((c) => Number(c.price_per_gram)).filter((n) => Number.isFinite(n));
  const avgPerGram = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;

  const weekOf = new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/New_York',
  });

  const html = `
  <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; color: #1E1410;">
    <p style="font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; color: #D94E1F; margin: 0 0 4px;">Palato · Weekly</p>
    <h1 style="font-size: 22px; margin: 0 0 20px; font-style: italic;">Catalog health — week of ${weekOf}</h1>
    <table style="width: 100%; border-collapse: collapse; font-family: -apple-system, system-ui, sans-serif;">
      <tr><td style="padding: 14px 0; border-bottom: 1px solid #e6dcc6;">New coffees added</td>
          <td style="padding: 14px 0; border-bottom: 1px solid #e6dcc6; text-align: right; font-weight: 600; font-size: 20px;">${newCoffees ?? 0}</td></tr>
      <tr><td style="padding: 14px 0; border-bottom: 1px solid #e6dcc6;">Avg cost per gram <span style="color:#8a7d6a;">(buyable catalog · n=${vals.length})</span></td>
          <td style="padding: 14px 0; border-bottom: 1px solid #e6dcc6; text-align: right; font-weight: 600; font-size: 20px;">${money(avgPerGram)}</td></tr>
      <tr><td style="padding: 14px 0;">Coffees no longer available</td>
          <td style="padding: 14px 0; text-align: right; font-weight: 600; font-size: 20px;">${wentUnavailable ?? 0}</td></tr>
    </table>
    <p style="font-size: 12px; color: #8a7d6a; margin: 24px 0 0;">Availability is re-checked on a ~14-day cadence. "No longer available" counts coffees whose buy link went dead this week.</p>
  </div>`;

  const send = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: TO,
      subject: `Palato weekly — ${newCoffees ?? 0} new, ${wentUnavailable ?? 0} gone`,
      html,
    }),
  });

  if (!send.ok) {
    const detail = await send.text().catch(() => '');
    return res.status(502).json({ error: `Email send failed (${send.status})`, detail: detail.slice(0, 500) });
  }

  return res.status(200).json({
    sent: true,
    metrics: { newCoffees: newCoffees ?? 0, avgPerGram, pricedCount: vals.length, wentUnavailable: wentUnavailable ?? 0 },
  });
}
