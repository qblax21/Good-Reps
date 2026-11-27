/**
 * A tiny event bus for mascot moments. Anything can call `cheer(...)`; the MascotLayer listens
 * and shows pop-ups one at a time, alternating between the two dogs.
 */
import type { MascotEvent } from '../theme/mascots/dogs';

export interface Cheer {
  event: MascotEvent;
  vars?: Record<string, string | number>;
}

type Listener = (c: Cheer) => void;
const listeners = new Set<Listener>();

export function cheer(c: Cheer) {
  listeners.forEach((fn) => fn(c));
}

export function onCheer(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** Screen-change pings, used for the occasional "peek" easter egg. */
const screenListeners = new Set<(name: string) => void>();
export const screenChanged = (name: string) => screenListeners.forEach((fn) => fn(name));
export function onScreen(fn: (name: string) => void) {
  screenListeners.add(fn);
  return () => {
    screenListeners.delete(fn);
  };
}

/** Easter-egg triggers. */
export type Egg = { kind: 'owl' } | { kind: 'raccoon' } | { kind: 'peek' } | { kind: 'secret'; dogId: string };
const eggListeners = new Set<(e: Egg) => void>();
export const egg = (e: Egg) => eggListeners.forEach((fn) => fn(e));
export function onEgg(fn: (e: Egg) => void) {
  eggListeners.add(fn);
  return () => {
    eggListeners.delete(fn);
  };
}

/** Count rapid taps on a mascot; after enough, trigger its secret trick. */
const taps = new Map<string, { n: number; t: number }>();
export function mascotTapped(dogId: string, needed: number): boolean {
  const now = Date.now();
  const cur = taps.get(dogId);
  const n = cur && now - cur.t < 1500 ? cur.n + 1 : 1;
  taps.set(dogId, { n, t: now });
  if (n >= needed) {
    taps.delete(dogId);
    egg({ kind: 'secret', dogId });
    return true;
  }
  return false;
}
