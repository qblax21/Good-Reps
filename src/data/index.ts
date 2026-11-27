/**
 * The one place the app picks its storage implementation.
 * To add cloud sync later: write another `Store` (e.g. createCloudStore) and swap it in here.
 */
import { createDexieStore } from './dexieStore';
import type { Store } from './storage';

export const store: Store = createDexieStore();
export { uid } from './storage';
export type * from './types';
