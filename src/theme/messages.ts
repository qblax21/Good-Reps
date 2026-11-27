/**
 * ✿ ENCOURAGING MESSAGES ✿
 * Edit freely! Add inside jokes, nicknames, anything.
 * Tokens that get filled in automatically:
 *   {name}  – her name (from config.ts)
 *   {dog}   – the dog who's talking
 *   {other} – the other dog
 *   {n}     – a number (streak days, milestone number…)
 *   {what}  – the exercise or record in question
 * Rule of thumb: warm, a little playful, never guilt-trippy.
 */

export const greetings = {
  morning: ['Good morning, {name}!', 'Rise and shine, {name}!', 'Morning! Daisy is already barking about breakfast.'],
  afternoon: ['Good afternoon, {name}!', 'Hi {name}! Eddie has kisses waiting.', 'Hello, sunshine!'],
  evening: ['Good evening, {name}!', 'Evening, {name}!', 'Hi {name}, cozy evening?'],
  night: ['Hello, night owl!', 'Still up, {name}?'],
};

/** Shown on the home screen under the greeting. Picked at random each day. */
export const dailyLines = [
  'Every little bit counts.',
  'Slow and steady makes strong and sturdy.',
  'You showed up. That’s the hard part.',
  'Gentle progress is still progress.',
  'Proud of you, Mom. Every single time.',
  'Daisy’s official ruling: you’re doing great. (Snacks are still due.)',
  'Eddie believes in you. Daisy believes there are treats in your pocket.',
  'Moving today is a gift to future you.',
  'Good reps, good Mom. (Daisy and Eddie agree.)',
  'Love you, Mom. Go get ’em.',
];

/** Rest days — never guilt, just encouragement. */
export const restDayLines = [
  'Rest day! Muscles grow while you relax.',
  'No workout today. A walk with the pups is a bonus.',
  'Feet up. Eddie is already on the couch saving you a spot.',
  'Rest is part of the plan. Enjoy it, Mom.',
];

/** On a planned day before she has worked out. */
export const plannedDayLines = [
  'Today’s a workout day! Whenever you’re ready.',
  'Workout day! {dog} will cheer you on.',
  'A few good reps today? The pups think so.',
];

/** When she comes back after a while away. Kind, never "you missed X days". */
export const welcomeBack = [
  'Welcome back, {name}! We missed you.',
  'There you are! The pups saved your spot.',
  'Hi {name}! Ready whenever you are.',
];

/** Mascot pop-up lines are in mascots/dogs.ts (each dog has their own voice). */

/** Gentle backup nudge. */
export const backupNudge = 'It’s been a while since your last backup. Save a copy so all your hard work stays safe?';

/** Owl easter egg. */
export const nightOwlLines = ['Night owl! Hoo-hoo-hooray for you!', 'Whooo is working out this late? You are!'];

/** Patina, the grandkitty: a long-haired tortoiseshell. Sweet, reserved, quietly supportive. */
export const catLines = [
  'Patina came to sit with you for a bit. She’s quietly proud of you.',
  '*Patina gives you a slow blink* (That’s cat for “I love you.”)',
  'Patina doesn’t say much, but she thinks you’re doing great.',
  'Your grandkitty Patina stopped by to keep you company.',
  'Patina curled up nearby. Take your time, she’s not going anywhere.',
];
/** When Patina shows up right after a workout. */
export const catFinishLines = [
  'Patina watched the whole workout. Soft purr of approval.',
  'Patina tiptoed over for a gentle head bump. Well done.',
  'Patina is very proud of you. She’d just never make a fuss about it.',
];

/** Raccoon easter egg. */
export const raccoonLines = ['(a raccoon sneaks by…)', 'Psst… don’t tell Daisy. She’ll bark.'];

/** Fill {tokens} in a line. */
export function fill(line: string, vars: Record<string, string | number>): string {
  return line.replace(/\{(\w+)\}/g, (m, key) => (key in vars ? String(vars[key]) : m));
}

export function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

/** Stable pick for a given day, so the home line doesn't change on every render. */
export function pickForDay<T>(list: readonly T[], date = new Date()): T {
  const seed = date.getFullYear() * 400 + date.getMonth() * 31 + date.getDate();
  return list[seed % list.length];
}
