/**
 * Everything that changes a workout. Each call writes straight to storage, so nothing is ever
 * "unsaved" — closing the app mid-workout is fine; it resumes where she left off.
 */
import { store, uid } from '../data';
import type { Exercise, Workout, WorkoutSet } from '../data/types';
import { sessionsFor } from './history';
import { suggestNext, targetToSets } from './progression';
import { currentValue, newlyReached } from './goals';
import { prsInWorkout, weekStreak } from './stats';

export async function startWorkout(): Promise<Workout> {
  const active = await store.getActiveWorkout();
  if (active) return active;
  const w: Workout = { id: uid(), startedAt: Date.now(), endedAt: null, exerciseIds: [] };
  await store.putWorkout(w);
  return w;
}

/** Add an exercise, prefilled with the suggested target from her history. */
export async function addExercise(w: Workout, ex: Exercise): Promise<void> {
  if (w.exerciseIds.includes(ex.id)) return;
  const settings = await store.getSettings();
  const history = await store.setsForExercise(ex.id);
  const t = suggestNext(ex, history, settings, w.id);
  const existing = await store.setsForWorkout(w.id);
  let order = existing.length ? Math.max(...existing.map((s) => s.order)) + 1 : 0;
  const sets: WorkoutSet[] = targetToSets(ex, t).map((v) => ({
    id: uid(), workoutId: w.id, exerciseId: ex.id, order: order++, at: w.startedAt, done: false, ...v,
  }));
  await store.putWorkout({ ...w, exerciseIds: [...w.exerciseIds, ex.id] });
  await store.putSets(sets);
}

/** Last finished session's sets for an exercise (excluding this workout). */
export async function lastSession(exerciseId: string, excludeWorkoutId: string) {
  const s = sessionsFor(await store.setsForExercise(exerciseId), excludeWorkoutId);
  return s[s.length - 1];
}

/** Replace today's sets for an exercise with an exact copy of last time — and tick them done. */
export async function sameAsLastTime(w: Workout, exerciseId: string): Promise<boolean> {
  const last = await lastSession(exerciseId, w.id);
  if (!last) return false;
  const current = (await store.setsForWorkout(w.id)).filter((s) => s.exerciseId === exerciseId);
  const baseOrder = current.length ? Math.min(...current.map((s) => s.order)) : 1000;
  for (const s of current) await store.deleteSet(s.id);
  await store.putSets(
    last.sets.map((s, i) => ({
      id: uid(), workoutId: w.id, exerciseId, order: baseOrder + i / 100, at: w.startedAt, done: true,
      weight: s.weight, reps: s.reps, duration: s.duration, distance: s.distance,
    })),
  );
  return true;
}

/** Add another set, copying the previous one. */
export async function addSet(w: Workout, exerciseId: string): Promise<void> {
  const all = await store.setsForWorkout(w.id);
  const mine = all.filter((s) => s.exerciseId === exerciseId);
  const prev = mine[mine.length - 1];
  const order = prev ? prev.order + 0.001 : Math.max(0, ...all.map((s) => s.order)) + 1;
  await store.putSet({
    id: uid(), workoutId: w.id, exerciseId, order, at: w.startedAt, done: false,
    weight: prev?.weight, reps: prev?.reps, duration: prev?.duration, distance: prev?.distance,
  });
}

export async function removeExercise(w: Workout, exerciseId: string): Promise<{ sets: WorkoutSet[]; workout: Workout }> {
  const sets = (await store.setsForWorkout(w.id)).filter((s) => s.exerciseId === exerciseId);
  for (const s of sets) await store.deleteSet(s.id);
  await store.putWorkout({ ...w, exerciseIds: w.exerciseIds.filter((id) => id !== exerciseId) });
  return { sets, workout: w };
}

export type Celebration =
  | { event: 'finish' }
  | { event: 'pr'; what: string }
  | { event: 'milestone'; n: number; what: string }
  | { event: 'goal'; what: string }
  | { event: 'streak'; n: number };

/**
 * Finish a workout and work out what to celebrate. Empty workouts (nothing ticked) are discarded
 * quietly. Returns celebrations in the order they should be shown (biggest last).
 */
export async function finishWorkout(w: Workout): Promise<Celebration[] | null> {
  const mySets = await store.setsForWorkout(w.id);
  const done = mySets.filter((s) => s.done);
  if (!done.length) {
    await store.deleteWorkout(w.id);
    return null;
  }
  // Drop unticked sets so history only shows what she actually did.
  for (const s of mySets.filter((x) => !x.done)) await store.deleteSet(s.id);
  const usedIds = w.exerciseIds.filter((id) => done.some((s) => s.exerciseId === id));
  await store.putWorkout({ ...w, exerciseIds: usedIds, endedAt: Date.now() });

  const out: Celebration[] = [{ event: 'finish' }];
  const [allSets, exercises, goals, workouts, settings] = await Promise.all([
    store.allSets(), store.listExercises(), store.listGoals(), store.listWorkouts(), store.getSettings(),
  ]);

  for (const id of usedIds) {
    const ex = exercises.find((e) => e.id === id);
    if (!ex) continue;
    const prs = prsInWorkout(ex, allSets, w.id);
    if (prs.length) out.push({ event: 'pr', what: `${ex.name} — ${prs[0].label.toLowerCase()}` });
  }

  for (const g of goals.filter((x) => usedIds.includes(x.exerciseId) && !x.achievedAt)) {
    const ex = exercises.find((e) => e.id === g.exerciseId);
    const value = currentValue(g, allSets);
    const fresh = newlyReached(g, value);
    if (!fresh.length) continue;
    const isGoal = value + 1e-9 >= g.target;
    await store.putGoal({ ...g, celebrated: [...g.celebrated, ...fresh], achievedAt: isGoal ? Date.now() : undefined });
    if (isGoal) out.push({ event: 'goal', what: ex?.name ?? 'your goal' });
    else out.push({ event: 'milestone', n: Math.max(...fresh) + 1, what: ex?.name ?? '' });
  }

  const streak = weekStreak(workouts);
  if (streak >= 2 && streak > settings.celebratedStreak) {
    out.push({ event: 'streak', n: streak });
    await store.updateSettings({ celebratedStreak: streak });
  }
  return out;
}
