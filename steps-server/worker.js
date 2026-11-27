/**
 * Good Reps steps server — a Cloudflare Worker.
 *
 * Her iPhone Shortcut POSTs daily step totals from Apple Health; the Good Reps app GETs them.
 * Both use the same link:  https://<worker-name>.<your-subdomain>.workers.dev/?key=<STEPS_KEY>
 *
 * Needs (set in the Cloudflare dashboard, see steps-server/README.md):
 *   - a KV namespace bound as  STEPS
 *   - a secret named           STEPS_KEY
 *
 * POST body (what the Shortcut sends):  { "lines": "2026-11-27 = 6,234\n2026-11-26 = 8,101" }
 * GET response (what the app reads):    { "days": { "2026-11-27": 6234, ... }, "updatedAt": "<ISO time>" }
 */

const KEEP_DAYS = 800; // a bit over two years

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...cors } });

/** Turn the Shortcut's text into { date: steps }. Ignores anything it can't read. */
export function parseLines(text) {
  const days = {};
  for (const line of String(text ?? '').split(/\r?\n/)) {
    const m = line.match(/(\d{4}-\d{2}-\d{2})\D+?([\d.,\s]+)/);
    if (!m) continue;
    // "6,234" or "6 234" → 6234; "6234.0" → 6234
    const steps = Math.round(parseFloat(m[2].replace(/[,\s]/g, '')));
    if (Number.isFinite(steps) && steps >= 0 && steps < 200000) days[m[1]] = steps;
  }
  return days;
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    const key = new URL(request.url).searchParams.get('key');
    if (!env.STEPS_KEY) return json({ error: 'STEPS_KEY secret is not set on the worker' }, 500);
    if (!env.STEPS) return json({ error: 'KV namespace is not bound as STEPS' }, 500);
    if (key !== env.STEPS_KEY) return json({ error: 'wrong or missing key' }, 401);

    const stored = (await env.STEPS.get('steps', 'json')) ?? { days: {}, updatedAt: null };

    if (request.method === 'GET') return json(stored);

    if (request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const days = parseLines(body.lines);
      const count = Object.keys(days).length;
      if (count === 0) return json({ error: 'no step lines found', got: String(body.lines ?? '').slice(0, 200) }, 400);
      Object.assign(stored.days, days);
      const dates = Object.keys(stored.days).sort();
      for (const d of dates.slice(0, Math.max(0, dates.length - KEEP_DAYS))) delete stored.days[d];
      stored.updatedAt = new Date().toISOString();
      await env.STEPS.put('steps', JSON.stringify(stored));
      return json({ ok: true, saved: count });
    }

    return json({ error: 'use GET or POST' }, 405);
  },
};
