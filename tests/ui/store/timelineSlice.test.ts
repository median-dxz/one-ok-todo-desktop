import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '@/store';
import { newTimelineGroup, newTaskTimeline, newRecurrenceTimeline } from '@/store/timelineSlice';
import type { TimelineGroup } from '@/types/timeline';

describe('timelineSlice Store测试', () => {
  beforeEach(() => {
    // 重置store到初始状态
    useStore.setState({
      timelineGroups: [],
      selectedTimelineGroup: null,
      editingTimelineGroup: null,
    });
  });

  describe('时间线组管理', () => {
    it('应该能够添加时间线组', () => {
      const group = newTimelineGroup();
      group.title = '测试分组';

      useStore.getState().addTimelineGroup(group);

      const { timelineGroups, selectedTimelineGroup } = useStore.getState();
      expect(timelineGroups).toHaveLength(1);
      expect(timelineGroups[0].title).toBe('测试分组');
      expect(selectedTimelineGroup).toBe(group);
    });

    it('应该能够删除时间线组', () => {
      const group1 = newTimelineGroup();
      group1.title = '分组1';
      const group2 = newTimelineGroup();
      group2.title = '分组2';

      useStore.getState().addTimelineGroup(group1);
      useStore.getState().addTimelineGroup(group2);

      useStore.getState().deleteTimelineGroup(group1.id);

      const { timelineGroups } = useStore.getState();
      expect(timelineGroups).toHaveLength(1);
      expect(timelineGroups[0].title).toBe('分组2');
    });

    it('应该能够更新时间线组', () => {
      const group = newTimelineGroup();
      group.title = '原标题';

      useStore.getState().addTimelineGroup(group);

      useStore.getState().updateTimelineGroup(group.id, (draft) => {
        draft.title = '新标题';
      });

      const { timelineGroups } = useStore.getState();
      expect(timelineGroups[0].title).toBe('新标题');
    });

    it('应该能够重新排序时间线组', () => {
      const group1 = newTimelineGroup();
      group1.title = '分组1';
      const group2 = newTimelineGroup();
      group2.title = '分组2';
      const group3 = newTimelineGroup();
      group3.title = '分组3';

      useStore.getState().setTimelineGroups([group1, group2, group3]);

      // 重新排序：2, 3, 1
      useStore.getState().reorderTimelineGroups([group2.id, group3.id, group1.id]);

      const { timelineGroups } = useStore.getState();
      expect(timelineGroups[0].title).toBe('分组2');
      expect(timelineGroups[1].title).toBe('分组3');
      expect(timelineGroups[2].title).toBe('分组1');
    });

    it('删除选中的分组后应该自动选择第一个分组', () => {
      const group1 = newTimelineGroup();
      const group2 = newTimelineGroup();

      useStore.getState().setTimelineGroups([group1, group2]);
      useStore.getState().setSelectedTimelineGroup(group1);

      useStore.getState().deleteTimelineGroup(group1.id);

      const { selectedTimelineGroup } = useStore.getState();
      expect(selectedTimelineGroup).toBe(group2);
    });
  });

  describe('时间线管理', () => {
    it('应该能够添加任务时间线', () => {
      const group = newTimelineGroup();
      useStore.getState().addTimelineGroup(group);

      const timeline = newTaskTimeline('测试时间线');
      useStore.getState().addTimeline(timeline);

      const { timelineGroups } = useStore.getState();
      expect(timelineGroups[0].timelines).toHaveLength(1);
      expect(timelineGroups[0].timelines[0].title).toBe('测试时间线');
      expect(timelineGroups[0].timelines[0].type).toBe('task');
    });

    it('应该能够添加循环时间线', () => {
      const group = newTimelineGroup();
      useStore.getState().addTimelineGroup(group);

      const timeline = newRecurrenceTimeline('每日任务');
      useStore.getState().addTimeline(timeline);

      const { timelineGroups } = useStore.getState();
      expect(timelineGroups[0].timelines).toHaveLength(1);
      expect(timelineGroups[0].timelines[0].title).toBe('每日任务');
      expect(timelineGroups[0].timelines[0].type).toBe('recurrence');
    });

    it('应该能够删除时间线', () => {
      const group = newTimelineGroup();
      useStore.getState().addTimelineGroup(group);

      const timeline = newTaskTimeline('测试时间线');
      useStore.getState().addTimeline(timeline);

      useStore.getState().deleteTimeline(timeline.id);

      const { timelineGroups } = useStore.getState();
      expect(timelineGroups[0].timelines).toHaveLength(0);
    });

    it('应该能够更新时间线', () => {
      const group = newTimelineGroup();
      useStore.getState().addTimelineGroup(group);

      const timeline = newTaskTimeline('原标题');
      useStore.getState().addTimeline(timeline);

      useStore.getState().updateTimeline(timeline.id, (draft) => {
        draft.title = '新标题';
      });

      const { timelineGroups } = useStore.getState();
      expect(timelineGroups[0].timelines[0].title).toBe('新标题');
    });
  });

  describe('选中状态管理', () => {
    it('添加第一个分组时应该自动选中', () => {
      const group = newTimelineGroup();
      useStore.getState().addTimelineGroup(group);

      const { selectedTimelineGroup } = useStore.getState();
      expect(selectedTimelineGroup).toBe(group);
    });

    it('应该能够手动设置选中的分组', () => {
      const group1 = newTimelineGroup();
      const group2 = newTimelineGroup();

      useStore.getState().setTimelineGroups([group1, group2]);
      useStore.getState().setSelectedTimelineGroup(group2);

      const { selectedTimelineGroup } = useStore.getState();
      expect(selectedTimelineGroup).toBe(group2);
    });

    it('应该能够设置编辑中的分组', () => {
      const group = newTimelineGroup();
      
      useStore.getState().setEditingTimelineGroup(group);

      const { editingTimelineGroup } = useStore.getState();
      expect(editingTimelineGroup).toBe(group);
    });
  });

  describe('工厂函数', () => {
    it('newTimelineGroup应该创建有效的分组', () => {
      const group = newTimelineGroup();

      expect(group.id).toBeTruthy();
      expect(group.title).toBe('');
      expect(group.timelines).toEqual([]);
    });

    it('newTaskTimeline应该创建有效的任务时间线', () => {
      const timeline = newTaskTimeline('测试');

      expect(timeline.id).toBeTruthy();
      expect(timeline.title).toBe('测试');
      expect(timeline.type).toBe('task');
      expect(timeline.nodes).toHaveLength(1); // 应该有一个起始分隔符
      expect(timeline.nodes[0].type).toBe('delimiter');
    });

    it('newRecurrenceTimeline应该创建有效的循环时间线', () => {
      const timeline = newRecurrenceTimeline('每日任务');

      expect(timeline.id).toBeTruthy();
      expect(timeline.title).toBe('每日任务');
      expect(timeline.type).toBe('recurrence');
      expect(timeline.frequency).toBe('daily');
      expect(timeline.pattern.taskTemplates).toHaveLength(1);
      expect(timeline.completedTasks).toEqual([]);
    });
  });
});
