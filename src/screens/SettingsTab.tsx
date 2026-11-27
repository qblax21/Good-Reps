/** Settings, kept short and friendly. Grouped into plain-English cards. */
import { useEffect, useRef, useState } from 'react';
import { store } from '../data';
import type { Backup, Settings } from '../data/types';
import { useSettings, useWorkouts } from '../hooks/useStore';
import { Button, Card, Choices, Header, SectionTitle, Sheet, Toggle } from '../components/ui';
import { toast } from '../components/Toast';
import { exportBackup, parseBackup, summarize } from '../data/backup';
import { seedDemo } from '../data/demo';
import { addToCalendar, enablePush } from '../lib/reminders';
import { pushSupport, isStandalone } from '../lib/platform';
import { DogArt } from '../theme/mascots/art';
import { dogs } from '../theme/mascots/dogs';
import { app } from '../theme/config';
import { InstallGuideSheet } from './Onboarding';
import { cheer, egg } from '../mascot/bus';
import { useNav } from '../nav';
import { StepsSettings } from '../components/StepsSettings';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function SettingsTab() {
  const s = useSettings();
  const nav = useNav();
  const workouts = useWorkouts() ?? [];
  const set = (patch: Partial<Settings>) => store.updateSettings(patch);
  const fileInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Backup | null>(null);
  const [pushMsg, setPushMsg] = useState('');
  const [installOpen, setInstallOpen] = useState(false);
  const [persisted, setPersisted] = useState<boolean | null>(null);
  useEffect(() => { navigator.storage?.persisted?.().then(setPersisted).catch(() => {}); }, []);

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    try {
      setPending(parseBackup(await f.text()));
    } catch (e) {
      toast((e as Error).message);
    }
    if (fileInput.current) fileInput.current.value = '';
  };

  const realWorkouts = workouts.filter((w) => !w.demo && w.endedAt).length;

  return (
    <div className="flex h-full flex-col">
      <Header title="Settings" />
      <div className="scroll-area px-safe flex-1 pb-10">
        <SectionTitle>Text size</SectionTitle>
        <Card>
          <Choices label="Text size" value={s.textSize} onChange={(textSize) => set({ textSize })}
            options={[{ value: 'normal', label: 'A' }, { value: 'large', label: 'A+' }, { value: 'xlarge', label: 'A++' }, { value: 'iphone', label: 'Match iPhone' }]} />
          <p className="mt-2 text-base text-ink-soft">“Match iPhone” follows Settings → Display &amp; Brightness → Text Size.</p>
        </Card>

        <SectionTitle>My workout days</SectionTitle>
        <Card>
          <div className="grid grid-cols-7 gap-1">
            {DAY_NAMES.map((d, n) => {
              const on = s.plannedDays.includes(n);
              return (
                <button key={d} role="checkbox" aria-checked={on} aria-label={d}
                  onClick={() => set({ plannedDays: on ? s.plannedDays.filter((x) => x !== n) : [...s.plannedDays, n].sort() })}
                  className={`min-h-14 rounded-xl border-2 text-base font-bold ${on ? 'border-primary bg-primary text-white' : 'border-primary/30 bg-card text-primary'}`}>
                  {d.slice(0, 2)}
                </button>
              );
            })}
          </div>
          <label className="mt-4 flex items-center gap-3 text-lg font-bold">
            Reminder time
            <input type="time" value={s.reminderTime} onChange={(e) => set({ reminderTime: e.target.value })}
              className="min-h-12 flex-1 rounded-xl border-2 border-ink/15 bg-white px-3 text-xl" />
          </label>
          <Button kind="secondary" className="mt-4 w-full" onClick={() => addToCalendar(s.plannedDays, s.reminderTime)}>
            📅 Add reminders to my Calendar
          </Button>
          <p className="mt-1 text-base text-ink-soft">The most reliable way — your iPhone Calendar will remind you.</p>
          <Button kind="ghost" className="mt-2 w-full" onClick={async () => {
            const r = await enablePush(s.plannedDays, s.reminderTime);
            setPushMsg(r.message);
            if (r.ok) set({ pushEnabled: true });
          }}>
            🔔 Turn on notifications
          </Button>
          {(pushMsg || pushSupport() !== 'yes') && (
            <p className="text-base text-ink-soft">
              {pushMsg || (pushSupport() === 'install-first' ? 'Notifications work once the app is on your Home Screen.' : pushSupport() === 'update-ios' ? 'Notifications need iOS 16.4 or newer.' : '')}
            </p>
          )}
        </Card>

        <SectionTitle>Units</SectionTitle>
        <Card className="flex flex-col gap-3">
          <Choices label="Weight unit" value={s.weightUnit} onChange={(weightUnit) => set({ weightUnit })} options={[{ value: 'lb', label: 'Pounds (lb)' }, { value: 'kg', label: 'Kilos (kg)' }]} />
          <Choices label="Distance unit" value={s.distanceUnit} onChange={(distanceUnit) => set({ distanceUnit })} options={[{ value: 'mi', label: 'Miles' }, { value: 'km', label: 'Kilometres' }]} />
          <p className="text-base text-ink-soft">Changing units doesn’t convert numbers you’ve already logged.</p>
        </Card>

        <SectionTitle>Fun stuff</SectionTitle>
        <Card>
          <Toggle label="Calm mode" hint="Less bouncing and movement" checked={s.reduceMotion} onChange={(reduceMotion) => set({ reduceMotion })} />
          <Toggle label="Surprise visitors" hint="The dogs, Patina the cat, the raccoons from next door and an owl may drop by now and then" checked={s.easterEggs} onChange={(easterEggs) => set({ easterEggs })} />
          <p className="mt-3 text-base font-bold">Call a visitor</p>
          <div className="mt-1 flex flex-wrap gap-2">
            <Button kind="ghost" className="flex-1" onClick={() => egg({ kind: 'patina' })}>🐱 Patina</Button>
            <Button kind="ghost" className="flex-1" onClick={() => egg({ kind: 'raccoon' })}>🦝 Raccoons</Button>
            <Button kind="ghost" className="flex-1" onClick={() => egg({ kind: 'owl' })}>🦉 Owl</Button>
            <Button kind="ghost" className="flex-1" onClick={() => egg({ kind: 'peek' })}>🐶 Peek</Button>
          </div>
        </Card>

        <SectionTitle>Meet the dogs</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {dogs.map((d) => (
            <Card key={d.id} onClick={() => cheer({ event: 'hello' })} label={`${d.name}: ${d.bio}`} className="text-center">
              <div className="flex justify-center"><DogArt dog={d} pose="popup" size={100} /></div>
              <p className="text-xl font-extrabold">{d.name}</p>
              <p className="text-base text-ink-soft">{d.bio}</p>
            </Card>
          ))}
        </div>

        <SectionTitle>Steps from Apple Health</SectionTitle>
        <StepsSettings />

        <SectionTitle>Keep my progress safe</SectionTitle>
        <Card>
          <p className="text-lg">Everything is saved on this phone. A backup is a little file you can keep in Files, iCloud or email to yourself.</p>
          <p className="mt-1 text-base text-ink-soft">Last backup: {s.lastBackupAt ? new Date(s.lastBackupAt).toLocaleDateString() : 'never'}</p>
          <Button className="mt-3 w-full" onClick={() => exportBackup(store).then((r) => r !== 'cancelled' && toast('Backup saved 🌼'))}>💾 Save a backup</Button>
          <Button kind="secondary" className="mt-2 w-full" onClick={() => fileInput.current?.click()}>📂 Restore from a backup</Button>
          <input ref={fileInput} type="file" accept="application/json,.json" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          {persisted === false && <p className="mt-2 text-base text-ink-soft">Tip: open the app from your Home Screen icon so your iPhone keeps your data safe.</p>}
        </Card>

        <SectionTitle>Help</SectionTitle>
        <Card className="flex flex-col gap-2">
          <Button onClick={() => nav.push({ name: 'feedback' })}>💌 Send me a note</Button>
          {!isStandalone() && <Button kind="secondary" onClick={() => setInstallOpen(true)}>📲 How to add to Home Screen</Button>}
          {s.demoMode ? (
            <Button kind="danger" onClick={() => store.clearDemo().then(() => toast('Demo data cleared'))}>Clear demo data</Button>
          ) : (
            <Button kind="ghost" onClick={() => seedDemo(store).then(() => toast('Demo data loaded'))}>
              Load demo data {realWorkouts > 0 ? '(mixes with yours — clear it after)' : ''}
            </Button>
          )}
        </Card>
        <p className="mt-6 text-center text-base text-ink-soft">{app.name} · made with 💛</p>
      </div>

      <Sheet open={!!pending} onClose={() => setPending(null)} title="Restore backup?">
        {pending && (
          <>
            <p className="text-lg">This backup has <b>{summarize(pending)}</b>.</p>
            <p className="mt-2 text-lg">Restoring <b>replaces</b> what’s on this phone now. We’ll save a copy of the current data first, just in case.</p>
            <Button big className="mt-4 w-full" onClick={async () => {
              await exportBackup(store).catch(() => {});
              await store.importAll(pending);
              setPending(null);
              toast('Backup restored 🌼');
            }}>Yes, restore it</Button>
            <Button kind="ghost" className="mt-2 w-full" onClick={() => setPending(null)}>Cancel</Button>
          </>
        )}
      </Sheet>
      <InstallGuideSheet open={installOpen} onClose={() => setInstallOpen(false)} />
    </div>
  );
}
