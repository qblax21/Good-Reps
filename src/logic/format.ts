import type { Exercise, GoalMetric, Settings } from '../data/types';
import { fmtDistance, fmtDuration, fmtWeight } from './history';
import type { Target } from './progression';
import type { PR } from './stats';

export const unitsOf = (s: Settings) => ({ w: s.weightUnit, d: s.distanceUnit });

export function fmtMetric(metric: GoalMetric | PR['format'], v: number, s: Settings, targetReps?: number): string {
  switch (metric) {
    case 'weight':
      return targetReps ? `${fmtWeight(v, s.weightUnit)} × ${targetReps}` : fmtWeight(v, s.weightUnit);
    case 'reps':
      return `${v} reps`;
    case 'duration':
      return fmtDuration(v);
    case 'distance':
      return fmtDistance(v, s.distanceUnit);
    case 'volume':
      return `${Math.round(v).toLocaleString()} ${s.weightUnit}`;
  }
}

/** "20 lb × 11", "2 sets of 12 reps", "16 min", "1.2 mi" */
export function fmtTarget(ex: Exercise, t: Target, s: Settings): string {
  if (ex.kind === 'weight') return `${fmtWeight(t.weight, s.weightUnit)} × ${t.reps}${t.sets > 1 ? ` (${t.sets} sets)` : ''}`;
  if (ex.kind === 'reps') return `${t.reps} reps${t.sets > 1 ? ` (${t.sets} sets)` : ''}`;
  if (ex.cardioFocus === 'distance') return fmtDistance(t.distance, s.distanceUnit) + (t.duration ? ` · ${fmtDuration(t.duration)}` : '');
  return fmtDuration(t.duration);
}

export const kindLabel: Record<Exercise['kind'], string> = {
  weight: 'Weight × reps',
  reps: 'Bodyweight reps',
  cardio: 'Time / distance',
};

export function relDay(t: number): string {
  const d = new Date(t);
  const today = new Date();
  const diff = Math.round((new Date(today.toDateString()).getTime() - new Date(d.toDateString()).getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return d.toLocaleDateString(undefined, { weekday: 'long' });
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}
