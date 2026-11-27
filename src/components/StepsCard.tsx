/** Home screen steps card: the latest day's steps against her goal, plus the last 7 days. */
import { useSettings, useSteps } from '../hooks/useStore';
import { dayKey } from '../logic/stats';
import { Daisy } from '../theme/mascots/art';
import { Card } from './ui';

const fmt = (n: number) => n.toLocaleString();

export function lastNDays(n: number, end = new Date()): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(end);
    d.setDate(d.getDate() - (n - 1 - i));
    return dayKey(d);
  });
}

export function updatedText(t: number | null): string {
  if (!t) return 'Waiting for the first update from your iPhone.';
  const d = new Date(t);
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const today = dayKey(new Date()), that = dayKey(d);
  const yest = new Date(); yest.setDate(yest.getDate() - 1);
  const when = that === today ? 'today' : that === dayKey(yest) ? 'yesterday' : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return `Updated ${when} at ${time}`;
}

export function StepsCard() {
  const settings = useSettings();
  const steps = useSteps() ?? {};
  if (!settings.stepsLink) return null;

  const days = lastNDays(7);
  const today = days[6], yesterday = days[5];
  const showDay = steps[today] !== undefined ? today : steps[yesterday] !== undefined ? yesterday : null;
  const value = showDay ? steps[showDay] : null;
  const goal = settings.stepGoal;
  const top = Math.max(goal, ...days.map((d) => steps[d] ?? 0));

  return (
    <Card className="mt-4">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <h2 className="text-xl font-extrabold">👟 Steps</h2>
        <span className="text-base text-ink-soft">Goal {fmt(goal)}</span>
      </div>
      {value === null ? (
        <p className="text-lg text-ink-soft">No steps yet for today or yesterday.</p>
      ) : (
        <>
          <p className="text-3xl font-black">
            {fmt(value)} <span className="text-lg font-bold text-ink-soft">{showDay === today ? 'today' : 'yesterday'}</span>
            {value >= goal && <span className="ml-2 inline-block align-middle"><Daisy size={28} /></span>}
          </p>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuemin={0} aria-valuemax={goal} aria-valuenow={value}
            aria-label={`${fmt(value)} of ${fmt(goal)} steps`}>
            <div className="h-full rounded-full bg-leaf" style={{ width: `${Math.min(100, (value / goal) * 100)}%` }} />
          </div>
        </>
      )}

      <div className="mt-4 grid grid-cols-7 items-end gap-1" aria-label="Steps, last 7 days">
        {days.map((d) => {
          const v = steps[d];
          const hit = v !== undefined && v >= goal;
          const date = new Date(`${d}T12:00:00`);
          return (
            <div key={d} className="flex flex-col items-center gap-1" aria-label={`${date.toLocaleDateString(undefined, { weekday: 'long' })}: ${v === undefined ? 'no data' : `${fmt(v)} steps`}`}>
              <div className="flex h-6 items-end">{hit && <Daisy size={20} />}</div>
              <div className="flex h-16 w-full items-end justify-center">
                <div className={`w-4/6 rounded-t-md ${hit ? 'bg-leaf' : 'bg-leaf/40'}`} style={{ height: `${v ? Math.max(6, (v / top) * 100) : 0}%` }} />
              </div>
              <span className={`text-sm font-bold ${d === today ? 'text-primary' : 'text-ink-soft'}`}>{date.toLocaleDateString(undefined, { weekday: 'narrow' })}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-sm text-ink-soft">{updatedText(settings.stepsUpdatedAt)}</p>
    </Card>
  );
}
