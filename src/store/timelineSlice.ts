import type {
  FlatTimelineData,
  TaskNodeDraft,
  TimelineDraft,
  TimelineFlat,
  TimelineGroupDraft,
  TimelineGroupFlat,
} from '@/types/flat';
import { TaskNodeFlatSchema, TimelineFlatSchema, TimelineGroupFlatSchema } from '@/types/flat';
import type {
  DelimiterNode,
  NodeStatus,
  RecurrenceTaskInstance,
  RecurrenceTimeline,
  TaskNode,
  TaskTimeline,
  Timeline,
  TimelineGroup,
  TimelineNode,
} from '@/types/timeline';
import { type Producer } from 'immer';
import { nanoid } from 'nanoid';
import type { StateCreator } from 'zustand';
import type { StoreState } from './index';

export interface TimelineSlice extends FlatTimelineData {
  importFlatData: (data: {
    groups: Record<string, TimelineGroupFlat>;
    timelines: Record<string, TimelineFlat>;
    nodes: Record<string, TimelineNode>;
    groupOrder: string[];
  }) => void;

  selectedTimelineGroupId: string | null;
  setSelectedTimelineGroupId: (groupId: string | null) => void;

  addTimelineGroup: (group: TimelineGroupDraft) => void;
  deleteTimelineGroup: (groupId: string) => void;
  reorderTimelineGroups: (newGroupIds: string[]) => void;
  updateTimelineGroup: (groupId: string, recipe: Producer<TimelineGroupFlat>) => void;

  addTimeline: (groupId: string, timeline: TimelineDraft) => void;
  updateTimeline: (timelineId: string, recipe: Producer<TimelineFlat>) => void;
  deleteTimeline: (timelineId: string) => void;

  updateNode: (nodeId: string, recipe: Producer<TimelineNode>) => void;

  addTaskNode: (
    timelineId: string,
    insertData: {
      sourceId: string;
      draft: TaskNodeDraft;
      insertMode: 'before' | 'after';
    },
  ) => void;

  updateTaskNodeStatus: (
    timelineId: string,
    node: TaskNode | RecurrenceTaskInstance,
    status: Exclude<NodeStatus, 'locked'>,
  ) => void;
}

export const createTimelineSlice: StateCreator<
  StoreState,
  [['zustand/immer', never], ['zustand/persist', unknown]],
  [],
  TimelineSlice
> = (set) => ({
  groups: {},
  timelines: {},
  nodes: {},
  groupOrder: [],
  selectedTimelineGroupId: null,
  editingTimelineGroupId: null,

  setSelectedTimelineGroupId: (groupId) => set({ selectedTimelineGroupId: groupId }),

  importFlatData: (data) =>
    set((state) => {
      state.groups = data.groups;
      state.timelines = data.timelines;
      state.nodes = data.nodes;
      state.groupOrder = data.groupOrder;
    }),

  addTimelineGroup: (draft) =>
    set((state) => {
      const result = TimelineGroupFlatSchema.safeParse(draft);
      if (!result.success) {
        throw new Error('Invalid timeline group draft', { cause: result.error });
      }
      const group = result.data;
      state.groups[group.id] = group;
      state.groupOrder.push(group.id);
      state.selectedTimelineGroupId = group.id;
    }),

  deleteTimelineGroup: (groupId) =>
    set((state) => {
      const group = state.groups[groupId];
      if (!group) return;

      // 级联删除关联 timelines 和 nodes
      for (const timelineId of group.timelineOrder) {
        const timeline = state.timelines[timelineId];
        if (timeline?.type === 'task') {
          // 删除属于该 timeline 的所有 nodes
          for (const nodeId of timeline.nodeOrder) {
            delete state.nodes[nodeId];
          }
        }
        delete state.timelines[timelineId];
      }

      delete state.groups[groupId];
      state.groupOrder = state.groupOrder.filter((id) => id !== groupId);

      if (state.selectedTimelineGroupId === groupId) {
        state.selectedTimelineGroupId = state.groupOrder[0] ?? null;
      }
    }),

  reorderTimelineGroups: (newGroupIds) =>
    set((state) => {
      state.groupOrder = newGroupIds;
    }),

  updateTimelineGroup: (groupId, recipe) =>
    set((state) => {
      const group = state.groups[groupId];
      if (group) {
        const r = recipe(group);
        r && Object.assign(group, r);
      }
    }),

  addTimeline: (groupId, draft) =>
    set((state) => {
      if (!state.groups[groupId]) return;

      const draftWithGroupId = { ...draft, groupId };
      const result = TimelineFlatSchema.safeParse(draftWithGroupId);

      if (!result.success) {
        throw new Error('Invalid timeline draft', { cause: result.error });
      }

      const timeline = result.data;
      state.timelines[timeline.id] = timeline;
      state.groups[groupId].timelineOrder.push(timeline.id);

      // 自动为 task timeline 创建起始 delimiter 节点
      if (timeline.type === 'task') {
        const startNodeId = nanoid();
        state.nodes[startNodeId] = {
          id: startNodeId,
          type: 'delimiter',
          markerType: 'start',
          timelineId: timeline.id,
          dependedBy: [],
        } satisfies DelimiterNode;
        timeline.nodeOrder = [startNodeId];
      }
    }),

  updateTimeline: (timelineId, recipe) =>
    set((state) => {
      const timeline = state.timelines[timelineId];
      if (timeline) {
        const r = recipe(timeline);
        r && Object.assign(timeline, r);
      }
    }),

  updateNode: (nodeId, recipe) =>
    set((state) => {
      const node = state.nodes[nodeId];
      if (node) {
        const r = recipe(node);
        r && Object.assign(node, r);
      }
    }),

  deleteTimeline: (timelineId) =>
    set((state) => {
      const timeline = state.timelines[timelineId];
      if (!timeline) return;

      // 级联删除属于该 timeline 的 nodes
      if (timeline.type === 'task') {
        for (const nodeId of timeline.nodeOrder) {
          delete state.nodes[nodeId];
        }
      }

      // 从所属 group 的 timelineOrder 中移除
      const group = state.groups[timeline.groupId];
      if (group) {
        group.timelineOrder = group.timelineOrder.filter((id) => id !== timelineId);
      }

      delete state.timelines[timelineId];
    }),

  addTaskNode: (timelineId, { draft, insertMode, sourceId }) =>
    set((state) => {
      const timeline = state.timelines[timelineId];
      if (!timeline || timeline.type !== 'task') {
        throw new Error('Timeline not found or is not a task timeline');
      }

      const source = state.nodes[sourceId];
      if (source?.timelineId !== timelineId) {
        throw new Error('Source node does not belong to the specified timeline');
      }

      const result = TaskNodeFlatSchema.safeParse({
        ...draft,
        timelineId,
        type: 'task',
      });

      if (!result.success) {
        throw new Error('Invalid task node draft', { cause: result.error });
      }

      const taskToAdd = result.data;
      const sourceIndex = timeline.nodeOrder.indexOf(sourceId);

      if (sourceIndex === -1) {
        throw new Error('Source node not found in timeline order');
      }

      if (insertMode === 'after') {
        // 在源节点之后插入
        timeline.nodeOrder.splice(sourceIndex + 1, 0, taskToAdd.id);
        state.nodes[taskToAdd.id] = taskToAdd;
      } else if (insertMode === 'before' && source.type !== 'delimiter') {
        // 在源节点之前插入
        timeline.nodeOrder.splice(sourceIndex, 0, taskToAdd.id);
        state.nodes[taskToAdd.id] = taskToAdd;
      }
    }),

  updateTaskNodeStatus: (timelineId, targetNode, status) =>
    set((state) => {
      const timeline = state.timelines[timelineId];
      if (!timeline) return;

      if (timeline.type === 'task') {
        const node = state.nodes[targetNode.id];
        if (node?.type === 'task') {
          node.status = status;
        }
      } else if (
        timeline.type === 'recurrence' &&
        targetNode.type === 'task' &&
        (status === 'done' || status === 'skipped')
      ) {
        timeline.completedTasks.push({ ...targetNode, status } as RecurrenceTaskInstance);
      }
    }),
});

