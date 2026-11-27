/** Progress: streak, calendar, per-exercise summaries, records, and workout history. */
import { useMemo } from 'react';
import { useAllSets, useExercises, useSettings, useSteps, useWorkouts } from '../hooks/useStore';
import { LineChart } from '../components/LineChart';
import { lastNDays } from '../components/StepsCard';
import { useNav } from '../nav';
import { Card, Header, SectionTitle } from '../components/ui';
import { MonthCalendar } from '../components/MonthCalendar';
import { Daisy } from '../theme/mascots/art';
import { recordsFor, weekStreak, workoutDays } from '../logic/stats';
import { sessionsFor } from '../logic/history';
import { fmtMetric, relDay } from '../logic/format';

export function ProgressTab() {
  const nav = useNav();
  const settings = useSettings();
  const steps = useSteps() ?? {};
  const stepPoints = lastNDays(30)
    .map((d) => ({ x: new Date(`${d}T12:00:00`).getTime(), y: steps[d] }))
    .filter((p): p is { x: number; y: number } => p.y !== undefined);
  const workouts = useWorkouts() ?? [];
  const sets = useAllSets() ?? [];
  const exercises = useExercises() ?? [];
  const finished = workouts.filter((w) => w.endedAt);
  const streak = weekStreak(workouts);
  const days = useMemo(() => workoutDays(workouts), [workouts]);
  const thisMonth = finished.filter((w) => new Date(w.startedAt).getMonth() === new Date().getMonth() && new Date(w.startedAt).getFullYear() === new Date().getFullYear()).length;

  const used = exercises
    .map((ex) => ({ ex, sessions: sessionsFor(sets.filter((s) => s.exerciseId === ex.id)) }))
    .filter((x) => x.sessions.length)
    .sort((a, b) => b.sessions[b.sessions.length - 1].at - a.sessions[a.sessions.length - 1].at);

  const recentRecords = used
    .flatMap(({ ex }) => recordsFor(ex, sets).map((r) => ({ ...r, ex })))
    .sort((a, b) => b.at - a.at)
    .slice(0, 5);

  return (
    <div className="flex h-full flex-col">
      <Header title="My progress" />
      <div className="scroll-area px-safe flex-1 pb-6">
        <div className="grid grid-cols-3 gap-2">
          {[
            { n: streak, label: streak === 1 ? 'week in a row' : 'weeks in a row' },
            { n: thisMonth, label: 'this month' },
            { n: finished.length, label: 'all time' },
          ].map((s) => (
            <Card key={s.label} className="!p-3 text-center">
              <div className="text-4xl font-black text-primary">{s.n}</div>
              <div className="text-base leading-tight font-semibold text-ink-soft">{s.label}</div>
            </Card>
          ))}
        </div>

        {settings.stepsLink && stepPoints.length > 0 && (
          <>
            <SectionTitle>Steps, last 30 days</SectionTitle>
            <Card><LineChart points={stepPoints} format={(v) => Math.round(v).toLocaleString()} label="Daily steps, last 30 days" /></Card>
          </>
        )}

        <SectionTitle>Calendar</SectionTitle>
        <Card><MonthCalendar workoutDays={days} plannedDays={settings.plannedDays} /></Card>

        {recentRecords.length > 0 && (
          <>
            <SectionTitle>Personal records</SectionTitle>
            <Card>
              <ul className="divide-y divide-ink/10">
                {recentRecords.map((r) => (
                  <li key={r.key}>
                    <button className="flex min-h-14 w-full items-center gap-2 py-2 text-left" onClick={() => nav.push({ name: 'exercise', exerciseId: r.ex.id })}>
                      <span className="text-2xl" aria-hidden="true">🏅</span>
                      <span className="flex-1 text-lg"><b>{r.ex.name}</b><span className="block text-base text-ink-soft">{r.label} · {relDay(r.at)}</span></span>
                      <span className="text-lg font-extrabold">{fmtMetric(r.format, r.value, settings)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          </>
        )}

        <SectionTitle>By exercise</SectionTitle>
        {used.length === 0 && (
          <Card className="flex flex-col items-center py-6 text-center">
            <Daisy size={56} bloom={false} />
            <p className="mt-2 text-lg">Your progress will grow here after your first workout.</p>
          </Card>
        )}
        <div className="flex flex-col gap-2">
          {used.map(({ ex, sessions }) => (
            <Card key={ex.id} onClick={() => nav.push({ name: 'exercise', exerciseId: ex.id })} label={`${ex.name} progress`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl" aria-hidden="true">{ex.emoji}</span>
                <span className="flex-1">
                  <span className="block text-xl font-bold">{ex.name}</span>
                  <span className="block text-base text-ink-soft">{sessions.length} time{sessions.length === 1 ? '' : 's'} · last {relDay(sessions[sessions.length - 1].at).toLowerCase()}</span>
                </span>
                <span className="text-2xl text-primary" aria-hidden="true">›</span>
              </div>
            </Card>
          ))}
        </div>

        {finished.length > 0 && (
          <button className="mt-6 min-h-14 w-full rounded-2xl bg-card text-lg font-bold text-primary shadow-sm" onClick={() => nav.push({ name: 'history' })}>
            See all workouts ›
          </button>
        )}
      </div>
    </div>
  );
}
