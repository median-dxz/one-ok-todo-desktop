import type { TimelineGroup } from '@/types/timeline';
import { atom } from 'jotai';
import { initialTimelineGroups } from './mockData';

export const selectedNodeIdAtom = atom<string | null>(null);

export const timelineGroupsAtom = atom<TimelineGroup[]>(initialTimelineGroups);

export const selectedTimelineGroupIdAtom = atom<string | null>(null);