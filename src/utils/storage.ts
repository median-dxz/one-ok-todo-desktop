import type { AppMetaData } from '@/types/app';
import type { MemoNode } from '@/types/memo';
import { MemoNodeSchema, TimelineGroupSchema } from '@/types/schemas';
import type { TimelineGroup } from '@/types/timeline';
import { reportPersistenceError } from '@/utils/persistenceError';
import { invoke } from '@tauri-apps/api/core';
import type { IDBPDatabase } from 'idb';
import { openDB } from 'idb';
import superjson from 'superjson';
import { z } from 'zod';
import type { PersistStorage, StorageValue } from 'zustand/middleware';

import { WebDAVClient } from './webdav';

const isTauri = !!window.__TAURI__;

export type PersistedAppData = AppMetaData & {
  memo: MemoNode[];
  timelineGroups: TimelineGroup[];
};

const emptyStorageValue: StorageValue<PersistedAppData> = {
  version: 3,
  state: {
    lastModified: new Date().toISOString(),
    memo: [],
    timelineGroups: [],
    syncStatus: 'synced',
  },
};

const PersistedStateSchema = z.object({
  lastModified: z
    .string()
    .min(1)
    .catch(() => new Date().toISOString()),
  syncStatus: z.enum(['synced', 'pending', 'error']).optional().catch('error'),
  memo: z.preprocess((value) => (value == null ? [] : value), z.array(MemoNodeSchema)),
  timelineGroups: z.preprocess((value) => (value == null ? [] : value), z.array(TimelineGroupSchema)),
});

const PersistedStorageValueSchema = z.object({
  version: z.number().catch(3),
  state: PersistedStateSchema,
});

type StorageAdapter = {
  name: string;
  getItem: () => Promise<StorageValue<PersistedAppData> | null>;
  setItem: (value: StorageValue<PersistedAppData>) => Promise<void>;
  removeItem: () => Promise<void>;
};

const APP_STORAGE_KEY = 'one-ok-todo-app-data';

type AdapterCandidate = {
  adapter: string;
  value: StorageValue<PersistedAppData>;
};

