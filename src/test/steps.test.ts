import { describe, expect, it } from 'vitest';
// @ts-expect-error plain JS worker, no type declarations
import worker, { parseLines } from '../../steps-server/worker.js';
import { cleanStepDays, parseStepsLink } from '../lib/steps';
import { createDexieStore } from '../data/dexieStore';

/** In-memory stand-in for a Cloudflare KV namespace. */
function fakeKV() {
  const m = new Map<string, string>();
  return {
    get: async (k: string, type?: string) => (m.has(k) ? (type === 'json' ? JSON.parse(m.get(k)!) : m.get(k)) : null),
    put: async (k: string, v: string) => void m.set(k, v),
  };
}
const env = () => ({ STEPS: fakeKV(), STEPS_KEY: 'secret123' });
const url = (key = 'secret123') => `https://good-reps-steps.example.workers.dev/?key=${key}`;

describe('steps server', () => {
  it('reads the lines the iPhone Shortcut sends', () => {
    expect(parseLines('2026-11-27 = 6,234\n2026-11-26 = 8101.0\n2026-11-25 = 1 234\ngarbage')).toEqual({
      '2026-11-27': 6234, '2026-11-26': 8101, '2026-11-25': 1234,
    });
  });

  it('stores posted steps and returns them, merging later posts', async () => {
    const e = env();
    const post = (lines: string) => worker.fetch(new Request(url(), { method: 'POST', body: JSON.stringify({ lines }) }), e);
    expect((await post('2026-11-26 = 8,101\n2026-11-27 = 3,000')).status).toBe(200);
    await post('2026-11-27 = 6,234'); // later in the day: bigger total replaces the earlier one
    const got = await (await worker.fetch(new Request(url()), e)).json();
    expect(got.days).toEqual({ '2026-11-26': 8101, '2026-11-27': 6234 });
    expect(got.updatedAt).toBeTruthy();
  });

  it('refuses the wrong key and empty posts', async () => {
    const e = env();
    expect((await worker.fetch(new Request(url('nope')), e)).status).toBe(401);
    expect((await worker.fetch(new Request(url(), { method: 'POST', body: '{"lines":""}' }), e)).status).toBe(400);
  });
});

describe('steps in the app', () => {
  it('accepts the setup link and rejects anything else', () => {
    expect(parseStepsLink('  https://x.workers.dev/?key=abc  ')).toBe('https://x.workers.dev/?key=abc');
    expect(parseStepsLink('https://x.workers.dev/')).toBeNull();
    expect(parseStepsLink('http://x.workers.dev/?key=abc')).toBeNull();
    expect(parseStepsLink('not a link')).toBeNull();
  });

  it('ignores malformed data from the server', () => {
    expect(cleanStepDays({ '2026-11-27': 6234.4, bad: 5, '2026-11-26': 'x', '2026-11-25': -3 })).toEqual({ '2026-11-27': 6234 });
  });

  it('merges steps into storage', async () => {
    const s = createDexieStore('steps-test');
    await s.mergeSteps({ '2026-11-26': 100 });
    await s.mergeSteps({ '2026-11-27': 200, '2026-11-26': 150 });
    expect(await s.getSteps()).toEqual({ '2026-11-26': 150, '2026-11-27': 200 });
  });
});
