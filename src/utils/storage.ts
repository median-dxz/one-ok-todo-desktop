import { invoke } from '@tauri-apps/api/core';

import type { AppData } from '@/types/app';
import type { MemoNode } from '@/types/memo';
import type { TimelineGroup } from '@/types/timeline';

import { initialAppData, initialMemo, initialTimelineGroups } from './mockData';

// A flag to determine if the app is running in a Tauri context.
const isTauri = !!window.__TAURI__;

interface ExtendedAppData extends AppData {
  memo: MemoNode[];
  timelineGroups: TimelineGroup[];
}

// --- Mock Storage for Browser Development (localStorage) ---
const STORAGE_KEY = 'one-ok-todo-app-data';

// Initialize localStorage with mock data if not present
const initializeLocalStorage = () => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    const initialData = { ...initialAppData, memo: initialMemo, timelineGroups: initialTimelineGroups };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  }
};

// Initialize on module load
initializeLocalStorage();

const mockSaveData = async (data: ExtendedAppData): Promise<void> => {
  console.log('[LocalStorage] Saving root data');
  const jsonString = JSON.stringify(data);
  localStorage.setItem(STORAGE_KEY, jsonString);
};

const mockLoadData = async (): Promise<ExtendedAppData> => {
  console.log('[LocalStorage] Loading root data');
  const jsonString = localStorage.getItem(STORAGE_KEY);

  if (jsonString === null) {
    return { ...initialAppData, memo: [], timelineGroups: [] };
  }

  try {
    return JSON.parse(jsonString) as ExtendedAppData;
  } catch (error) {
    console.error('Failed to parse localStorage data, falling back to initial mock data:', error);
    return { ...initialAppData, memo: [], timelineGroups: [] };
  }
};

// --- Tauri (Rust) Implementation ---
const tauriSaveData = async (data: ExtendedAppData): Promise<void> => {
  try {
    const jsonString = JSON.stringify(data);
    await invoke('save_data_rust', { data: jsonString });
  } catch (error) {
    console.error('Failed to save root data:', error);
  }
};

const tauriLoadData = async (): Promise<ExtendedAppData> => {
  try {
    const jsonString = (await invoke('load_data_rust')) as string;
    if (!jsonString) {
      return { ...initialAppData, memo: [], timelineGroups: [] };
    }
    return JSON.parse(jsonString) as ExtendedAppData;
  } catch (error) {
    console.error('Failed to load root data, falling back to initial mock data:', error);
    return { ...initialAppData, memo: [], timelineGroups: [] };
  }
};

// --- Exported Functions ---
export const saveData = isTauri ? tauriSaveData : mockSaveData;
export const loadData = isTauri ? tauriLoadData : mockLoadData;
