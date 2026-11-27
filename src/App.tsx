/** App shell: tab bar, pushed screens, mascot layer, toasts. */
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { NavContext, type Route, type Tab } from './nav';
import { useQuery, useSettings } from './hooks/useStore';
import { store } from './data';
import { applyTextSize } from './theme/apply';
import { screenChanged } from './mascot/bus';
import { MascotLayer } from './mascot/MascotLayer';
import { ToastHost } from './components/Toast';
import { HomeTab } from './screens/HomeTab';
import { ExercisesTab } from './screens/ExercisesTab';
import { ProgressTab } from './screens/ProgressTab';
import { SettingsTab } from './screens/SettingsTab';
import { WorkoutScreen } from './screens/WorkoutScreen';
import { ExerciseDetail } from './screens/ExerciseDetail';
import { HistoryScreen } from './screens/HistoryScreen';
import { FeedbackScreen } from './screens/FeedbackScreen';
import { Onboarding } from './screens/Onboarding';
import { Daisy } from './theme/mascots/art';

const TABS: Array<{ id: Tab; label: string; icon: string }> = [
  { id: 'home', label: 'Today', icon: '🏡' },
  { id: 'exercises', label: 'Exercises', icon: '💪' },
  { id: 'progress', label: 'Progress', icon: '📈' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function App() {
  const settings = useSettings();
  const loaded = useQuery(() => store.getSettings().then(() => true));
  const [tab, setTab] = useState<Tab>('home');
  const [stack, setStack] = useState<Route[]>([]);

  useEffect(() => applyTextSize(settings.textSize), [settings.textSize]);
  const top = stack[stack.length - 1];
  useEffect(() => screenChanged(top?.name ?? tab), [tab, top]);

  const nav = useMemo(
    () => ({
      tab,
      setTab: (t: Tab) => { setStack([]); setTab(t); },
      stack,
      push: (r: Route) => setStack((s) => [...s, r]),
      pop: () => setStack((s) => s.slice(0, -1)),
    }),
    [tab, stack],
  );

  if (!loaded) return <div className="grid h-full place-items-center"><Daisy size={80} /></div>;

  return (
    <MotionConfig reducedMotion={settings.reduceMotion ? 'always' : 'user'}>
      <NavContext.Provider value={nav}>
        {!settings.onboarded ? (
          <Onboarding />
        ) : (
          <div className="relative flex h-full flex-col">
            <main className="relative min-h-0 flex-1" aria-hidden={!!top}>
              {tab === 'home' && <HomeTab />}
              {tab === 'exercises' && <ExercisesTab />}
              {tab === 'progress' && <ProgressTab />}
              {tab === 'settings' && <SettingsTab />}
            </main>
            <nav className="pb-safe relative z-10 border-t border-ink/10 bg-card px-2 pt-1" aria-label="Main">
              <ul className="flex">
                {TABS.map((t) => (
                  <li key={t.id} className="flex-1">
                    <button onClick={() => nav.setTab(t.id)} aria-current={tab === t.id ? 'page' : undefined}
                      className={`flex min-h-16 w-full flex-col items-center justify-center rounded-2xl text-base font-bold ${tab === t.id ? 'bg-primary-soft text-primary-dark' : 'text-ink-soft'}`}>
                      <span className="text-2xl" aria-hidden="true">{t.icon}</span>
                      {t.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            {/* Pushed screens slide over the tabs */}
            <AnimatePresence>
              {stack.map((r, i) => (
                <motion.div key={i + r.name + JSON.stringify(r)} className="absolute inset-0 z-20 bg-cream"
                  initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                  aria-hidden={i < stack.length - 1}>
                  {r.name === 'workout' && <WorkoutScreen workoutId={r.workoutId} />}
                  {r.name === 'exercise' && <ExerciseDetail exerciseId={r.exerciseId} />}
                  {r.name === 'history' && <HistoryScreen />}
                  {r.name === 'feedback' && <FeedbackScreen />}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        <MascotLayer />
        <ToastHost />
      </NavContext.Provider>
    </MotionConfig>
  );
}
