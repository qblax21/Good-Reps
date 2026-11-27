/**
 * Minimal navigation: four tabs plus a stack of pushed screens. No URLs/router needed, which keeps
 * the app simple to wrap with Capacitor later and avoids confusing browser history in standalone mode.
 */
import { createContext, useContext } from 'react';

export type Tab = 'home' | 'exercises' | 'progress' | 'settings';
export type Route =
  | { name: 'workout'; workoutId: string }
  | { name: 'exercise'; exerciseId: string }
  | { name: 'history' };

export interface Nav {
  tab: Tab;
  setTab: (t: Tab) => void;
  stack: Route[];
  push: (r: Route) => void;
  pop: () => void;
}

export const NavContext = createContext<Nav>(null as unknown as Nav);
export const useNav = () => useContext(NavContext);
