import type {
  BaseNode,
  RecurrenceTimeline,
  TaskTimeline,
  Timeline,
  TimelineNode,
  NodeType as TimelineNodeType,
} from '@/types/timeline';
import type { Edge, Node } from '@xyflow/react';
import { atom, type PrimitiveAtom as Atom, type PrimitiveAtom } from 'jotai';
import { timelineAtomsAtom } from './timeline';
import { selectedTLGroupValueAtom } from './timelineGroup';

type ExtendedTLNode<T extends BaseNode> = T & { timelineAtom: PrimitiveAtom<Timeline> };
export type RFNode<T extends BaseNode = TimelineNode> = Node<ExtendedTLNode<T>, TimelineNodeType | 'unknown'>;

const NODE_GAP = 200;

export const reactFlowObjectsAtom = atom((get) => {
  const timelineGroup = get(selectedTLGroupValueAtom);
  const timelineAtoms = get(timelineAtomsAtom);

  const nodes: RFNode[] = [];
  const edges: Edge[] = [];
  let yPos = 0;

  if (!timelineGroup) {
    return { edges, nodes };
  }

  const renderTaskTimeline = (timelineAtom: PrimitiveAtom<Timeline>) => {
    const timeline = get(timelineAtom) as TaskTimeline;
    nodes.push(
      ...timeline.nodes.map((node, index): RFNode => {
        const rfNode: RFNode = {
          id: node.id,
          type: node.type,
          position: { x: index * NODE_GAP, y: yPos },
          data: { ...node, timelineAtom: timelineAtom as Atom<Timeline> },
        };

        const edgeConfig: Partial<Edge> = {
          type: 'smoothstep',
          animated: true,
        };

        switch (node.type) {
          case 'task':
          case 'delimiter':
            // 无向边只需要添加一次
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

  const renderRecurrenceTimeline = (timelineAtom: PrimitiveAtom<Timeline>) => {
    let xPos = 0;
    const allNodes: RFNode[] = [];
    const timeline = get(timelineAtom) as RecurrenceTimeline;

    // 1. 生成起始节点
    const startNodeId = `${timeline.id}-start`;
    allNodes.push({
      id: startNodeId,
      type: 'delimiter',
      position: { x: xPos, y: yPos },
      data: {
        id: startNodeId,
        type: 'delimiter',
        markerType: 'start',
        prevs: [],
        succs: [],
        timelineAtom,
      },
    });
    xPos += NODE_GAP;

    // 2. 渲染已完成的任务实例（作为链表）
    let prevNodeId = startNodeId;
    for (let i = 0; i < timeline.completedTasks.length; i++) {
      const completedTask = timeline.completedTasks[i];
      const currentNodeId = `${timeline.id}-completed-${i}`;
      const nextNodeId =
        i < timeline.completedTasks.length - 1
          ? `${timeline.id}-completed-${i + 1}`
          : timeline.endDate
            ? `${timeline.id}-end`
            : `${timeline.id}-future-0`;

      allNodes.push({
        id: currentNodeId,
        type: 'task',
        position: { x: xPos, y: yPos },
        data: {
          id: currentNodeId,
          title: completedTask.title,
          type: 'task',
          status: completedTask.status,
          prevs: [prevNodeId],
          succs: [nextNodeId],
          completedDate: completedTask.completedDate,
          timelineAtom,
        },
      });

      // 添加边
      edges.push({
        id: `e-${prevNodeId}-${currentNodeId}`,
        source: prevNodeId,
        target: currentNodeId,
        type: 'smoothstep',
        animated: true,
      });

      xPos += NODE_GAP;
      prevNodeId = currentNodeId;
    }

    // 3. 生成未来的任务节点（如果没有 endDate，则生成3个预测节点）
    if (!timeline.endDate) {
      const lastCompletedIndex = timeline.completedTasks.length - 1;
      const patternTasks = timeline.pattern?.tasks || [timeline.title];
      const currentPatternIndex = timeline.pattern?.currentIndex || 0;

      for (let i = 0; i < 3; i++) {
        const futureNodeId = `${timeline.id}-future-${i}`;
        const nextNodeId = i < 2 ? `${timeline.id}-future-${i + 1}` : undefined;

        // 轮换任务标题
        const taskIndex = (currentPatternIndex + lastCompletedIndex + 1 + i) % patternTasks.length;
        const taskTitle = patternTasks[taskIndex];

        allNodes.push({
          id: futureNodeId,
          type: 'task',
          position: { x: xPos, y: yPos },
          data: {
            id: futureNodeId,
            title: taskTitle,
            type: 'task',
            status: 'todo',
            prevs: [prevNodeId],
            succs: nextNodeId ? [nextNodeId] : [],
            timelineAtom,
          },
        });

        // 添加边
        edges.push({
          id: `e-${prevNodeId}-${futureNodeId}`,
          source: prevNodeId,
          target: futureNodeId,
          type: 'smoothstep',
          animated: true,
        });

        xPos += NODE_GAP;
        prevNodeId = futureNodeId;
      }
    }

    // 4. 如果有 endDate，生成结束节点
    if (timeline.endDate) {
      const endNodeId = `${timeline.id}-end`;
      allNodes.push({
        id: endNodeId,
        type: 'delimiter',
        position: { x: xPos, y: yPos },
        data: {
          id: endNodeId,
          type: 'delimiter',
          markerType: 'end',
          prevs: [prevNodeId],
          succs: [],
          timelineAtom,
        },
      });

      // 添加边
      edges.push({
        id: `e-${prevNodeId}-${endNodeId}`,
        source: prevNodeId,
        target: endNodeId,
        type: 'smoothstep',
        animated: true,
      });
    }

    // 添加所有节点到主节点列表
    nodes.push(...allNodes);
  };

  timelineAtoms.forEach((timelineAtom) => {
    switch (get(timelineAtom).type) {
      case 'task':
        renderTaskTimeline(timelineAtom);
        break;
      case 'recurrence':
        renderRecurrenceTimeline(timelineAtom);
        break;
      default:
        break;
    }
    yPos += 100;
  });

  return { nodes, edges };
});
