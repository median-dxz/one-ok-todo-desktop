import { getReactFlowObjects, type RFNode } from '@/utils/reactFlowObjects';
import type { Edge, OnEdgesChange, OnNodesChange } from '@xyflow/react';
import { applyEdgeChanges, applyNodeChanges } from '@xyflow/react';
import { create } from 'zustand';
import { shallow } from 'zustand/shallow';
import { immer } from 'zustand/middleware/immer';

import { subscribeWithSelector } from 'zustand/middleware';
import { useAppStore } from './index';
import { selectNestedTimelineGroup } from './timelineSlice';

/**
 * Diff 工具函数 - O(n) 版本
 * 保留旧节点上的 RF 内部属性（measured、selected 等），同时用新数据覆盖业务字段
 */
const diffAndMergeNodes = (oldNodes: RFNode[], newNodes: RFNode[]): RFNode[] => {
  const oldMap = new Map(oldNodes.map((n) => [n.id, n]));
  return newNodes.map((newNode) => {
    const old = oldMap.get(newNode.id);
    return old ? { ...old, data: newNode.data, position: newNode.position } : newNode;
  });
};

interface ReactFlowStoreState {
  nodes: RFNode[];
  edges: Edge[];

  // Actions
  setNodes: (nodes: RFNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: OnNodesChange<RFNode>;
  onEdgesChange: OnEdgesChange;
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
    })),
  ),
);

// 模块级订阅：AppStore 扁平状态变化 → 自动 diff 更新 RF Store
// 使用 shallow 比较扁平字段，避免无关状态变更（如 memo、view）触发重算
useAppStore.subscribe(
  (state) => ({
    groups: state.groups,
    timelines: state.timelines,
    nodes: state.nodes,
    selectedTimelineGroupId: state.selectedTimelineGroupId,
  }),
  ({ selectedTimelineGroupId }) => {
    const state = useAppStore.getState();
    if (!selectedTimelineGroupId) {
      useReactFlowStateStore.setState({ nodes: [], edges: [] });
      return;
    }
    const group = selectNestedTimelineGroup(selectedTimelineGroupId)(state);
    const { nodes: newNodes, edges: newEdges } = getReactFlowObjects(group);
    useReactFlowStateStore.setState((rfState) => ({
      nodes: diffAndMergeNodes(rfState.nodes, newNodes),
      edges: newEdges,
    }));
  },
  { equalityFn: shallow },
);

export const reactFlowSelector = (state: ReactFlowStoreState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
});
