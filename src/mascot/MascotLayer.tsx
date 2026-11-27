/**
 * Draws every mascot moment on top of the app: celebration pop-ups, the occasional peek,
 * Patina the cat, the raccoons from next door (Amby, Stu and Cavs), the night owl, and the secret sploot/zoomies.
 * Nothing here ever blocks the screen — only the mascot itself catches taps.
 */
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { dogs, otherDog, type DogConfig, type Pose } from '../theme/mascots/dogs';
import { DogArt, OwlArt, PatinaArt, RaccoonArt, WolfArt } from '../theme/mascots/art';
import { mascotTiming as T, person } from '../theme/config';
import { showLines, sometimes } from '../theme/catchphrases';
import { catFinishLines, catLines, fill, nightOwlLines, pick, raccoonVisit } from '../theme/messages';
import { claimOwlNight, onCheer, onEgg, onScreen, mascotTapped, readFlag, writeFlag, type Cheer } from './bus';
import { useSettings } from '../hooks/useStore';
import { store } from '../data';
import { dayKey } from '../logic/stats';

/** Each dog's show-catchphrase lines. */
const showFor = (dog: DogConfig) => (dog.id === 'dog-a' ? showLines.daisy : showLines.eddie);

let turn = 0;
/** Alternate between the dogs for each moment. */
export const nextDog = (): DogConfig => dogs[turn++ % dogs.length];

interface Popup { id: number; dog: DogConfig; pose: Pose; line: string }

const TAB_BAR = 'calc(5.25rem + env(safe-area-inset-bottom))';

