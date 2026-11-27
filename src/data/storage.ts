/**
 * The storage interface. Every screen talks to data through this — never to Dexie directly —
 * so a cloud-synced implementation could be dropped in later without touching the UI.
 *
 * Live updates: `subscribe(fn)` fires after any write, and the hooks in src/hooks/useStore.ts
 * re-query when that happens.
 */
import type { Exercise, Goal, Settings, Workout, WorkoutSet, Backup, StepDays } from './types';

export interface Store {
  // Exercises
  listExercises(): Promise<Exercise[]>;
  getExercise(id: string): Promise<Exercise | undefined>;
  putExercise(e: Exercise): Promise<void>;

  // Workouts & sets
  listWorkouts(): Promise<Workout[]>;
  getWorkout(id: string): Promise<Workout | undefined>;
  getActiveWorkout(): Promise<Workout | undefined>;
  putWorkout(w: Workout): Promise<void>;
  deleteWorkout(id: string): Promise<void>;
  setsForWorkout(workoutId: string): Promise<WorkoutSet[]>;
  setsForExercise(exerciseId: string): Promise<WorkoutSet[]>;
  allSets(): Promise<WorkoutSet[]>;
  putSet(s: WorkoutSet): Promise<void>;
  putSets(s: WorkoutSet[]): Promise<void>;
  deleteSet(id: string): Promise<void>;

  // Goals
  listGoals(): Promise<Goal[]>;
  putGoal(g: Goal): Promise<void>;
  deleteGoal(id: string): Promise<void>;

  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(patch: Partial<Settings>): Promise<Settings>;

  // Steps (from Apple Health, via the steps server)
  getSteps(): Promise<StepDays>;
  mergeSteps(days: StepDays): Promise<void>;

  // Bulk
  exportAll(): Promise<Backup>;
  importAll(b: Backup): Promise<void>;
  clearDemo(): Promise<void>;

  subscribe(fn: () => void): () => void;
}

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
