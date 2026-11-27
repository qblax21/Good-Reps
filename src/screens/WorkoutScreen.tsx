/** The workout logger: big steppers, daisy checkboxes, auto-saves on every tap. */
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { store } from '../data';
import type { Exercise, Settings, Workout, WorkoutSet } from '../data/types';
import { useQuery, useSettings } from '../hooks/useStore';
import { useNav } from '../nav';
import { Button, Card, DaisyCheck, Header, Sheet, Stepper } from '../components/ui';
import { toast } from '../components/Toast';
import { ExercisePicker } from './ExercisePicker';
import { addExercise, addSet, finishWorkout, lastSession, removeExercise, sameAsLastTime, type Celebration } from '../logic/workoutActions';
import { suggestNext, whyText } from '../logic/progression';
import { fmtSet, fmtDuration } from '../logic/history';
import { fmtTarget, relDay, unitsOf } from '../logic/format';
import { cheer, claimOwlNight, egg } from '../mascot/bus';
import { mascotTiming } from '../theme/config';
import { DogArt } from '../theme/mascots/art';
import { dogs } from '../theme/mascots/dogs';

export function WorkoutScreen({ workoutId }: { workoutId: string }) {
  const nav = useNav();
  const settings = useSettings();
  const workout = useQuery(() => store.getWorkout(workoutId), [workoutId]);
  const sets = useQuery(() => store.setsForWorkout(workoutId), [workoutId]) ?? [];
  const exercises = useQuery(() => store.listExercises()) ?? [];
  const [picking, setPicking] = useState(false);
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const past = !!workout?.endedAt;

  // Night owl easter egg (once per workout)
  useEffect(() => {
    if (!workout || past) return;
    // Shares the once-a-night limit with the owl that greets her when she opens the app.
    if (claimOwlNight(mascotTiming.nightOwl, new Date(workout.startedAt))) setTimeout(() => egg({ kind: 'owl' }), 700);
  }, [workout, past]);

  if (!workout) return null;

  const finish = async () => {
    if (past) return nav.pop();
    if (!sets.some((s) => s.done)) return setConfirmEmpty(true);
    const celebrations = (await finishWorkout(workout)) ?? [];
    nav.pop();
    playCelebrations(celebrations);
  };

  const deletePast = async () => {
    const backup = { w: workout, s: sets };
    await store.deleteWorkout(workout.id);
    nav.pop();
    toast('Workout deleted', async () => {
      await store.putWorkout(backup.w);
      await store.putSets(backup.s);
    });
  };

  const title = past ? relDay(workout.startedAt) : 'Today’s workout';
  const started = new Date(workout.startedAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="flex h-full flex-col bg-cream">
      <Header title={title} onBack={nav.pop} backLabel={past ? 'Back' : 'Home'} />
      <div className="scroll-area px-safe flex-1 pb-48">
        <p className="mb-3 text-base text-ink-soft">
          {past ? `Started ${started}. Changes save automatically.` : `Started at ${started} · Everything saves as you go 🌼`}
        </p>
        {workout.exerciseIds.length === 0 && (
          <Card className="flex flex-col items-center gap-2 py-8 text-center">
            <DogArt dog={dogs[0]} pose="popup" size={120} />
            <p className="text-xl font-bold">Let’s pick your first exercise!</p>
            <p className="text-lg text-ink-soft">Your favourites and recent ones are at the top.</p>
          </Card>
        )}
        <div className="flex flex-col gap-4">
          <AnimatePresence initial={false}>
            {workout.exerciseIds.map((id) => {
              const ex = exercises.find((e) => e.id === id);
              if (!ex) return null;
              return (
                <motion.div key={id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -80 }}>
                  <ExerciseBlock ex={ex} workout={workout} sets={sets.filter((s) => s.exerciseId === id)} settings={settings} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        <Button kind="secondary" big className="mt-4 w-full" onClick={() => setPicking(true)}>
          + Add exercise
        </Button>
        {past && (
          <Button kind="danger" className="mt-8 w-full" onClick={deletePast}>
            Delete this workout
          </Button>
        )}
      </div>

      {/* Sticky finish bar, above the home indicator */}
      <div className="px-safe pb-safe fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-cream via-cream to-cream/0 pt-6">
        <Button big className="w-full" onClick={finish}>
          {past ? 'Done' : 'Finish workout 🌼'}
        </Button>
      </div>

      <ExercisePicker
        open={picking}
        onClose={() => setPicking(false)}
        exclude={workout.exerciseIds}
        onPick={async (ex) => {
          setPicking(false);
          await addExercise(workout, ex);
        }}
      />

      <Sheet open={confirmEmpty} onClose={() => setConfirmEmpty(false)} title="Nothing ticked yet">
        <p className="mb-4 text-lg">
          Tap the circle next to each set when you finish it — it turns into a daisy! 🌼 Sets without a daisy aren’t saved to your history.
        </p>
        <div className="flex flex-col gap-3">
          <Button big onClick={() => setConfirmEmpty(false)}>Keep going</Button>
          <Button kind="danger" onClick={async () => { await finishWorkout(workout); setConfirmEmpty(false); nav.pop(); }}>
            Leave without saving
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

/** Show the celebrations one after another (the MascotLayer queues them). */
function playCelebrations(list: Celebration[]) {
  // Show at most 3 so it never feels like a slot machine; the biggest news goes last.
  const order = ['finish', 'streak', 'pr', 'milestone', 'goal'];
  const sorted = [...list].sort((a, b) => order.indexOf(a.event) - order.indexOf(b.event));
  const shown = sorted.length > 3 ? [sorted[0], ...sorted.slice(-2)] : sorted;
  for (const c of shown) {
    const vars: Record<string, string | number> = {};
    if ('what' in c) vars.what = c.what;
    if ('n' in c) vars.n = c.n;
    cheer({ event: c.event, vars });
  }
}

function ExerciseBlock({ ex, workout, sets, settings }: { ex: Exercise; workout: Workout; sets: WorkoutSet[]; settings: Settings }) {
  const history = useQuery(() => store.setsForExercise(ex.id), [ex.id, workout.id]) ?? [];
  const last = useQuery(() => lastSession(ex.id, workout.id), [ex.id, workout.id, history.length]);
  const target = suggestNext(ex, history.filter((s) => s.at < workout.startedAt), settings, workout.id);
  const u = unitsOf(settings);

  const remove = async () => {
    const { sets: removed, workout: before } = await removeExercise(workout, ex.id);
    toast(`Removed ${ex.name}`, async () => {
      await store.putWorkout(before);
      await store.putSets(removed);
    });
  };

  return (
    <Card>
      <div className="flex items-start gap-3">
        <span className="text-4xl" aria-hidden="true">{ex.emoji}</span>
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl leading-tight font-extrabold">{ex.name}</h2>
          {!workout.endedAt && (
            <p className="mt-1 text-lg">
              <span className="font-bold text-primary">Today, try: {fmtTarget(ex, target, settings)}</span>
              <span className="block text-base text-ink-soft">{whyText[target.why]}</span>
            </p>
          )}
        </div>
      </div>

      {last && !workout.endedAt && (
        <Button kind="sun" className="mt-3 w-full" onClick={() => sameAsLastTime(workout, ex.id).then(() => toast('Copied from last time ✓'))}
          label={`Same as last time: ${last.sets.map((s) => fmtSet(ex, s, u)).join(', ')}`}>
          <span className="flex flex-col items-center py-1 leading-tight">
            <span>↺ Same as last time</span>
            <span className="text-base font-semibold opacity-80">{last.sets.map((s) => fmtSet(ex, s, u)).join('  ·  ')}</span>
          </span>
        </Button>
      )}

      <ol className="mt-3 flex flex-col gap-2">
        {sets.map((s, i) => <SetRow key={s.id} ex={ex} set={s} index={i} settings={settings} />)}
      </ol>

      <div className="mt-3 flex gap-2">
        <Button kind="ghost" className="flex-1" onClick={() => addSet(workout, ex.id)}>+ Add a set</Button>
        <Button kind="ghost" className="flex-1 !text-ink-soft" onClick={remove} label={`Remove ${ex.name} from this workout`}>Remove</Button>
      </div>
    </Card>
  );
}

function SetRow({ ex, set, index, settings }: { ex: Exercise; set: WorkoutSet; index: number; settings: Settings }) {
  const [open, setOpen] = useState(!set.done);
  useEffect(() => setOpen(!set.done), [set.done]);
  const save = (patch: Partial<WorkoutSet>) => store.putSet({ ...set, ...patch });
  const u = unitsOf(settings);
  const label = ex.kind === 'cardio' ? 'Activity' : `Set ${index + 1}`;
  const shortHold = ex.category === 'bodyweight' && ex.kind === 'cardio'; // e.g. plank — counted in seconds

  return (
    <li className={`rounded-2xl p-3 ${set.done ? 'bg-primary-soft' : 'bg-cream'}`}>
      <div className="flex items-center gap-2">
        <button className="min-h-12 flex-1 text-left" onClick={() => setOpen(!open)} aria-expanded={open}
          aria-label={`${label}: ${fmtSet(ex, set, u)}${set.done ? ', done' : ''}. Tap to ${open ? 'hide' : 'change'}.`}>
          <span className="block text-base font-bold text-ink-soft">{label}</span>
          <span className="block text-xl font-extrabold">{fmtSet(ex, set, u)}</span>
        </button>
        <DaisyCheck checked={set.done} onChange={(done) => save({ done })} label={`Mark ${label} done`} />
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="flex flex-col gap-2 pt-2">
              {ex.kind === 'weight' && (
                <Stepper label="Weight" unit={settings.weightUnit} value={set.weight ?? 0} step={ex.weightStep || 2.5} onChange={(weight) => save({ weight })} />
              )}
              {(ex.kind === 'weight' || ex.kind === 'reps') && (
                <Stepper label="Reps" unit="reps" value={set.reps ?? 0} step={1} max={200} onChange={(reps) => save({ reps })} />
              )}
              {ex.kind === 'cardio' && (
                <Stepper
                  label="Time" value={shortHold ? set.duration ?? 0 : Math.round((set.duration ?? 0) / 60)}
                  step={shortHold ? 5 : 1} unit={shortHold ? undefined : 'min'}
                  format={shortHold ? (v) => fmtDuration(v) : undefined}
                  onChange={(v) => save({ duration: shortHold ? v : v * 60 })}
                />
              )}
              {ex.kind === 'cardio' && (ex.cardioFocus === 'distance' || (set.distance ?? 0) > 0) && (
                <Stepper label="Distance" unit={settings.distanceUnit} value={set.distance ?? 0} step={0.1} onChange={(distance) => save({ distance })} />
              )}
              {ex.kind === 'cardio' && ex.cardioFocus !== 'distance' && !set.distance && !shortHold && (
                <button className="min-h-12 text-left text-lg font-bold text-primary" onClick={() => save({ distance: 0.1 })}>+ Add distance too</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
