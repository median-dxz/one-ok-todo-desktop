import { atom } from 'jotai';
import { timelineGroupsAtom } from '../timelineGroups';
import type { Dependency, Timeline, TaskTimelineNode as Node, TimelineGroup } from '@/types/timeline';
import { nanoid } from 'nanoid';
import { produce } from 'immer';

export const completeRecurrenceInstanceAtom = atom(
  null,
  (get, set, { timelineId }: { timelineId: string; instanceDate: string }) => {
    const newGroups = produce(get(timelineGroupsAtom), (draft) => {
      for (const group of draft) {
        const timeline = group.timelines.find((t) => t.id === timelineId);
        if (timeline && timeline.recurrence) {
          const { pattern, stats } = timeline.recurrence;
          stats.totalCompleted++;
          stats.lastCompleted = new Date().toISOString();
          if (pattern && pattern.tasks.length > 0) {
            stats.byTask = stats.byTask || {};
            const currentTaskIndex = pattern.currentIndex || 0;
            const taskTitle = pattern.tasks[currentTaskIndex % pattern.tasks.length];
            const taskStats = stats.byTask[taskTitle] || { completed: 0, skipped: 0 };
            taskStats.completed++;
            stats.byTask[taskTitle] = taskStats;
            pattern.currentIndex = (currentTaskIndex + 1) % pattern.tasks.length;
          }
        }
      }
    });
    set(timelineGroupsAtom, newGroups);
  },
);

export const skipRecurrenceInstanceAtom = atom(
  null,
  (get, set, { timelineId }: { timelineId: string; instanceDate: string }) => {
    const newGroups = produce(get(timelineGroupsAtom), (draft) => {
      for (const group of draft) {
        const timeline = group.timelines.find((t) => t.id === timelineId);
        if (timeline && timeline.recurrence) {
          const { pattern, stats } = timeline.recurrence;
          stats.totalSkipped++;
          stats.lastSkipped = new Date().toISOString();
          if (pattern && pattern.tasks.length > 0) {
            stats.byTask = stats.byTask || {};
            const currentTaskIndex = pattern.currentIndex || 0;
            const taskTitle = pattern.tasks[currentTaskIndex % pattern.tasks.length];
            const taskStats = stats.byTask[taskTitle] || { completed: 0, skipped: 0 };
            taskStats.skipped++;
            stats.byTask[taskTitle] = taskStats;
            pattern.currentIndex = (currentTaskIndex + 1) % pattern.tasks.length;
          }
        }
      }
    });
    set(timelineGroupsAtom, newGroups);
  },
);

export const forkTimelineAtom = atom(
  null,
  (get, set, { fromNodeId, newTimelineTitle }: { fromNodeId: string; newTimelineTitle: string }) => {
    const newGroups = produce(get(timelineGroupsAtom), (draft) => {
      let sourceNode: Node | null = null;
      let sourceTimeline: Timeline | null = null;
      let sourceGroup: TimelineGroup | null = null;

      for (const group of draft) {
        for (const timeline of group.timelines) {
          const node = timeline.nodes.find((n) => n.id === fromNodeId);
          if (node) {
            sourceNode = node;
            sourceTimeline = timeline;
            sourceGroup = group;
            break;
          }
        }
        if (sourceNode) break;
      }

      if (!sourceNode || !sourceTimeline || !sourceGroup) {
        console.error('Source node, timeline, or group not found for forking.');
        return;
      }

      const newTimeline: Timeline = {
        id: nanoid(),
        title: newTimelineTitle,
        nodes: [],
        dependencies: [],
        status: 'todo',
      };

      const copiedNode: Node = {
        ...sourceNode,
        id: nanoid(),
        status: 'todo',
        depends_on: [],
        depends_on_timeline: [],
      };
      newTimeline.nodes.push(copiedNode);

      const dependency: Dependency = {
        id: nanoid(),
        type: 'split',
        from: fromNodeId,
        to: [newTimeline.id],
      };
      sourceTimeline.dependencies = sourceTimeline.dependencies || [];
      sourceTimeline.dependencies.push(dependency);

      const groupToUpdate = draft.find((g) => g.id === sourceGroup!.id);
      if (groupToUpdate) {
        groupToUpdate.timelines.push(newTimeline);
      }
    });
    set(timelineGroupsAtom, newGroups);
  },
);

export const addTimelineDependencyAtom = atom(
  null,
  (get, set, { toNodeId, fromTimelineIds }: { toNodeId: string; fromTimelineIds: string[] }) => {
    const newGroups = produce(get(timelineGroupsAtom), (draft) => {
      let targetNode: Node | null = null;
      let targetTimeline: Timeline | null = null;

      for (const group of draft) {
        for (const timeline of group.timelines) {
          const node = timeline.nodes.find((n) => n.id === toNodeId);
          if (node) {
            targetNode = node;
            targetTimeline = timeline;
            break;
          }
        }
        if (targetNode) break;
      }

      if (!targetNode || !targetTimeline) {
        console.error('Target node or timeline not found for dependency.');
        return;
      }

      const dependency: Dependency = {
        id: nanoid(),
        type: 'timeline',
        from: fromTimelineIds,
        to: toNodeId,
      };

      targetTimeline.dependencies = targetTimeline.dependencies || [];
      targetTimeline.dependencies.push(dependency);

      targetNode.depends_on_timeline = [...(targetNode.depends_on_timeline || []), ...fromTimelineIds];
    });
    set(timelineGroupsAtom, newGroups);
  },
);
