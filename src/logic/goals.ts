/** Goals and the milestone "progress path". */
import { progression as P } from '../config/progression';
import type { Exercise, Goal, GoalMetric, WorkoutSet } from '../data/types';
import { round, roundToStep, sessionsFor, totalDistance, totalDuration } from './history';
import { stepFor, type Units } from './progression';

export function metricFor(ex: Exercise): GoalMetric {
  if (ex.kind === 'weight') return 'weight';
  if (ex.kind === 'reps') return 'reps';
  return ex.cardioFocus === 'distance' ? 'distance' : 'duration';
}

export function metricStep(ex: Exercise, metric: GoalMetric, u: Units): number {
  if (metric === 'weight') return stepFor(ex, u);
  if (metric === 'reps') return P.milestones.repStep;
  if (metric === 'duration') return ex.category === 'bodyweight' ? 5 : P.milestones.secondsStep;
  return P.milestones.distanceStep[u.distanceUnit];
}

/**
 * Break the gap between start and target into friendly intermediate targets.
 * Each step is ~15% of the gap, rounded up to a sensible increment. Always ends at the target.
 */
export function buildMilestones(start: number, target: number, step: number): number[] {
  if (target <= start) return [target];
  const gap = target - start;
  let inc = Math.max(step, roundToStep(gap * P.milestones.fraction, step, 'up'));
  while (Math.ceil(gap / inc) > P.milestones.maxCount) inc += step;
  const out: number[] = [];
  for (let v = start + inc; v < target - 1e-9; v += inc) out.push(round(v, 2));
  // Avoid a tiny final hop: if the last milestone is very close to the target, drop it.
  if (out.length && target - out[out.length - 1] < inc / 3) out.pop();
  out.push(target);
  return out;
}

/** Her current best for a goal's metric. */
export function currentValue(goal: Pick<Goal, 'metric' | 'targetReps' | 'exerciseId'>, sets: WorkoutSet[]): number {
  const sessions = sessionsFor(sets.filter((s) => s.exerciseId === goal.exerciseId));
  let best = 0;
  for (const s of sessions) {
    let v = 0;
    if (goal.metric === 'weight') {
      v = Math.max(0, ...s.sets.filter((x) => (x.reps ?? 0) >= (goal.targetReps ?? 1)).map((x) => x.weight ?? 0));
    } else if (goal.metric === 'reps') v = Math.max(0, ...s.sets.map((x) => x.reps ?? 0));
    else if (goal.metric === 'duration') v = totalDuration(s);
    else v = totalDistance(s);
    best = Math.max(best, v);
  }
  return best;
}

export function goalProgress(goal: Goal, value: number) {
  const reached = goal.milestones.filter((m) => value + 1e-9 >= m).length;
  const pct = goal.target <= goal.start ? 1 : Math.max(0, Math.min(1, (value - goal.start) / (goal.target - goal.start)));
  return { reached, total: goal.milestones.length, pct, done: value + 1e-9 >= goal.target };
}

/** Milestone indexes newly reached since last celebration. */
export function newlyReached(goal: Goal, value: number): number[] {
  return goal.milestones.map((m, i) => (value + 1e-9 >= m && !goal.celebrated.includes(i) ? i : -1)).filter((i) => i >= 0);
}
