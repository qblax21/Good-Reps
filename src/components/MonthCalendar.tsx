/** Month calendar: workout days get a daisy, planned days a dotted ring. */
import { useState } from 'react';
import { Daisy } from '../theme/mascots/art';
import { dayKey } from '../logic/stats';

export function MonthCalendar({ workoutDays, plannedDays }: { workoutDays: Set<string>; plannedDays: number[] }) {
  const [offset, setOffset] = useState(0);
  const first = new Date();
  first.setDate(1);
  first.setMonth(first.getMonth() + offset);
  const year = first.getFullYear(), month = first.getMonth();
  const daysIn = new Date(year, month + 1, 0).getDate();
  const cells: Array<Date | null> = [...Array(first.getDay()).fill(null), ...Array.from({ length: daysIn }, (_, i) => new Date(year, month, i + 1))];
  const today = dayKey(Date.now());
  const count = cells.filter((d) => d && workoutDays.has(dayKey(d))).length;
  const title = first.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <div>
      <div className="mb-2 flex items-center">
        <button aria-label="Previous month" onClick={() => setOffset(offset - 1)} className="h-12 w-12 rounded-xl text-2xl font-bold text-primary active:bg-primary-soft">‹</button>
        <div className="flex-1 text-center">
          <div className="text-xl font-extrabold">{title}</div>
          <div className="text-base text-ink-soft">{count} workout{count === 1 ? '' : 's'}</div>
        </div>
        <button aria-label="Next month" disabled={offset >= 0} onClick={() => setOffset(offset + 1)} className="h-12 w-12 rounded-xl text-2xl font-bold text-primary active:bg-primary-soft disabled:opacity-25">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center" role="grid" aria-label={title}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-sm font-bold text-ink-soft" aria-hidden="true">{d}</div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const k = dayKey(d);
          const did = workoutDays.has(k);
          const planned = plannedDays.includes(d.getDay()) && k >= today;
          return (
            <div key={i} role="gridcell"
              aria-label={`${d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}${did ? ', worked out' : planned ? ', planned' : ''}`}
              className={`relative grid aspect-square place-items-center rounded-full text-base font-bold ${k === today ? 'ring-2 ring-primary' : ''} ${planned && !did ? 'border-2 border-dashed border-leaf/60' : ''}`}>
              {did ? (
                <>
                  <Daisy size={36} className="absolute" />
                  <span className="relative text-xs text-ink">{d.getDate()}</span>
                </>
              ) : (
                <span className="text-ink">{d.getDate()}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
