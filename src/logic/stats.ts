/** Streaks, personal records and calendar helpers. */
import type { Exercise, Workout, WorkoutSet } from '../data/types';
import { bestReps, sessionsFor, topWeight, totalDistance, totalDuration, totalReps, volume, type Session } from './history';

export const dayKey = (t: number | Date) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Start of the week (Sunday) as a day key. */
const weekKey = (t: number) => {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return dayKey(d);
};

/**
 * Weekly streak: consecutive weeks with at least one finished workout.
 * The current week doesn't break the streak just because it hasn't had a workout yet —
 * that would feel like guilt on a Monday morning.
 */
export function weekStreak(workouts: Workout[], now = Date.now()): number {
  const weeks = new Set(workouts.filter((w) => w.endedAt).map((w) => weekKey(w.startedAt)));
  const d = new Date(now);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  let streak = 0;
  if (!weeks.has(dayKey(d))) d.setDate(d.getDate() - 7); // this week still pending
  while (weeks.has(dayKey(d))) {
    streak++;
    d.setDate(d.getDate() - 7);
  }
  return streak;
}

export function workoutDays(workouts: Workout[]): Set<string> {
  return new Set(workouts.filter((w) => w.endedAt).map((w) => dayKey(w.startedAt)));
}

export interface PR {
  key: string;
  label: string;
  value: number;
  format: 'weight' | 'reps' | 'duration' | 'distance' | 'volume';
  at: number;
}

type Measure = { key: string; label: string; format: PR['format']; fn: (s: Session) => number };

export function measuresFor(ex: Exercise): Measure[] {
  if (ex.kind === 'weight')
    return [
      { key: 'heaviest', label: 'Heaviest weight', format: 'weight', fn: topWeight },
      { key: 'reps', label: 'Most reps in a set', format: 'reps', fn: bestReps },
      { key: 'volume', label: 'Most total lifted', format: 'volume', fn: volume },
    ];
  if (ex.kind === 'reps')
    return [
      { key: 'reps', label: 'Most reps in a set', format: 'reps', fn: bestReps },
      { key: 'total', label: 'Most reps in a workout', format: 'reps', fn: totalReps },
    ];
  return [
    { key: 'time', label: 'Longest time', format: 'duration', fn: totalDuration },
    { key: 'distance', label: 'Farthest', format: 'distance', fn: totalDistance },
  ];
}

/** Personal records for one exercise. */
export function recordsFor(ex: Exercise, sets: WorkoutSet[]): PR[] {
  const sessions = sessionsFor(sets.filter((s) => s.exerciseId === ex.id));
  const out: PR[] = [];
  for (const m of measuresFor(ex)) {
    let best: PR | null = null;
    for (const s of sessions) {
      const v = m.fn(s);
      if (v > 0 && (!best || v > best.value)) best = { key: `${ex.id}:${m.key}`, label: m.label, value: v, format: m.format, at: s.at };
    }
    if (best) out.push(best);
  }
  return out;
}

/** PRs set in a given workout (beats every earlier session; first-ever sessions don't count). */
export function prsInWorkout(ex: Exercise, sets: WorkoutSet[], workoutId: string): PR[] {
  const sessions = sessionsFor(sets.filter((s) => s.exerciseId === ex.id));
  const idx = sessions.findIndex((s) => s.workoutId === workoutId);
  if (idx <= 0) return [];
  const cur = sessions[idx];
  const prev = sessions.slice(0, idx);
  return measuresFor(ex)
    .map((m) => ({ m, v: m.fn(cur), before: Math.max(0, ...prev.map(m.fn)) }))
    .filter(({ v, before }) => before > 0 && v > before)
    .map(({ m, v }) => ({ key: `${ex.id}:${m.key}`, label: m.label, value: v, format: m.format, at: cur.at }));
}
