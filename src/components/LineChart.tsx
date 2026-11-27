/** A simple, readable line chart (hand-rolled SVG — no chart library, works offline, tiny). */
export function LineChart({ points, format, label }: { points: Array<{ x: number; y: number }>; format: (v: number) => string; label: string }) {
  if (points.length === 0) return <p className="py-6 text-center text-lg text-ink-soft">No workouts yet — your chart will grow here.</p>;
  const W = 320, H = 170, padL = 8, padR = 8, padT = 28, padB = 26;
  const ys = points.map((p) => p.y);
  let min = Math.min(...ys), max = Math.max(...ys);
  if (min === max) { min = min * 0.9; max = max * 1.1 || 1; }
  const x0 = points[0].x, x1 = points[points.length - 1].x || x0 + 1;
  const sx = (x: number) => padL + (points.length === 1 ? (W - padL - padR) / 2 : ((x - x0) / (x1 - x0 || 1)) * (W - padL - padR));
  const sy = (y: number) => padT + (1 - (y - min) / (max - min)) * (H - padT - padB);
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(' ');
  const area = `${line} L${sx(points[points.length - 1].x)} ${H - padB} L${sx(points[0].x)} ${H - padB} Z`;
  const best = points.reduce((a, b) => (b.y > a.y ? b : a));
  const last = points[points.length - 1];
  const date = (t: number) => new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label={`${label}: ${points.length} workouts, from ${format(points[0].y)} to ${format(last.y)}. Best ${format(best.y)}.`}>
      <defs>
        <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#4E9A62" stopOpacity="0.35" />
          <stop offset="1" stopColor="#4E9A62" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke="#1F3326" strokeOpacity={0.15} />
      <path d={area} fill="url(#chartFill)" />
      <path d={line} fill="none" stroke="#2B6E46" strokeWidth={3.5} strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={points.length > 30 ? 2.5 : 4} fill="#2B6E46" />)}
      {/* best point gets a little daisy */}
      <g transform={`translate(${sx(best.x)} ${sy(best.y)})`}>
        <circle r={8} fill="#FFFFFF" stroke="#F6C945" strokeWidth={4} />
      </g>
      <text x={Math.min(Math.max(sx(best.x), 40), W - 40)} y={Math.max(14, sy(best.y) - 14)} textAnchor="middle" fontSize={14} fontWeight={800} fill="#1F3326">
        {format(best.y)}
      </text>
      <text x={padL} y={H - 6} fontSize={13} fill="#4A5C4F">{date(points[0].x)}</text>
      <text x={W - padR} y={H - 6} fontSize={13} fill="#4A5C4F" textAnchor="end">{date(last.x)}</text>
    </svg>
  );
}
