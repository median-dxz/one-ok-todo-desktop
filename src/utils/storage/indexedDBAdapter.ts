import type { StorageAdapter } from '@/types/storage';
import { openDB } from 'idb';
import superjson from 'superjson';

const APP_STORAGE_KEY = 'one-ok-todo-app-data';
const DB_NAME = 'one-ok-todo-db';
const DB_VERSION = 1;
const STORE_NAME = 'app-storage';

export const getIndexedDBAdapter = async (): Promise<StorageAdapter> => {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });

  return {
    name: 'indexedDB',

    getItem: async () => {
      try {
        const value = await db.get(STORE_NAME, APP_STORAGE_KEY);
        if (value) {
          return superjson.parse(value as string);
        }
        return null;
      } catch (error) {
        console.error('Failed to get data from IndexedDB:', error);
        return null;
      }
    },

    setItem: async (value) => {
      try {
        await db.put(STORE_NAME, superjson.stringify(value), APP_STORAGE_KEY);
      } catch (error) {
        console.error('Failed to save data to IndexedDB:', error);
      }
    },

    removeItem: async () => {
      try {
        await db.delete(STORE_NAME, APP_STORAGE_KEY);
      } catch (error) {
        console.error('Failed to remove data from IndexedDB:', error);
      }
    },
  };
};
