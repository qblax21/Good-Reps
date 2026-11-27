/** Core data types. Kept plain (JSON-serialisable) so backups and future cloud sync are easy. */

/** How an exercise is measured. */
export type ExerciseKind =
  | 'weight' // weight × reps (e.g. dumbbell curl)
  | 'reps' // bodyweight reps (e.g. wall push-up)
  | 'cardio'; // time and/or distance (e.g. walking)

export type Category = 'strength' | 'bodyweight' | 'cardio';
/** Body area for strength lifts, used to group the exercise list. */
export type MuscleGroup = 'legs' | 'push' | 'pull' | 'arms';

export interface Exercise {
  id: string;
  name: string;
  kind: ExerciseKind;
  category: Category;
  description: string;
  emoji: string;
  /** Rep range used by double progression (weight + reps kinds). */
  repMin: number;
  repMax: number;
  /** Usual number of sets. */
  sets: number;
  /** Smallest sensible weight jump, in the user's weight unit. */
  weightStep: number;
  /** Strength lifts: which body area, for grouping the list. */
  group?: MuscleGroup;
  /** First-time weight guess in lb, used until she logs the exercise. */
  startWeight?: number;
  /** For cardio: which number matters most. */
  cardioFocus?: 'time' | 'distance';
  favorite: boolean;
  custom: boolean;
  archived: boolean;
  createdAt: number;
  demo?: boolean;
}

export interface Workout {
  id: string;
  startedAt: number;
  endedAt: number | null;
  /** Exercise ids in the order she added them. */
  exerciseIds: string[];
  demo?: boolean;
}

export interface WorkoutSet {
  id: string;
  workoutId: string;
  exerciseId: string;
  order: number;
  weight?: number;
  reps?: number;
  /** Seconds. */
  duration?: number;
  /** In the user's distance unit. */
  distance?: number;
  done: boolean;
  /** Timestamp of the parent workout (denormalised so history queries are cheap). */
  at: number;
  demo?: boolean;
}

/** The single number a goal is measured by. */
export type GoalMetric = 'weight' | 'reps' | 'duration' | 'distance';

export interface Goal {
  id: string;
  exerciseId: string;
  metric: GoalMetric;
  /** Where she was when the goal was set. */
  start: number;
  /** The goal value (weight in lb/kg, reps, seconds, or distance). */
  target: number;
  /** For weight goals: the reps that must be done at that weight. */
  targetReps?: number;
  targetDate?: string; // yyyy-mm-dd
  /** Intermediate targets on the progress path (excludes start, includes target). */
  milestones: number[];
  /** Index of milestones already celebrated. */
  celebrated: number[];
  createdAt: number;
  achievedAt?: number;
  demo?: boolean;
}

export interface Settings {
  weightUnit: 'lb' | 'kg';
  distanceUnit: 'mi' | 'km';
  textSize: 'iphone' | 'normal' | 'large' | 'xlarge';
  reduceMotion: boolean;
  easterEggs: boolean;
  plannedDays: number[];
  reminderTime: string;
  pushEnabled: boolean;
  onboarded: boolean;
  demoMode: boolean;
  lastBackupAt: number | null;
  lastBackupNudgeAt: number | null;
  /** Longest weekly streak already celebrated, so we only cheer once per new week. */
  celebratedStreak: number;
  lastRaccoonDay: string | null;
  firstOpenedAt: number;
  /** Steps server link incl. ?key=… (see steps-server/README.md), or null when not connected. */
  stepsLink: string | null;
  /** Daily step goal; days that reach it get a daisy. */
  stepGoal: number;
  /** When the steps server last received data from her phone. */
  stepsUpdatedAt: number | null;
}

/** Daily step totals from Apple Health, keyed by local date 'YYYY-MM-DD'. */
export type StepDays = Record<string, number>;

export interface Backup {
  app: 'daisy-strong';
  version: 1;
  exportedAt: string;
  exercises: Exercise[];
  workouts: Workout[];
  sets: WorkoutSet[];
  goals: Goal[];
  settings: Settings;
}
