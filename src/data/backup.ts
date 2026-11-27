/** Export / import a JSON backup. On iPhone, export opens the Share sheet ("Save to Files"). */
import type { Store } from './storage';
import type { Backup } from './types';

export async function exportBackup(store: Store): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const data = await store.exportAll();
  const json = JSON.stringify(data, null, 2);
  const name = `daisy-strong-backup-${new Date().toISOString().slice(0, 10)}.json`;
  const file = new File([json], name, { type: 'application/json' });

  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Workout backup' });
      await store.updateSettings({ lastBackupAt: Date.now() });
      return 'shared';
    }
  } catch (e) {
    if ((e as Error).name === 'AbortError') return 'cancelled';
    // fall through to a normal download
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  await store.updateSettings({ lastBackupAt: Date.now() });
  return 'downloaded';
}

/** Validate a backup file. Throws a friendly message if it doesn't look right. */
export function parseBackup(text: string): Backup {
  let data: Backup;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('That file doesn’t look like a backup.');
  }
  if (data?.app !== 'daisy-strong' || !Array.isArray(data.exercises) || !Array.isArray(data.sets)) {
    throw new Error('That file doesn’t look like a Good Reps backup.');
  }
  return data;
}

export function summarize(b: Backup): string {
  const workouts = b.workouts.filter((w) => w.endedAt).length;
  return `${workouts} workout${workouts === 1 ? '' : 's'}, ${b.goals.length} goal${b.goals.length === 1 ? '' : 's'}, saved ${new Date(b.exportedAt).toLocaleDateString()}`;
}