function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`).join('; ');
}

function validatePersistedValue(
  sourceName: string,
  raw: StorageValue<PersistedAppData>,
): StorageValue<PersistedAppData> {
  const result = PersistedStorageValueSchema.safeParse(raw);

  if (!result.success) {
    throw new Error(`[${sourceName}] schema validation failed: ${formatZodError(result.error)}`);
  }

  return result.data satisfies StorageValue<PersistedAppData>;
}

function isNonEmptyPersistedValue(value: StorageValue<PersistedAppData>): boolean {
  return value.state.memo.length > 0 || value.state.timelineGroups.length > 0;
}

function getLastModifiedTimestamp(value: StorageValue<PersistedAppData>): number {
  const timestamp = new Date(value.state.lastModified).getTime();
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

const tauriAdapter: StorageAdapter = {
  name: 'tauri',
  getItem: async () => {
    try {
      const data = await invoke<string>('load_data_rust');
      if (!data) {
        return null;
      }
      return superjson.parse(data) as StorageValue<PersistedAppData>;
    } catch (error) {
      console.error('Failed to load data from Tauri:', error);
      return null;
    }
  },
  setItem: async (value) => {
    try {
      await invoke('save_data_rust', { data: superjson.stringify(value) });
    } catch (error) {
      console.error('Failed to save data to Tauri:', error);
    }
  },
  removeItem: async () => {
    try {
      await invoke('remove_data_rust');
    } catch (error) {
      console.error('Failed to remove data from Tauri:', error);
    }
  },
};

// IndexedDB adapter using idb
const DB_NAME = 'one-ok-todo-db';
const DB_VERSION = 1;
const STORE_NAME = 'app-storage';

let dbPromise: Promise<IDBPDatabase> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
};

const indexedDBAdapter: StorageAdapter = {
  name: 'indexedDB',
  getItem: async () => {
    try {
      const db = await getDB();
      const value = await db.get(STORE_NAME, APP_STORAGE_KEY);
      if (value) {
        return superjson.parse(value as string) as StorageValue<PersistedAppData>;
      }
      return null;
    } catch (error) {
      console.error('Failed to get data from IndexedDB:', error);
      return null;
    }
  },
  setItem: async (value) => {
    try {
      const db = await getDB();
      await db.put(STORE_NAME, superjson.stringify(value), APP_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to save data to IndexedDB:', error);
    }
  },
  removeItem: async () => {
    try {
      const db = await getDB();
      await db.delete(STORE_NAME, APP_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to remove data from IndexedDB:', error);
    }
  },
};

/**
 * TODO: 改为从配置文件读取 WebDAV 参数，并提供 UI 让用户配置。
 */
type ImportMetaEnvWithWebdav = {
  VITE_WEBDAV_URL?: string;
  VITE_WEBDAV_USERNAME?: string;
  VITE_WEBDAV_PASSWORD?: string;
  VITE_WEBDAV_PATH?: string;
};

function getWebdavConfig() {
  // TODO: 后续可能会动态切换 WebDAV 配置，届时当前实现将无法满足要求
  const env = import.meta.env as ImportMetaEnvWithWebdav;
  if (!env.VITE_WEBDAV_URL) {
    return null;
  }

  return {
    url: env.VITE_WEBDAV_URL,
    username: env.VITE_WEBDAV_USERNAME,
    password: env.VITE_WEBDAV_PASSWORD,
    remotePath: env.VITE_WEBDAV_PATH ?? '/one-ok-todo/data/root-data.json',
  };
}

function createWebdavAdapter(): StorageAdapter | null {
  // TODO：后续需要提供动态切换 WebDAV 配置的能力
  const config = getWebdavConfig();
  if (!config) {
    return null;
  }

  const client = new WebDAVClient({
    url: config.url,
    username: config.username,
    password: config.password,
  });

  return {
    name: 'webdav',
    getItem: async () => {
      try {
        return client.download<StorageValue<PersistedAppData>>(config.remotePath);
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        if (message.includes('not found')) {
          return null;
        }

        console.error('Failed to load data from WebDAV:', error);
        return null;
      }
    },

    setItem: async (value) => {
      await client.upload(value, config.remotePath);
    },

    removeItem: async () => {
      await client.delete(config.remotePath);
    },
  };
}

function getActiveAdapters(): StorageAdapter[] {
  const adapters: StorageAdapter[] = [];

  if (isTauri) {
    adapters.push(tauriAdapter);
  } else {
    adapters.push(indexedDBAdapter);
  }

  const webdavAdapter = createWebdavAdapter();
  if (webdavAdapter) {
    adapters.push(webdavAdapter);
  }

  return adapters;
}

const aggregatedStorage: PersistStorage<PersistedAppData> = {
  getItem: async (_name) => {
    const adapters = getActiveAdapters();
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
          reportPersistenceError(`数据源 ${adapter.name} 校验失败，已跳过。`);
          console.error(`[Storage] ${adapter.name} candidate rejected:`, error);
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

  setItem: async (_name, value) => {
    const adapters = getActiveAdapters();
    const results = await Promise.allSettled(adapters.map((adapter) => adapter.setItem(value)));
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const adapter = adapters[index];
        reportPersistenceError(`写入 ${adapter.name} 失败。`, result.reason);
      }
    });
  },

  removeItem: async (_name) => {
    const adapters = getActiveAdapters();
    const results = await Promise.allSettled(adapters.map((adapter) => adapter.removeItem()));
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const adapter = adapters[index];
        reportPersistenceError(`删除 ${adapter.name} 数据失败。`, result.reason);
      }
    });
  },
};

export const appStorage = aggregatedStorage;