export const createRecurrenceTimeline = (title: string, groupId: string = ''): RecurrenceTimeline => {
  return {
    id: nanoid(),
    title,
    type: 'recurrence',
    groupId,
    completedTasks: [],
    frequency: 'daily',
    pattern: {
      taskTemplates: [
        {
          title: 'Recurrence Task',
          content: {
            subtasks: [],
            description: '',
          },
        },
      ],
    },
    startDate: new Date(),
  };
};

// ─── Selectors ───

export const selectTimelineGroupById =
  (groupId?: string) =>
  (state: StoreState): TimelineGroupFlat | null => {
    if (!groupId) return null;
    return state.groups[groupId] ?? null;
  };

export const selectTimelinesForGroup =
  (groupId?: string) =>
  (state: StoreState): TimelineFlat[] => {
    if (!groupId) return [];
    const group = state.groups[groupId];

    return group?.timelineOrder.map((id) => state.timelines[id]).filter(Boolean) ?? [];
  };

export const selectTimelineById =
  (timelineId?: string) =>
  (state: StoreState): TimelineFlat | null => {
    if (!timelineId) return null;
    return state.timelines[timelineId] ?? null;
  };

export const selectNodesForTimeline =
  (timelineId?: string) =>
  (state: StoreState): TimelineNode[] => {
    if (!timelineId) return [];
    const timeline = state.timelines[timelineId];
    if (timeline?.type === 'task') {
      return timeline.nodeOrder.map((id) => state.nodes[id]).filter(Boolean);
    }
    return [];
  };

/**
 * 重组嵌套结构，供 React Flow bridge 和需要完整结构的场景使用
 * TODO: 临时桥接方案，后续在 React Flow 中直接使用展平数据
 */
export const selectNestedTimelineGroup =
  (groupId: string) =>
  (state: StoreState): TimelineGroup | null => {
    const group = state.groups[groupId];
    if (!group) return null;

    const timelines: Timeline[] = group.timelineOrder.map((tlId) => {
      const timeline = state.timelines[tlId];

      if (timeline.type === 'task') {
        const timelineNodes = timeline.nodeOrder.map((id) => state.nodes[id]).filter(Boolean);
        return { ...timeline, nodes: timelineNodes } as TaskTimeline;
      } else {
        return timeline;
      }
    });

    return {
      id: group.id,
      title: group.title,
      timelines,
    };
  };
