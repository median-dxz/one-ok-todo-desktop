import type { TaskNode, Timeline, NodeStatus } from '@/types/timeline';

export function computeNodeStatus(node: TaskNode, allNodes: TaskNode[]): NodeStatus {
  if (node.status === 'done' || node.status === 'skipped') {
    return node.status;
  }

  if (node.prevs.length === 0) {
    return 'todo';
  }

  const prevNodes = node.prevs.map((p) => allNodes.find((n) => n.id === p)).filter(Boolean) as TaskNode[];

  if (prevNodes.length !== node.prevs.length) {
    // A predecessor node is missing, which is an invalid state.
    // Lock the node to prevent actions.
    return 'lock';
  }

  const allPrevsDone = prevNodes.every((p) => p.status === 'done' || p.status === 'skipped');

  return allPrevsDone ? 'todo' : 'lock';
}

export function computeTimelineStatus(timeline: Timeline): 'todo' | 'doing' | 'done' {
  if ('completedTasks' in timeline) {
    // Logic for recurrence timelines can be based on its own status or stats
    return 'todo';
  }

  if ('nodes' in timeline) {
    const nodes = timeline.nodes;
    if (nodes.every((n) => n.status === 'done' || n.status === 'skipped')) {
      return 'done';
    }
    if (nodes.some((n) => n.milestone)) {
      return 'doing';
    }
    return 'todo';
  }

  return 'todo';
}
