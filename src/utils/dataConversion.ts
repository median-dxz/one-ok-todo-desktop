import type { TimelineFlat, TimelineGroupFlat, FlatTimelineData } from '@/types/flat';
import type { TimelineGroup, TimelineNode } from '@/types/timeline';

/**
 * 将持久化的嵌套结构转换为扁平化的运行时结构
 */
export function flattenPersistedData(persisted: TimelineGroup[]): FlatTimelineData {
  const groups: Record<string, TimelineGroupFlat> = {};
  const timelines: Record<string, TimelineFlat> = {};
  const nodes: Record<string, TimelineNode> = {};
  const groupOrder: string[] = [];

  for (const pGroup of persisted) {
    const timelineOrder: string[] = [];

    for (const pTimeline of pGroup.timelines) {
      if (pTimeline.type === 'task') {
        // 提取 nodes 到扁平字典
        for (const node of pTimeline.nodes) {
          nodes[node.id] = node;
        }

        // TaskTimeline 只含 nodes ID
        const { nodes: pNodes, ...rest } = pTimeline;
        timelines[pTimeline.id] = { ...rest, nodeOrder: pNodes.map((n) => n.id) };
      } else {
        // RecurrenceTimeline 保持原样
        timelines[pTimeline.id] = pTimeline;
      }
      timelineOrder.push(pTimeline.id);
    }

    groups[pGroup.id] = {
      id: pGroup.id,
      title: pGroup.title,
      timelineOrder,
    };
    groupOrder.push(pGroup.id);
  }

  return { groups, timelines, nodes, groupOrder };
}

/**
 * 将扁平化的运行时结构转换回持久化的嵌套结构
 */
export function nestFlatData(flat: FlatTimelineData): TimelineGroup[] {
  return flat.groupOrder.map((groupId) => {
    const group = flat.groups[groupId];

    const timelines = group.timelineOrder.map((timelineId) => {
      const timeline = flat.timelines[timelineId];

      if (timeline.type === 'task') {
        // 收集属于此 timeline 的节点
        const timelineNodes = Object.values(flat.nodes).filter((n) => n.timelineId === timelineId);

        // 重新附上 nodes
        return { ...timeline, nodes: timelineNodes };
      } else {
        return timeline;
      }
    });

    return {
      id: group.id,
      title: group.title,
      timelines,
    };
  });
}
