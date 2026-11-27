import { describe, expect, it } from 'vitest';
import { seedExercises } from '../data/exercises';
import type { WorkoutSet } from '../data/types';
import { sessionsFor } from '../logic/history';
import { firstTarget, suggestFromSessions } from '../logic/progression';
import Dexie from 'dexie';
import { buildMilestones, currentValue } from '../logic/goals';
import { weekStreak, prsInWorkout } from '../logic/stats';
import { createDexieStore } from '../data/dexieStore';

const u = { weightUnit: 'lb' as const, distanceUnit: 'mi' as const };
const ex = (id: string) => seedExercises().find((e) => e.id === id)!;
// The rules are what's under test, so pin the numbers rather than rely on library tweaks.
const curl = { ...ex('db-curl'), repMin: 8, repMax: 12, weightStep: 2.5 };

let n = 0;
function session(day: number, sets: Array<Partial<WorkoutSet>>, exerciseId = curl.id): WorkoutSet[] {
  const wid = `w${day}`;
  return sets.map((s, i) => ({ id: `s${n++}`, workoutId: wid, exerciseId, order: i, at: day * 86400000, done: true, ...s }));
}

describe('double progression', () => {
  it('adds a rep after a successful session', () => {
    const t = suggestFromSessions(curl, sessionsFor(session(1, [{ weight: 10, reps: 8 }, { weight: 10, reps: 8 }])), u);
    expect(t).toMatchObject({ weight: 10, reps: 9, sets: 2, why: 'add-rep' });
  });

  it('adds the smallest weight step once every set hits the top of the range', () => {
    const t = suggestFromSessions(curl, sessionsFor(session(1, [{ weight: 10, reps: 12 }, { weight: 10, reps: 12 }])), u);
    expect(t).toMatchObject({ weight: 12.5, reps: 8, why: 'add-weight' });
  });

  it('repeats after one miss, eases off after two', () => {
    const sets = [
      ...session(1, [{ weight: 20, reps: 10 }, { weight: 20, reps: 10 }]), // → 20×11
      ...session(2, [{ weight: 20, reps: 10 }, { weight: 20, reps: 9 }]), // miss → repeat 20×11
    ];
    expect(suggestFromSessions(curl, sessionsFor(sets), u)).toMatchObject({ weight: 20, reps: 11, why: 'repeat' });
    sets.push(...session(3, [{ weight: 20, reps: 9 }, { weight: 20, reps: 9 }])); // miss again → ease
    expect(suggestFromSessions(curl, sessionsFor(sets), u)).toMatchObject({ weight: 17.5, reps: 8, why: 'ease' });
  });

  it('keeps light weights and drops reps instead of halving the weight', () => {
    const sets = [
      ...session(1, [{ weight: 5, reps: 10 }, { weight: 5, reps: 10 }]), // → 5×11
      ...session(2, [{ weight: 5, reps: 9 }]),
      ...session(3, [{ weight: 5, reps: 9 }]),
    ];
    expect(suggestFromSessions(curl, sessionsFor(sets), u)).toMatchObject({ weight: 5, reps: 9, why: 'ease' });
  });

  it('follows her lead when she picks a lighter weight', () => {
    const sets = [
      ...session(1, [{ weight: 20, reps: 12 }, { weight: 20, reps: 12 }]), // → 22.5×8
      ...session(2, [{ weight: 20, reps: 10 }, { weight: 20, reps: 10 }]),
    ];
    expect(suggestFromSessions(curl, sessionsFor(sets), u)).toMatchObject({ weight: 20, reps: 11, why: 'add-rep' });
  });

  it('grows cardio gently', () => {
    const walk = ex('walk');
    const t = suggestFromSessions(walk, sessionsFor(session(1, [{ duration: 1200, distance: 1 }], walk.id)), u);
    expect(t.distance).toBe(1.1);
  });
});

describe('milestones', () => {
  it('splits the gap into friendly steps ending at the goal', () => {
    expect(buildMilestones(20, 50, 5)).toEqual([25, 30, 35, 40, 45, 50]);
    expect(buildMilestones(0.5, 2, 0.1)).toEqual([0.8, 1.1, 1.4, 1.7, 2]);
    expect(buildMilestones(10, 12, 1)).toEqual([11, 12]);
    expect(buildMilestones(0, 1000, 1).length).toBeLessThanOrEqual(8);
  });

  it('counts weight only when the target reps were done', () => {
    const sets = session(1, [{ weight: 30, reps: 8 }, { weight: 25, reps: 10 }]);
    expect(currentValue({ metric: 'weight', targetReps: 10, exerciseId: curl.id }, sets)).toBe(25);
  });
});

