/**
 * Cartoon art in a flat, geometric style: Daisy the corgi, Eddie the corgi-terrier mix, a sneaky raccoon,
 * a night owl, and daisies. All plain SVG so they stay crisp at any size.
 * Real illustrations can still replace the dogs via `images` in dogs.ts.
 */
import type { ReactNode } from 'react';
import type { Pose, DogConfig } from './dogs';

const INK = '#2A1D17';

/* ---------- Dogs: flat geometric style ---------- */

const FACE = '#2B1E17';

/** How Eddie looks. 0–1 each: how far his ears lean out, and how scruffy his fur is. */
export const EDDIE_STYLE = { earSpread: 0.8, scruff: 0.7 };

/** Draws its children, then a left-right mirrored copy (for ears, eyes, cheeks). */
function Mirror({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <g transform="matrix(-1 0 0 1 200 0)">{children}</g>
    </>
  );
}

/** Zig-zag outline around an ellipse — the flat style's "fur". */
function zig(cx: number, cy: number, rx: number, ry: number, n: number, amp: number, seed: number): string {
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const a = -Math.PI / 2 + (i / (n * 2)) * Math.PI * 2;
    const k = i % 2 ? 1 + amp * (0.6 + 0.4 * rand()) : 1;
    d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rx * k).toFixed(1)},${(cy + Math.sin(a) * ry * k).toFixed(1)}`;
  }
  return d + 'Z';
}

function Eyes({ pose, y, gap }: { pose: Pose; y: number; gap: number }) {
  const xs = [100 - gap, 100 + gap];
  if (pose === 'sleep')
    return <g stroke={FACE} strokeWidth={3.5} strokeLinecap="round" fill="none">{xs.map((x) => <path key={x} d={`M${x - 7} ${y} Q${x} ${y + 6} ${x + 7} ${y}`} />)}</g>;
  if (pose === 'celebrate' || pose === 'sploot')
    return <g stroke={FACE} strokeWidth={4} strokeLinecap="round" fill="none">{xs.map((x) => <path key={x} d={`M${x - 7} ${y + 3} Q${x} ${y - 7} ${x + 7} ${y + 3}`} />)}</g>;
  const [lx, ly] = pose === 'peek' ? [2.5, -3] : [0, 0];
  return (
    <g>
      {xs.map((x) => (
        <g key={x}>
          <circle cx={x + lx} cy={y + ly} r={6} fill={FACE} />
          <circle cx={x + lx + 2} cy={y + ly - 2} r={1.8} fill="#fff" />
        </g>
      ))}
    </g>
  );
}

function Mouth({ pose, y }: { pose: Pose; y: number }) {
  if (pose === 'celebrate' || pose === 'sploot')
    return (
      <g>
        <path d={`M89 ${y - 2} Q100 ${y + 16} 111 ${y - 2} Z`} fill={FACE} stroke={FACE} strokeWidth={2} strokeLinejoin="round" />
        <ellipse cx={100} cy={y + 8} rx={5.5} ry={4.5} fill="#F2828F" />
      </g>
    );
  if (pose === 'peek' || pose === 'sleep') return <path d={`M95 ${y} Q100 ${y + 3} 105 ${y}`} stroke={FACE} strokeWidth={3} fill="none" strokeLinecap="round" />;
  return <path d={`M92 ${y - 2} Q100 ${y + 5} 108 ${y - 2}`} stroke={FACE} strokeWidth={3} fill="none" strokeLinecap="round" />;
}

function Zzz() {
  return (
    <g fill="#4A5C4F" fontFamily="ui-rounded, sans-serif" fontWeight={800}>
      <text x={152} y={56} fontSize={22}>z</text>
      <text x={166} y={40} fontSize={16}>z</text>
      <text x={176} y={28} fontSize={11}>z</text>
    </g>
  );
}

/** Four-point stars, flat yellow. */
function Sparkles() {
  const star = (x: number, y: number, r: number) => `M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r} Z`;
  return (
    <g fill="#F6C945">
      <path d={star(24, 54, 12)} />
      <path d={star(176, 40, 9)} />
      <path d={star(168, 92, 6)} />
    </g>
  );
}

/** Front paws for the sploot (head resting on them). */
function Paws({ color }: { color: string }) {
  return (
    <g fill={color}>
      <rect x={60} y={176} width={34} height={30} rx={15} />
      <rect x={106} y={176} width={34} height={30} rx={15} />
    </g>
  );
}

/** Daisy: red-and-white Pembroke corgi. Huge ears, white blaze, muzzle and chest. */
export function CorgiArt({ pose, size = 160 }: { pose: Pose; size?: number }) {
  const C = '#E4893D', W = '#FFF6E9', P = '#F8C9A8';
  const drop = pose === 'sploot' ? 16 : 0;
  const earTilt = pose === 'sleep' ? 'rotate(-8 70 84)' : undefined;
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden="true">
      {pose === 'celebrate' && <Sparkles />}
      <path d="M38 204 L52 152 Q100 134 148 152 L162 204 Z" fill={C} />
      <path d="M70 204 L100 148 L130 204 Z" fill={W} />
      <g transform={`translate(0 ${drop})`}>
        <Mirror>
          <g transform={earTilt}>
            <path d="M48 100 L36 18 L96 62 Z" fill={C} stroke={C} strokeWidth={10} strokeLinejoin="round" />
            <path d="M56 86 L48 38 L84 64 Z" fill={P} stroke={P} strokeWidth={6} strokeLinejoin="round" />
          </g>
        </Mirror>
        <path d="M100 58 L150 78 L156 116 L120 152 L80 152 L44 116 L50 78 Z" fill={C} stroke={C} strokeWidth={14} strokeLinejoin="round" />
        <path d="M100 58 L150 78 L156 116 L120 152 L100 152 Z" fill="#7A3B0A" opacity={0.08} />
        <path d="M100 92 L124 128 L110 154 L90 154 L76 128 Z" fill={W} stroke={W} strokeWidth={8} strokeLinejoin="round" />
        <path d="M100 60 L100 92" stroke={W} strokeWidth={5} strokeLinecap="round" />
        <Eyes pose={pose} y={104} gap={20} />
        <path d="M91 124 L109 124 L100 133 Z" fill={FACE} stroke={FACE} strokeWidth={7} strokeLinejoin="round" />
        <Mouth pose={pose} y={142} />
      </g>
      {pose === 'sploot' && <Paws color={W} />}
      {pose === 'sleep' && <Zzz />}
    </svg>
  );
}

/**
 * Eddie: blonde, wiry corgi-terrier mix. Ears that lean outward, a golden stripe down his nose,
 * scruffy brows and a beard. `earSpread` and `scruff` (0–1) default to EDDIE_STYLE.
 */
export function TerrierCorgiArt({ pose, size = 160, earSpread = EDDIE_STYLE.earSpread, scruff = EDDIE_STYLE.scruff }: { pose: Pose; size?: number; earSpread?: number; scruff?: number }) {
  const C = '#DDBA7C', G = '#E9CB8F', W = '#F6ECD6', P = '#F2C3B2';
  const e = earSpread, s = scruff;
  const drop = pose === 'sploot' ? 16 : 0;
  const earTransform = `translate(${-12 * e} ${6 * e}) rotate(${-24 * e - (pose === 'sleep' ? 8 : 0)} 76 86)`;

  // Wisps at the ear tip and along the ear's outer edge.
  const wispCount = 2 + Math.round(s * 3);
  const tipWisps = Array.from({ length: wispCount }, (_, i) => {
    const a = ((-150 + (90 * i) / (wispCount - 1)) * Math.PI) / 180;
    const len = 8 + 7 * s;
    return `M56 26 L${(56 + Math.cos(a) * len).toFixed(1)} ${(26 + Math.sin(a) * len).toFixed(1)}`;
  }).join(' ');
  const edgeTufts = s > 0.3
    ? [0.3, 0.55, 0.8].map((t) => {
        const x = 60 - 4 * t, y = 96 - 70 * t, out = 6 + 9 * s;
        return `M${x + 1} ${y - 5} L${x - out} ${y - 2} L${x + 1} ${y + 4} Z`;
      }).join(' ')
    : '';
  // Spiky cheek fur sticking out sideways (drawn behind the head).
  const cheekCount = 2 + Math.round(s * 2);
  let cheek = 'M50 98';
  for (let i = 0; i < cheekCount; i++) {
    const y0 = 98 + (i * 44) / cheekCount, y1 = 98 + ((i + 1) * 44) / cheekCount;
    cheek += ` L${(46 - 6 - 14 * s).toFixed(1)} ${((y0 + y1) / 2 + 3).toFixed(1)} L50 ${y1.toFixed(1)}`;
  }
  cheek += ' L60 142 L60 98 Z';
  // Top-of-head tuft.
  const h = 8 + 16 * s;
  const topTuft = `M82 62 L86 ${60 - h} L93 ${58 - h * 0.4} L99 ${56 - h * 1.1} L106 ${58 - h * 0.45} L113 ${60 - h * 0.85} L118 62 Z`;
  // Scruffy brow tuft (left side; mirrored).
  const b = 4 + 8 * s;
  const brow = `M66 96 L68 ${90 - b} L74 ${93 - b * 0.4} L78 ${88 - b} L84 ${92 - b * 0.4} L90 ${89 - b * 0.6} L89 96 Z`;
  // Chest with a zig-zag top edge.
  let chest = 'M38 204 L50 156';
  for (let i = 0; i <= 12; i++) chest += ` L${50 + (i * 100) / 12} ${i % 2 ? 150 - (2 + 8 * s) : 154}`;
  chest += ' L162 204 Z';

  return (
    <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden="true">
      {pose === 'celebrate' && <Sparkles />}
      <path d={chest} fill={C} />
      <path d="M74 204 L84 160 L92 166 L100 156 L108 166 L116 160 L126 204 Z" fill={W} />
      <g transform={`translate(0 ${drop})`}>
        <Mirror>
          <g transform={earTransform}>
            <path d="M60 96 L56 26 L94 62 Z" fill={C} stroke={C} strokeWidth={8} strokeLinejoin="round" />
            <path d="M64 82 L61 42 L84 64 Z" fill={P} stroke={P} strokeWidth={5} strokeLinejoin="round" />
            <path d={tipWisps} stroke={C} strokeWidth={4} strokeLinecap="round" />
            {edgeTufts && <path d={edgeTufts} fill={C} />}
            <path d="M68 80 L64 60 M73 78 L72 64" stroke={W} strokeWidth={2.5} strokeLinecap="round" />
          </g>
          <path d={cheek} fill={C} stroke={C} strokeWidth={3} strokeLinejoin="round" />
        </Mirror>
        <path d={zig(100, 104, 56, 52, Math.round(16 + s * 8), 0.08 + s * 0.12, 6)} fill={C} stroke={C} strokeWidth={4} strokeLinejoin="round" />
        {s > 0 && <path d={topTuft} fill={C} stroke={C} strokeWidth={3} strokeLinejoin="round" />}
        <path d={zig(100, 150 + 3 * s, 26 + 4 * s, 20 + 8 * s, 9 + Math.round(s * 4), 0.3 + 0.2 * s, 2)} fill={W} stroke={W} strokeWidth={3} strokeLinejoin="round" />
        <path d={zig(100, 128, 32, 20, 12, 0.14 + 0.1 * s, 8)} fill={W} stroke={W} strokeWidth={3} strokeLinejoin="round" />
        <rect x={91} y={80} width={18} height={40} rx={9} fill={G} />
        <Mirror>
          <path d={brow} fill={W} stroke={W} strokeWidth={2} strokeLinejoin="round" />
        </Mirror>
        <Eyes pose={pose} y={104} gap={20} />
        <rect x={87} y={117} width={26} height={16} rx={8} fill={FACE} />
        <Mouth pose={pose} y={142} />
      </g>
      {pose === 'sploot' && <Paws color={W} />}
      {pose === 'sleep' && <Zzz />}
    </svg>
  );
}

export function DogArt({ dog, pose, size = 160 }: { dog: DogConfig; pose: Pose; size?: number }) {
  const img = dog.images?.[pose] ?? (pose === 'sploot' ? dog.images?.celebrate : undefined);
  if (img) return <img src={import.meta.env.BASE_URL + img} width={size} height={size} alt="" draggable={false} style={{ objectFit: 'contain' }} />;
  return dog.art === 'corgi' ? <CorgiArt pose={pose} size={size} /> : <TerrierCorgiArt pose={pose} size={size} />;
}

/**
 * Patina, the grandkitty, in the same flat style as Daisy and Eddie: a long-haired tortoiseshell
 * sitting up. Dark fur with ginger patches, a ginger blaze down one side of her face, yellow-green
 * eyes, small rounded ears, long-hair cheeks and ruff, a light ginger chest, one paw with ginger
 * toes, and a plumed tail with a ginger tip.
 */
export function PatinaArt({ size = 120 }: { size?: number }) {
  const K = '#2B2320', B = '#4A3A32', G = '#D08A45', GL = '#E8B67A', P = '#C79A92', E = '#C9D36A', LEG = '#231C19';
  // Long-hair tufts along her sides (left side; mirrored).
  let side = 'M60 176';
  for (let i = 0; i < 5; i++) side += ` L${46 - (i % 2) * 2} ${186 + i * 13} L58 ${192 + i * 13}`;
  side += ' L64 176 Z';
  // Fluffy cheek fur sticking out sideways (left side; mirrored).
  const cheek = 'M56 96 L36 102 L52 110 L32 118 L52 124 L38 134 L58 136 L62 100 Z';
  return (
    <svg viewBox="0 34 200 230" width={size} height={size * 1.15} aria-hidden="true">
      {/* plumed tail curled round the front, ginger tip */}
      <path d="M140 250 Q186 254 184 214 Q183 200 172 194" stroke={B} strokeWidth={18} strokeLinecap="round" fill="none" />
      <path d="M180 208 Q180 198 172 194" stroke={G} strokeWidth={18} strokeLinecap="round" fill="none" />

      {/* sitting body with long-hair sides and tortie patches */}
      <Mirror><path d={side} fill={K} stroke={K} strokeWidth={3} strokeLinejoin="round" /></Mirror>
      <path d="M70 150 L56 182 L52 252 L148 252 L144 182 L130 150 Z" fill={K} stroke={K} strokeWidth={10} strokeLinejoin="round" />
      <path d="M120 186 L146 196 L148 252 L114 252 Z" fill={B} />
      <path d="M56 186 L72 172 L80 198 L58 220 Z" fill={G} stroke={G} strokeWidth={3} strokeLinejoin="round" />
      <path d="M128 214 L146 222 L146 248 L124 242 Z" fill={G} stroke={G} strokeWidth={3} strokeLinejoin="round" />
      <path d="M60 232 L72 238 L66 250 L56 248 Z" fill={B} />

      {/* light ginger chest fluff */}
      <path d="M82 150 L90 160 L100 150 L110 160 L118 150 L114 192 L100 204 L86 192 Z" fill={GL} stroke={GL} strokeWidth={3} strokeLinejoin="round" />
      <path d="M98 162 L104 166 L101 192 L96 186 Z" fill={G} />

      {/* front legs and paws, one with ginger toes */}
      <path d="M82 196 L80 250 L98 250 L98 202 Z" fill={LEG} stroke={LEG} strokeWidth={4} strokeLinejoin="round" />
      <path d="M102 202 L102 250 L120 250 L118 196 Z" fill={LEG} stroke={LEG} strokeWidth={4} strokeLinejoin="round" />
      <rect x={76} y={244} width={25} height={14} rx={7} fill={LEG} />
      <rect x={100} y={244} width={25} height={14} rx={7} fill={LEG} />
      <rect x={78} y={249} width={8} height={8} rx={4} fill={GL} />
      <rect x={87} y={250} width={8} height={7} rx={3.5} fill={GL} />

      {/* ruff behind the head */}
      <path d={zig(100, 128, 60, 30, 16, 0.18, 21)} fill={B} />
      <Mirror>
        {/* small, rounded ears */}
        <path d="M60 88 Q55 48 64 42 Q82 50 94 68 Z" fill={K} stroke={K} strokeWidth={8} strokeLinejoin="round" />
        <path d="M66 80 Q62 58 68 52 Q80 58 87 70 Z" fill={P} stroke={P} strokeWidth={3} strokeLinejoin="round" />
        <path d="M69 76 L67 60 M74 74 L74 63" stroke="#E6D3C6" strokeWidth={2} strokeLinecap="round" />
        <path d={cheek} fill={K} stroke={K} strokeWidth={3} strokeLinejoin="round" />
      </Mirror>
      {/* head */}
      <path d="M100 62 L140 74 L152 106 L136 138 L100 150 L64 138 L48 106 L60 74 Z" fill={K} stroke={K} strokeWidth={12} strokeLinejoin="round" />
      <path d="M100 62 L140 74 L152 106 L136 138 L100 150 Z" fill="#000" opacity={0.1} />
      {/* her split face: ginger blaze down one side of the nose, a few flecks on the other cheek */}
      <path d="M97 64 L107 66 L101 102 L96 124 L86 122 L92 98 Z" fill={G} stroke={G} strokeWidth={4} strokeLinejoin="round" />
      <path d="M99 72 L101 74 L97 100 L95 98 Z" fill={GL} />
      <path d="M126 118 L134 114 L132 122 Z M118 128 L124 126 L122 132 Z" fill={G} />
      <path d="M68 126 L74 132 L66 134 Z" fill={B} />
      {/* yellow-green eyes with slit pupils */}
      <Mirror>
        <path d="M67 104 Q80 91 93 104 Q80 115 67 104 Z" fill={E} />
        <ellipse cx={80} cy={104} rx={3} ry={7.5} fill="#15100C" />
        <circle cx={83} cy={100} r={2.2} fill="#fff" />
        <path d="M88 132 L62 126 M88 136 L62 140" stroke="#CFC4BA" strokeWidth={1.4} strokeLinecap="round" opacity={0.8} />
      </Mirror>
      {/* nose and a small smile */}
      <path d="M94 122 L106 122 L100 129 Z" fill="#A06A66" stroke="#A06A66" strokeWidth={4} strokeLinejoin="round" />
      <path d="M100 130 Q96 136 91 133 M100 130 Q104 136 109 133" stroke="#5E4A44" strokeWidth={2.2} fill="none" strokeLinecap="round" />
    </svg>
  );
}

/**
 * A shaggy black wolf, side-on with his head turned toward her, in the same flat style as the
 * others. `raised` lifts one front paw straight up in a quiet salute.
 */
export function WolfArt({ size = 160, raised = false }: { size?: number; raised?: boolean }) {
  const K = '#1E1E23', B = '#34343C', H = '#4A4A54';
  return (
    <svg viewBox="0 0 220 200" width={size} height={size * (200 / 220)} aria-hidden="true">
      <ellipse cx={104} cy={190} rx={74} ry={6} fill="#000" opacity={0.12} />
      {/* bushy tail */}
      <path d="M66 110 L40 114 L12 128 L28 118 L6 116 L30 108 L14 98 L42 102 Z" fill={K} stroke={K} strokeWidth={3} strokeLinejoin="round" />
      {/* hind legs with shaggy thighs */}
      <path d="M66 124 L56 186 L65 186 L78 130 Z" fill={K} stroke={K} strokeWidth={3} strokeLinejoin="round" />
      <path d="M84 126 L84 186 L93 186 L96 128 Z" fill={K} stroke={K} strokeWidth={3} strokeLinejoin="round" />
      <path d={zig(78, 120, 20, 16, 8, 0.28, 31)} fill={K} />
      {/* front standing leg */}
      <path d="M126 126 L126 186 L135 186 L140 128 Z" fill={K} stroke={K} strokeWidth={3} strokeLinejoin="round" />
      {/* shaggy body */}
      <path d={zig(105, 113, 50, 19, 24, 0.17, 4)} fill={K} />
      <path d="M78 104 l10 -4 M96 100 l10 -3 M112 102 l9 -2 M88 122 l10 1 M106 124 l10 0" stroke={H} strokeWidth={2} strokeLinecap="round" />
      {/* the other front leg: down while walking, straight up in a salute */}
      {raised ? (
        <g>
          <path d="M146 116 L158 100 L184 56 L194 24 L206 28 L198 60 L168 118 Z" fill={K} stroke={K} strokeWidth={3} strokeLinejoin="round" />
          <path d={zig(180, 72, 8, 20, 7, 0.35, 41)} fill={K} transform="rotate(28 180 72)" />
          <circle cx={200} cy={20} r={9} fill={K} />
        </g>
      ) : (
        <path d="M144 120 L146 186 L155 186 L158 118 Z" fill={K} stroke={K} strokeWidth={3} strokeLinejoin="round" />
      )}
      {/* neck ruff */}
      <path d={zig(146, 100, 22, 22, 12, 0.26, 7)} fill={K} />
      {/* head turned toward her: pointed ears, pale eyes */}
      <path d="M133 72 L130 50 L144 64 Z M157 64 L170 49 L166 72 Z" fill={K} stroke={K} strokeWidth={4} strokeLinejoin="round" />
      <path d="M134 66 L162 64 L168 80 L160 98 L148 104 L136 98 L130 82 Z" fill={K} stroke={K} strokeWidth={6} strokeLinejoin="round" />
      <path d="M134 66 L162 64 L168 80 L160 98 L148 104 Z" fill={B} opacity={0.35} />
      <path d="M142 86 L154 86 L152 99 L144 99 Z" fill={B} stroke={B} strokeWidth={3} strokeLinejoin="round" />
      <ellipse cx={140.5} cy={79} rx={3.4} ry={2.6} fill="#E9E6DA" />
      <ellipse cx={156.5} cy={78} rx={3.4} ry={2.6} fill="#E9E6DA" />
      <circle cx={141} cy={79} r={1.1} fill={K} />
      <circle cx={157} cy={78} r={1.1} fill={K} />
      <ellipse cx={148} cy={96} rx={3.4} ry={2.4} fill="#0A0A0C" />
    </svg>
  );
}

/** Side-on raccoon tiptoeing (facing right). */
export function RaccoonArt({ size = 120 }: { size?: number }) {
  return (
    <svg viewBox="0 0 160 100" width={size} height={size * 0.625} aria-hidden="true">
      {/* ringed tail */}
      <g transform="rotate(-20 40 60)">
        <ellipse cx={24} cy={58} rx={26} ry={11} fill="#8E8E93" />
        {[8, 20, 32].map((x) => <rect key={x} x={x} y={47} width={6} height={22} fill="#3A3A3C" rx={2} />)}
      </g>
      <ellipse cx={78} cy={62} rx={34} ry={22} fill="#9A9AA0" />
      {/* tiptoe legs */}
      {[58, 70, 88, 100].map((x, i) => <rect key={x} x={x} y={74} width={7} height={18 - (i % 2) * 4} rx={3} fill="#3A3A3C" />)}
      {/* head */}
      <ellipse cx={116} cy={48} rx={22} ry={18} fill="#A8A8AE" />
      <path d="M100 36 L104 22 L112 34 Z M120 32 L128 20 L132 36 Z" fill="#6E6E73" />
      <path d="M98 48 Q116 36 136 46 Q132 56 116 52 Q104 58 98 48 Z" fill="#2C2C2E" />
      <circle cx={110} cy={47} r={3} fill="#fff" />
      <circle cx={126} cy={46} r={3} fill="#fff" />
      <ellipse cx={139} cy={54} rx={5} ry={4} fill={INK} />
      <path d="M128 62 Q134 64 138 60" stroke={INK} strokeWidth={2} fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function OwlArt({ size = 110 }: { size?: number }) {
  return (
    <svg viewBox="0 0 120 140" width={size} height={size * 1.17} aria-hidden="true">
      <path d="M98 14 a14 14 0 1 0 10 22 a11 11 0 1 1 -10 -22 z" fill="#F6D56B" />
      <path d="M26 30 L36 50 L48 40 Z M94 30 L84 50 L72 40 Z" fill="#7A5534" />
      <ellipse cx={60} cy={84} rx={38} ry={46} fill="#9C6B43" />
      <ellipse cx={60} cy={98} rx={24} ry={28} fill="#E8D3B0" />
      <path d="M48 92 q4 4 8 0 M64 92 q4 4 8 0 M52 104 q4 4 8 0 M60 112 q4 4 8 0" stroke="#B08A60" strokeWidth={2} fill="none" />
      <circle cx={44} cy={60} r={15} fill="#FFF9EC" />
      <circle cx={76} cy={60} r={15} fill="#FFF9EC" />
      <circle cx={44} cy={60} r={7} fill={INK} />
      <circle cx={76} cy={60} r={7} fill={INK} />
      <circle cx={46.5} cy={57.5} r={2.2} fill="#fff" />
      <circle cx={78.5} cy={57.5} r={2.2} fill="#fff" />
      <path d="M55 70 L60 80 L65 70 Z" fill="#F2A33A" />
      <path d="M22 84 Q14 104 30 118 Q30 96 22 84 Z M98 84 Q106 104 90 118 Q90 96 98 84 Z" fill="#7A5534" />
      <path d="M44 128 l-4 6 M50 128 l0 7 M70 128 l0 7 M76 128 l4 6" stroke="#F2A33A" strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}

/** A daisy. `bloom` false shows a closed green bud (for milestones not yet reached). */
export function Daisy({ size = 40, bloom = true, petals = 12, className }: { size?: number; bloom?: boolean; petals?: number; className?: string }) {
  if (!bloom)
    return (
      <svg viewBox="0 0 40 40" width={size} height={size} className={className} aria-hidden="true">
        <circle cx={20} cy={20} r={17} fill="#FFFFFF" stroke="#4E9A62" strokeWidth={2.5} strokeDasharray="4 4" />
        <path d="M20 28 Q14 20 20 11 Q26 20 20 28 Z" fill="#7FBF7F" />
      </svg>
    );
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className={className} aria-hidden="true">
      {Array.from({ length: petals }, (_, i) => (
        <ellipse key={i} cx={20} cy={8.5} rx={4} ry={8} fill="#FFFFFF" stroke="#E5DFC8" strokeWidth={0.8} transform={`rotate(${(360 / petals) * i} 20 20)`} />
      ))}
      <circle cx={20} cy={20} r={7} fill="#F6C945" stroke="#D9A520" strokeWidth={1} />
      <circle cx={18} cy={18} r={2} fill="#FBE38A" />
    </svg>
  );
}
