/** Helpers that turn raw sets into per-session summaries. Pure functions — easy to test. */
import type { Exercise, WorkoutSet } from '../data/types';

export interface Session {
  workoutId: string;
  at: number;
  sets: WorkoutSet[]; // done sets only, in order
}

/** Group an exercise's done sets into sessions, oldest first. Optionally skip a workout (the active one). */
export function sessionsFor(sets: WorkoutSet[], excludeWorkoutId?: string): Session[] {
  const by = new Map<string, Session>();
  for (const s of sets) {
    if (!s.done || s.workoutId === excludeWorkoutId) continue;
    let sess = by.get(s.workoutId);
    if (!sess) by.set(s.workoutId, (sess = { workoutId: s.workoutId, at: s.at, sets: [] }));
    sess.sets.push(s);
  }
  const list = [...by.values()];
  list.forEach((x) => x.sets.sort((a, b) => a.order - b.order));
  return list.sort((a, b) => a.at - b.at);
}

export const topWeight = (s: Session) => Math.max(0, ...s.sets.map((x) => x.weight ?? 0));
export const bestReps = (s: Session) => Math.max(0, ...s.sets.map((x) => x.reps ?? 0));
export const totalReps = (s: Session) => s.sets.reduce((t, x) => t + (x.reps ?? 0), 0);
export const volume = (s: Session) => s.sets.reduce((t, x) => t + (x.weight ?? 0) * (x.reps ?? 0), 0);
export const totalDuration = (s: Session) => s.sets.reduce((t, x) => t + (x.duration ?? 0), 0);
export const totalDistance = (s: Session) => round(s.sets.reduce((t, x) => t + (x.distance ?? 0), 0), 2);

export function round(n: number, dp = 1): number {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}

/** Round to a multiple of `step` (down by default). */
export function roundToStep(n: number, step: number, mode: 'down' | 'up' | 'near' = 'down'): number {
  if (step <= 0) return n;
  const q = n / step;
  const r = mode === 'down' ? Math.floor(q + 1e-9) : mode === 'up' ? Math.ceil(q - 1e-9) : Math.round(q);
  return round(r * step, 2);
}

// ── Formatting ──

export function fmtWeight(n: number | undefined, unit: string): string {
  return `${n === undefined ? 0 : round(n, 1)} ${unit}`;
}

export function fmtDuration(sec: number | undefined): string {
  const s = Math.round(sec ?? 0);
  if (s < 60) return `${s} sec`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m >= 60) return `${Math.floor(m / 60)} hr ${m % 60} min`;
  return r ? `${m} min ${r} sec` : `${m} min`;
}

export function fmtDistance(n: number | undefined, unit: string): string {
  return `${round(n ?? 0, 2)} ${unit}`;
}

/** One-line summary of a set, e.g. "20 lb × 10", "12 reps", "15 min · 0.8 mi". */
export function fmtSet(ex: Exercise, s: Partial<WorkoutSet>, units: { w: string; d: string }): string {
  if (ex.kind === 'weight') return `${fmtWeight(s.weight, units.w)} × ${s.reps ?? 0}`;
  if (ex.kind === 'reps') return `${s.reps ?? 0} reps`;
  const parts: string[] = [];
  if (s.duration) parts.push(fmtDuration(s.duration));
  if (s.distance) parts.push(fmtDistance(s.distance, units.d));
  return parts.join(' · ') || '—';
}
