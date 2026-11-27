/**
 * ✿ CATCHPHRASES ✿
 * Lines from the family's favourite shows, sprinkled into what the dogs, Patina, the raccoons,
 * the owl and the home screen say — about 1 message in 5 (`catchphraseChance` in config.ts).
 * Shows are weighted by the family ranking: Psych comes up most, then Bones, Always Sunny,
 * then Parks and Rec. Add or remove lines freely. {name} = what the app calls her.
 * `who` limits a line to certain characters; leave it off and anyone can say it.
 */
import { catchphraseChance } from './config';

export type Speaker = 'daisy' | 'eddie' | 'patina' | 'raccoon' | 'owl' | 'app';
export type Show = 'Psych' | 'Bones' | 'Always Sunny' | 'Parks and Rec';

/** Higher = shows up more often. Follows the family ranking. */
export const showWeight: Record<Show, number> = { Psych: 4, Bones: 3, 'Always Sunny': 2, 'Parks and Rec': 1 };

export const catchphrases: Array<{ show: Show; text: string; who?: Speaker[] }> = [
  // Psych
  { show: 'Psych', text: 'C’mon, son!' },
  { show: 'Psych', text: 'You know that’s right!' },
  { show: 'Psych', text: 'I’ve heard it both ways.' },
  { show: 'Psych', text: 'Suck it!' },
  { show: 'Psych', text: '*hides a pineapple somewhere in here*' },
  // Bones
  { show: 'Bones', text: 'I don’t know what that means.' },
  { show: 'Bones', text: 'Nice work, Bones.' },
  { show: 'Bones', text: 'King of the lab! …er, gym!' },
  // Always Sunny
  { show: 'Always Sunny', text: 'I’m not fat, I’m cultivating mass.' },
  { show: 'Always Sunny', text: 'Wildcard!' },
  { show: 'Always Sunny', text: 'Can I offer you a nice egg in this trying time?' },
  { show: 'Always Sunny', text: 'Rum ham!', who: ['daisy', 'raccoon'] },
  { show: 'Always Sunny', text: 'I’m well-versed in bird law.', who: ['owl'] },
  // Parks and Rec
  { show: 'Parks and Rec', text: 'Treat yo self!' },
  { show: 'Parks and Rec', text: 'That was literally the best workout of all time.' },
  { show: 'Parks and Rec', text: '{name}, you beautiful tropical fish.' },
  { show: 'Parks and Rec', text: 'Give me all the bacon and eggs you have.', who: ['daisy'] },
];

/** Weighted pick of a catchphrase this speaker can say. `rand` returns 0–1 (pass a seeded one for stable text). */
export function pickCatchphrase(speaker: Speaker, rand: () => number = Math.random): string {
  const pool = catchphrases.filter((c) => !c.who || c.who.includes(speaker));
  const total = pool.reduce((t, c) => t + showWeight[c.show], 0);
  let r = rand() * total;
  for (const c of pool) {
    r -= showWeight[c.show];
    if (r < 0) return c.text;
  }
  return pool[pool.length - 1].text;
}

/** Now and then, tack a catchphrase onto a line. */
export function sprinkle(line: string, speaker: Speaker, name: string, rand: () => number = Math.random, chance = catchphraseChance): string {
  if (rand() >= chance) return line;
  return `${line} ${pickCatchphrase(speaker, rand).replace('{name}', name)}`;
}

/** A small seeded random generator, so a line stays the same all day instead of changing on every render. */
export function seededRandom(seed: number): () => number {
  let s = Math.abs(Math.floor(seed)) % 2147483647 || 1;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}
