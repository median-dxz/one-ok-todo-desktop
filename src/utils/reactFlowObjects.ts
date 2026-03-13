import type {
  BaseNode,
  RecurrenceTaskInstance,
  RecurrenceTimeline,
  TaskNode,
  TaskTimeline,
  Timeline,
  TimelineGroup,
  TimelineNode,
  NodeType as TimelineNodeType,
} from '@/types/timeline';

import type { Edge, Node } from '@xyflow/react';
import { produce } from 'immer';
import { nanoid } from 'nanoid';

export type RFNode<T extends BaseNode = TimelineNode> = Node<T, TimelineNodeType | string>;

const NODE_GAP = { x: 300, y: 100 };
const edgeConfig: Partial<Edge> = {
  type: 'smoothstep',
  animated: true,
};

export const getReactFlowObjects = (group: TimelineGroup | null) => {
  const nodes: RFNode[] = [];
  const edges: Edge[] = [];

  if (!group) {
    return { edges, nodes };
  }

  const renderTaskTimeline = (timeline: Timeline) => {
    const taskTimeline = timeline as TaskTimeline;
    nodes.push(
      ...taskTimeline.nodes.map((node, index): RFNode => {
        const rfNode: RFNode = {
          id: node.id,
          type: node.type,
          draggable: false,
          position: { x: 0, y: 0 },
          data: { ...node },
        };

        if (index > 0) {
          const prevNode = taskTimeline.nodes[index - 1];
          edges.push({
            id: `e-${prevNode.id}-${node.id}`,
            source: prevNode.id,
            target: node.id,
            ...edgeConfig,
          });
        }

        switch (node.type) {
          case 'task':
          case 'delimiter':
            return rfNode;
          default:
            rfNode.type = 'unknown';
            return rfNode;
        }
      }),
    );
  };

  const renderRecurrenceTimeline = (timeline: Timeline) => {
    const allNodes: RFNode[] = [];
    const recurrenceTimeline = timeline as RecurrenceTimeline;

    // 1. 生成起始节点
    const startNode: RFNode = {
      id: `${recurrenceTimeline.id}-start`,
      type: 'delimiter',
      draggable: false,
      position: { x: 0, y: 0 },
      data: {
        id: `${recurrenceTimeline.id}-start`,
        type: 'delimiter',
        markerType: 'start',
        timelineId: timeline.id,
        dependedBy: [],
      },
    };
    allNodes.push(startNode);

    let prevNode = startNode;

    // 2. 渲染已完成的任务实例（作为链表）
    for (let i = 0; i < recurrenceTimeline.completedTasks.length; i++) {
      const completedTask = recurrenceTimeline.completedTasks[i];
      const currentNodeId = `${recurrenceTimeline.id}-completed-${i}`;

      const currentNode: RFNode = {
        id: currentNodeId,
        type: 'task',
        draggable: false,
        position: { x: 0, y: 0 },
        data: produce((draft) => {
          draft.dependedBy = [];
          draft.dependsOn = [];
          draft.milestone = false;
        })(completedTask as TaskNode),
      };

      allNodes.push(currentNode);

      // 添加边
      edges.push({
        id: `e-${prevNode.id}-${currentNode.id}`,
        source: prevNode.id,
        target: currentNode.id,
        ...edgeConfig,
      });

      prevNode = currentNode;
    }

    // 3. 生成未来的任务节点（如果没有 endDate，则生成3个预测节点）
    if (!recurrenceTimeline.endDate) {
      const lastCompletedIndex = recurrenceTimeline.completedTasks.length - 1;
      const taskTemplates = recurrenceTimeline.pattern.taskTemplates;
      const currentPatternIndex = recurrenceTimeline.pattern?.currentIndex ?? 0;

      for (let i = 0; i < 3; i++) {
        const futureRFNodeId = `${recurrenceTimeline.id}-future-${i}`;

        // 轮换任务标题
        const taskIndex = (currentPatternIndex + lastCompletedIndex + 1 + i) % taskTemplates.length;
        const taskTemplate = taskTemplates[taskIndex];

        const futureNodeId = `${taskTemplate.title}-${nanoid()}`;
        const futureNode: RFNode = {
          id: futureRFNodeId,
          type: 'task',
          draggable: false,
          position: { x: 0, y: 0 },
          data: produce((draft) => {
            draft.id = futureNodeId;
            draft.status = i === 0 ? 'todo' : 'locked';
            draft.timelineId = timeline.id;
          })(taskTemplate as RecurrenceTaskInstance),
        };

        allNodes.push(futureNode);

        // 添加边
        edges.push({
          id: `e-${prevNode.id}-${futureNode.id}`,
          source: prevNode.id,
          target: futureNode.id,
          ...edgeConfig,
        });

        prevNode = futureNode;
      }
    }

    // 4. 如果有 endDate，生成结束节点
    if (recurrenceTimeline.endDate) {
      const endNodeId = `${recurrenceTimeline.id}-end`;
      allNodes.push({
        id: endNodeId,
        type: 'delimiter',
        draggable: false,
        position: { x: 0, y: 0 },
        data: {
          id: endNodeId,
          type: 'delimiter',
          markerType: 'end',
          timelineId: timeline.id,
          dependedBy: [],
        },
      });

      // 添加边
      edges.push({
        id: `e-${prevNode.id}-${endNodeId}`,
        source: prevNode.id,
        target: endNodeId,
        ...edgeConfig,
      });
    }

    // 添加所有节点到主节点列表
    nodes.push(...allNodes);
  };

  group.timelines.forEach((timeline) => {
    switch (timeline.type) {
      case 'task':
        renderTaskTimeline(timeline);
        break;
      case 'recurrence':
        renderRecurrenceTimeline(timeline);
        break;
      default:
        break;
    }
  });

  // 计算布局
  calcNodesPositions(nodes);

  return { nodes, edges };
};

const calcNodesPositions = (nodes: RFNode[]) => {
  let startY = 0;

  const timelineGroups = new Map<string, RFNode[]>();
  for (const node of nodes) {
    const timelineId = node.data.timelineId;
    if (!timelineGroups.has(timelineId)) {
      timelineGroups.set(timelineId, []);
    }
    timelineGroups.get(timelineId)!.push(node);
  }

  for (const [, timelineNodes] of timelineGroups) {
    let x = 0;
    for (const node of timelineNodes) {
      node.position = { x, y: startY };
      x += NODE_GAP.x;
    }
    startY += NODE_GAP.y;
  }
};
