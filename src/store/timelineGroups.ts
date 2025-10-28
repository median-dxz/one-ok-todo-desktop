import { produce } from 'immer';
import type { TimelineGroup } from '@/types/timeline';
import { atom } from 'jotai';
import { nanoid } from 'nanoid';
import { initialTimelineGroups } from './mockData';

/* Atoms */

export const timelineGroupsAtom = atom<TimelineGroup[]>(initialTimelineGroups);

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
