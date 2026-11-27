/** Tiny "live query" hook: re-runs the query whenever the store changes. */
import { useEffect, useRef, useState } from 'react';
import { store } from '../data';
import type { Settings } from '../data/types';
import { defaultSettings } from '../data/defaults';

export function useQuery<T>(query: () => Promise<T>, deps: unknown[] = []): T | undefined {
  const [value, setValue] = useState<T>();
  const q = useRef(query);
  q.current = query;
  useEffect(() => {
    let alive = true;
    const run = () => q.current().then((v) => alive && setValue(v));
    run();
    const off = store.subscribe(run);
    return () => {
      alive = false;
      off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return value;
}

export function useSettings(): Settings {
  return useQuery(() => store.getSettings()) ?? defaultSettings();
}

export const useExercises = () => useQuery(() => store.listExercises());
export const useWorkouts = () => useQuery(() => store.listWorkouts());
export const useAllSets = () => useQuery(() => store.allSets());
export const useGoals = () => useQuery(() => store.listGoals());
export const useSteps = () => useQuery(() => store.getSteps());
