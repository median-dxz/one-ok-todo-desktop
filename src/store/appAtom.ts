import type { AppData } from '@/types/app';
import { atom } from 'jotai';
import { persistState } from './actions/persistence';

export type ViewType = 'initializing' | 'timeline' | 'memo';

export const _appDataAtom = atom<AppData>({
  version: '3.0',
  metadata: {
    lastModified: new Date().toISOString(),
    syncStatus: 'synced',
  },
});

export const appDataAtom = atom(
  (get) => get(_appDataAtom),
  (get, set, newValue: AppData) => {
    set(_appDataAtom, newValue);
    persistState(get, set);
  },
);

export const viewAtom = atom<ViewType>('initializing');
