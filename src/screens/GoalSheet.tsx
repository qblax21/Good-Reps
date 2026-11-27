/** Set or change a goal for one exercise, with a live preview of the milestone path. */
import { useEffect, useState } from 'react';
import { store, uid } from '../data';
import type { Exercise, Goal, GoalMetric } from '../data/types';
import { useAllSets, useSettings } from '../hooks/useStore';
import { Button, Choices, Sheet, Stepper } from '../components/ui';
import { MiniPath } from '../components/ProgressPath';
import { buildMilestones, currentValue, metricFor, metricStep } from '../logic/goals';
import { firstTarget } from '../logic/progression';
import { fmtMetric } from '../logic/format';
import { fmtDuration } from '../logic/history';
import { cheer } from '../mascot/bus';

export function GoalSheet({ open, onClose, ex, existing }: { open: boolean; onClose: () => void; ex: Exercise; existing?: Goal }) {
  const settings = useSettings();
  const sets = useAllSets() ?? [];
  const [metric, setMetric] = useState<GoalMetric>(metricFor(ex));
  const [start, setStart] = useState(0);
  const [target, setTarget] = useState(0);
  const [reps, setReps] = useState(10);
  const [hasDate, setHasDate] = useState(false);
  const [date, setDate] = useState('');

  // Prefill from her current best when the sheet opens
  useEffect(() => {
    if (!open) return;
    const m = existing?.metric ?? metricFor(ex);
    const r = existing?.targetReps ?? Math.min(ex.repMax, 10);
    const cur = currentValue({ metric: m, targetReps: r, exerciseId: ex.id }, sets);
    const ft = firstTarget(ex, settings);
    const base = cur || (m === 'weight' ? ft.weight ?? 5 : m === 'reps' ? ft.reps ?? 8 : m === 'duration' ? ft.duration ?? 600 : ft.distance ?? 0.5);
    const step = metricStep(ex, m, settings);
    setMetric(m);
    setReps(r);
    setStart(existing?.start ?? base);
    setTarget(existing?.target ?? Math.round((base + step * (m === 'reps' ? 5 : m === 'duration' ? 10 : 6)) * 100) / 100);
    setHasDate(!!existing?.targetDate);
    setDate(existing?.targetDate ?? new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const step = metricStep(ex, metric, settings);
  const milestones = buildMilestones(start, target, step);
  const fmt = (v: number) => fmtMetric(metric, v, settings, metric === 'weight' ? reps : undefined);
  const isSeconds = metric === 'duration';
  const shortHold = isSeconds && ex.category === 'bodyweight';
  // Durations are edited in minutes (or seconds for planks) but stored in seconds.
  const toUi = (v: number) => (isSeconds && !shortHold ? Math.round(v / 60) : v);
  const fromUi = (v: number) => (isSeconds && !shortHold ? v * 60 : v);
  const uiStep = isSeconds ? (shortHold ? 5 : 1) : step;
  const unit = metric === 'weight' ? settings.weightUnit : metric === 'reps' ? 'reps' : metric === 'distance' ? settings.distanceUnit : shortHold ? undefined : 'min';
  const uiFormat = shortHold ? (v: number) => fmtDuration(v) : undefined;

  const save = async () => {
    const g: Goal = {
      id: existing?.id ?? uid(), exerciseId: ex.id, metric, start, target,
      targetReps: metric === 'weight' ? reps : undefined,
      targetDate: hasDate ? date : undefined,
      milestones, celebrated: [], createdAt: existing?.createdAt ?? Date.now(),
    };
    // Don't re-celebrate milestones she's already past.
    const cur = currentValue(g, sets);
    g.celebrated = milestones.map((m, i) => (cur >= m ? i : -1)).filter((i) => i >= 0);
    await store.putGoal(g);
    onClose();
    if (!existing) cheer({ event: 'hello', vars: {} });
  };

  return (
    <Sheet open={open} onClose={onClose} title={existing ? 'Change goal' : 'Set a goal'} closeLabel="Cancel">
      <p className="mb-4 text-lg text-ink-soft">{ex.emoji} {ex.name}</p>

      {ex.kind === 'cardio' && (
        <div className="mb-4">
          <p className="mb-2 text-lg font-bold">Goal is about…</p>
          <Choices label="Goal type" value={metric} onChange={(m) => { setMetric(m); setStart(0); setTarget(m === 'distance' ? 1 : 1200); }}
            options={[{ value: 'duration', label: '⏱️ Time' }, { value: 'distance', label: '📏 Distance' }]} />
        </div>
      )}

      <p className="mb-2 text-lg font-bold">My goal</p>
      <Stepper label="Goal" value={toUi(target)} step={uiStep} unit={unit} format={uiFormat} onChange={(v) => setTarget(fromUi(v))} />
      {metric === 'weight' && (
        <div className="mt-2">
          <Stepper label="Reps at that weight" value={reps} step={1} min={1} max={30} unit="reps" onChange={setReps} />
        </div>
      )}

      <p className="mt-5 mb-2 text-lg font-bold">Starting from</p>
      <Stepper label="Starting point" value={toUi(start)} step={uiStep} unit={unit} format={uiFormat} onChange={(v) => setStart(fromUi(v))} />
      <p className="mt-1 text-base text-ink-soft">We filled in your best so far.</p>

      <div className="mt-5">
        <p className="mb-2 text-lg font-bold">By a certain date?</p>
        <Choices label="Target date" value={hasDate ? 'yes' : 'no'} onChange={(v) => setHasDate(v === 'yes')}
          options={[{ value: 'no', label: 'No rush' }, { value: 'yes', label: 'Pick a date' }]} />
        {hasDate && (
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Target date"
            className="mt-2 min-h-14 w-full rounded-2xl border-2 border-ink/15 bg-white px-4 text-xl" />
        )}
      </div>

      <div className="mt-6 rounded-3xl bg-primary-soft p-4">
        <p className="text-lg font-bold">Your path: {milestones.length} daisies to bloom 🌼</p>
        <div className="mt-2 overflow-x-auto"><MiniPath milestones={milestones} value={start} /></div>
        <p className="mt-2 text-base text-ink-soft">{milestones.map(fmt).join(' → ')}</p>
      </div>

      <Button big className="mt-6 w-full" disabled={target <= start} onClick={save}>
        {existing ? 'Save goal' : 'Set this goal'}
      </Button>
      {target <= start && <p className="mt-2 text-center text-base text-danger">Make the goal a bit bigger than where you’re starting.</p>}
    </Sheet>
  );
}
