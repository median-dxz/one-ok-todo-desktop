import { produce } from 'immer';
import { atom } from 'jotai';
import { nanoid } from 'nanoid';

import type { RecurrenceTimeline, TaskTimeline, TimelineGroup } from '@/types/timeline';

import { selectedTimelineGroupIdAtom, timelineGroupsAtom } from '../timelineGroups';

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

    // console.log('Reordering timeline groups to:', groupIds);

    // 按新顺序重新排列
    return groupIds.map((id) => groupMap.get(id)!);
  });
});

// 添加时间线到指定组
export const addTimelineAtom = atom(null, (_get, set, { groupId, title }: { groupId: string; title: string }) => {
  set(timelineGroupsAtom, (prev) =>
    prev.map((group) => {
      if (group.id === groupId) {
        const newTimeline: TaskTimeline = {
          id: nanoid(),
          title,
          type: 'task-timeline',
          nodes: [],
        };
        return {
          ...group,
          timelines: [...group.timelines, newTimeline],
        };
      }
      return group;
    }),
  );
});

// 完成循环任务实例
export const completeRecurrenceInstanceAtom = atom(
  null,
  (_get, set, { timelineId, instanceDate }: { timelineId: string; instanceDate: string }) => {
    set(timelineGroupsAtom, (prev) =>
      prev.map((group) => ({
        ...group,
        timelines: group.timelines.map((timeline) => {
          if (timeline.id === timelineId && timeline.type === 'recurrence-timeline') {
            const recurrenceTimeline = timeline as RecurrenceTimeline;
            const { pattern, completedTasks } = recurrenceTimeline;

            const newCompletedTasks = [
              ...completedTasks,
              {
                taskTitle: 'completed',
                scheduledDate: new Date().toISOString(),
                status: 'done' as const,
              },
            ];

            let newPattern = pattern;
            if (pattern && pattern.tasks.length > 0) {
              const currentTaskIndex = pattern.currentIndex || 0;
              newPattern = {
                ...pattern,
                currentIndex: (currentTaskIndex + 1) % pattern.tasks.length,
              };
            }

            return {
              ...recurrenceTimeline,
              completedTasks: newCompletedTasks,
              pattern: newPattern,
            };
          }
          return timeline;
        }),
      })),
    );
  },
);

// 跳过循环任务实例
export const skipRecurrenceInstanceAtom = atom(
  null,
  (_get, set, { timelineId, instanceDate }: { timelineId: string; instanceDate: string }) => {
    set(timelineGroupsAtom, (prev) =>
      prev.map((group) => ({
        ...group,
        timelines: group.timelines.map((timeline) => {
          if (timeline.id === timelineId && timeline.type === 'recurrence-timeline') {
            const recurrenceTimeline = timeline as RecurrenceTimeline;
            const { pattern, completedTasks } = recurrenceTimeline;

            const newCompletedTasks = [
              ...completedTasks,
              {
                taskTitle: 'skipped',
                scheduledDate: new Date().toISOString(),
                status: 'skipped' as const,
              },
            ];

            let newPattern = pattern;
            if (pattern && pattern.tasks.length > 0) {
              const currentTaskIndex = pattern.currentIndex || 0;
              newPattern = {
                ...pattern,
                currentIndex: (currentTaskIndex + 1) % pattern.tasks.length,
              };
            }

            return {
              ...recurrenceTimeline,
              completedTasks: newCompletedTasks,
              pattern: newPattern,
            };
          }
          return timeline;
        }),
      })),
    );
  },
);
