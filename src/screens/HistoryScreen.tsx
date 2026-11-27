/** Every finished workout, newest first. Tap one to view or fix it. */
import { useAllSets, useExercises, useWorkouts } from '../hooks/useStore';
import { useNav } from '../nav';
import { Card, Header } from '../components/ui';
import { relDay } from '../logic/format';

export function HistoryScreen() {
  const nav = useNav();
  const workouts = (useWorkouts() ?? []).filter((w) => w.endedAt).reverse();
  const exercises = useExercises() ?? [];
  const sets = useAllSets() ?? [];

  return (
    <div className="flex h-full flex-col bg-cream">
      <Header title="All workouts" onBack={nav.pop} />
      <div className="scroll-area px-safe pb-safe flex-1 pb-8">
        <div className="flex flex-col gap-2">
          {workouts.map((w) => {
            const names = w.exerciseIds.map((id) => exercises.find((e) => e.id === id)).filter(Boolean);
            const n = sets.filter((s) => s.workoutId === w.id && s.done).length;
            return (
              <Card key={w.id} onClick={() => nav.push({ name: 'workout', workoutId: w.id })} label={`Workout ${relDay(w.startedAt)}`}>
                <p className="text-lg font-extrabold">{relDay(w.startedAt)} <span className="font-normal text-ink-soft">· {n} set{n === 1 ? '' : 's'}</span></p>
                <p className="text-lg">{names.map((e) => `${e!.emoji} ${e!.name}`).join(', ')}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
