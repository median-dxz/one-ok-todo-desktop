import { AppMetadataSchema, type AppMetaData } from '@/types/app';
import { MemoNodeSchema, type MemoNode } from '@/types/memo';
import { TimelineGroupSchema, type TimelineGroup } from '@/types/timeline';
import z from 'zod';
import type { StorageValue } from 'zustand/middleware';

export const PersistedStateSchema = z.object({
  metadata: AppMetadataSchema,
  memo: z.preprocess((value) => (value == null ? [] : value), z.array(MemoNodeSchema)),
  timelineGroups: z.preprocess((value) => (value == null ? [] : value), z.array(TimelineGroupSchema)),
});

export const PersistedStorageValueSchema = z.object({
  version: z.number().catch(1),
  state: PersistedStateSchema,
});

export type StorageAdapter = {
  name: string;
  getItem: () => Promise<unknown>;
  setItem: (value: StorageValue<PersistedAppData>) => Promise<void>;
  removeItem: () => Promise<void>;
};

export type AdapterCandidate = {
  adapter: string;
  value: StorageValue<PersistedAppData>;
};

export type PersistedAppData = {
  metadata: AppMetaData;
  memo: MemoNode[];
  timelineGroups: TimelineGroup[];
};
