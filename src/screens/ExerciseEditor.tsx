/** Create or edit a custom exercise. The only place she might need the keyboard (for the name). */
import { useEffect, useState } from 'react';
import { store, uid } from '../data';
import type { Exercise } from '../data/types';
import { blankExercise } from '../data/exercises';
import { Button, Choices, Sheet } from '../components/ui';
import { useSettings } from '../hooks/useStore';

const EMOJIS = ['🌼', '🏋️', '💪', '🦵', '🤸‍♀️', '🚶‍♀️', '🚴‍♀️', '🧘‍♀️', '🏊‍♀️', '💃', '🎾', '⛳', '🥾', '🪴', '🐕', '⭐'];

export function ExerciseEditor({ open, onClose, onSaved, existing, initialName = '' }: {
  open: boolean; onClose: () => void; onSaved: (e: Exercise) => void; existing?: Exercise; initialName?: string;
}) {
  const settings = useSettings();
  const [name, setName] = useState('');
  const [kind, setKind] = useState<Exercise['kind']>('weight');
  const [emoji, setEmoji] = useState('🌼');
  const [desc, setDesc] = useState('');
  const [step, setStep] = useState('2.5');
  const [focus, setFocus] = useState<'time' | 'distance'>('time');

  useEffect(() => {
    if (!open) return;
    setName(existing?.name ?? initialName);
    setKind(existing?.kind ?? 'weight');
    setEmoji(existing?.emoji ?? '🌼');
    setDesc(existing?.description ?? '');
    setStep(String(existing?.weightStep || (settings.weightUnit === 'kg' ? 1 : 2.5)));
    setFocus(existing?.cardioFocus ?? 'time');
  }, [open, existing, initialName, settings.weightUnit]);

  const save = async () => {
    const base = existing ?? { ...blankExercise(kind), id: uid(), name: '' };
    const ex: Exercise = {
      ...base,
      ...(existing && existing.kind !== kind ? blankExercise(kind) : {}),
      id: base.id,
      name: name.trim(),
      kind,
      emoji,
      description: desc.trim(),
      weightStep: kind === 'weight' ? parseFloat(step) : 0,
      cardioFocus: kind === 'cardio' ? focus : undefined,
      category: kind === 'cardio' ? 'cardio' : kind === 'reps' ? 'bodyweight' : 'strength',
      custom: true,
    };
    await store.putExercise(ex);
    onSaved(ex);
  };

  return (
    <Sheet open={open} onClose={onClose} title={existing ? 'Edit exercise' : 'New exercise'} closeLabel="Cancel">
      <label className="block text-lg font-bold" htmlFor="ex-name">What’s it called?</label>
      <input id="ex-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Pool walking"
        className="mt-1 mb-4 min-h-14 w-full rounded-2xl border-2 border-ink/15 bg-white px-4 text-xl" autoComplete="off" />

      <p className="mb-2 text-lg font-bold">How do you measure it?</p>
      <div className="mb-4 flex flex-col gap-2">
        {([
          ['weight', '🏋️ Weight and reps', 'Like “10 lb, 12 times”'],
          ['reps', '🤸‍♀️ Just reps', 'Like “15 times”, no weights'],
          ['cardio', '⏱️ Time or distance', 'Like “20 minutes” or “1 mile”'],
        ] as const).map(([k, title, hint]) => (
          <button key={k} role="radio" aria-checked={kind === k} onClick={() => setKind(k)}
            className={`min-h-16 rounded-2xl border-2 p-3 text-left ${kind === k ? 'border-primary bg-primary-soft' : 'border-ink/10 bg-card'}`}>
            <span className="block text-xl font-bold">{title}</span>
            <span className="block text-base text-ink-soft">{hint}</span>
          </button>
        ))}
      </div>

      {kind === 'weight' && (
        <>
          <p className="mb-2 text-lg font-bold">Smallest weight jump</p>
          <Choices label="Smallest weight jump" value={step} onChange={setStep}
            options={(settings.weightUnit === 'kg' ? ['0.5', '1', '2.5', '5'] : ['1', '2.5', '5', '10']).map((v) => ({ value: v, label: `${v} ${settings.weightUnit}` }))} />
        </>
      )}
      {kind === 'cardio' && (
        <>
          <p className="mb-2 text-lg font-bold">What matters most?</p>
          <Choices label="What matters most" value={focus} onChange={setFocus}
            options={[{ value: 'time', label: '⏱️ Time' }, { value: 'distance', label: '📏 Distance' }]} />
        </>
      )}

      <p className="mt-4 mb-2 text-lg font-bold">Pick a picture</p>
      <div className="grid grid-cols-8 gap-1" role="radiogroup" aria-label="Picture">
        {EMOJIS.map((e) => (
          <button key={e} role="radio" aria-checked={emoji === e} onClick={() => setEmoji(e)} aria-label={e}
            className={`grid aspect-square min-h-11 place-items-center rounded-xl text-2xl ${emoji === e ? 'bg-sun' : 'bg-card'}`}>{e}</button>
        ))}
      </div>

      <label className="mt-4 block text-lg font-bold" htmlFor="ex-desc">Notes (optional)</label>
      <textarea id="ex-desc" value={desc} onChange={(e) => setDesc(e.target.value)} rows={2}
        className="mt-1 w-full rounded-2xl border-2 border-ink/15 bg-white p-3 text-lg" placeholder="Anything to remember" />

      <Button big className="mt-6 w-full" disabled={!name.trim()} onClick={save}>
        {existing ? 'Save changes' : 'Add exercise'}
      </Button>
    </Sheet>
  );
}
