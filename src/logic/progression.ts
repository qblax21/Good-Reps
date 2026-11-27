/**
 * Suggests the next session's target for an exercise by replaying her history through the rules
 * in src/config/progression.ts. Because it replays, tweaking the rules applies to old data too.
 */
import { progression as P } from '../config/progression';
import type { Exercise, WorkoutSet } from '../data/types';
import {
  roundToStep,
  round,
  sessionsFor,
  topWeight,
  totalDistance,
  totalDuration,
  type Session,
} from './history';

export interface Target {
  sets: number;
  weight?: number;
  reps?: number;
  duration?: number;
  distance?: number;
  /** Short, friendly reason shown under the suggestion. */
  why: 'start' | 'add-rep' | 'add-weight' | 'repeat' | 'ease' | 'top' | 'add-time' | 'add-distance';
}

export interface Units {
  weightUnit: 'lb' | 'kg';
  distanceUnit: 'mi' | 'km';
}

export const stepFor = (ex: Exercise, u: Units) => ex.weightStep || P.weight.fallbackStep[u.weightUnit];

/** What she should aim for the very first time (no history). */
export function firstTarget(ex: Exercise, u: Units): Target {
  if (ex.kind === 'weight') return { sets: ex.sets, weight: P.weight.startWeight[u.weightUnit], reps: ex.repMin, why: 'start' };
  if (ex.kind === 'reps') return { sets: ex.sets, reps: ex.repMin, why: 'start' };
  return ex.cardioFocus === 'distance'
    ? { sets: 1, duration: P.cardio.startSeconds, distance: P.cardio.startDistance[u.distanceUnit], why: 'start' }
    : { sets: 1, duration: ex.category === 'bodyweight' ? 20 : P.cardio.startSeconds, why: 'start' };
}

/** Did this session meet the target? */
export function metTarget(ex: Exercise, s: Session, t: Target): boolean {
  if (ex.kind === 'weight') {
    const good = s.sets.filter((x) => (x.weight ?? 0) >= (t.weight ?? 0) && (x.reps ?? 0) >= (t.reps ?? 0));
    return good.length >= t.sets;
  }
  if (ex.kind === 'reps') return s.sets.filter((x) => (x.reps ?? 0) >= (t.reps ?? 0)).length >= t.sets;
  if (ex.cardioFocus === 'distance') return totalDistance(s) + 1e-9 >= (t.distance ?? 0);
  return totalDuration(s) >= (t.duration ?? 0);
}

/** The target that naturally follows a successful session. */
function progressFrom(ex: Exercise, s: Session, u: Units): Target {
  if (ex.kind === 'weight') {
    const w = topWeight(s);
    const work = s.sets.filter((x) => (x.weight ?? 0) === w);
    const minReps = Math.min(...work.map((x) => x.reps ?? 0));
    const sets = Math.max(1, work.length);
    if (minReps >= ex.repMax) return { sets, weight: round(w + stepFor(ex, u), 2), reps: ex.repMin, why: 'add-weight' };
    return { sets, weight: w, reps: Math.max(ex.repMin, Math.min(ex.repMax, minReps + P.weight.addReps)), why: 'add-rep' };
  }
  if (ex.kind === 'reps') {
    const minReps = Math.min(...s.sets.map((x) => x.reps ?? 0));
    const sets = Math.max(1, s.sets.length);
    if (minReps >= ex.repMax) return { sets, reps: ex.repMax, why: 'top' };
    return { sets, reps: Math.min(ex.repMax, minReps + P.reps.addReps), why: 'add-rep' };
  }
  // cardio
  const dur = totalDuration(s);
  if (ex.cardioFocus === 'distance') {
    return { sets: 1, duration: dur || undefined, distance: round(totalDistance(s) + P.cardio.addDistance[u.distanceUnit], 2), why: 'add-distance' };
  }
  const add = Math.min(P.cardio.maxAddSeconds, Math.max(dur < 120 ? 10 : P.cardio.addSeconds, dur * P.cardio.addPercent));
  const step = dur < 120 ? 5 : 30; // short holds (planks) grow by seconds, longer cardio by half-minutes
  return { sets: 1, duration: roundToStep(dur + add, step, 'near'), distance: totalDistance(s) || undefined, why: 'add-time' };
}

