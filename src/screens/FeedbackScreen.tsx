/**
 * "Send a note": Mom types what's not working or what she'd like, and it goes to you.
 *
 * How it's delivered (set in src/theme/config.ts → feedback):
 *   - phone set → opens Messages with the note filled in and addressed to you (one tap to send)
 *   - email set → opens Mail the same way
 *   - neither   → opens the iPhone share sheet so she picks Messages and you
 * App details (version, iOS, installed or not) are added at the bottom so a fix can be found fast.
 * If she backs out without sending, her note stays put.
 */
import { useState } from 'react';
import { useNav } from '../nav';
import { Button, Choices, Header } from '../components/ui';
import { toast } from '../components/Toast';
import { DogArt } from '../theme/mascots/art';
import { dogs } from '../theme/mascots/dogs';
import { app, feedback } from '../theme/config';
import { useSettings } from '../hooks/useStore';
import { iosVersion, isStandalone } from '../lib/platform';
import { cheer } from '../mascot/bus';

type Kind = 'broken' | 'idea' | 'hi';
const kinds: Array<{ value: Kind; label: string }> = [
  { value: 'broken', label: '🛠️ Something’s not right' },
  { value: 'idea', label: '💡 I have an idea' },
  { value: 'hi', label: '💛 Just saying hi' },
];
const kindTitle: Record<Kind, string> = { broken: 'Problem', idea: 'Idea', hi: 'Hi' };

const DRAFT_KEY = 'feedback-draft';
const readDraft = () => { try { return localStorage.getItem(DRAFT_KEY) ?? ''; } catch { return ''; } };
const saveDraft = (t: string) => { try { t ? localStorage.setItem(DRAFT_KEY, t) : localStorage.removeItem(DRAFT_KEY); } catch { /* private mode */ } };

export function FeedbackScreen() {
  const nav = useNav();
  const settings = useSettings();
  const [kind, setKind] = useState<Kind>('broken');
  const [text, setText] = useState(readDraft);

  const message = () => {
    const v = iosVersion();
    const details = [
      `${app.name} ${__APP_VERSION__}`,
      v ? `iOS ${v}` : navigator.platform || 'unknown device',
      isStandalone() ? 'Home Screen app' : 'in browser',
      settings ? `text ${settings.textSize}, ${settings.weightUnit}` : '',
      new Date().toLocaleString(),
    ].filter(Boolean).join(' · ');
    return `${kindTitle[kind]} from Mom (${app.name}):\n\n${text.trim()}\n\n— ${details}`;
  };

  const done = () => {
    setText('');
    saveDraft('');
    toast('Thank you! Note sent 💌');
    cheer({ event: 'hello' });
    nav.pop();
  };

  const send = async () => {
    const body = message();
    // Must run straight from the tap: iOS only opens Messages/Mail/Share for a direct user action.
    if (feedback.phone) {
      window.location.href = `sms:${feedback.phone}&body=${encodeURIComponent(body)}`;
      done();
      return;
    }
    if (feedback.email) {
      window.location.href = `mailto:${feedback.email}?subject=${encodeURIComponent(`${app.name}: ${kindTitle[kind]}`)}&body=${encodeURIComponent(body)}`;
      done();
      return;
    }
    if (navigator.share) {
      try {
        await navigator.share({ text: body });
        done();
      } catch {
        /* she closed the share sheet; keep her note */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(body);
      toast('Copied! Paste it in a text to me.');
    } catch {
      toast('Couldn’t open sharing on this device.');
    }
  };

  return (
    <div className="flex h-full flex-col bg-cream">
      <Header title="Send a note" onBack={nav.pop} />
      <div className="scroll-area px-safe pb-safe flex-1 pb-8">
        <div className="flex items-end gap-3">
          <DogArt dog={dogs[1]} pose="popup" size={96} />
          <p className="mb-3 flex-1 rounded-2xl bg-white p-3 text-lg shadow-sm">
            Something not working, or want something changed? Tell me here and I’ll fix it!
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          <Choices stack label="What kind of note?" value={kind} options={kinds} onChange={setKind} />
          <label htmlFor="feedback-text" className="sr-only">Your note</label>
          <textarea
            id="feedback-text"
            value={text}
            onChange={(e) => { setText(e.target.value); saveDraft(e.target.value); }}
            rows={6}
            placeholder={kind === 'broken' ? 'What happened? What were you trying to do?' : kind === 'idea' ? 'What would make it better?' : 'Say hi!'}
            className="w-full rounded-2xl border-2 border-ink/15 bg-white p-4 text-lg"
          />
          <Button big onClick={send} disabled={!text.trim()} className="w-full">💌 Send my note</Button>
          <p className="text-center text-base text-ink-soft">
            {feedback.phone ? 'This opens Messages with your note ready. Just tap send.'
              : feedback.email ? 'This opens Mail with your note ready. Just tap send.'
              : 'Pick Messages, then me, then tap send.'}
          </p>
        </div>
      </div>
    </div>
  );
}
