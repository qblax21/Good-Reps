/** One exercise: what it is, next target, goal path, chart, records and history. */
import { useState } from 'react';
import { store } from '../data';
import type { Exercise } from '../data/types';
import { useAllSets, useGoals, useQuery, useSettings } from '../hooks/useStore';
import { useNav } from '../nav';
import { Button, Card, Choices, Header, SectionTitle } from '../components/ui';
import { toast } from '../components/Toast';
import { LineChart } from '../components/LineChart';
import { ProgressPath } from '../components/ProgressPath';
import { suggestNext, whyText } from '../logic/progression';
import { currentValue, goalProgress } from '../logic/goals';
import { bestReps, fmtSet, sessionsFor, topWeight, totalDistance, totalDuration, totalReps, volume, type Session } from '../logic/history';
import { recordsFor } from '../logic/stats';
import { fmtMetric, fmtTarget, kindLabel, relDay, unitsOf } from '../logic/format';
import { GoalSheet } from './GoalSheet';
import { ExerciseEditor } from './ExerciseEditor';

type ChartKey = 'weight' | 'reps' | 'volume' | 'total' | 'time' | 'distance';

export function ExerciseDetail({ exerciseId }: { exerciseId: string }) {
  const nav = useNav();
  const settings = useSettings();
  const ex = useQuery(() => store.getExercise(exerciseId), [exerciseId]);
  const allSets = useAllSets() ?? [];
  const goals = useGoals() ?? [];
  const [goalOpen, setGoalOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [chart, setChart] = useState<ChartKey | null>(null);
  if (!ex) return null;

  const sets = allSets.filter((s) => s.exerciseId === ex.id);
  const sessions = sessionsFor(sets);
  const next = suggestNext(ex, sets, settings);
  const goal = goals.find((g) => g.exerciseId === ex.id);
  const records = recordsFor(ex, sets);
  const u = unitsOf(settings);

  const chartOptions: Array<{ value: ChartKey; label: string; fn: (s: Session) => number; fmt: (v: number) => string }> =
    ex.kind === 'weight'
      ? [
          { value: 'weight', label: 'Weight', fn: topWeight, fmt: (v) => fmtMetric('weight', v, settings) },
          { value: 'reps', label: 'Reps', fn: bestReps, fmt: (v) => `${v} reps` },
          { value: 'volume', label: 'Total', fn: volume, fmt: (v) => fmtMetric('volume', v, settings) },
        ]
      : ex.kind === 'reps'
        ? [
            { value: 'reps', label: 'Best set', fn: bestReps, fmt: (v) => `${v} reps` },
            { value: 'total', label: 'Total reps', fn: totalReps, fmt: (v) => `${v} reps` },
          ]
        : [
            { value: 'time', label: 'Time', fn: totalDuration, fmt: (v) => fmtMetric('duration', v, settings) },
            { value: 'distance', label: 'Distance', fn: totalDistance, fmt: (v) => fmtMetric('distance', v, settings) },
          ];
  const active = chartOptions.find((c) => c.value === chart) ?? (ex.cardioFocus === 'distance' ? chartOptions[1] : chartOptions[0]);
  const points = sessions.map((s) => ({ x: s.at, y: active.fn(s) })).filter((p) => p.y > 0);

  const value = goal ? currentValue(goal, sets) : 0;
  const prog = goal ? goalProgress(goal, value) : null;
  const goalFmt = (v: number) => (goal ? fmtMetric(goal.metric, v, settings, goal.targetReps) : '');

  const removeGoal = async () => {
    if (!goal) return;
    await store.deleteGoal(goal.id);
    toast('Goal removed', () => store.putGoal(goal));
  };
  const hide = async () => {
    await store.putExercise({ ...ex, archived: true });
    nav.pop();
    toast(`${ex.name} hidden`, () => store.putExercise({ ...ex, archived: false }));
  };

  return (
    <div className="flex h-full flex-col bg-cream">
      <Header title={ex.name} onBack={nav.pop} />
      <div className="scroll-area px-safe flex-1 pb-safe pb-10">
        <Card>
          <div className="flex items-start gap-3">
            <span className="text-5xl" aria-hidden="true">{ex.emoji}</span>
            <div className="flex-1">
              <p className="text-lg leading-snug">{ex.description || 'Your own exercise.'}</p>
              <p className="mt-1 text-base text-ink-soft">{kindLabel[ex.kind]}{ex.kind !== 'cardio' ? ` · aim for ${ex.repMin}–${ex.repMax} reps` : ''}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button kind={ex.favorite ? 'sun' : 'secondary'} className="flex-1" onClick={() => store.putExercise({ ...ex, favorite: !ex.favorite })}>
              {ex.favorite ? '⭐ Favourite' : '☆ Add to favourites'}
            </Button>
            {ex.custom && <Button kind="ghost" onClick={() => setEditOpen(true)}>Edit</Button>}
          </div>
        </Card>

        <Card className="mt-4 bg-sun-soft">
          <p className="text-base font-bold text-ink-soft">{sessions.length ? 'Next time, try:' : 'First time? Start with:'}</p>
          <p className="text-3xl font-extrabold text-primary-dark">{fmtTarget(ex, next, settings)}</p>
          <p className="mt-1 text-base text-ink-soft">{whyText[next.why]}</p>
        </Card>

        <SectionTitle>Goal</SectionTitle>
        {goal && prog ? (
          <Card>
            <p className="text-xl font-extrabold">🏁 {goalFmt(goal.target)}</p>
            <p className="text-lg text-ink-soft">
              {prog.done ? 'Goal reached! 🎉' : `${prog.reached} of ${prog.total} daisies bloomed · best so far ${goalFmt(value || goal.start)}`}
              {goal.targetDate && !prog.done && ` · by ${new Date(goal.targetDate + 'T12:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}`}
            </p>
            <div className="mt-4">
              <ProgressPath milestones={goal.milestones} value={value} format={goalFmt} startLabel={goalFmt(goal.start)} />
            </div>
            <div className="mt-2 flex gap-2">
              <Button kind="secondary" className="flex-1" onClick={() => setGoalOpen(true)}>Change goal</Button>
              <Button kind="ghost" onClick={removeGoal}>Remove</Button>
            </div>
          </Card>
        ) : (
          <Card className="text-center">
            <p className="mb-3 text-lg">Something to aim for? We’ll break it into little steps.</p>
            <Button big className="w-full" onClick={() => setGoalOpen(true)}>🎯 Set a goal</Button>
          </Card>
        )}

        <SectionTitle>Progress</SectionTitle>
        <Card>
          <Choices label="Chart shows" value={active.value} onChange={setChart} options={chartOptions.map(({ value, label }) => ({ value, label }))} />
          <div className="mt-3"><LineChart points={points} format={active.fmt} label={`${ex.name} ${active.label}`} /></div>
        </Card>

        {records.length > 0 && (
          <>
            <SectionTitle>Personal records</SectionTitle>
            <Card>
              <ul className="divide-y divide-ink/10">
                {records.map((r) => (
                  <li key={r.key} className="flex items-center py-2 text-lg">
                    <span className="flex-1">🏅 {r.label}</span>
                    <span className="text-right font-extrabold">{fmtMetric(r.format, r.value, settings)}<span className="block text-sm font-normal text-ink-soft">{relDay(r.at)}</span></span>
                  </li>
                ))}
              </ul>
            </Card>
          </>
        )}

        {sessions.length > 0 && (
          <>
            <SectionTitle>History</SectionTitle>
            <div className="flex flex-col gap-2">
              {[...sessions].reverse().slice(0, 20).map((s) => (
                <Card key={s.workoutId} onClick={() => nav.push({ name: 'workout', workoutId: s.workoutId })} label={`Workout ${relDay(s.at)}`}>
                  <p className="text-base font-bold text-ink-soft">{relDay(s.at)}</p>
                  <p className="text-lg">{s.sets.map((x) => fmtSet(ex, x, u)).join('  ·  ')}</p>
                </Card>
              ))}
            </div>
          </>
        )}

        {ex.custom && <Button kind="ghost" className="mt-8 w-full !text-ink-soft" onClick={hide}>Hide this exercise</Button>}
      </div>
      <GoalSheet open={goalOpen} onClose={() => setGoalOpen(false)} ex={ex} existing={goal} />
      <ExerciseEditor open={editOpen} onClose={() => setEditOpen(false)} existing={ex as Exercise} onSaved={() => setEditOpen(false)} />
    </div>
  );
}
