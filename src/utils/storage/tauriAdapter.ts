import { core } from '@tauri-apps/api';
import superjson from 'superjson';

import type { StorageAdapter } from '@/types/storage';

export const tauriAdapter: StorageAdapter = {
  name: 'tauri',
  getItem: async () => {
    try {
      const data = await core.invoke<string>('load_data_rust');
      if (!data) {
        return null;
      }
      return superjson.parse(data);
    } catch (error) {
      console.error('Failed to load data from Tauri:', error);
      return null;
    }
  },
  setItem: async (value) => {
    try {
      await core.invoke('save_data_rust', { data: superjson.stringify(value) });
    } catch (error) {
      console.error('Failed to save data to Tauri:', error);
    }
  },
  removeItem: async () => {
    try {
      await core.invoke('remove_data_rust');
    } catch (error) {
      console.error('Failed to remove data from Tauri:', error);
    }
  },
};
