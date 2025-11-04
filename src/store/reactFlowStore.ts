import type { RecurrenceInstance, TaskNode, Timeline, TimelineGroup } from '@/types/timeline';
import { getReactFlowObjects, type RFNode } from '@/utils/reactFlowObjects';
import type { Edge, OnEdgesChange, OnNodesChange } from '@xyflow/react';
import { applyEdgeChanges, applyNodeChanges } from '@xyflow/react';
import { useEffect } from 'react';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { subscribeWithSelector } from 'zustand/middleware';
import { useAppStore } from './index';
import { createTaskNode, selectTimelineGroupById } from './timelineSlice';

/**
 * React Flow 中间层 Store
 *
 * 这个 store 作为 React Flow 和主 Zustand store 之间的桥梁：
 * 1. 监听 selectedTimelineGroup 的变化并初始化/重置图
 * 2. 维护 nodes 和 edges 的状态
 * 3. 将 React Flow 的变化同步回主 store
 */
interface ReactFlowStoreState {
  nodes: RFNode[];
  edges: Edge[];

  // Actions
  setNodes: (nodes: RFNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: OnNodesChange<RFNode>;
  onEdgesChange: OnEdgesChange;

  addTimeline: (timeline: Timeline) => void;
  updateTimeline: (timelineId: string, timelineUpdater: (timeline: Timeline) => void) => void;
  deleteTimeline: (timelineId: string) => void;
  addTaskNode: (
    timelineId: string,
    sourceNodeId: string,
    nodeData: Omit<TaskNode, 'id' | 'prevs' | 'succs'>,
    insertMode: 'succ' | 'prev',
  ) => void;
  updateTaskNodeStatus: (
    timelineId: string,
    node: TaskNode | RecurrenceInstance,
    status: 'done' | 'skipped' | 'todo',
  ) => void;

  // 从 selectedTimelineGroup 初始化图
  initializeFromTimelineGroup: (group: TimelineGroup | null) => void;

  syncWithTimelineSlice: () => void;
}

export const useReactFlowStateStore = create<ReactFlowStoreState>()(
  subscribeWithSelector(
    immer((set, get) => ({
      nodes: [],
      edges: [],

      setNodes: (nodes) => {
        set({ nodes });
      },
      setEdges: (edges) => {
        set({ edges });
      },

      onNodesChange: (changes) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes),
        });
      },

      onEdgesChange: (changes) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },

      initializeFromTimelineGroup: (group) => {
        set(getReactFlowObjects(group));
      },

      addTimeline: (timeline) => {
        useAppStore.getState().addTimeline(timeline);
        get().syncWithTimelineSlice();
      },

      updateTimeline: (timelineId, timelineUpdater) => {
        useAppStore.getState().updateTimeline(timelineId, timelineUpdater);
        get().syncWithTimelineSlice();
      },

      deleteTimeline: (timelineId) => {
        useAppStore.getState().deleteTimeline(timelineId);
        get().syncWithTimelineSlice();
      },

      addTaskNode: (timelineId, sourceNodeId, nodeData, insertMode) => {
        useAppStore.getState().updateTimeline(timelineId, (timeline) => {
          if (timeline.type !== 'task') return;

          const sourceIndex = timeline.nodes.findIndex((n) => n.id === sourceNodeId);
          if (sourceIndex === -1) return;

          const taskToAdd = createTaskNode(nodeData);

          const source = timeline.nodes[sourceIndex];

          if (insertMode === 'succ') {
            // 在源节点之后插入
            taskToAdd.prevs = [source.id];
            taskToAdd.succs = source.succs;

            // 更新所有原后继节点的前驱
            source.succs.forEach((succId) => {
              const succNode = timeline.nodes.find((n) => n.id === succId);
              if (succNode) {
                succNode.prevs = succNode.prevs.map((p) => (p === source.id ? taskToAdd.id : p));
              }
            });

            // 更新源节点的后继
            source.succs = [taskToAdd.id];
            timeline.nodes.push(taskToAdd);
          } else if (insertMode === 'prev' && source.type !== 'delimiter') {
            // 在源节点之前插入
            taskToAdd.succs = [source.id];
            taskToAdd.prevs = source.prevs;

            // 更新所有原前驱节点的后继
            source.prevs.forEach((prevId) => {
              const prevNode = timeline.nodes.find((n) => n.id === prevId);
              if (prevNode) {
                prevNode.succs = prevNode.succs.map((s) => (s === source.id ? taskToAdd.id : s));
              }
            });

            // 更新源节点的前驱
            source.prevs = [taskToAdd.id];
            timeline.nodes.push(taskToAdd);
          }
        });
        get().syncWithTimelineSlice();
      },

      updateTaskNodeStatus: (timelineId, targetNode, status) => {
        useAppStore.getState().updateTimeline(timelineId, (timeline) => {
          if (timeline?.type === 'task') {
            const node = timeline.nodes.find((n) => n.id === targetNode.id);
            if (node?.type === 'task') {
              node.status = status;
            }
          } else if (
            timeline?.type === 'recurrence' &&
            targetNode.type === 'task' &&
            (status === 'done' || status === 'skipped')
          ) {
            const recurrenceInstance = { ...targetNode } as RecurrenceInstance;
            recurrenceInstance.status = status;
            timeline.completedTasks.push(recurrenceInstance);
          }
        });
        get().syncWithTimelineSlice();
      },

      syncWithTimelineSlice: () => {
        const groups = useAppStore.getState().timelineGroups;
        const group = groups.find((g) => g.id === useAppStore.getState().selectedTimelineGroupId);
        if (!group) return;

        const { nodes: newNodes, edges: newEdges } = getReactFlowObjects(group);
        const s = new Set(newNodes);

        set((state) => {
          state.nodes = state.nodes.filter((node) => {
            const r = newNodes.find((nn) => nn.id === node.id);

            if (r) {
              s.delete(r);
              node.data = r.data;
              node.position = r.position;
              return true;
            } else {
              return false;
            }
          });

          state.nodes.push(...s);
          state.edges = newEdges;
        });
      },
    })),
  ),
);

/**
 * Hook: 监听 selectedTimelineGroup 的变化并自动初始化 React Flow store
 */
export const useReactFlowStore = <T>(selector: (state: ReactFlowStoreState) => T): T => {
  const initializeFromTimelineGroup = useReactFlowStateStore((state) => state.initializeFromTimelineGroup);

  // 使用 useEffect 监听 selectedTimelineGroup 变化
  useEffect(() => {
    initializeFromTimelineGroup(
      selectTimelineGroupById(useAppStore.getState().selectedTimelineGroupId)(useAppStore.getState()),
    );

    const unsubApp = useAppStore.subscribe((state, prevState) => {
      if (state.selectedTimelineGroupId !== prevState.selectedTimelineGroupId) {
        initializeFromTimelineGroup(selectTimelineGroupById(state.selectedTimelineGroupId)(state));
      }
    });

    return () => {
      unsubApp();
    };
  }, []);

  return useReactFlowStateStore(selector);
};

export const reactFlowSelector = (state: ReactFlowStoreState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
});

export const useAddTimeline = () => useReactFlowStateStore((state) => state.addTimeline);
export const useUpdateTimeline = () => useReactFlowStateStore((state) => state.updateTimeline);
export const useDeleteTimeline = () => useReactFlowStateStore((state) => state.deleteTimeline);
export const useAddTaskNode = () => useReactFlowStateStore((state) => state.addTaskNode);
export const useUpdateTaskNodeStatus = () => useReactFlowStateStore((state) => state.updateTaskNodeStatus);
