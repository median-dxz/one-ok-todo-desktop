import type { TimelineGroup } from '@/types/timeline';
import { produce } from 'immer';
import { atom } from 'jotai';
import { focusAtom } from 'jotai-optics';
import { nanoid } from 'nanoid';
import { useMemo } from 'react';
import { persistState } from './actions/persistence';

/* Atoms */

export const _timelineGroupsAtom = atom<TimelineGroup[]>([]);

export const selectedTimelineGroupIdAtom = atom<string | null>(null);

export const timelineGroupsAtom = atom(
  (get) => get(_timelineGroupsAtom),
  (get, set, newValue: TimelineGroup[]) => {
    set(_timelineGroupsAtom, newValue);
    persistState(get, set);
  },
);

/* Actions */

// 添加时间线组
export const addTimelineGroupAtom = atom(null, (get, set, { title }: { title: string }) => {
  const newGroup: TimelineGroup = {
    id: nanoid(),
    title,
    timelines: [],
  };

  const prev = get(timelineGroupsAtom);
  set(
    timelineGroupsAtom,
    produce(prev, (draft) => {
      draft.push(newGroup);
    }),
  );

  set(selectedTimelineGroupIdAtom, newGroup.id);
});

// 删除时间线组
export const deleteTimelineGroupAtom = atom(null, (get, set, { id }: TimelineGroup) => {
  const prev = get(timelineGroupsAtom);
  set(
    timelineGroupsAtom,
    prev.filter((group) => group.id !== id),
  );
});

// 重新排序时间线组
export const reorderTimelineGroupsAtom = atom(null, (get, set, groupIds: string[]) => {
  const prev = get(timelineGroupsAtom);
  // 创建 ID 到 group 的映射
  const groupMap = new Map(prev.map((group) => [group.id, group]));

  // 按新顺序重新排列
  set(
    timelineGroupsAtom,
    groupIds.map((id) => groupMap.get(id)!),
  );
});

/* Atom Creators */

export const createTimelineGroupAtom = (groupId: string | null) => {
  return focusAtom(timelineGroupsAtom, (optic) => optic.find((group) => group.id === groupId));
};

/* Hooks */

export const useTimelineGroupAtom = (groupId: string | null) => {
  return useMemo(() => createTimelineGroupAtom(groupId), [groupId]);
};
