/** First-run welcome + the illustrated "Add to Home Screen" guide for iPhone Safari. */
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { store } from '../data';
import { useSettings } from '../hooks/useStore';
import { Button, Sheet } from '../components/ui';
import { Daisy, DogArt } from '../theme/mascots/art';
import { dogs } from '../theme/mascots/dogs';
import { app, person } from '../theme/config';
import { isIOS, isStandalone } from '../lib/platform';
import { requestPersistentStorage } from '../lib/pwa';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function Onboarding() {
  const settings = useSettings();
  const needsInstall = isIOS() && !isStandalone();
  const steps = ['welcome', ...(needsInstall ? ['install'] : []), 'days'] as const;
  const [i, setI] = useState(0);
  const step = steps[i];
  const next = () => setI((n) => Math.min(n + 1, steps.length - 1));
  const finish = async () => {
    await requestPersistentStorage();
    await store.updateSettings({ onboarded: true });
  };

  return (
    <div className="pt-safe px-safe pb-safe daisy-dots flex h-full flex-col bg-cream">
      <div className="flex justify-center gap-2 py-2" aria-hidden="true">
        {steps.map((_, n) => <Daisy key={n} size={22} bloom={n <= i} />)}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
          className="scroll-area flex flex-1 flex-col">
          {step === 'welcome' && (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="flex items-end">
                <motion.div initial={{ y: 60 }} animate={{ y: 0 }} transition={{ type: 'spring', delay: 0.2 }}><DogArt dog={dogs[0]} pose="popup" size={140} /></motion.div>
                <motion.div initial={{ y: 60 }} animate={{ y: 0 }} transition={{ type: 'spring', delay: 0.4 }}><DogArt dog={dogs[1]} pose="celebrate" size={140} /></motion.div>
              </div>
              <h1 className="mt-4 text-4xl font-black text-primary">{app.name}</h1>
              <p className="mt-2 text-2xl font-bold">Hi {person.name}! 🌼</p>
              <p className="mt-3 max-w-sm text-xl text-ink-soft">
                Your own little workout buddy. {dogs[0].name} and {dogs[1].name} will cheer you on every step of the way.
              </p>
              {person.giftFrom && <p className="mt-4 text-lg text-ink-soft italic">{person.giftFrom} 💛</p>}
            </div>
          )}
          {step === 'install' && <InstallGuide />}
          {step === 'days' && (
            <div className="flex flex-1 flex-col justify-center">
              <h1 className="text-3xl font-black">Which days do you like to work out?</h1>
              <p className="mt-2 text-xl text-ink-soft">Just a plan — you can change it any time. No pressure!</p>
              <div className="mt-6 grid grid-cols-4 gap-2">
                {DAY_NAMES.map((d, n) => {
                  const on = settings.plannedDays.includes(n);
                  return (
                    <button key={d} role="checkbox" aria-checked={on}
                      onClick={() => store.updateSettings({ plannedDays: on ? settings.plannedDays.filter((x) => x !== n) : [...settings.plannedDays, n].sort() })}
                      className={`min-h-16 rounded-2xl border-2 text-xl font-bold ${on ? 'border-primary bg-primary text-white' : 'border-primary/30 bg-card text-primary'}`}>
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      <div className="flex flex-col gap-2 pt-4">
        {step === 'days' ? (
          <Button big onClick={finish}>All set — let’s go! 🌼</Button>
        ) : step === 'install' ? (
          <>
            <Button big onClick={next}>I did it! (or: maybe later)</Button>
          </>
        ) : (
          <Button big onClick={next}>Let’s get started</Button>
        )}
        {i > 0 && <Button kind="ghost" onClick={() => setI(i - 1)}>Back</Button>}
      </div>
    </div>
  );
}

/** Three illustrated steps: Share → Add to Home Screen → Add. */
export function InstallGuide() {
  return (
    <div>
      <h1 className="text-3xl font-black">Put me on your Home Screen</h1>
      <p className="mt-2 text-lg text-ink-soft">
        It takes 10 seconds. Then I open like a real app — and your progress is kept safe. Use the new icon from now on!
      </p>
      <ol className="mt-4 flex flex-col gap-3">
        <Step n={1} text={<>Tap the <b>Share</b> button at the bottom of Safari (a square with an arrow pointing up).</>}>
          <SafariBar />
        </Step>
        <Step n={2} text={<>Scroll down a little and tap <b>“Add to Home Screen”</b>.</>}>
          <ShareMenu />
        </Step>
        <Step n={3} text={<>Tap <b>Add</b> in the top corner. Look for the daisy icon on your Home Screen!</>}>
          <AddBar />
        </Step>
      </ol>
      <p className="mt-3 text-base text-ink-soft">Don’t see Share at the bottom? Tap the “⋯” or the address bar first, then Share.</p>
    </div>
  );
}

export function InstallGuideSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title="How to install">
      <InstallGuide />
    </Sheet>
  );
}

function Step({ n, text, children }: { n: number; text: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="rounded-3xl bg-card p-3 shadow-sm">
      <div className="flex gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-xl font-black text-white">{n}</span>
        <p className="text-lg leading-snug">{text}</p>
      </div>
      <div className="mt-2" aria-hidden="true">{children}</div>
    </li>
  );
}

const ShareIcon = ({ x, y, s = 1, color = '#0A84FF' }: { x: number; y: number; s?: number; color?: string }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={color} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M-7 -2 h-3 v16 h20 v-16 h-3" />
    <path d="M0 6 v-18 M-5 -7 l5 -5 l5 5" />
  </g>
);

/** Safari's bottom toolbar with the Share button highlighted. */
function SafariBar() {
  return (
    <svg viewBox="0 0 320 70" className="w-full">
      <rect x={2} y={2} width={316} height={66} rx={14} fill="#F2F2F7" stroke="#D1D1D6" />
      <rect x={14} y={10} width={292} height={22} rx={8} fill="#E5E5EA" />
      <text x={160} y={25} textAnchor="middle" fontSize={11} fill="#3A3A3C">🔒 your-app-address</text>
      {[40, 100, 220, 280].map((x) => <circle key={x} cx={x} cy={50} r={5} fill="#AEAEB2" />)}
      <motion.circle cx={160} cy={50} r={17} fill="#F6D56B" animate={{ r: [15, 19, 15] }} transition={{ repeat: Infinity, duration: 1.4 }} />
      <ShareIcon x={160} y={50} s={0.8} />
    </svg>
  );
}

function ShareMenu() {
  const rows = ['Copy', 'Add to Reading List', 'Add Bookmark', 'Add to Home Screen'];
  return (
    <svg viewBox="0 0 320 150" className="w-full">
      <rect x={2} y={2} width={316} height={146} rx={14} fill="#F2F2F7" stroke="#D1D1D6" />
      {rows.map((r, i) => {
        const hl = r === 'Add to Home Screen';
        return (
          <g key={r}>
            <rect x={12} y={10 + i * 34} width={296} height={30} rx={8} fill={hl ? '#F6D56B' : '#FFFFFF'} />
            <text x={24} y={30 + i * 34} fontSize={13} fontWeight={hl ? 800 : 500} fill="#1C1C1E">{r}</text>
            {hl ? (
              <g transform={`translate(288 ${25 + i * 34})`}>
                <rect x={-9} y={-9} width={18} height={18} rx={4} fill="none" stroke="#1C1C1E" strokeWidth={2} />
                <path d="M0 -5 v10 M-5 0 h10" stroke="#1C1C1E" strokeWidth={2} />
              </g>
            ) : (
              <circle cx={288} cy={25 + i * 34} r={6} fill="#D1D1D6" />
            )}
          </g>
        );
      })}
    </svg>
  );
}

function AddBar() {
  return (
    <svg viewBox="0 0 320 90" className="w-full">
      <rect x={2} y={2} width={316} height={86} rx={14} fill="#F2F2F7" stroke="#D1D1D6" />
      <text x={20} y={28} fontSize={14} fill="#0A84FF">Cancel</text>
      <text x={160} y={28} fontSize={14} fontWeight={700} textAnchor="middle" fill="#1C1C1E">Add to Home Screen</text>
      <motion.rect x={262} y={10} width={48} height={26} rx={8} fill="#F6D56B" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 1.4 }} />
      <text x={286} y={28} fontSize={14} fontWeight={800} textAnchor="middle" fill="#0A3D91">Add</text>
      <rect x={20} y={46} width={34} height={34} rx={8} fill="#2B6E46" />
      <g transform="translate(37 63) scale(0.6)">
        {Array.from({ length: 10 }, (_, i) => <ellipse key={i} cx={0} cy={-11} rx={4} ry={9} fill="#fff" transform={`rotate(${i * 36})`} />)}
        <circle r={6} fill="#F6C945" />
      </g>
      <text x={66} y={68} fontSize={14} fill="#1C1C1E">{app.name}</text>
    </svg>
  );
}
