import type { Timeline } from '@/types/timeline';
import { produce } from 'immer';
import { atom } from 'jotai';
import { splitAtom } from 'jotai/utils';
import { selectedTLGroupRefAtom } from './timelineGroup';

export const timelinesAtom = atom(
  (get) => {
    const groupRef = get(selectedTLGroupRefAtom);
    if (!groupRef) return [];
    return get(groupRef).timelines;
  },
  (get, set, value: Timeline[]) => {
    const groupRef = get(selectedTLGroupRefAtom);
    if (!groupRef) return;
    set(
      groupRef,
      produce(get(groupRef), (draft) => {
        draft.timelines = value;
      }),
    );
  },
);

export const timelineAtomsAtom = splitAtom(timelinesAtom, (timeline) => timeline.id);
