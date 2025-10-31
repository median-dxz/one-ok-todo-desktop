import type { TaskTimeline, Timeline } from '@/types/timeline';
import { produce } from 'immer';
import { atom, type PrimitiveAtom } from 'jotai';
import { splitAtom } from 'jotai/utils';
import { selectedTLGroupRefAtom } from './timelineGroup';
import { nanoid } from 'nanoid';

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

export const newTaskTimeline = (title: string): TaskTimeline => {
  const tl: TaskTimeline = {
    id: nanoid(),
    title,
    type: 'task',
    nodes: [],
  };
  tl.nodes.push({
    id: nanoid(),
    type: 'delimiter',
    markerType: 'start',
    prevs: [],
    succs: [],
  });
  return tl;
};

/** 添加/更新 时间线到选定组 */
export const updateOrInsertTimelineAtom = atom(
  null,
  (get, set, value: Timeline, timelineAtom?: PrimitiveAtom<Timeline> | null) => {
    const group = get(selectedTLGroupRefAtom);
    if (!group) return;

    if (!timelineAtom) {
      set(
        group,
        produce((draft) => {
          draft.timelines.push(value);
        }),
      );
    } else {
      set(timelineAtom, () => value);
    }
  },
);
