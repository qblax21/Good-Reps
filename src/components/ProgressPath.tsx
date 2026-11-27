/**
 * The goal "garden path": a winding stem from where she started (bottom) up to the goal (top).
 * Each milestone is a bud that blooms into a daisy once reached.
 */
import { motion } from 'framer-motion';
import { Daisy } from '../theme/mascots/art';

export function ProgressPath({ milestones, value, format, startLabel }: {
  milestones: number[]; value: number; format: (v: number) => string; startLabel: string;
}) {
  const rowH = 76;
  const rows = [...milestones].reverse(); // goal at the top
  const h = rows.length * rowH + 60;
  const xFor = (i: number) => (i % 2 === 0 ? 70 : 30); // percent across, alternating
  const pts = [...rows.map((_, i) => ({ x: xFor(i), y: i * rowH + rowH / 2 })), { x: 50, y: h - 24 }];
  const d = pts.reduce((acc, p, i) => {
    if (i === 0) return `M${p.x} ${p.y}`;
    const prev = pts[i - 1];
    const my = (prev.y + p.y) / 2;
    return `${acc} C${prev.x} ${my} ${p.x} ${my} ${p.x} ${p.y}`;
  }, '');
  const reachedCount = milestones.filter((m) => value + 1e-9 >= m).length;

  return (
    <div className="relative w-full" style={{ height: h }} role="list" aria-label={`Progress path: ${reachedCount} of ${milestones.length} milestones reached`}>
      <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 100 ${h}`} preserveAspectRatio="none" aria-hidden="true">
        <path d={d} fill="none" stroke="#CFE6C9" strokeWidth={10} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <path d={d} fill="none" stroke="#4E9A62" strokeWidth={3} strokeDasharray="2 8" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      {rows.map((m, i) => {
        const reached = value + 1e-9 >= m;
        const isGoal = i === 0;
        const left = xFor(i);
        return (
          // The daisy sits on the path; its label points toward the middle so nothing runs off-screen.
          <div key={i} role="listitem" className="absolute -translate-x-1/2 -translate-y-1/2" style={{ top: i * rowH + rowH / 2, left: `${left}%` }}
            aria-label={`${isGoal ? 'Goal' : 'Milestone'} ${format(m)}${reached ? ', reached' : ''}`}>
            <motion.div initial={false} animate={reached ? { scale: [0.6, 1.15, 1], rotate: [0, 20, 0] } : { scale: 1 }} transition={{ duration: 0.6 }}>
              <Daisy size={isGoal ? 60 : 52} bloom={reached} />
            </motion.div>
            <span className={`absolute top-1/2 -translate-y-1/2 rounded-xl px-2 py-1 text-base font-bold whitespace-nowrap ${left > 50 ? 'right-full mr-1' : 'left-full ml-1'} ${reached ? 'bg-primary-soft text-primary-dark' : 'bg-card text-ink-soft'} ${isGoal ? 'text-lg' : ''}`}>
              {isGoal ? '🏁 ' : ''}{format(m)}
            </span>
          </div>
        );
      })}
      <div className="absolute flex -translate-x-1/2 items-center gap-1 text-base font-semibold whitespace-nowrap text-ink-soft" style={{ top: h - 40, left: '50%' }}>
        <span aria-hidden="true">🌱</span> Start: {startLabel}
      </div>
    </div>
  );
}

/** Compact row of daisies/buds for cards on the home screen. */
export function MiniPath({ milestones, value }: { milestones: number[]; value: number }) {
  return (
    <div className="flex items-center gap-1" aria-hidden="true">
      {milestones.map((m, i) => (
        <div key={i} className="flex items-center gap-1">
          <Daisy size={i === milestones.length - 1 ? 30 : 24} bloom={value + 1e-9 >= m} />
          {i < milestones.length - 1 && <span className={`h-1 w-2 rounded ${value >= milestones[i] ? 'bg-leaf' : 'bg-ink/15'}`} />}
        </div>
      ))}
    </div>
  );
}
