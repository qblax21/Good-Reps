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
    bio: 'Head of the cheer squad. Satellite-dish ears, short legs, even bigger heart.',
    art: 'corgi',
    secret: 'sploot',
    lines: {
      finish: ['All done! Good job, {name}!', 'Workout complete! Wiggle butt activated!', 'You did it! I supervised. We make a great team.'],
      pr: ['A new record! {what}! My ears can’t go any higher!', 'New personal best, {name}! I’m doing happy spins!'],
      milestone: ['Milestone #{n}! A daisy bloomed, and it’s not even me!', 'Another daisy in the garden! So proud of you!'],
      streak: ['{n} weeks in a row! You’re on a roll (like me on the rug).', '{n}-week streak! {other} and I are very impressed.'],
      goal: ['YOU HIT YOUR GOAL, {name}! {what}! Best day ever!', 'Goal reached! {what}! This calls for my biggest sploot.'],
      hello: ['Hi {name}! Ready to move?', 'Ears up! Let’s do this.', 'I’m listening. I’m always listening. Look at these ears.'],
      secret: ['Sploot!', '*maximum sploot achieved*', 'Sploot mode: on.'],
    },
  },
  {
    id: 'dog-b',
    name: 'Eddie',
    breed: 'Corgi-terrier mix',
    bio: 'Permanent bedhead, distinguished beard, zero chill. Will zoom for you.',
    art: 'terrier-corgi',
    secret: 'zoomies',
    lines: {
      finish: ['Done and dusted! Nice work, {name}!', 'That’s a wrap! {other} and I are impressed.', 'You did it! Can we play now? Can we? Can we?'],
      pr: ['NEW RECORD! {what}! Zoomies are required!', 'New best, {name}! I’m telling everyone at the dog park.'],
      milestone: ['Milestone #{n}! I didn’t dig this daisy up, promise.', 'Bloom! That’s milestone #{n}, {name}!'],
      streak: ['{n} weeks running! I’d bring you my toy if I could.', '{n} weeks in a row! My hair is extra wild with excitement.'],
      goal: ['GOAL REACHED! {what}! Celebration zoomies, go go go!'],
      hello: ['Hi {name}! Let’s get moving!', 'Scruff scruff! (That means hello.)', 'Workout time? I brought my toy, just in case.'],
      secret: ['ZOOMIES!', 'Nyoooom!', '*zooms around the couch twice*'],
    },
  },
];

export function otherDog(dog: DogConfig): DogConfig {
  return dogs.find((d) => d.id !== dog.id) ?? dog;
}
