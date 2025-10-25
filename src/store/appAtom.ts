import { atom } from 'jotai';
import type { AppData } from '@/types/app';
import { initialAppData } from './mockData';

export type ViewType = 'timeline' | 'memo';

export const viewAtom = atom<ViewType>('timeline');

export const appDataAtom = atom<AppData>(initialAppData);
