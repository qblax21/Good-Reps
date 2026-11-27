import { defaults } from '../theme/config';
import type { Settings } from './types';

export function defaultSettings(): Settings {
  return {
    weightUnit: defaults.weightUnit,
    distanceUnit: defaults.distanceUnit,
    textSize: defaults.textSize,
    reduceMotion: false,
    easterEggs: true,
    plannedDays: [...defaults.plannedDays],
    reminderTime: defaults.reminderTime,
    pushEnabled: false,
    onboarded: false,
    demoMode: false,
    lastBackupAt: null,
    lastBackupNudgeAt: null,
    celebratedStreak: 0,
    lastRaccoonDay: null,
    firstOpenedAt: Date.now(),
    stepsLink: null,
    stepGoal: 7000,
    stepsUpdatedAt: null,
  };
}
