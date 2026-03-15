import { useAppStore } from '@/store';
import type { RecurrenceTimelineFlat, TaskTimelineFlat, TimelineGroupFlat } from '@/types/flat';
import { nanoid } from 'nanoid';
import { beforeEach, describe, expect, it } from 'vitest';

// ─── 测试数据工厂 ─────────────────────────────────────────────────────────────

function createTimelineGroup(title = 'New Group'): TimelineGroupFlat {
  return {
    id: nanoid(),
    title,
    timelineOrder: [],
  };
}

function createTaskTimeline(groupId: string, title = 'New Task Timeline'): TaskTimelineFlat {
  return {
    id: nanoid(),
    title,
    type: 'task',
    nodeOrder: [],
    groupId,
  };
}

function createRecurrenceTimeline(groupId: string, title = 'New Recurrence Timeline'): RecurrenceTimelineFlat {
  const taskTemplates = [{ title: 'Template 1', content: { description: '', subtasks: [] } }];
  return {
    id: nanoid(),
    groupId,
    title,
    type: 'recurrence',
    startDate: new Date(),
    frequency: 'daily',
    pattern: {
      taskTemplates,
      currentIndex: 0,
    },
    completedTasks: [],
  };
}

describe('timelineSlice Store测试', () => {
  beforeEach(() => {
    // 重置store到初始状态
    useAppStore.setState({
      groups: {},
      timelines: {},
      nodes: {},
      groupOrder: [],
      selectedTimelineGroupId: null,
    });
  });

  describe('时间线组管理', () => {
    it('应该能够添加时间线组', () => {
      const group = createTimelineGroup();
      group.title = '测试分组';

      useAppStore.getState().addTimelineGroup(group);

      const state = useAppStore.getState();
      expect(state.groupOrder).toHaveLength(1);
      expect(state.groups[group.id].title).toBe('测试分组');
      expect(state.selectedTimelineGroupId).toBe(group.id);
    });

    it('应该能够删除时间线组', () => {
      const group1 = createTimelineGroup();
      group1.title = '分组1';
      const group2 = createTimelineGroup();
      group2.title = '分组2';

      useAppStore.getState().addTimelineGroup(group1);
      useAppStore.getState().addTimelineGroup(group2);

      useAppStore.getState().deleteTimelineGroup(group1.id);

      const state = useAppStore.getState();
      expect(state.groupOrder).toHaveLength(1);
      expect(state.groups[state.groupOrder[0]].title).toBe('分组2');
    });

    it('应该能够更新时间线组', () => {
      const group = createTimelineGroup();
      group.title = '原标题';

      useAppStore.getState().addTimelineGroup(group);

      useAppStore.getState().updateTimelineGroup(group.id, (draft) => {
        draft.title = '新标题';
      });

      const state = useAppStore.getState();
      expect(state.groups[group.id].title).toBe('新标题');
    });

    it('应该能够重新排序时间线组', () => {
      const group1 = createTimelineGroup('分组1');
      const group2 = createTimelineGroup('分组2');
      const group3 = createTimelineGroup('分组3');

      useAppStore.getState().addTimelineGroup(group1);
      useAppStore.getState().addTimelineGroup(group2);
      useAppStore.getState().addTimelineGroup(group3);

      // 重新排序：2, 3, 1
      useAppStore.getState().reorderTimelineGroups([group2.id, group3.id, group1.id]);

      const state = useAppStore.getState();
      expect(state.groups[state.groupOrder[0]].title).toBe('分组2');
      expect(state.groups[state.groupOrder[1]].title).toBe('分组3');
      expect(state.groups[state.groupOrder[2]].title).toBe('分组1');
    });

    it('删除选中的分组后应该自动选择第一个分组', () => {
      const group1 = createTimelineGroup();
      const group2 = createTimelineGroup();

      useAppStore.getState().addTimelineGroup(group1);
      useAppStore.getState().addTimelineGroup(group2);
      useAppStore.getState().setSelectedTimelineGroupId(group1.id);

      useAppStore.getState().deleteTimelineGroup(group1.id);

      const { selectedTimelineGroupId } = useAppStore.getState();
      expect(selectedTimelineGroupId).toBe(group2.id);
    });
  });

  describe('时间线管理', () => {
    it('应该能够添加任务时间线', () => {
      const group = createTimelineGroup();
      useAppStore.getState().addTimelineGroup(group);

      const timeline = createTaskTimeline(group.id, '测试时间线');
      useAppStore.getState().addTimeline(group.id, timeline);

      const state = useAppStore.getState();
      expect(state.groups[group.id].timelineOrder).toHaveLength(1);
      expect(state.timelines[timeline.id].title).toBe('测试时间线');
      expect(state.timelines[timeline.id].type).toBe('task');
      // addTimeline should auto-create a start delimiter node
      const timelineNodes = Object.values(state.nodes).filter((n) => n.timelineId === timeline.id);
      expect(timelineNodes).toHaveLength(1);
      expect(timelineNodes[0].type).toBe('delimiter');
    });

    it('应该能够添加循环时间线', () => {
      const group = createTimelineGroup();
      useAppStore.getState().addTimelineGroup(group);

      const timeline = createRecurrenceTimeline(group.id, '每日任务');
      useAppStore.getState().addTimeline(group.id, timeline);

      const state = useAppStore.getState();
      expect(state.groups[group.id].timelineOrder).toHaveLength(1);
      expect(state.timelines[timeline.id].title).toBe('每日任务');
      expect(state.timelines[timeline.id].type).toBe('recurrence');
    });

    it('应该能够删除时间线', () => {
      const group = createTimelineGroup();
      useAppStore.getState().addTimelineGroup(group);

      const timeline = createTaskTimeline(group.id, '测试时间线');
      useAppStore.getState().addTimeline(group.id, timeline);

      useAppStore.getState().deleteTimeline(timeline.id);

      const state = useAppStore.getState();
      expect(state.groups[group.id].timelineOrder).toHaveLength(0);
      expect(state.timelines[timeline.id]).toBeUndefined();
      // Nodes should be cascade-deleted
      const timelineNodes = Object.values(state.nodes).filter((n) => n.timelineId === timeline.id);
      expect(timelineNodes).toHaveLength(0);
    });

    it('应该能够更新时间线', () => {
      const group = createTimelineGroup();
      useAppStore.getState().addTimelineGroup(group);

      const timeline = createTaskTimeline(group.id, '原标题');
      useAppStore.getState().addTimeline(group.id, timeline);

      useAppStore.getState().updateTimeline(timeline.id, (draft) => {
        draft.title = '新标题';
      });

      const state = useAppStore.getState();
      expect(state.timelines[timeline.id].title).toBe('新标题');
    });
  });

  describe('选中状态管理', () => {
    it('添加第一个分组时应该自动选中', () => {
      const group = createTimelineGroup();
      useAppStore.getState().addTimelineGroup(group);

      const { selectedTimelineGroupId } = useAppStore.getState();
      expect(selectedTimelineGroupId).toBe(group.id);
    });

    it('应该能够手动设置选中的分组', () => {
      const group1 = createTimelineGroup();
      const group2 = createTimelineGroup();

      useAppStore.getState().addTimelineGroup(group1);
      useAppStore.getState().addTimelineGroup(group2);
      useAppStore.getState().setSelectedTimelineGroupId(group2.id);

      const { selectedTimelineGroupId } = useAppStore.getState();
      expect(selectedTimelineGroupId).toBe(group2.id);
    });
  });
});
