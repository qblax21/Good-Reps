/** IndexedDB implementation of the Store interface, using Dexie. */
import Dexie, { type Table } from 'dexie';
import type { Store } from './storage';
import type { Backup, Exercise, Goal, Settings, Workout, WorkoutSet } from './types';
import { defaultSettings } from './defaults';
import { seedExercises } from './exercises';

class DaisyDB extends Dexie {
  exercises!: Table<Exercise, string>;
  workouts!: Table<Workout, string>;
  sets!: Table<WorkoutSet, string>;
  goals!: Table<Goal, string>;
  kv!: Table<{ key: string; value: unknown }, string>;

  constructor(name = 'daisy-strong') {
    super(name);
    // Schema v1. To change: add `this.version(2).stores({...}).upgrade(...)` — never edit v1.
    this.version(1).stores({
      exercises: 'id, name, favorite, archived',
      workouts: 'id, startedAt, endedAt',
      sets: 'id, workoutId, exerciseId, at',
      goals: 'id, exerciseId',
      kv: 'key',
    });
    this.on('populate', (tx) => {
      tx.table('exercises').bulkAdd(seedExercises());
    });
  }
}

export function createDexieStore(dbName?: string): Store {
  const db = new DaisyDB(dbName);
  const listeners = new Set<() => void>();
  const fire = () => listeners.forEach((fn) => fn());
  // Also refresh if another tab/window changes data.
  const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('daisy-strong') : null;
  if (channel) channel.onmessage = fire;
  /** Wrap a write so subscribers re-render afterwards. */
  const write = async <T>(fn: () => Promise<T>): Promise<T> => {
    const r = await fn();
    fire();
    channel?.postMessage('changed');
    return r;
  };

  const getSettings = async (): Promise<Settings> => {
    const row = await db.kv.get('settings');
    return { ...defaultSettings(), ...((row?.value as Partial<Settings>) ?? {}) };
  };

  return {
    listExercises: () => db.exercises.toArray(),
    getExercise: (id) => db.exercises.get(id),
    putExercise: (e) => write(() => db.exercises.put(e).then(() => {})),

    listWorkouts: () => db.workouts.orderBy('startedAt').toArray(),
    getWorkout: (id) => db.workouts.get(id),
    getActiveWorkout: async () => (await db.workouts.toArray()).find((w) => w.endedAt === null),
    putWorkout: (w) =>
      write(async () => {
        await db.transaction('rw', db.workouts, db.sets, async () => {
          await db.workouts.put(w);
          // keep the denormalised timestamp on sets in sync
          await db.sets.where('workoutId').equals(w.id).modify({ at: w.startedAt });
        });
      }),
    deleteWorkout: (id) =>
      write(() =>
        db.transaction('rw', db.workouts, db.sets, async () => {
          await db.sets.where('workoutId').equals(id).delete();
          await db.workouts.delete(id);
        }),
      ),
    setsForWorkout: (workoutId) => db.sets.where('workoutId').equals(workoutId).sortBy('order'),
    setsForExercise: (exerciseId) => db.sets.where('exerciseId').equals(exerciseId).sortBy('at'),
    allSets: () => db.sets.toArray(),
    putSet: (s) => write(() => db.sets.put(s).then(() => {})),
    putSets: (s) => write(() => db.sets.bulkPut(s).then(() => {})),
    deleteSet: (id) => write(() => db.sets.delete(id)),

    listGoals: () => db.goals.toArray(),
    putGoal: (g) => write(() => db.goals.put(g).then(() => {})),
    deleteGoal: (id) => write(() => db.goals.delete(id)),

    getSettings,
    updateSettings: (patch) =>
      write(async () => {
        const next = { ...(await getSettings()), ...patch };
        await db.kv.put({ key: 'settings', value: next });
        return next;
      }),

    exportAll: async (): Promise<Backup> => ({
      app: 'daisy-strong',
      version: 1,
      exportedAt: new Date().toISOString(),
      exercises: await db.exercises.toArray(),
      workouts: await db.workouts.toArray(),
      sets: await db.sets.toArray(),
      goals: await db.goals.toArray(),
      settings: await getSettings(),
    }),

    importAll: (b) =>
      write(() =>
        db.transaction('rw', [db.exercises, db.workouts, db.sets, db.goals, db.kv], async () => {
          await Promise.all([db.exercises.clear(), db.workouts.clear(), db.sets.clear(), db.goals.clear()]);
          await db.exercises.bulkPut(b.exercises);
          await db.workouts.bulkPut(b.workouts);
          await db.sets.bulkPut(b.sets);
          await db.goals.bulkPut(b.goals);
          await db.kv.put({ key: 'settings', value: { ...defaultSettings(), ...b.settings, onboarded: true } });
        }),
      ),

    clearDemo: () =>
      write(() =>
        db.transaction('rw', [db.exercises, db.workouts, db.sets, db.goals, db.kv], async () => {
          await db.sets.filter((s) => !!s.demo).delete();
          await db.workouts.filter((w) => !!w.demo).delete();
          await db.goals.filter((g) => !!g.demo).delete();
          await db.exercises.filter((e) => !!e.demo).delete();
          // Un-favourite the built-in exercises the demo starred.
          await db.exercises.filter((e) => !e.custom).modify({ favorite: false });
          const s = await getSettings();
          await db.kv.put({ key: 'settings', value: { ...s, demoMode: false, celebratedStreak: 0 } });
        }),
      ),

    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
