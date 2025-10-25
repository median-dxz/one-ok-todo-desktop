import { atom } from 'jotai';
import { selectedNodeIdAtom } from './timelineGroups';
import type { TimelineNode } from '@/types/timeline';
import { timelineGroupsAtom } from './timelineGroups';

export const selectedNodeAtom = atom<TimelineNode | null>((get) => {
  const timelineGroups = get(timelineGroupsAtom);
  const selectedNodeId = get(selectedNodeIdAtom);

  if (!selectedNodeId) {
    return null;
  }

  for (const group of timelineGroups) {
    for (const timeline of group.timelines) {
      const foundNode = timeline.nodes.find((node) => node.id === selectedNodeId);
      if (foundNode) {
        return foundNode;
      }
    }
  }

  return null;
});
