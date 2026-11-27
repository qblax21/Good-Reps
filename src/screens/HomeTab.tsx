/** Home: a warm hello, one big button, this week at a glance, goals, and gentle nudges. */
import { motion } from 'framer-motion';
import { useState } from 'react';
import { store } from '../data';
import { useAllSets, useExercises, useGoals, useQuery, useSettings, useWorkouts } from '../hooks/useStore';
import { useNav } from '../nav';
import { Button, Card, SectionTitle } from '../components/ui';
import { MiniPath } from '../components/ProgressPath';
import { toast } from '../components/Toast';
import { Daisy, DogArt } from '../theme/mascots/art';
import { dogs } from '../theme/mascots/dogs';
import { backupNudgeDays, mascotTiming, person } from '../theme/config';
import * as M from '../theme/messages';
import { startWorkout } from '../logic/workoutActions';
import { currentValue, goalProgress } from '../logic/goals';
import { dayKey, weekStreak, workoutDays } from '../logic/stats';
import { fmtMetric } from '../logic/format';
import { exportBackup } from '../data/backup';
import { mascotTapped } from '../mascot/bus';
import { isIOS, isStandalone } from '../lib/platform';
import { InstallGuideSheet } from './Onboarding';

const DAY = 86400000;

function greeting(): string {
  const h = new Date().getHours();
  const list = h < 5 ? M.greetings.night : h < 12 ? M.greetings.morning : h < 17 ? M.greetings.afternoon : h < 22 ? M.greetings.evening : M.greetings.night;
  return M.fill(M.pickForDay(list), { name: person.name });
}

