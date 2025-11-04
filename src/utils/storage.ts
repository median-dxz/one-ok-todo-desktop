import type { AppMetaData } from '@/types/app';
import type { MemoNode } from '@/types/memo';
import type { TimelineGroup } from '@/types/timeline';
import { invoke } from '@tauri-apps/api/core';
import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';
import superjson from 'superjson';
import type { PersistStorage, StorageValue } from 'zustand/middleware';

const isTauri = !!window.__TAURI__;

export type PersistedAppData = AppMetaData & {
  memo: MemoNode[];
  timelineGroups: TimelineGroup[];
};

const tauriStorage: PersistStorage<PersistedAppData> = {
  getItem: async (name) => {
    try {
      const data = await invoke('load_data_rust', { key: name });
      return superjson.parse(data as string);
    } catch (error) {
      console.error('Failed to load data from Tauri:', error);
      return null;
    }
  },
  setItem: async (name, value) => {
    try {
      await invoke('save_data_rust', { key: name, data: superjson.stringify(value) });
    } catch (error) {
      console.error('Failed to save data to Tauri:', error);
    }
  },
  removeItem: async (name) => {
    try {
      await invoke('remove_data_rust', { key: name });
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

const indexedDBAdapter: PersistStorage<PersistedAppData> = {
  getItem: async (name) => {
    try {
      const db = await getDB();
      const value = await db.get(STORE_NAME, name);
      if (value) {
        return superjson.parse(value as string) as StorageValue<PersistedAppData>;
      } else {
        return {
          version: 3,
          state: {
            lastModified: new Date().toISOString(),
            memo: [],
            timelineGroups: [],
            syncStatus: 'synced',
          },
        } satisfies StorageValue<PersistedAppData>;
      }
    } catch (error) {
      console.error('Failed to get data from IndexedDB:', error);
      return {
        version: 3,
        state: {
          lastModified: new Date().toISOString(),
          memo: [],
          timelineGroups: [],
          syncStatus: 'synced',
        },
      } satisfies StorageValue<PersistedAppData>;
    }
  },
  setItem: async (name, value) => {
    try {
      const db = await getDB();
      await db.put(STORE_NAME, superjson.stringify(value), name);
    } catch (error) {
      console.error('Failed to save data to IndexedDB:', error);
    }
  },
  removeItem: async (name) => {
    try {
      const db = await getDB();
      await db.delete(STORE_NAME, name);
    } catch (error) {
      console.error('Failed to remove data from IndexedDB:', error);
    }
  },
};

export const appStorage = isTauri ? tauriStorage : indexedDBAdapter;
