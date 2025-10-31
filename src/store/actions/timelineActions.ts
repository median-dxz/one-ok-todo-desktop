import { produce } from 'immer';
import { atom } from 'jotai';
import { nanoid } from 'nanoid';

import type { TaskTimeline, Timeline } from '@/types/timeline';

import { selectedTLGroupRefAtom } from '../timelineGroup';

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

/** 添加时间线到指定组 */
export const addTimelineAtom = atom(null, (get, set, value: Timeline) => {
  const group = get(selectedTLGroupRefAtom);
  if (!group) return;
  set(
    group,
    produce((draft) => {
      draft.timelines.push(value);
    }),
  );
});
