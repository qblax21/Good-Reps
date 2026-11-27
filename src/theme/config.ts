/**
 * ✿ PERSONALISE HERE ✿
 * Everything personal about this copy of the app lives in src/theme/.
 * To re-skin it for someone else, edit this file, messages.ts and mascots/dogs.ts.
 */

export const person = {
  /** What the app (and the dogs) call her. Shown in greetings like "Good morning, Mom!" */
  name: 'Mom',
  /** Her real name, for the welcome screen. */
  realName: 'Teri',
  /** Who the gift is from — shown on the welcome screen. Leave '' to hide. */
  giftFrom: 'Proud of you, Mom. You’ve got this!',
};

export const app = {
  name: 'Good Reps',
  /** Home Screen label. Keep it to about 12 characters or iOS cuts it off. */
  shortName: 'Good Reps',
  tagline: 'One little step at a time.',
};

/**
 * Colour palette. All text/background pairs used by the app are checked for
 * WCAG AA contrast (4.5:1) — if you change these, keep `ink` dark and `cream` light.
 */
export const colors = {
  primary: '#2B6E46', // deep leaf green — buttons, headings
  primaryDark: '#1E5233',
  primarySoft: '#DCEFD9', // pale green fills
  leaf: '#4E9A62', // decorative green (stems, chart lines)
  cream: '#FFF9EC', // app background
  card: '#FFFFFF',
  sun: '#F6D56B', // soft yellow accent (backgrounds only — never text)
  sunSoft: '#FFF1BF',
  ink: '#1F3326', // main text
  inkSoft: '#4A5C4F', // secondary text (still AA on cream/white)
  petal: '#FFFFFF', // daisy petals
  danger: '#A93A2B',
};

/** Units shown by default. She can switch these in Settings. */
export const defaults = {
  weightUnit: 'lb' as 'lb' | 'kg',
  distanceUnit: 'mi' as 'mi' | 'km',
  textSize: 'large' as TextSize,
  /** Days she plans to work out (0 = Sunday … 6 = Saturday). */
  plannedDays: [1, 3, 5],
  reminderTime: '09:00',
};

export type TextSize = 'iphone' | 'normal' | 'large' | 'xlarge';

/** Mascot timing — tweak to taste. */
export const mascotTiming = {
  /** How long a celebration pop-up stays before tucking itself away (ms). */
  popupVisibleMs: 3000,
  /** Chance a dog peeks up when she opens a screen (0–1), and min gap between peeks. */
  peekChance: 0.12,
  peekMinGapMs: 4 * 60 * 1000,
  /** Chance the raccoon sneaks past when the app opens (at most once a day). */
  raccoonChance: 0.08,
  /** Night-owl hours (24h clock): workouts started at/after `from` or before `to`. */
  nightOwl: { from: 21, to: 4 },
  /** Taps on a mascot needed to trigger a sploot / zoomies. */
  secretTaps: 5,
};

/**
 * Optional web push (see README → "Reminders"). Leave empty to use the
 * no-server reminders only (in-app nudge + iPhone Calendar reminders).
 */
export const push = {
  vapidPublicKey: '',
  subscribeEndpoint: '',
};

/**
 * Where Mom's "Send a note" messages go. Fill in ONE of these for the easiest experience:
 *   phone → Messages opens addressed to you, note filled in (e.g. '+15551234567')
 *   email → Mail opens addressed to you
 * Leave both empty and she picks Messages + you from the iPhone share sheet instead.
 * Note: this repo is public, so anything typed here is visible on GitHub.
 */
export const feedback = {
  phone: '',
  email: '',
};

/** How often to nudge her to save a backup. */
export const backupNudgeDays = 30;
