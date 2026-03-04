import type { StorageValue } from 'zustand/middleware';
import superjson from 'superjson';
import { invoke } from '@tauri-apps/api/core';

import type { PersistedAppData, StorageAdapter } from './types';

export const tauriAdapter: StorageAdapter = {
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
