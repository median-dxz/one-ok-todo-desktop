import { debounce } from '@/utils/index';
import { reportPersistenceError } from '@/utils/persistenceError';
import { core } from '@tauri-apps/api';
import { z } from 'zod';
import type { PersistStorage, StorageValue } from 'zustand/middleware';

import { getIndexedDBAdapter } from './indexedDBAdapter';
import { tauriAdapter } from './tauriAdapter';
import type { AdapterCandidate, PersistedAppData, StorageAdapter } from '../../types/storage';
import { getWebDAVAdapter } from './webdavAdapter';
import { PersistedStorageValueSchema } from '@/types/storage';

export type { PersistedAppData } from '../../types/storage';

const emptyStorageValue: StorageValue<PersistedAppData> = {
  version: 3,
  state: {
    metadata: {
      lastModified: new Date().toISOString(),
      syncStatus: 'synced',
    },
    memo: [],
    timelineGroups: [],
  },
};

function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`).join('; ');
}

function validatePersistedValue(
  sourceName: string,
  raw: object,
): StorageValue<PersistedAppData> {
  const result = PersistedStorageValueSchema.safeParse(raw);

  if (!result.success) {
    throw new Error(`[${sourceName}] schema validation failed: ${formatZodError(result.error)}`);
  }

  return result.data;
}

function isNonEmptyPersistedValue(value: StorageValue<PersistedAppData>): boolean {
  return value.state.memo.length > 0 || value.state.timelineGroups.length > 0;
}

function getLastModifiedTimestamp(value: StorageValue<PersistedAppData>): number {
  const timestamp = new Date(value.state.metadata.lastModified).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function pickBestCandidate(candidates: AdapterCandidate[]): AdapterCandidate | null {
  if (candidates.length === 0) {
    return null;
  }

  const nonEmptyCandidates = candidates.filter((candidate) => isNonEmptyPersistedValue(candidate.value));
  const effectiveCandidates = nonEmptyCandidates.length > 0 ? nonEmptyCandidates : candidates;

  effectiveCandidates.sort((a, b) => getLastModifiedTimestamp(b.value) - getLastModifiedTimestamp(a.value));
  return effectiveCandidates[0] ?? null;
}

async function getActiveAdapters(): Promise<StorageAdapter[]> {
  const adapters: Array<StorageAdapter | null> = [];

  if (core.isTauri()) {
    adapters.push(tauriAdapter);
  } else {
    adapters.push(await getIndexedDBAdapter());
  }

  adapters.push(getWebDAVAdapter());

  return adapters.filter((adapter) => adapter !== null);
}

const aggregatedStorage = {
  getItem: async (_name) => {
    const adapters = await getActiveAdapters();
    const candidates: AdapterCandidate[] = [];
    let hasUnrecoverableError = false;

    await Promise.all(
      adapters.map(async (adapter) => {
        try {
          const value = await adapter.getItem();
          if (!value) {
            return;
          }

          const validated = validatePersistedValue(adapter.name, value);
          candidates.push({ adapter: adapter.name, value: validated });
        } catch (error) {
          hasUnrecoverableError = true;
          reportPersistenceError(`数据源 ${adapter.name} 校验失败，已跳过。`, error);
        }
      }),
    );

    const bestCandidate = pickBestCandidate(candidates);
    if (bestCandidate) {
      return bestCandidate.value;
    }

    if (hasUnrecoverableError) {
      const error = new Error('所有可用数据源均不可恢复，应用已停止使用损坏数据。');
      reportPersistenceError(error.message, error);
      throw error;
    }

    return emptyStorageValue;
  },

  setItem: debounce(async (_name: string, value: StorageValue<PersistedAppData>) => {
    const adapters = await getActiveAdapters();
    const results = await Promise.allSettled(adapters.map((adapter) => adapter.setItem(value)));
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const adapter = adapters[index];
        reportPersistenceError(`写入 ${adapter.name} 失败。`, result.reason);
      }
    });
  }, 300),

  removeItem: async (_name) => {
    const adapters = await getActiveAdapters();
    const results = await Promise.allSettled(adapters.map((adapter) => adapter.removeItem()));
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const adapter = adapters[index];
        reportPersistenceError(`删除 ${adapter.name} 数据失败。`, result.reason);
      }
    });
  },
} satisfies PersistStorage<PersistedAppData>;

export const appStorage = aggregatedStorage;