describe('stats', () => {
  it('weekly streak ignores a not-yet-active current week', () => {
    const now = new Date(2026, 10, 25, 12).getTime(); // Wed
    const wk = (daysAgo: number) => ({ id: String(daysAgo), startedAt: now - daysAgo * 86400000, endedAt: 1, exerciseIds: [] });
    expect(weekStreak([wk(7), wk(14)], now)).toBe(2);
    expect(weekStreak([wk(0), wk(7), wk(14)], now)).toBe(3);
    expect(weekStreak([wk(21)], now)).toBe(0);
  });

  it('detects personal records', () => {
    const sets = [...session(1, [{ weight: 10, reps: 10 }]), ...session(2, [{ weight: 12.5, reps: 8 }])];
    expect(prsInWorkout(curl, sets, 'w2').map((p) => p.label)).toContain('Heaviest weight');
    expect(prsInWorkout(curl, sets, 'w1')).toEqual([]);
  });
});

describe('dexie store', () => {
  it('seeds exercises, saves, exports and re-imports', async () => {
    const s = createDexieStore('test-db');
    expect((await s.listExercises()).length).toBeGreaterThan(15);
    await s.putWorkout({ id: 'w', startedAt: 1, endedAt: 2, exerciseIds: ['db-curl'] });
    await s.putSet({ id: 'x', workoutId: 'w', exerciseId: 'db-curl', order: 0, at: 1, weight: 5, reps: 8, done: true });
    const backup = await s.exportAll();
    await s.deleteWorkout('w');
    expect(await s.allSets()).toEqual([]);
    await s.importAll(JSON.parse(JSON.stringify(backup)));
    expect((await s.allSets()).length).toBe(1);
  });
});

describe('intermediate library', () => {
  it('starts lifts at a realistic first-time weight', () => {
    expect(firstTarget(ex('back-squat'), u)).toMatchObject({ weight: 95, reps: 6, sets: 3, why: 'start' });
    expect(firstTarget(ex('back-squat'), { ...u, weightUnit: 'kg' }).weight).toBe(45);
  });

  it('upgrades an older install: adds new lifts, hides retired ones, keeps favourites and history', async () => {
    const old = new Dexie('upgrade-test');
    old.version(1).stores({ exercises: 'id, name, favorite, archived', workouts: 'id, startedAt, endedAt', sets: 'id, workoutId, exerciseId, at', goals: 'id, exerciseId', kv: 'key' });
    await old.table('exercises').bulkPut([
      { ...ex('db-curl'), repMin: 8, repMax: 12, sets: 2, favorite: true },
      { ...ex('db-curl'), id: 'sit-to-stand', name: 'Sit-to-Stand', kind: 'reps', category: 'bodyweight', custom: false },
      { ...ex('db-curl'), id: 'my-own', name: 'My Own Lift', custom: true },
    ]);
    await old.table('sets').put({ id: 'h', workoutId: 'w', exerciseId: 'sit-to-stand', order: 0, at: 1, reps: 10, done: true });
    old.close();

    const store = createDexieStore('upgrade-test');
    const list = await store.listExercises();
    const byId = (id: string) => list.find((e) => e.id === id);
    expect(byId('back-squat')).toBeTruthy();
    expect(byId('db-curl')).toMatchObject({ favorite: true, sets: 3 });
    expect(byId('sit-to-stand')).toMatchObject({ archived: true });
    expect(byId('my-own')).toMatchObject({ archived: false, custom: true });
    expect(await store.setsForExercise('sit-to-stand')).toHaveLength(1);
  });
});

describe('raccoons from next door', async () => {
  const { raccoonVisit } = await import('../theme/messages');
  it('sends one named raccoon, or the whole band', () => {
    const solo = raccoonVisit(0);
    expect(solo.count).toBe(1);
    expect(solo.line).toMatch(/Amby|Stu|Cavs/);
    expect(solo.line).not.toContain('{name}');
    const band = raccoonVisit(1);
    expect(band.count).toBe(3);
    expect(band.line).toMatch(/Amby, Stu and Cavs/);
  });
});

describe('show catchphrase lines', async () => {
  const { sometimes, showLines, seededRandom } = await import('../theme/catchphrases');
  const { fill } = await import('../theme/messages');

  it('uses a show line about 1 time in 5, otherwise a regular line', () => {
    const rand = seededRandom(42);
    let special = 0;
    for (let i = 0; i < 5000; i++) if (sometimes(['regular'], ['show'], rand)[0] === 'show') special++;
    expect(special / 5000).toBeGreaterThan(0.17);
    expect(special / 5000).toBeLessThan(0.23);
    expect(sometimes(['regular'], [], () => 0)).toEqual(['regular']); // no show lines → always regular
  });

  it('never leaves a {token} unfilled', () => {
    const all = JSON.stringify(showLines).match(/"[^"]*"/g)!.map((x) => x.slice(1, -1));
    for (const line of all) {
      expect(fill(line, { name: 'Mom', what: 'Squat', n: 3, other: 'Eddie', dog: 'Daisy' })).not.toMatch(/{w+}/);
    }
  });
});
