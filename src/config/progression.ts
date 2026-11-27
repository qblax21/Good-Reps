/**
 * ✿ PROGRESSION RULES ✿
 * Conservative "double progression" tuned for an older beginner. Tweak numbers here only —
 * the logic in src/logic/progression.ts reads everything from this file.
 *
 * Weights:  work in a rep range (e.g. 8–12). Add a rep each session; once EVERY set hits the
 *           top of the range, add the smallest weight step and drop back to the bottom.
 * Missed a target? First miss → repeat the same target. Second miss in a row → ease off a bit.
 */
export const progression = {
  weight: {
    /** Reps added per successful session. */
    addReps: 1,
    /** If an exercise has no weightStep set, use this (in lb / kg). */
    fallbackStep: { lb: 2.5, kg: 1 },
    /** Starting weight for a brand-new exercise with no history. */
    startWeight: { lb: 5, kg: 2 },
    /** Ease off by this fraction after `missesBeforeEase` misses in a row (rounded to the step). */
    easePercent: 0.1,
    missesBeforeEase: 2,
    /** If one weight step is more than this fraction of the weight, keep the weight and drop reps instead. */
    maxEaseFraction: 0.2,
    easeRepsInstead: 2,
  },
  reps: {
    addReps: 1,
    missesBeforeEase: 2,
    /** Reps to drop when easing off. */
    easeReps: 1,
  },
  cardio: {
    /** Add this much time per successful session (seconds)… */
    addSeconds: 60,
    /** …or this fraction, whichever is bigger, but never more than maxAddSeconds. */
    addPercent: 0.05,
    maxAddSeconds: 5 * 60,
    /** Distance step per successful session. */
    addDistance: { mi: 0.1, km: 0.2 },
    easePercent: 0.1,
    missesBeforeEase: 2,
    /** Starting values for a brand-new cardio exercise. */
    startSeconds: 10 * 60,
    startDistance: { mi: 0.5, km: 1 },
  },
  milestones: {
    /** Each milestone is roughly this fraction of the way from start to goal. */
    fraction: 0.15,
    maxCount: 8,
    /** Rounding for non-weight goals. */
    repStep: 1,
    secondsStep: 60,
    distanceStep: { mi: 0.1, km: 0.1 },
  },
};
