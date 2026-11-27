/** Service-worker registration and persistent storage. */
import { store } from '../data';

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;
  try {
    // virtual module provided by vite-plugin-pwa
    const { registerSW } = await import('virtual:pwa-register');
    // autoUpdate: new versions install in the background and apply on next launch.
    registerSW({ immediate: true });
  } catch (e) {
    console.warn('Service worker registration failed', e);
  }
}

/**
 * Ask the browser to keep our data even when storage is tight. iOS can otherwise clear data for
 * sites that aren't used for a while — the monthly backup nudge is the second safety net.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (navigator.storage?.persisted && (await navigator.storage.persisted())) return true;
    return (await navigator.storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
}

export async function initPlatform() {
  await registerServiceWorker();
  await requestPersistentStorage();
  // Make sure settings exist (sets firstOpenedAt on first launch).
  const s = await store.getSettings();
  await store.updateSettings({ firstOpenedAt: s.firstOpenedAt });
}
