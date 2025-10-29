import type { TimelineGroup } from '@/types/timeline';
import { produce } from 'immer';
import { atom } from 'jotai';
import { focusAtom } from 'jotai-optics';
import { nanoid } from 'nanoid';
import { useMemo } from 'react';

/* Atoms */

export const timelineGroupsAtom = atom<TimelineGroup[]>([]);

export const selectedTimelineGroupIdAtom = atom<string | null>(null);

/* Actions */

// 添加时间线组
export const addTimelineGroupAtom = atom(null, (_get, set, { title }: { title: string }) => {
  const newGroup: TimelineGroup = {
    id: nanoid(),
    title,
    timelines: [],
  };

  set(
    timelineGroupsAtom,
    produce((prev) => {
      prev.push(newGroup);
    }),
  );

  set(selectedTimelineGroupIdAtom, newGroup.id);
});

// 删除时间线组
export const deleteTimelineGroupAtom = atom(null, (_get, set, { id }: TimelineGroup) => {
  set(timelineGroupsAtom, (prev) => prev.filter((group) => group.id !== id));
});

// 重新排序时间线组
export const reorderTimelineGroupsAtom = atom(null, (_get, set, groupIds: string[]) => {
  set(timelineGroupsAtom, (prev) => {
    // 创建 ID 到 group 的映射
    const groupMap = new Map(prev.map((group) => [group.id, group]));

    // 按新顺序重新排列
    return groupIds.map((id) => groupMap.get(id)!);
  });
});

/* Atom Creators */

export const createTimelineGroupAtom = (groupId: string | null) => {
  return focusAtom(timelineGroupsAtom, (optic) => optic.find((group) => group.id === groupId));
};

/* Hooks */

export const useTimelineGroupAtom = (groupId: string | null) => {
  return useMemo(() => createTimelineGroupAtom(groupId), [groupId]);
};
