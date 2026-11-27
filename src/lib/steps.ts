/**
 * Steps from Apple Health. A web app can't read Health directly, so an iPhone Shortcut sends the
 * daily totals to a tiny server (steps-server/worker.js) and the app fetches them from there.
 * Setup: steps-server/README.md.
 */
import { store } from '../data';
import type { StepDays } from '../data/types';

/** Accepts the link exactly as copied from the setup guide: https://…workers.dev/?key=… */
export function parseStepsLink(text: string): string | null {
  try {
    const u = new URL(text.trim());
    if (u.protocol !== 'https:' && u.hostname !== 'localhost' && u.hostname !== '127.0.0.1') return null;
    if (!u.searchParams.get('key')) return null;
    u.hash = '';
    return u.toString();
  } catch {
    return null;
  }
}

/** Keep only well-formed { 'YYYY-MM-DD': number } entries. */
export function cleanStepDays(raw: unknown): StepDays {
  const out: StepDays = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const [d, v] of Object.entries(raw as Record<string, unknown>)) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(d) && typeof v === 'number' && Number.isFinite(v) && v >= 0) out[d] = Math.round(v);
  }
  return out;
}

export type SyncResult = 'ok' | 'off' | 'wrong-key' | 'error' | 'skipped';

let lastSync = 0;
let running: Promise<SyncResult> | null = null;

/** Fetch the latest steps. Called when the app opens or comes back to the front; throttled. */
export function syncSteps(opts: { force?: boolean; link?: string } = {}): Promise<SyncResult> {
  if (running) return running;
  if (!opts.force && Date.now() - lastSync < 5 * 60 * 1000) return Promise.resolve('skipped');
  running = (async (): Promise<SyncResult> => {
    const link = opts.link ?? (await store.getSettings()).stepsLink;
    if (!link) return 'off';
    lastSync = Date.now();
    try {
      const res = await fetch(link, { cache: 'no-store' });
      if (res.status === 401) return 'wrong-key';
      if (!res.ok) return 'error';
      const body = (await res.json()) as { days?: unknown; updatedAt?: string | null };
      await store.mergeSteps(cleanStepDays(body.days));
      const updatedAt = body.updatedAt ? Date.parse(body.updatedAt) : null;
      const s = await store.getSettings();
      if (updatedAt && updatedAt !== s.stepsUpdatedAt) await store.updateSettings({ stepsUpdatedAt: updatedAt });
      return 'ok';
    } catch {
      return 'error'; // offline or server unreachable — try again next time
    }
  })().finally(() => {
    running = null;
  });
  return running;
}
