import { atom } from 'jotai';
import { selectedNodeIdAtom, selectedTimelineGroupIdAtom, timelineGroupsAtom } from './timelineGroups';
import type { TaskNode } from '@/types/timeline';

export const selectedNodeAtom = atom<TaskNode | null>((get) => {
  const timelineGroups = get(timelineGroupsAtom);
  const selectedNodeId = get(selectedNodeIdAtom);

  if (!selectedNodeId) {
    return null;
  }

  for (const group of timelineGroups) {
    for (const timeline of group.timelines) {
      if ('nodes' in timeline) {
        const foundNode = timeline.nodes.find((node) => node.id === selectedNodeId);
        if (foundNode) {
          return foundNode;
        }
      }
    }
  }

  return null;
});

export const selectedTimelineGroupAtom = atom((get) => {
  const groups = get(timelineGroupsAtom);
  const selectedId = get(selectedTimelineGroupIdAtom);
  return groups.find((g) => g.id === selectedId) ?? (groups.length > 0 ? groups[0] : null);
});
