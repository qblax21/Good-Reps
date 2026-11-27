/**
 * Demo mode: fills the app with ~10 weeks of realistic sample workouts so you can preview
 * charts, milestones, records and the calendar. Everything is tagged `demo: true` and
 * Settings → "Clear demo data" removes exactly those rows.
 */
import type { Store } from './storage';
import { uid } from './storage';
import type { Exercise, Goal, WorkoutSet } from './types';
import { suggestNext, targetToSets, type Units } from '../logic/progression';
import { buildMilestones, currentValue, metricStep } from '../logic/goals';

const DAY = 86400000;

export async function seedDemo(store: Store): Promise<void> {
  const settings = await store.getSettings();
  const u: Units = { weightUnit: settings.weightUnit, distanceUnit: settings.distanceUnit };
  const all = await store.listExercises();
  const get = (id: string) => all.find((e) => e.id === id)!;
  const plan: Exercise[] = ['goblet-squat', 'db-curl', 'db-row', 'sit-to-stand', 'walk', 'wall-pushup'].map(get).filter(Boolean);

  // Star the demo exercises so "favourites first" is visible.
  for (const e of plan) await store.putExercise({ ...e, favorite: true });

  // Simple deterministic pseudo-random so the demo looks the same each time.
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  const allSets: WorkoutSet[] = [];
  const start = Date.now() - 70 * DAY;
  for (let day = 0; day < 70; day++) {
    const date = new Date(start + day * DAY);
    if (![1, 3, 5].includes(date.getDay()) || rand() < 0.15) continue; // Mon/Wed/Fri, skip a few
    date.setHours(9 + Math.floor(rand() * 3), Math.floor(rand() * 60));
    const at = date.getTime();
    const wid = uid();
    const exs = plan.filter((_, i) => (day % 2 === 0 ? i % 2 === 0 : i % 2 === 1) || i === 4);
    let order = 0;
    for (const ex of exs) {
      const t = suggestNext(ex, allSets, u);
      for (const v of targetToSets(ex, t)) {
        const miss = rand() < 0.18; // occasionally fall a little short, like real life
        allSets.push({
          id: uid(), workoutId: wid, exerciseId: ex.id, order: order++, at, done: true, demo: true,
          ...v,
          reps: v.reps !== undefined ? Math.max(1, v.reps - (miss ? 1 + Math.floor(rand() * 2) : 0)) : undefined,
          duration: v.duration !== undefined ? Math.round(v.duration * (miss ? 0.9 : 1)) : undefined,
          distance: v.distance !== undefined ? Math.round(v.distance * (miss ? 0.9 : 1) * 100) / 100 : undefined,
        });
      }
    }
    await store.putWorkout({ id: wid, startedAt: at, endedAt: at + 35 * 60000, exerciseIds: exs.map((e) => e.id), demo: true });
  }
  await store.putSets(allSets);

  // A few goals, with early milestones already "bloomed".
  const goals: Array<[string, number, number | undefined]> = [
    ['goblet-squat', 30, 10],
    ['walk', 2, undefined],
    ['sit-to-stand', 15, undefined],
  ];
  for (const [id, target, targetReps] of goals) {
    const ex = get(id);
    const metric = ex.kind === 'weight' ? 'weight' : ex.kind === 'reps' ? 'reps' : 'distance';
    const startVal = metric === 'weight' ? 5 : metric === 'reps' ? 8 : 0.5;
    const milestones = buildMilestones(startVal, target, metricStep(ex, metric, u));
    const g: Goal = {
      id: uid(), exerciseId: id, metric, start: startVal, target, targetReps, milestones, celebrated: [],
      targetDate: new Date(Date.now() + 60 * DAY).toISOString().slice(0, 10), createdAt: start, demo: true,
    };
    const val = currentValue(g, allSets);
    g.celebrated = milestones.map((m, i) => (val >= m ? i : -1)).filter((i) => i >= 0);
    await store.putGoal(g);
  }
  await store.updateSettings({ demoMode: true, onboarded: true });
}
