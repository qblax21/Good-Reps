/** Exercise picker sheet: favourites and recent first, then everything by category. */
import { useMemo, useState } from 'react';
import { store } from '../data';
import type { Exercise } from '../data/types';
import { useAllSets, useExercises } from '../hooks/useStore';
import { Button, Sheet } from '../components/ui';
import { ExerciseEditor } from './ExerciseEditor';

export function groupExercises(all: Exercise[], recentIds: string[]) {
  const live = all.filter((e) => !e.archived).sort((a, b) => a.name.localeCompare(b.name));
  const favs = live.filter((e) => e.favorite);
  const recent = recentIds.map((id) => live.find((e) => e.id === id)).filter((e): e is Exercise => !!e && !e.favorite).slice(0, 5);
  return [
    { title: '⭐ Favourites', items: favs },
    { title: '🕐 Recent', items: recent },
    { title: '🏋️ Strength', items: live.filter((e) => e.category === 'strength') },
    { title: '🤸‍♀️ Bodyweight', items: live.filter((e) => e.category === 'bodyweight') },
    { title: '🚶‍♀️ Cardio & movement', items: live.filter((e) => e.category === 'cardio') },
  ].filter((g) => g.items.length);
}

export function useRecentIds() {
  const sets = useAllSets() ?? [];
  return useMemo(() => {
    const latest = new Map<string, number>();
    for (const s of sets) if (s.done) latest.set(s.exerciseId, Math.max(latest.get(s.exerciseId) ?? 0, s.at));
    return [...latest.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
  }, [sets]);
}

export function ExerciseRow({ ex, onClick, right }: { ex: Exercise; onClick: () => void; right?: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-center gap-1 rounded-2xl bg-card shadow-sm shadow-ink/5">
      <button onClick={onClick} className="flex min-h-16 min-w-0 flex-1 items-center gap-3 rounded-2xl p-3 text-left active:bg-primary-soft">
        <span className="text-3xl" aria-hidden="true">{ex.emoji}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-xl font-bold">{ex.name}</span>
          <span className="block truncate text-base text-ink-soft">{ex.description || 'Your own exercise'}</span>
        </span>
      </button>
      {right}
    </div>
  );
}

export function FavStar({ ex }: { ex: Exercise }) {
  return (
    <button
      onClick={() => store.putExercise({ ...ex, favorite: !ex.favorite })}
      aria-label={ex.favorite ? `Remove ${ex.name} from favourites` : `Add ${ex.name} to favourites`}
      aria-pressed={ex.favorite}
      className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-3xl active:bg-sun-soft"
    >
      {ex.favorite ? '⭐' : '☆'}
    </button>
  );
}

export function ExercisePicker({ open, onClose, onPick, exclude }: { open: boolean; onClose: () => void; onPick: (e: Exercise) => void; exclude: string[] }) {
  const all = useExercises() ?? [];
  const recent = useRecentIds();
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const list = all.filter((e) => !exclude.includes(e.id) && (!query || e.name.toLowerCase().includes(query.toLowerCase())));
  const groups = groupExercises(list, recent);

  return (
    <>
      <Sheet open={open && !creating} onClose={onClose} title="Add an exercise">
        <input
          type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="🔍 Search (optional)"
          aria-label="Search exercises" className="mb-2 min-h-12 w-full rounded-2xl border-2 border-ink/10 bg-white px-4"
        />
        {groups.map((g) => (
          <div key={g.title}>
            <h3 className="mt-4 mb-2 text-lg font-extrabold text-ink-soft">{g.title}</h3>
            <div className="flex flex-col gap-2">
              {g.items.map((ex) => <ExerciseRow key={g.title + ex.id} ex={ex} onClick={() => { setQuery(''); onPick(ex); }} />)}
            </div>
          </div>
        ))}
        {!groups.length && <p className="py-6 text-center text-lg text-ink-soft">No exercises match “{query}”.</p>}
        <Button kind="secondary" big className="mt-6 w-full" onClick={() => setCreating(true)}>
          ✏️ Make my own exercise
        </Button>
      </Sheet>
      <ExerciseEditor
        open={creating}
        onClose={() => setCreating(false)}
        initialName={query}
        onSaved={(ex) => { setCreating(false); setQuery(''); onPick(ex); }}
      />
    </>
  );
}
