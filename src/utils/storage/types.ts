import type { AppMetaData } from '@/types/app';
import type { MemoNode } from '@/types/memo';
import type { TimelineGroup } from '@/types/timeline';
import type { StorageValue } from 'zustand/middleware';

export type StorageAdapter = {
  name: string;
  getItem: () => Promise<StorageValue<PersistedAppData> | null>;
  setItem: (value: StorageValue<PersistedAppData>) => Promise<void>;
  removeItem: () => Promise<void>;
};

export type AdapterCandidate = {
  adapter: string;
  value: StorageValue<PersistedAppData>;
};

export type PersistedAppData = AppMetaData & {
  memo: MemoNode[];
  timelineGroups: TimelineGroup[];
};