export function MascotLayer() {
  const settings = useSettings();
  const systemReduced = useReducedMotion();
  const calm = settings.reduceMotion || !!systemReduced;
  // Calm mode / iOS Reduce Motion only softens the animations; the Surprise visitors toggle turns them off.
  const eggsOn = settings.easterEggs;

  const [queue, setQueue] = useState<Popup[]>([]);
  const [peek, setPeek] = useState<DogConfig | null>(null);
  const [raccoon, setRaccoon] = useState<{ line: string; count: number } | null>(null);
  const [owl, setOwl] = useState<string | null>(null);
  const [cat, setCat] = useState<string | null>(null);
  // The wolf walks up, raises a paw, then heads off into the distance.
  const [wolf, setWolf] = useState<'walk' | 'salute' | 'away' | null>(null);
  const [trick, setTrick] = useState<{ dog: DogConfig; kind: 'sploot' | 'zoomies'; line: string } | null>(null);
  const lastPeek = useRef(0);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const show = useCallback((dog: DogConfig, pose: Pose, line: string) => {
    setQueue((q) => [...q, { id: Date.now() + Math.random(), dog, pose, line }]);
  }, []);

  // Celebration pop-ups
  useEffect(
    () =>
      onCheer((c: Cheer) => {
        const dog = nextDog();
        const vars = { name: person.name, dog: dog.name, other: otherDog(dog).name, ...c.vars };
        const pose: Pose = c.event === 'hello' ? 'popup' : 'celebrate';
        show(dog, pose, fill(pick(sometimes(dog.lines[c.event], showFor(dog)[c.event])), vars));
        // Reaching a goal sometimes earns a salute from the wolf.
        if (c.event === 'goal' && settingsRef.current.easterEggs && Math.random() < T.wolfAfterGoalChance)
          setTimeout(() => setWolf('walk'), T.popupVisibleMs + 1200);
        // Now and then Patina wanders in after the dogs are done celebrating.
        if (c.event === 'finish' && settingsRef.current.easterEggs && Math.random() < T.catAfterWorkoutChance)
          setTimeout(() => setCat(pick(sometimes(catFinishLines, showLines.patina.afterWorkout))), T.popupVisibleMs + 800);
      }),
    [show],
  );

  // Auto-dismiss the current pop-up
  const current = queue[0];
  useEffect(() => {
    if (!current) return;
    const t = setTimeout(() => setQueue((q) => q.slice(1)), Math.max(T.popupVisibleMs, current.line.length * 55));
    return () => clearTimeout(t);
  }, [current]);

  // Occasional peek when switching screens
  useEffect(
    () =>
      onScreen(() => {
        if (!eggsOn || peek || Date.now() - lastPeek.current < T.peekMinGapMs || Math.random() > T.peekChance) return;
        lastPeek.current = Date.now();
        setTimeout(() => setPeek(dogs[Math.floor(Math.random() * dogs.length)]), 900);
      }),
    [eggsOn, peek],
  );
  useEffect(() => {
    if (!peek) return;
    const t = setTimeout(() => setPeek(null), 2600);
    return () => clearTimeout(t);
  }, [peek]);

  // Visitors that may drop by when she opens the app or comes back to it (iPhone keeps the app
  // running in the background, so "coming back" is the usual way in):
  //   raccoon — at most once a day, a little while later
  //   owl     — at night, at most once a night
  useEffect(() => {
    if (!eggsOn) return;
    const timers: number[] = [];
    const visit = async () => {
      if (document.visibilityState !== 'visible') return;
      const now = new Date();
      const today = dayKey(now);
      const s = await store.getSettings();
      if (s.lastRaccoonDay !== today && Math.random() < T.raccoonChance) {
        await store.updateSettings({ lastRaccoonDay: today });
        timers.push(window.setTimeout(() => setRaccoon(raccoonVisit()), 6000 + Math.random() * 12000));
      }
      if (claimOwlNight(T.nightOwl, now)) timers.push(window.setTimeout(() => setOwl(pick(sometimes(nightOwlLines, showLines.owl))), 2500));
      if (readFlag('wolf-day') !== today && Math.random() < T.wolfChance) {
        writeFlag('wolf-day', today);
        timers.push(window.setTimeout(() => setWolf('walk'), 15000 + Math.random() * 20000));
      }
      if (readFlag('patina-day') !== today && Math.random() < T.catChance) {
        writeFlag('patina-day', today);
        timers.push(window.setTimeout(() => setCat(pick(sometimes(catLines, showLines.patina.visit))), 10000 + Math.random() * 20000));
      }
    };
    visit();
    document.addEventListener('visibilitychange', visit);
    return () => {
      document.removeEventListener('visibilitychange', visit);
      timers.forEach(clearTimeout);
    };
  }, [eggsOn]);

  // Owl + secret tricks
  useEffect(
    () =>
      onEgg((e) => {
        if (e.kind === 'owl') setOwl(pick(sometimes(nightOwlLines, showLines.owl)));
        if (e.kind === 'raccoon') setRaccoon(raccoonVisit());
        if (e.kind === 'wolf') setWolf('walk');
        if (e.kind === 'patina') setCat(pick(sometimes(catLines, showLines.patina.visit)));
        if (e.kind === 'peek') setPeek(dogs[Math.floor(Math.random() * dogs.length)]);
        if (e.kind === 'secret') {
          const dog = dogs.find((d) => d.id === e.dogId) ?? dogs[0];
          const line = pick(dog.lines.secret);
          if (calm) show(dog, 'celebrate', line);
          else setTrick({ dog, kind: dog.secret, line });
        }
      }),
    [calm, eggsOn, show],
  );
  useEffect(() => {
    if (!wolf) return;
    const next = { walk: 'salute', salute: 'away', away: null } as const;
    const wait = { walk: calm ? 500 : 2300, salute: 2400, away: calm ? 400 : 1700 }[wolf];
    const t = setTimeout(() => setWolf(next[wolf]), wait);
    return () => clearTimeout(t);
  }, [wolf, calm]);
  useEffect(() => {
    if (!cat) return;
    const t = setTimeout(() => setCat(null), Math.max(5000, cat.length * 60));
    return () => clearTimeout(t);
  }, [cat]);
  useEffect(() => {
    if (!owl) return;
    const t = setTimeout(() => setOwl(null), Math.max(3500, owl.length * 60));
    return () => clearTimeout(t);
  }, [owl]);
  useEffect(() => {
    if (!trick) return;
    const t = setTimeout(() => setTrick(null), 2200);
    return () => clearTimeout(t);
  }, [trick]);

  const spring = calm ? { duration: 0.2 } : { type: 'spring' as const, stiffness: 520, damping: 17 };

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden" aria-live="polite">
      {/* Celebration pop-up */}
      <AnimatePresence>
        {current && (
          <motion.button
            key={current.id}
            className="pointer-events-auto absolute right-3 flex flex-col items-end"
            style={{ bottom: TAB_BAR }}
            initial={calm ? { opacity: 0 } : { y: 220, rotate: -8 }}
            animate={calm ? { opacity: 1 } : { y: 0, rotate: [0, -4, 4, 0] }}
            exit={calm ? { opacity: 0 } : { y: 240, transition: { duration: 0.25 } }}
            transition={spring}
            onClick={() => setQueue((q) => q.slice(1))}
            aria-label={`${current.dog.name} says: ${current.line} Tap to close.`}
          >
            <Bubble>{current.line}</Bubble>
            <motion.div animate={calm ? {} : { y: [0, -14, 0] }} transition={{ repeat: 2, duration: 0.45, delay: 0.35 }}>
              <DogArt dog={current.dog} pose={current.pose} size={130} />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Peek over the tab bar edge */}
      <div className="absolute left-0 right-0 h-24 overflow-hidden" style={{ bottom: TAB_BAR }}>
        <AnimatePresence>
          {peek && (
            <motion.button
              className="pointer-events-auto absolute left-8"
              initial={{ y: 110 }} animate={{ y: 34 }} exit={{ y: 110 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onClick={() => { mascotTapped(peek.id, T.secretTaps); setPeek(null); show(peek, 'popup', fill(pick(sometimes(peek.lines.hello, showFor(peek).hello)), { name: person.name })); }}
              aria-label={`${peek.name} is peeking. Say hi!`}
            >
              <DogArt dog={peek} pose="peek" size={110} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Raccoons sneak across; their line stays put in a bubble so it can be read */}
      <AnimatePresence>
        {raccoon && (
          <motion.div key="raccoon-line" className="absolute left-4" style={{ bottom: `calc(${TAB_BAR} + 6.5rem)` }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} aria-hidden="true">
            <Bubble>{raccoon.line}</Bubble>
          </motion.div>
        )}
        {raccoon && (
          <motion.div
            key="raccoon-walk"
            className="absolute"
            style={{ bottom: `calc(${TAB_BAR} + 0.25rem)` }}
            initial={{ x: raccoon.count > 1 ? -360 : -160 }}
            animate={{ x: typeof window !== 'undefined' ? window.innerWidth + 40 : 500 }}
            onAnimationComplete={() => setRaccoon(null)}
            transition={{ duration: raccoon.count > 1 ? 7.5 : 6, ease: 'linear' }}
            role="img" aria-label={raccoon.line}
          >
            <div className="flex items-end gap-1">
              {Array.from({ length: raccoon.count }, (_, i) => (
                <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.15 }}>
                  <RaccoonArt size={raccoon.count > 1 ? 92 - i * 6 : 110} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Patina strolls in from the right, sits with her for a moment, then leaves */}
      <AnimatePresence>
        {cat && (
          <motion.button
            className="pointer-events-auto absolute right-2 flex items-end gap-1"
            style={{ bottom: `calc(${TAB_BAR} + 0.25rem)` }}
            initial={calm ? { opacity: 0 } : { x: 260 }} animate={calm ? { opacity: 1 } : { x: 0 }} exit={calm ? { opacity: 0 } : { x: 280 }}
            transition={calm ? { duration: 0.2 } : { type: 'tween', duration: 0.9, ease: 'easeOut' }}
            onClick={() => setCat(null)}
            aria-label={`Patina the cat: ${cat}`}
          >
            <Bubble>{cat}</Bubble>
            <span className="shrink-0"><PatinaArt size={110} /></span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* The wolf: walks in from the side, raises a paw to her, then walks off into the distance */}
      <AnimatePresence>
        {wolf && (
          <motion.div
            key="wolf"
            className="absolute left-1/2"
            style={{ bottom: `calc(${TAB_BAR} + 0.5rem)`, marginLeft: -88, originY: 1 }}
            initial={calm ? { opacity: 0 } : { x: -(window.innerWidth / 2 + 200), opacity: 1 }}
            animate={wolf === 'away'
              ? calm ? { opacity: 0 } : { x: 0, y: -60, scale: 0.3, opacity: 0 }
              : { x: 0, y: 0, scale: 1, opacity: 1 }}
            transition={wolf === 'walk' && !calm ? { duration: 2.2, ease: 'linear' } : wolf === 'away' ? { duration: calm ? 0.3 : 1.6, ease: 'easeIn' } : { duration: 0.3 }}
            role="img" aria-label="A wolf walks up, raises a paw to you, and heads off into the distance"
          >
            <motion.div animate={wolf === 'walk' && !calm ? { y: [0, -3, 0] } : { y: 0 }} transition={{ repeat: wolf === 'walk' ? Infinity : 0, duration: 0.35 }}>
              <WolfArt size={176} raised={wolf === 'salute'} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Night owl */}
      <AnimatePresence>
        {owl && (
          <motion.button
            className="pointer-events-auto absolute top-0 left-4 flex items-start gap-1"
            style={{ top: 'calc(env(safe-area-inset-top) + 4rem)' }}
            initial={calm ? { opacity: 0 } : { y: -200 }} animate={calm ? { opacity: 1 } : { y: 0 }} exit={calm ? { opacity: 0 } : { y: -220 }}
            transition={spring}
            onClick={() => setOwl(null)}
            aria-label={`An owl says: ${owl}`}
          >
            <OwlArt size={90} />
            <Bubble tail="left">{owl}</Bubble>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Secret tricks */}
      <AnimatePresence>
        {trick?.kind === 'zoomies' && (
          <motion.div key="zoom" className="absolute" style={{ bottom: '40%' }}
            initial={{ x: -140 }}
            animate={{ x: [-140, window.innerWidth, -140, window.innerWidth], scaleX: [1, 1, -1, -1, 1], rotate: [0, -10, 10, -10] }}
            transition={{ duration: 1.9, ease: 'easeInOut' }}
            role="img" aria-label={`${trick.dog.name} does zoomies!`}>
            <div className="mb-1 text-center text-2xl font-black text-primary">{trick.line}</div>
            <DogArt dog={trick.dog} pose="celebrate" size={120} />
          </motion.div>
        )}
        {trick?.kind === 'sploot' && (
          <motion.div key="sploot" className="absolute left-1/2 -translate-x-1/2" style={{ bottom: TAB_BAR, originY: 1 }}
            initial={{ y: 200 }} animate={{ y: 0, scaleY: [1, 1, 0.55, 0.55], scaleX: [1, 1, 1.45, 1.45] }} exit={{ y: 220 }}
            transition={{ duration: 1, times: [0, 0.4, 0.6, 1] }}
            role="img" aria-label={`${trick.dog.name} does a sploot!`}>
            <div className="mb-1 text-center text-2xl font-black text-primary">{trick.line}</div>
            <DogArt dog={trick.dog} pose="sploot" size={150} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Bubble({ children, tail = 'right' }: { children: React.ReactNode; tail?: 'right' | 'left' }) {
  return (
    <div className={`relative mb-1 max-w-[16rem] rounded-3xl border-2 border-primary/20 bg-card px-4 py-3 text-left text-lg leading-snug font-bold text-ink shadow-lg ${tail === 'left' ? 'mt-6' : ''}`}>
      {children}
      <span className={`absolute h-4 w-4 rotate-45 border-primary/20 bg-card ${tail === 'right' ? '-bottom-2 right-12 border-r-2 border-b-2' : 'top-5 -left-2 border-b-2 border-l-2'}`} />
    </div>
  );
}
