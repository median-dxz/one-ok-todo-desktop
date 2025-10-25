import { atom } from 'jotai';
import { timelineGroupsAtom } from '../timelineGroups';
import type { TimelineNode as Node, TimelineGroup } from '@/types/timeline';
import { produce } from 'immer';
import { nanoid } from 'nanoid';

// Helper function to find a timeline
const findTimeline = (groups: TimelineGroup[], timelineId: string) => {
  for (const group of groups) {
    const timeline = group.timelines.find((t) => t.id === timelineId);
    if (timeline) return timeline;
  }
  return null;
};

export const addNodeAtom = atom(
  null,
  (get, set, { timelineId, nodeType }: { timelineId: string; nodeType: 'task' | 'group' }) => {
    const newGroups = produce(get(timelineGroupsAtom), (draft) => {
      const timeline = findTimeline(draft, timelineId);
      if (timeline) {
        const newNode: Node =
          nodeType === 'task'
            ? {
                id: nanoid(),
                type: 'task',
                title: 'New Task',
                status: 'todo',
              }
            : {
                id: nanoid(),
                type: 'group',
                title: 'New Group',
                status: 'todo',
                subtasks: [],
              };
        timeline.nodes.push(newNode);
      }
    });
    set(timelineGroupsAtom, newGroups);
  },
);

export const updateNodeTitleAtom = atom(
  null,
  (
    get,
    set,
    { timelineId, nodeId, newTitle }: { timelineId: string; nodeId: string; newTitle: string },
  ) => {
    const newGroups = produce(get(timelineGroupsAtom), (draft) => {
      const timeline = findTimeline(draft, timelineId);
      if (timeline) {
        const node = timeline.nodes.find((n) => n.id === nodeId);
        if (node) {
          node.title = newTitle;
        }
      }
    });
    set(timelineGroupsAtom, newGroups);
  },
);

export const removeNodeAtom = atom(
  null,
  (get, set, { timelineId, nodeId }: { timelineId: string; nodeId: string }) => {
    const newGroups = produce(get(timelineGroupsAtom), (draft) => {
      const timeline = findTimeline(draft, timelineId);
      if (timeline) {
        timeline.nodes = timeline.nodes.filter((n) => n.id !== nodeId);
      }
    });
    set(timelineGroupsAtom, newGroups);
  },
);
