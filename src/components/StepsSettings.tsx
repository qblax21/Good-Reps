/** Settings → "Steps from Apple Health": connect the steps server, set a daily goal. */
import { useState } from 'react';
import { store } from '../data';
import { useSettings, useSteps } from '../hooks/useStore';
import { parseStepsLink, syncSteps, type SyncResult } from '../lib/steps';
import { Button, Card, Stepper } from './ui';
import { toast } from './Toast';
import { updatedText } from './StepsCard';

const problem: Partial<Record<SyncResult, string>> = {
  'wrong-key': 'That link’s key doesn’t match the server. Copy the whole link again.',
  error: 'Couldn’t reach the steps server. Check the link and your internet connection.',
};

export function StepsSettings() {
  const s = useSettings();
  const steps = useSteps() ?? {};
  const [link, setLink] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const connect = async () => {
    const parsed = parseStepsLink(link);
    if (!parsed) { setMsg('That doesn’t look like the steps link. It starts with https:// and ends with ?key=…'); return; }
    setBusy(true);
    const r = await syncSteps({ force: true, link: parsed });
    setBusy(false);
    if (r !== 'ok') { setMsg(problem[r] ?? 'Something went wrong. Try again.'); return; }
    await store.updateSettings({ stepsLink: parsed });
    setLink(''); setMsg('');
    toast('Steps connected 👟');
  };

  const refresh = async () => {
    setBusy(true);
    const r = await syncSteps({ force: true });
    setBusy(false);
    toast(r === 'ok' ? 'Steps up to date' : problem[r] ?? 'Couldn’t update right now');
  };

  if (!s.stepsLink)
    return (
      <Card className="flex flex-col gap-3">
        <p className="text-lg">Show your daily steps from the iPhone Health app here. This needs a one-time setup.</p>
        <label htmlFor="steps-link" className="text-base font-bold">Steps link</label>
        <input id="steps-link" type="url" inputMode="url" autoCapitalize="off" autoCorrect="off" spellCheck={false}
          value={link} onChange={(e) => { setLink(e.target.value); setMsg(''); }} placeholder="https://…workers.dev/?key=…"
          className="min-h-12 w-full rounded-2xl border-2 border-ink/15 bg-white px-3 text-lg" />
        {msg && <p className="text-base font-bold text-danger" role="alert">{msg}</p>}
        <Button onClick={connect} disabled={!link.trim() || busy}>{busy ? 'Checking…' : '👟 Connect steps'}</Button>
      </Card>
    );

  const days = Object.keys(steps).length;
  return (
    <Card className="flex flex-col gap-3">
      <p className="text-lg">👟 Connected. {days ? `${days} day${days === 1 ? '' : 's'} of steps so far.` : 'No steps yet.'}</p>
      <p className="text-base text-ink-soft">{updatedText(s.stepsUpdatedAt)}. Your iPhone sends new steps a few times a day.</p>
      <div>
        <p className="mb-1 text-lg font-bold">Daily step goal</p>
        <Stepper label="Daily step goal" value={s.stepGoal} step={500} min={500} max={50000}
          format={(v) => v.toLocaleString()} onChange={(v) => store.updateSettings({ stepGoal: v })} />
      </div>
      <Button kind="secondary" onClick={refresh} disabled={busy}>Check for new steps</Button>
      <Button kind="ghost" onClick={() => store.updateSettings({ stepsLink: null }).then(() => toast('Steps disconnected'))}>Disconnect steps</Button>
    </Card>
  );
}
