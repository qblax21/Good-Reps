/** Platform detection helpers (iPhone Safari specifics). */

export const isIOS = (): boolean =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/** True when launched from the home screen icon (not inside Safari). */
export const isStandalone = (): boolean =>
  window.matchMedia?.('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true;

/** Capacitor sets this when wrapped as a native app. */
export const isNativeApp = (): boolean => !!(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.();

/** iOS version, e.g. 17.4, or null if not iOS. */
export function iosVersion(): number | null {
  const m = navigator.userAgent.match(/OS (\d+)_(\d+)/);
  return m ? parseFloat(`${m[1]}.${m[2]}`) : null;
}

/** Web push on iPhone needs iOS 16.4+ AND the app installed to the home screen. */
export function pushSupport(): 'yes' | 'install-first' | 'update-ios' | 'no' {
  const hasApi = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  if (isIOS()) {
    const v = iosVersion();
    if (v !== null && v < 16.4) return 'update-ios';
    if (!isStandalone()) return 'install-first';
  }
  return hasApi ? 'yes' : 'no';
}
