/**
 * ✿ SHOW LINES ✿
 * Whole lines built around catchphrases from the family's favourite shows (Psych, Bones,
 * Always Sunny, Parks and Rec — Psych gets the most). Each character says them their own way, at the
 * right moment. About 1 time in 5 (`catchphraseChance` in config.ts) one of these is used INSTEAD of a
 * regular line. Edit freely. Tokens: {name} = Mom, {what} = the record or goal, {n} = a number,
 * {other} = the other dog.
 */
import { catchphraseChance } from './config';
import type { MascotEvent } from './mascots/dogs';

type DogMoments = Partial<Record<MascotEvent, string[]>>;

/** Daisy: the bossy, stubborn, food-obsessed barker. */
const daisy: DogMoments = {
  finish: [
    'C’mon, son! That was a whole workout. Now where’s my snack?',
    'Wildcard! You finished AND you’re about to feed me. That’s how this works.',
  ],
  pr: [
    '{what}?! Suck it, gravity! BARK!',
    'I’m not fat, I’m cultivating mass. And so are you, {name}. New record!',
  ],
  milestone: ['Another daisy bloomed. You know that’s right! Now, about that treat…'],
  streak: ['{n} weeks in a row. I’ve heard it both ways, but I say you’re unstoppable.'],
  goal: ['GOAL! Give me all the bacon and eggs you have. Celebration rules, I don’t make them.'],
  hello: [
    'Rum ham? No? Fine. Let’s lift.',
    'I’ve heard it both ways: “workout first” or “snack first.” I vote snack.',
  ],
};

/** Eddie: the sweet, chill mama's boy who gives kisses and gets the zoomies. */
const eddie: DogMoments = {
  finish: [
    'Treat yo self, {name}! Cuddles are on me. *kisses*',
    'Nice work, Bones! Is it okay if I call you Bones? I love you. *kisses*',
  ],
  pr: ['{what}! C’mon, son! I have the ZOOMIES!'],
  milestone: ['A new daisy! You know that’s right, {name}! *happy kisses*'],
  streak: ['{n} weeks in a row! King of the lab! …I mean queen of the gym!'],
  goal: ['GOAL REACHED! Treat yo self! (I recommend belly rubs. For me.)'],
  hello: ['Hi {name}! I hid a pineapple somewhere in here for you. *kisses*'],
};

/** Patina, the grandkitty: sweet, reserved, quietly supportive. */
const patina = {
  visit: [
    'Patina hid a tiny pineapple somewhere in your workout. She thinks you’ll find it.',
    'Patina gently suggests you treat yo self today.',
    'Patina thinks you’re the queen of the lab. She’d just never say it out loud.',
  ],
  afterWorkout: ['Patina gives you a slow, proud blink. Nice work, Bones.'],
};

/** The raccoons from next door. */
const raccoons = {
  Amby: ['Amby found a whole rum ham in the neighbor’s trash. Best night of his life.'],
  Stu: ['Stu’s heard it both ways: trash night is Tuesday, or Thursday. He checks both.'],
  Cavs: ['Cavs drums on a trash can lid, yells “Wildcard!” and runs off.'],
  band: [
    'Amby, Stu and Cavs, on tour. C’mon, son!',
    'Amby, Stu and Cavs are cultivating mass, one trash can at a time.',
  ],
};

/** The night owl. */
const owl = [
  'Whooo’s working out this late? I’m well-versed in bird law. It’s allowed.',
  'Hoo! Late-night reps? You know that’s right!',
];

/** The line under the home screen greeting (the app's own voice). */
const home = {
  daily: ['You know that’s right: every little bit counts.', 'C’mon, son! …er, Mom. Let’s get moving.'],
  rest: ['I’ve heard it both ways, but rest days count as training too. Treat yo self.'],
  planned: ['Workout day! Somewhere a pineapple is cheering for you.'],
};

export const showLines = { daisy, eddie, patina, raccoons, owl, home };

/**
 * Pick from the regular lines most of the time, and from the show lines about 1 time in 5.
 * `rand` returns 0–1; pass a seeded one where the text should stay the same all day.
 */
export function sometimes(regular: readonly string[], special: readonly string[] | undefined, rand: () => number = Math.random, chance = catchphraseChance): readonly string[] {
  return special?.length && rand() < chance ? special : regular;
}

/** A small seeded random generator, so a line stays the same all day instead of changing on every render. */
export function seededRandom(seed: number): () => number {
  let s = Math.abs(Math.floor(seed)) % 2147483647 || 1;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}
