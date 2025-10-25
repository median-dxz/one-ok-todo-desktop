import { initialAppData, initialMemo, initialTimelineGroups } from '@/store/mockData';
import type { AppData } from '@/types/app';
import type { MemoNode } from '@/types/memo';
import type { TimelineGroup } from '@/types/timeline';
import { invoke } from '@tauri-apps/api/core';

// A flag to determine if the app is running in a Tauri context.
const isTauri = !!window.__TAURI__;

const DATA_FILE = 'app-data.json';

interface ExtendedAppData extends AppData {
  memo: MemoNode[];
  timelineGroups: TimelineGroup[];
}

// --- Mock Filesystem for Browser Development ---
const mockFileStorage = new Map<string, string>();
mockFileStorage.set(
  DATA_FILE,
  JSON.stringify({ ...initialAppData, memo: initialMemo, timelineGroups: initialTimelineGroups }),
);

const mockSaveData = async (data: ExtendedAppData): Promise<void> => {
  console.log('[Mock FS] Saving root data');
  const jsonString = JSON.stringify(data);
  mockFileStorage.set(DATA_FILE, jsonString);
};

const mockLoadData = async (): Promise<ExtendedAppData> => {
  console.log('[Mock FS] Loading root data');
  const jsonString = mockFileStorage.get(DATA_FILE);

  if (jsonString === undefined) {
    return { ...initialAppData, memo: [], timelineGroups: [] };
  }

  try {
    return JSON.parse(jsonString) as ExtendedAppData;
  } catch (error) {
    console.error('Failed to parse mock root data, falling back to initial mock data:', error);
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
