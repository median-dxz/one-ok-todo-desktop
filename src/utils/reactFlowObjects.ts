import type {
  BaseNode,
  RecurrenceInstance,
  RecurrenceTimeline,
  TaskTimeline,
  Timeline,
  TimelineNode,
  NodeType as TimelineNodeType,
} from '@/types/timeline';
import type { Edge, Node } from '@xyflow/react';
import type { TimelineGroup } from '@/types/timeline';
import { nanoid } from 'nanoid';

type ExtendedTLNode<T extends BaseNode> = T & { timeline: Timeline };
export type RFNode<T extends BaseNode = TimelineNode> = Node<ExtendedTLNode<T>, TimelineNodeType | string>;

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
      ...taskTimeline.nodes.map((node): RFNode => {
        const rfNode: RFNode = {
          id: node.id,
          type: node.type,
          draggable: false,
          position: { x: 0, y: 0 },
          data: { ...node, timeline },
        };

        switch (node.type) {
          case 'task':
          case 'delimiter':
            node.prevs.forEach((prevId) => {
              edges.push({
                id: `e-${prevId}-${node.id}`,
                source: prevId,
                target: node.id,
                ...edgeConfig,
              });
            });
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
        prevs: [],
        succs: [],
        timeline,
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
        data: {
          id: currentNodeId,
          title: completedTask.title,
          type: 'task',
          status: completedTask.status,
          prevs: [prevNode.data.id],
          succs: [],
          completedDate: completedTask.completedDate,
          timeline,
        },
      };

      allNodes.push(currentNode);
      prevNode.data.succs.push(currentNode.id);

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

        const futureNodeId = `${taskTemplate.id}-${nanoid()}`;
        const futureNode: RFNode = {
          id: futureRFNodeId,
          type: 'task',
          draggable: false,
          position: { x: 0, y: 0 },
          data: {
            ...taskTemplate,
            id: futureNodeId,
            status: i === 0 ? 'todo' : 'lock',
            prevs: [prevNode.data.id],
            succs: [],
            timeline,
          } satisfies ExtendedTLNode<RecurrenceInstance>,
        };

        allNodes.push(futureNode);
        prevNode.data.succs.push(futureNodeId);

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
          prevs: [prevNode.id],
          succs: [],
          timeline,
        },
      });
      prevNode.data.succs.push(endNodeId);

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
  const startNodes = nodes.filter(({ data: node }) => node.type === 'delimiter' && node.markerType === 'start');
  let startY = 0;

  const traversed = new Set<string>();

  const traverse = (node: RFNode, pos: { x: number; y: number }) => {
    if (traversed.has(node.id)) return;
    traversed.add(node.id);

    // 计算节点位置
    node.position = { ...pos };
    startY = Math.max(startY, pos.y + NODE_GAP.y);

    // 递归遍历子节点
    node.data.succs.forEach((child, index) => {
      const childNode = nodes.find((n) => n.data.id === child);
      if (childNode && childNode.data.timeline.id === node.data.timeline.id) {
        traverse(childNode, { x: pos.x + NODE_GAP.x, y: pos.y + index * NODE_GAP.y });
      }
    });
  };

  startNodes.forEach((startNode) => {
    traverse(startNode, { x: 0, y: startY });
  });
};