export function HomeTab() {
  const nav = useNav();
  const settings = useSettings();
  const workouts = useWorkouts() ?? [];
  const sets = useAllSets() ?? [];
  const goals = useGoals() ?? [];
  const exercises = useExercises() ?? [];
  const active = useQuery(() => store.getActiveWorkout());
  const [wiggle, setWiggle] = useState(0);
  const [installOpen, setInstallOpen] = useState(false);

  const dog = dogs[Math.floor(Date.now() / DAY) % dogs.length]; // dog of the day
  const days = workoutDays(workouts);
  const today = dayKey(Date.now());
  const doneToday = days.has(today);
  const plannedToday = settings.plannedDays.includes(new Date().getDay());
  const finished = workouts.filter((w) => w.endedAt);
  const lastAt = finished.length ? finished[finished.length - 1].startedAt : 0;
  const away = lastAt && Date.now() - lastAt > 10 * DAY;
  const streak = weekStreak(workouts);

  const line = doneToday
    ? 'You moved today. Wonderful! 🌼'
    : away
      ? M.fill(M.pickForDay(M.welcomeBack), { name: person.name })
      : plannedToday
        ? M.fill(M.pickForDay(M.plannedDayLines), { dog: dog.name, name: person.name })
        : M.pickForDay(settings.plannedDays.length ? M.restDayLines : M.dailyLines);

  const needsBackup =
    !settings.demoMode && finished.length >= 3 &&
    (!settings.lastBackupAt || Date.now() - settings.lastBackupAt > backupNudgeDays * DAY) &&
    (!settings.lastBackupNudgeAt || Date.now() - settings.lastBackupNudgeAt > 7 * DAY);

  const go = async () => {
    const w = await startWorkout();
    nav.push({ name: 'workout', workoutId: w.id });
  };

  // This week strip (Sun–Sat)
  const weekStart = new Date();
  weekStart.setHours(12, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const week = Array.from({ length: 7 }, (_, i) => new Date(weekStart.getTime() + i * DAY));

  return (
    <div className="scroll-area pt-safe px-safe h-full pb-6">
      {settings.demoMode && (
        <div className="mb-3 flex items-center gap-2 rounded-2xl bg-sun-soft p-3 text-base">
          <span className="flex-1">👀 You’re looking at <b>demo data</b>.</span>
          <Button kind="ghost" onClick={() => store.clearDemo().then(() => toast('Demo data cleared'))}>Clear it</Button>
        </div>
      )}

      {/* Greeting + mascot */}
      <div className="flex items-end gap-2">
        <div className="flex-1 pb-3">
          <h1 className="text-3xl leading-tight font-black">{greeting()}</h1>
          <p className="mt-1 text-xl text-ink-soft">{line}</p>
        </div>
        <motion.button
          key={wiggle}
          animate={wiggle ? { rotate: [0, -10, 10, -6, 0], y: [0, -12, 0] } : {}}
          transition={{ duration: 0.5 }}
          onClick={() => { setWiggle((w) => w + 1); mascotTapped(dog.id, mascotTiming.secretTaps); }}
          aria-label={`${dog.name} the ${dog.breed.toLowerCase()}. Tap to pet!`}
          className="shrink-0"
        >
          <DogArt dog={dog} pose={doneToday ? 'sleep' : 'popup'} size={124} />
        </motion.button>
      </div>

      {/* The one big button */}
      {active ? (
        <Button kind="sun" big className="w-full !min-h-20 !text-2xl" onClick={() => nav.push({ name: 'workout', workoutId: active.id })}>
          ▶ Continue my workout
        </Button>
      ) : (
        <Button big className="w-full !min-h-20 !text-2xl" onClick={go}>
          🌼 Start a workout
        </Button>
      )}

      {/* This week */}
      <Card className="mt-4">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-xl font-extrabold">This week</h2>
          {streak >= 2 && <span className="text-base font-bold text-primary">{streak} weeks in a row!</span>}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {week.map((d) => {
            const k = dayKey(d);
            const did = days.has(k);
            const planned = settings.plannedDays.includes(d.getDay());
            return (
              <div key={k} className="flex flex-col items-center gap-1"
                aria-label={`${d.toLocaleDateString(undefined, { weekday: 'long' })}${did ? ', worked out' : planned ? ', planned' : ''}`}>
                <span className={`text-sm font-bold ${k === today ? 'text-primary' : 'text-ink-soft'}`}>{d.toLocaleDateString(undefined, { weekday: 'narrow' })}</span>
                {did ? <Daisy size={34} /> : (
                  <span className={`h-[34px] w-[34px] rounded-full ${planned ? 'border-2 border-dashed border-leaf' : 'bg-ink/5'} ${k === today ? 'ring-2 ring-primary' : ''}`} />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {needsBackup && (
        <Card className="mt-4 border-2 !border-sun bg-sun-soft">
          <p className="text-lg">💾 {M.backupNudge}</p>
          <div className="mt-3 flex gap-2">
            <Button className="flex-1" onClick={() => exportBackup(store).then((r) => r !== 'cancelled' && toast('Backup saved 🌼'))}>Save a backup</Button>
            <Button kind="ghost" onClick={() => store.updateSettings({ lastBackupNudgeAt: Date.now() })}>Later</Button>
          </div>
        </Card>
      )}

      {isIOS() && !isStandalone() && (
        <Card className="mt-4" onClick={() => setInstallOpen(true)} label="How to add this app to your Home Screen">
          <p className="text-lg"><b>📲 Put me on your Home Screen</b><span className="block text-base text-ink-soft">So I open like a real app and keep your progress safe. Tap to see how.</span></p>
        </Card>
      )}

      {/* Goals */}
      {goals.length > 0 && <SectionTitle>My goals</SectionTitle>}
      <div className="flex flex-col gap-2">
        {goals.map((g) => {
          const ex = exercises.find((e) => e.id === g.exerciseId);
          if (!ex) return null;
          const v = currentValue(g, sets);
          const p = goalProgress(g, v);
          return (
            <Card key={g.id} onClick={() => nav.push({ name: 'exercise', exerciseId: ex.id })} label={`${ex.name} goal: ${p.reached} of ${p.total} milestones`}>
              <p className="text-lg font-extrabold">{ex.emoji} {ex.name}</p>
              <p className="text-base text-ink-soft">{p.done ? 'Goal reached! 🎉' : `Goal: ${fmtMetric(g.metric, g.target, settings, g.targetReps)} · ${p.reached} of ${p.total} daisies`}</p>
              <div className="mt-2 overflow-hidden"><MiniPath milestones={g.milestones} value={v} /></div>
            </Card>
          );
        })}
      </div>
      {goals.length === 0 && finished.length > 0 && (
        <Card className="mt-4" onClick={() => nav.setTab('exercises')} label="Set a goal">
          <p className="text-lg">🎯 <b>Set a goal?</b> Pick an exercise and tap “Set a goal”. We’ll plant daisies along the way.</p>
        </Card>
      )}
      <InstallGuideSheet open={installOpen} onClose={() => setInstallOpen(false)} />
    </div>
  );
}
