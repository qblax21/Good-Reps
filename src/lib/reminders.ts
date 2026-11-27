/**
 * Gentle reminders, three layers (each fails gracefully):
 *  1. In-app: on a planned day the home screen says so (always works).
 *  2. iPhone Calendar: a repeating calendar event with an alert — works offline, no server,
 *     and is the most reliable option on iPhone.
 *  3. Web push (iOS 16.4+, installed to home screen): needs a tiny push server because the web
 *     can't schedule notifications on its own. Configure `push` in theme/config.ts — see README.
 */
import { app, push } from '../theme/config';
import { pushSupport } from './platform';

const DAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

/** Build an .ics file with one weekly repeating event on her planned days. */
export function buildCalendarFile(plannedDays: number[], time: string): string {
  const [hh, mm] = time.split(':').map(Number);
  const start = new Date();
  // first upcoming planned day
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    if (plannedDays.includes(d.getDay())) {
      start.setTime(d.getTime());
      break;
    }
  }
  start.setHours(hh, mm, 0, 0);
  const end = new Date(start.getTime() + 30 * 60000);
  const local = (d: Date) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}00`;
  const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:-//${app.name}//EN`, 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${app.name.replace(/\s/g, '')}-workout-reminder`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${local(start)}`,
    `DTEND:${local(end)}`,
    `RRULE:FREQ=WEEKLY;BYDAY=${plannedDays.map((d) => DAYS[d]).join(',')}`,
    `SUMMARY:🌼 Workout time (${app.name})`,
    'DESCRIPTION:Open the app whenever you’re ready. The dogs are cheering for you!',
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Workout time 🌼', 'TRIGGER:PT0M', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
}

export async function addToCalendar(plannedDays: number[], time: string) {
  const ics = buildCalendarFile(plannedDays, time);
  const file = new File([ics], 'workout-reminders.ics', { type: 'text/calendar' });
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file] });
      return;
    }
  } catch (e) {
    if ((e as Error).name === 'AbortError') return;
  }
  // Safari opens a data: calendar link with an "Add to Calendar" sheet.
  const a = document.createElement('a');
  a.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
  a.download = 'workout-reminders.ics';
  a.click();
}

export const pushConfigured = () => !!push.vapidPublicKey && !!push.subscribeEndpoint;

function urlB64ToUint8Array(b64: string) {
  const pad = '='.repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/**
 * Turn on push reminders. Must be called from a tap (iOS requires a user gesture).
 * Returns a friendly status string to show her.
 */
export async function enablePush(plannedDays: number[], time: string): Promise<{ ok: boolean; message: string }> {
  const support = pushSupport();
  if (support === 'install-first') return { ok: false, message: 'Add the app to your Home Screen first, then try again.' };
  if (support === 'update-ios') return { ok: false, message: 'Notifications need a newer iPhone update (iOS 16.4 or later).' };
  if (support === 'no') return { ok: false, message: 'This browser can’t do notifications. Try the Calendar reminder instead!' };
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') return { ok: false, message: 'No problem! You can use the Calendar reminder instead.' };
  const reg = await navigator.serviceWorker.ready;
  if (!pushConfigured()) {
    // Without a push server we can still confirm notifications work.
    await reg.showNotification(`${app.name} 🌼`, { body: 'Notifications are on! (Daily reminders need setup — the Calendar option works great.)', icon: 'icons/icon-192.png' });
    return { ok: true, message: 'Notifications allowed. For scheduled reminders, use “Add to my Calendar”.' };
  }
  try {
    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToUint8Array(push.vapidPublicKey) });
    await fetch(push.subscribeEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: sub, days: plannedDays, time, tz: Intl.DateTimeFormat().resolvedOptions().timeZone }),
    });
    return { ok: true, message: 'Reminders are on! 🌼' };
  } catch {
    return { ok: false, message: 'Couldn’t set up reminders right now. The Calendar option works offline!' };
  }
}
