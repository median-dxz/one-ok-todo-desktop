import type { AppMetaData } from '@/types/app';
import type { StateCreator } from 'zustand';
import type { StoreState } from './index';

export type ViewType = 'initializing' | 'timeline' | 'memo';

export interface AppSlice {
  appMetadata: AppMetaData;
  view: ViewType;
  isAppDataLoaded: boolean;
  setView: (view: ViewType) => void;
  setAppData: (data: AppMetaData) => void;
  setAppDataLoaded: (loaded: boolean) => void;
}

export const createAppSlice: StateCreator<
  StoreState,
  [['zustand/immer', never], ['zustand/persist', unknown]],
  [],
  AppSlice
> = (set) => ({
  appMetadata: {
    lastModified: new Date().toISOString(),
    syncStatus: 'synced',
  },
  view: 'initializing',
  isAppDataLoaded: false,
  setView: (view) => set({ view }),
  setAppData: (data) => set({ appMetadata: data }),
  setAppDataLoaded: (loaded) => set({ isAppDataLoaded: loaded }),
});
