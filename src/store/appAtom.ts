import type { AppData } from '@/types/app';
import { atom } from 'jotai';

export type ViewType = 'initializing' | 'timeline' | 'memo';

export const viewAtom = atom<ViewType>('initializing');

const initialAppData: AppData = {
  version: '3',
};

export const appDataAtom = atom<AppData>(initialAppData);
