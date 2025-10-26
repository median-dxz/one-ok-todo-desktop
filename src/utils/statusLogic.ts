import type { BaseNode, TaskTimelineNode as Node, Timeline } from '@/types/timeline';

export function computeDoingStatus(node: Node, timeline: Timeline): boolean {
  if (node.type === 'group') {
    // GroupNode: 任一 subtask 为 doing 则为 doing
    return node.subtasks.some((st) => st.status === 'doing');
  }

  // TaskNode: 检查是否有依赖项处于 doing
  if (node.depends_on && node.depends_on.length > 0) {
    return node.depends_on.some((depId) => {
      const depNode = timeline.nodes.find((n) => n.id === depId);
      return depNode && depNode.status === 'doing';
    });
  }

  return false;
}

export function computeDoneStatus(node: Node): boolean {
  if (node.type === 'group') {
    // GroupNode: 所有 subtask 都 done 或 skipped
    return node.subtasks.every((st) => st.status === 'done' || st.status === 'skipped');
  }

  // TaskNode: 检查定量模式完成度
  if (node.mode?.mode === 'quantitative') {
    const config = node.mode.quantitativeConfig!;
    return config.current >= config.target;
  }

  // 其他情况由用户标记或手动触发
  return node.status === 'done';
}

export function computeNodeLockStatus(node: BaseNode, timeline: Timeline, allTimelines: Timeline[]): boolean {
  // 1. 检查节点依赖
  if (node.depends_on && node.depends_on.length > 0) {
    const hasUnfinishedNodeDeps = node.depends_on.some((depNodeId) => {
      const depNode = timeline.nodes.find((n) => n.id === depNodeId);
      return depNode && depNode.status !== 'done' && depNode.status !== 'skipped';
    });
    if (hasUnfinishedNodeDeps) return true;
  }

  // 2. 检查 Timeline 依赖（支持多依赖）
  if (node.depends_on_timeline && node.depends_on_timeline.length > 0) {
    const hasUnfinishedTimelineDeps = node.depends_on_timeline.some((timelineId) => {
      const depTimeline = allTimelines.find((tl) => tl.id === timelineId);
      return depTimeline && computeTimelineStatus(depTimeline) !== 'done';
    });
    if (hasUnfinishedTimelineDeps) return true;
  }

  return false;
}

export function computeTimelineStatus(timeline: Timeline): 'todo' | 'doing' | 'done' {
  // 循环任务没有 nodes，状态基于统计信息
  if (timeline.recurrence) {
    return timeline.status || 'todo';
  }

  const nodes = timeline.nodes;
  if (nodes.every((n) => n.status === 'done' || n.status === 'skipped')) {
    return 'done';
  }
  if (nodes.some((n) => n.status === 'doing')) {
    return 'doing';
  }
  return 'todo';
}
