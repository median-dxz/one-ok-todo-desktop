import type { RecurrenceTimeline, TaskNode, TaskTimeline, Timeline, TimelineGroup } from '@/types/timeline';
import { type Producer } from 'immer';
import { nanoid } from 'nanoid';
import type { StateCreator } from 'zustand';
import type { StoreState } from './index';

export interface TimelineSlice {
  timelineGroups: TimelineGroup[];
  selectedTimelineGroupId: string | null;
  editingTimelineGroup: TimelineGroup | null;

  setTimelineGroups: (recipe: Producer<TimelineGroup[]>) => void;

  setSelectedTimelineGroupId: (groupId: string | null) => void;
  setEditingTimelineGroup: (group: TimelineGroup | null) => void;

  addTimelineGroup: (group: TimelineGroup) => void;
  deleteTimelineGroup: (groupId: string) => void;
  reorderTimelineGroups: (newGroupIds: string[]) => void;
  updateTimelineGroup: (groupId: string, recipe: Producer<TimelineGroup>) => void;

  addTimeline: (timeline: Timeline) => void;
  updateTimeline: (timelineId: string, recipe: Producer<Timeline>) => void;
  deleteTimeline: (timelineId: string) => void;
}

export const createTimelineSlice: StateCreator<
  StoreState,
  [['zustand/immer', never], ['zustand/persist', unknown]],
  [],
  TimelineSlice
> = (set) => ({
  timelineGroups: [],
  selectedTimelineGroupId: null,
  editingTimelineGroup: null,

  setTimelineGroups: (recipe) =>
    set((state) => {
      const r = recipe(state.timelineGroups);
      r && (state.timelineGroups = r);

      if (state.timelineGroups.length > 0 && state.selectedTimelineGroupId === null) {
        state.selectedTimelineGroupId = state.timelineGroups[0].id;
      }
    }),

  setSelectedTimelineGroupId: (groupId) => set({ selectedTimelineGroupId: groupId }),

  setEditingTimelineGroup: (group) => set({ editingTimelineGroup: group }),

  addTimelineGroup: (group) =>
    set((state) => {
      state.timelineGroups.push(group);
      state.selectedTimelineGroupId = group.id;
    }),

  deleteTimelineGroup: (groupId) =>
    set((state) => {
      state.timelineGroups = state.timelineGroups.filter((group) => group.id !== groupId);
      if (state.selectedTimelineGroupId === groupId) {
        state.selectedTimelineGroupId = state.timelineGroups[0]?.id ?? null;
      }
    }),

  reorderTimelineGroups: (newGroupIds) =>
    set((state) => {
      const groupMap = new Map(state.timelineGroups.map((group) => [group.id, group]));
      state.timelineGroups = newGroupIds.map((id) => groupMap.get(id)!);
    }),

  updateTimelineGroup: (groupId, recipe) =>
    set((state) => {
      const group = state.timelineGroups.find((g) => g.id === groupId);
      if (group) {
        const r = recipe(group);
        r && Object.assign(group, r);
      }
    }),

  addTimeline: (timeline) =>
    set((state) => {
      const group = state.timelineGroups.find((tl) => tl.id === state.selectedTimelineGroupId);
      if (group) {
        group.timelines.push(timeline);
      }
    }),

  updateTimeline: (timelineId, recipe) =>
    set((state) => {
      const group = state.timelineGroups.find((tl) => tl.id === state.selectedTimelineGroupId);
      const timeline = group?.timelines.find((tl) => tl.id === timelineId);
      if (timeline) {
        const r = recipe(timeline);
        r && Object.assign(timeline, r);
      }
    }),

  deleteTimeline: (timelineId) =>
    set((state) => {
      const group = state.timelineGroups.find((tl) => tl.id === state.selectedTimelineGroupId);
      if (group) {
        group.timelines = group.timelines.filter((tl) => tl.id !== timelineId);
      }
    }),
});

export const createTimelineGroup = (title: string = ''): TimelineGroup => ({
  id: nanoid(),
  title,
  timelines: [],
});

export const DIRTY_TIMELINE_GROUP = createTimelineGroup();

export const newRecurrenceTimeline = (title: string): RecurrenceTimeline => {
  return {
    id: nanoid(),
    title,
    type: 'recurrence',
    completedTasks: [],
    frequency: 'daily',
    pattern: {
      taskTemplates: [
        {
          id: nanoid(),
          type: 'task',
          title: 'Recurrence Task',
          status: 'todo',
          prevs: [],
          succs: [],
        },
      ],
    },
    startDate: new Date().toISOString(),
  };
};

export const createTaskTimeline = (title: string): TaskTimeline => {
  const tl: TaskTimeline = {
    id: nanoid(),
    title,
    type: 'task',
    nodes: [],
  };
  tl.nodes.push({
    id: nanoid(),
    type: 'delimiter',
    markerType: 'start',
    prevs: [],
    succs: [],
  });
  return tl;
};

export const createTaskNode = (data: Omit<TaskNode, 'id' | 'prevs' | 'succs'>): TaskNode => {
  return {
    ...data,
    id: nanoid(),
    prevs: [],
    succs: [],
  };
};

export const selectTimelineGroupById =
  (groupId: string | null) =>
  (state: StoreState): TimelineGroup | null => {
    return state.timelineGroups.find((g) => g.id === groupId) || null;
  };
