/**
 * ✿ THE DOGS ✿
 * Each dog has a name, a little personality, their own lines, and art for each pose.
 *
 * Swapping in illustrated versions of her real dogs:
 *   1. Make 4 transparent PNG/WebP (or SVG) images per dog, square, ~600×600:
 *        popup.png, peek.png, celebrate.png, sleep.png
 *      (see public/assets/dogs/README.md for how to make them from photos)
 *   2. Put them in public/assets/dogs/<dog-id>/
 *   3. Fill in `images` below, e.g.  images: { popup: 'assets/dogs/biscuit/popup.png', ... }
 *   Any pose without an image falls back to the built-in cartoon.
 */

export type Pose = 'popup' | 'peek' | 'celebrate' | 'sleep' | 'sploot';
export type MascotEvent = 'finish' | 'pr' | 'milestone' | 'streak' | 'goal' | 'hello' | 'secret';

export interface DogConfig {
  id: string;
  name: string;
  breed: string;
  /** One line about them, shown in Settings → "Meet the dogs". */
  bio: string;
  /** Which built-in cartoon to use until real art exists. */
  art: 'corgi' | 'terrier-corgi';
  /** What happens when she taps them a bunch of times. */
  secret: 'sploot' | 'zoomies';
  images?: Partial<Record<Pose, string>>;
  lines: Record<MascotEvent, string[]>;
}

export const dogs: DogConfig[] = [
  {
    id: 'dog-a',
    name: 'Daisy',
    breed: 'Pembroke Welsh Corgi',
    bio: 'The boss. Stubborn, sassy, very loud, and will do absolutely anything for a snack.',
    art: 'corgi',
    secret: 'sploot',
    lines: {
      finish: [
        'Workout done. Fine. You may now feed me.',
        'BARK! (That means good job, {name}. Now snacks.)',
        'I supervised the whole thing. You’re welcome.',
        'Done! I’ve decided I’m proud of you. Don’t make it weird.',
      ],
      pr: ['A new record?! {what}! BARK BARK BARK!', 'New personal best, {name}! I demand a celebration treat.'],
      milestone: ['Milestone #{n}. A daisy bloomed. The good-looking kind, like me.', 'Another daisy! I’ll allow it. Treat?'],
      streak: ['{n} weeks in a row. I’m the boss, and the boss approves.', '{n}-week streak! Even {other} stopped giving kisses long enough to notice.'],
      goal: ['YOU HIT YOUR GOAL! {what}! BARK! BARK! …is there cheese?', 'Goal reached! {what}! I knew it. I always know.'],
      hello: ['Hi {name}. I’m in charge today. Let’s go.', 'BARK! (Translation: workout time.)', 'Is that a snack? No? Then let’s lift.'],
      secret: ['Sploot!', '*sploots dramatically. Will not move.*', 'I’m not getting up. This is my floor now.'],
    },
  },
  {
    id: 'dog-b',
    name: 'Eddie',
    breed: 'Corgi-terrier mix',
    bio: 'A total mama’s boy. Sweet, chill, gives a hundred kisses a day, and gets the zoomies when he’s happy.',
    art: 'terrier-corgi',
    secret: 'zoomies',
    lines: {
      finish: [
        'You did it, {name}! *kisses* *more kisses*',
        'All done! Can we cuddle now?',
        'So proud of you, {name}. {other} is too, she just won’t say it.',
      ],
      pr: ['NEW RECORD! {what}! I have the zoomies!', 'New best, {name}! *happy kisses all over your face*'],
      milestone: ['Milestone #{n}! A daisy just for you, {name}.', 'Bloom! That’s milestone #{n}. I love you!'],
      streak: ['{n} weeks in a row! You’re the best mom ever.', '{n} weeks running! *tail wag intensifies*'],
      goal: ['GOAL REACHED! {what}! ZOOMIES! ZOOMIES! Then cuddles.'],
      hello: ['Hi {name}! I missed you! *kisses*', 'I’ll be right here cheering, {name}.', 'Mom’s here! Best day ever!'],
      secret: ['ZOOMIES!', 'Nyoooom! *runs three laps, comes back for a kiss*', '*zooms around the couch twice*'],
    },
  },
];

export function otherDog(dog: DogConfig): DogConfig {
  return dogs.find((d) => d.id !== dog.id) ?? dog;
}
