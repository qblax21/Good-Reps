/** The exercise library tab. */
import { useState } from 'react';
import { useExercises } from '../hooks/useStore';
import { useNav } from '../nav';
import { Button, Header } from '../components/ui';
import { ExerciseRow, FavStar, groupExercises, useRecentIds } from './ExercisePicker';
import { ExerciseEditor } from './ExerciseEditor';

export function ExercisesTab() {
  const nav = useNav();
  const all = useExercises() ?? [];
  const recent = useRecentIds();
  const [creating, setCreating] = useState(false);
  const groups = groupExercises(all, recent).filter((g) => !g.title.includes('Recent'));

  return (
    <div className="flex h-full flex-col">
      <Header title="Exercises" />
      <div className="scroll-area px-safe flex-1 pb-6">
        <p className="text-lg text-ink-soft">Tap one to see how to do it, your progress, and set a goal. Tap ☆ to make it a favourite.</p>
        <Button kind="secondary" big className="mt-4 w-full" onClick={() => setCreating(true)}>✏️ Make my own exercise</Button>
        {groups.map((g) => (
          <div key={g.title}>
            <h2 className="mt-6 mb-2 text-xl font-extrabold">{g.title}</h2>
            <div className="flex flex-col gap-2">
              {g.items.map((ex) => (
                <ExerciseRow key={g.title + ex.id} ex={ex} onClick={() => nav.push({ name: 'exercise', exerciseId: ex.id })} right={<FavStar ex={ex} />} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <ExerciseEditor open={creating} onClose={() => setCreating(false)} onSaved={(ex) => { setCreating(false); nav.push({ name: 'exercise', exerciseId: ex.id }); }} />
    </div>
  );
}