/** Ease the target off slightly after repeated misses. */
function easeFrom(ex: Exercise, t: Target, u: Units): Target {
  if (ex.kind === 'weight') {
    const step = stepFor(ex, u);
    const w = t.weight ?? 0;
    // At light weights one step is a big jump (5 → 10 lb is double!), so ease the reps instead.
    if (w <= 0 || step / w > P.weight.maxEaseFraction) {
      return { ...t, weight: w, reps: Math.max(ex.repMin, (t.reps ?? ex.repMin) - P.weight.easeRepsInstead), why: 'ease' };
    }
    const eased = Math.max(step, Math.min(w - step, roundToStep(w * (1 - P.weight.easePercent), step, 'down')));
    return { ...t, weight: w <= step ? w : eased, reps: ex.repMin, why: 'ease' };
  }
  if (ex.kind === 'reps') return { ...t, reps: Math.max(1, (t.reps ?? 1) - P.reps.easeReps), why: 'ease' };
  if (ex.cardioFocus === 'distance') return { ...t, distance: round((t.distance ?? 0) * (1 - P.cardio.easePercent), 2), why: 'ease' };
  return { ...t, duration: roundToStep((t.duration ?? 0) * (1 - P.cardio.easePercent), 30, 'near'), why: 'ease' };
}

const missLimit = (ex: Exercise) =>
  ex.kind === 'weight' ? P.weight.missesBeforeEase : ex.kind === 'reps' ? P.reps.missesBeforeEase : P.cardio.missesBeforeEase;

/** Replay history and return the target for the next session. */
export function suggestFromSessions(ex: Exercise, sessions: Session[], u: Units): Target {
  let target: Target | null = null;
  let misses = 0;
  for (const s of sessions) {
    // If she chose a lighter weight than suggested, follow her lead: build from what she actually did.
    const choseLighter = !!target && ex.kind === 'weight' && topWeight(s) < (target.weight ?? 0);
    if (!target || choseLighter || metTarget(ex, s, target)) {
      misses = 0;
      target = progressFrom(ex, s, u);
    } else {
      misses += 1;
      if (misses >= missLimit(ex)) {
        target = easeFrom(ex, target, u);
        misses = 0;
      } else {
        target = { ...(target as Target), why: 'repeat' };
      }
    }
  }
  return target ?? firstTarget(ex, u);
}

export function suggestNext(ex: Exercise, sets: WorkoutSet[], u: Units, excludeWorkoutId?: string): Target {
  return suggestFromSessions(ex, sessionsFor(sets.filter((s) => s.exerciseId === ex.id), excludeWorkoutId), u);
}

export const whyText: Record<Target['why'], string> = {
  start: 'A gentle place to start. Adjust if it feels too easy or too hard.',
  'add-rep': 'You did great last time — one more rep!',
  'add-weight': 'You hit the top of your range. Time for a tiny bit more weight!',
  repeat: 'Let’s try the same as last time. No rush.',
  ease: 'Taking it a little easier this time — that’s smart training.',
  top: 'You’re at the top of the range! Keep it up, or try a harder version.',
  'add-time': 'A little longer than last time.',
  'add-distance': 'A little farther than last time.',
};

/** Turn a target into a set of prefilled set values. */
export function targetToSets(ex: Exercise, t: Target): Array<Pick<WorkoutSet, 'weight' | 'reps' | 'duration' | 'distance'>> {
  const n = ex.kind === 'cardio' ? 1 : Math.max(1, t.sets);
  return Array.from({ length: n }, () =>
    ex.kind === 'weight'
      ? { weight: t.weight, reps: t.reps }
      : ex.kind === 'reps'
        ? { reps: t.reps }
        : { duration: t.duration, distance: t.distance },
  );
}
