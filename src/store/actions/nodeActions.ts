import { atom } from 'jotai';
import { timelineGroupsAtom } from '../timelineGroup';
import type { TaskNode, TimelineGroup } from '@/types/timeline';
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

export const addNodeAtom = atom(null, (get, set, { timelineId }: { timelineId: string }) => {
  const newGroups = produce(get(timelineGroupsAtom), (draft) => {
    const timeline = findTimeline(draft, timelineId);
    if (timeline && 'nodes' in timeline) {
      const newNode: TaskNode = {
        id: nanoid(),
        type: 'task',
        title: 'New Task',
        status: 'todo',
        prevs: [],
        succs: [],
        milestone: false,
      };
      timeline.nodes.push(newNode);
    }
  });
  set(timelineGroupsAtom, newGroups);
});

export const updateNodeTitleAtom = atom(
  null,
  (
    get,
    set,
    { timelineId, nodeId, newTitle }: { timelineId: string; nodeId: string; newTitle: string },
  ) => {
    const newGroups = produce(get(timelineGroupsAtom), (draft) => {
      const timeline = findTimeline(draft, timelineId);
      if (timeline && 'nodes' in timeline) {
        const node = timeline.nodes.find((n) => n.id === nodeId);
        if (node && node.type === 'task') {
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
      if (timeline && 'nodes' in timeline) {
        timeline.nodes = timeline.nodes.filter((n) => n.id !== nodeId);
      }
    });
    set(timelineGroupsAtom, newGroups);
  },
);
