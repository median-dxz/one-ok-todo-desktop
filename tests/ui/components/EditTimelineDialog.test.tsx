import { Provider } from '@/components/context/Provider';
import { EditTimelineDialog } from '@/components/timeline/EditTimelineDialog';
import { useAppStore } from '@/store';
import type { DelimiterNodeFlat, RecurrenceTimelineFlat, TaskTimelineFlat, TimelineGroupFlat } from '@/types/flat';
import { useDialog } from '@chakra-ui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

function DialogTestWrapper({
  timeline,
  onOpenChange,
}: {
  timeline?: TaskTimelineFlat | RecurrenceTimelineFlat | null;
  onOpenChange?: (open: boolean) => void;
}) {
  const disclosure = useDialog({
    defaultOpen: true,
    onOpenChange: (details) => onOpenChange?.(details.open),
  });
  return <EditTimelineDialog timeline={timeline} disclosure={disclosure} />;
}

describe('EditTimelineDialog 组件综合测试', () => {
  const mockGroup: TimelineGroupFlat = {
    id: 'test-group',
    title: '测试分组',
    timelineOrder: ['test-timeline'],
  };

  const startDelimiterId = 'start-delimiter-123';
  const mockStartDelimiter: DelimiterNodeFlat = {
    id: startDelimiterId,
    type: 'delimiter',
    markerType: 'start',
    timelineId: 'test-timeline',
    dependedBy: [],
  };

  const mockTaskTimeline: TaskTimelineFlat = {
    id: 'test-timeline',
    title: '测试任务时间线',
    type: 'task',
    groupId: mockGroup.id,
    nodeOrder: [startDelimiterId],
  };

  const mockRecurrenceTimeline: RecurrenceTimelineFlat = {
    id: 'recurrence-timeline',
    title: '测试循环时间线',
    type: 'recurrence',
    groupId: mockGroup.id,
    completedTasks: [],
    frequency: 'daily',
    pattern: {
      taskTemplates: [
        {
          title: '任务模板',
          content: { subtasks: [], description: '' },
        },
      ],
      currentIndex: 0,
    },
    startDate: new Date('2024-01-01'),
  };

  const setupStore = (customState = {}) => {
    useAppStore.setState({
      groups: { [mockGroup.id]: mockGroup },
      timelines: {},
      nodes: {},
      groupOrder: [mockGroup.id],
      selectedTimelineGroupId: mockGroup.id,
      ...customState,
    });
  };

  const renderDialog = (timeline: TaskTimelineFlat | RecurrenceTimelineFlat | null = null) => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    const utils = render(
      <Provider>
        <DialogTestWrapper timeline={timeline} onOpenChange={onOpenChange} />
      </Provider>,
    );
    return { ...utils, user, onOpenChange };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('基础创建和验证流程', async () => {
    setupStore({ groups: { [mockGroup.id]: { ...mockGroup, timelineOrder: [] } } });
    const { user, onOpenChange } = renderDialog(null);

    // 1. 验证创建模式标题和基础状态
    expect(screen.getByText('创建时间线')).toBeInTheDocument();
    const taskRadioInput = screen.getByRole('radio', { name: /任务/i });
    const recurrenceRadioInput = screen.getByRole('radio', { name: /循环/i });
    expect(taskRadioInput).toBeChecked();
    expect(recurrenceRadioInput).not.toBeChecked();

    // 2. 验证空标题验证错误
    const saveButton = screen.getByText('创建');
    await user.click(saveButton);
    await waitFor(() => {
      expect(screen.getByText(/Too small/i)).toBeInTheDocument();
    });

    // 3. 补全标题成功保存
    const input = screen.getByPlaceholderText(/输入时间线名称/i);
    await user.type(input, '新任务时间线');
    await user.click(saveButton);

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    const state = useAppStore.getState();
    const newId = Object.keys(state.timelines)[0];
    expect(state.timelines[newId]).toMatchObject({
      title: '新任务时间线',
      type: 'task',
    });
  });

  describe('状态切换与保存集成行为 (State Toggling Flows)', () => {
    it('任务 -> 循环 -> 任务 保存 (应保留原有 nodeOrder 等基础字段)', async () => {
      setupStore({
        timelines: { [mockTaskTimeline.id]: mockTaskTimeline },
        nodes: { [startDelimiterId]: mockStartDelimiter },
      });
      const { user, onOpenChange } = renderDialog(mockTaskTimeline);
      expect(screen.getByText('编辑时间线')).toBeInTheDocument();

      // 切到循环
      await user.click(screen.getByText('循环'));
      await waitFor(() => expect(screen.getByText('任务模板')).toBeInTheDocument());

      // 切回任务
      await user.click(screen.getByText('任务', { exact: true }));
      await waitFor(() => expect(screen.queryByText('任务模板')).not.toBeInTheDocument());

      // 保存断言
      await user.click(screen.getByText('保存'));
      await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));

      const saved = useAppStore.getState().timelines[mockTaskTimeline.id] as TaskTimelineFlat;
      expect(saved.type).toBe('task');
      expect(saved.title).toBe('测试任务时间线');
      expect(saved.nodeOrder).toContain(startDelimiterId); // 验证基础字段在切换中未丢失
      expect(saved.nodeOrder).toHaveLength(1);
      // 应确保没有附加的循环任务特有字段被混入
      expect(saved).not.toHaveProperty('pattern');
    });

    it('任务 -> 循环 保存 (应初始化循环模板字段，并丢弃 nodeOrder)', async () => {
      setupStore({
        timelines: { [mockTaskTimeline.id]: mockTaskTimeline },
        nodes: { [startDelimiterId]: mockStartDelimiter },
      });
      const { user, onOpenChange } = renderDialog(mockTaskTimeline);

      // 切到循环直接保存
      await user.click(screen.getByText('循环'));
      await waitFor(() => expect(screen.getByText('任务模板')).toBeInTheDocument());
      await user.click(screen.getByText('保存'));
      await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));

      const saved = useAppStore.getState().timelines[mockTaskTimeline.id] as RecurrenceTimelineFlat;
      expect(saved.type).toBe('recurrence');
      expect(saved).toHaveProperty('pattern');
      expect(saved).toHaveProperty('frequency');
      expect(saved).toHaveProperty('startDate');
      expect(saved).not.toHaveProperty('nodeOrder'); // 转换为循环后应丢弃独立 task 特有字段
    });

    it('循环 -> 任务 -> 循环 保存 (应保留并重建 pattern 等循环字段)', async () => {
      setupStore({
        groups: { [mockGroup.id]: { ...mockGroup, timelineOrder: ['recurrence-timeline'] } },
        timelines: { [mockRecurrenceTimeline.id]: mockRecurrenceTimeline },
      });
      const { user, onOpenChange } = renderDialog(mockRecurrenceTimeline);

      expect(screen.getByRole('group', { name: '任务模板' })).toBeInTheDocument();

      // 切到任务
      await user.click(screen.getByText('任务', { exact: true }));
      await waitFor(() => expect(screen.queryByRole('group', { name: '任务模板' })).not.toBeInTheDocument());

      // 再次切回循环
      await user.click(screen.getByText('循环'));
      await waitFor(() => expect(screen.getByRole('group', { name: '任务模板' })).toBeInTheDocument());

      // 保存并断言
      await user.click(screen.getByText('保存'));
      await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));

      const saved = useAppStore.getState().timelines[mockRecurrenceTimeline.id] as RecurrenceTimelineFlat;
      expect(saved.type).toBe('recurrence');
      expect(saved.pattern.taskTemplates).toHaveLength(1);
      expect(saved.pattern.taskTemplates[0].title).toBe('任务模板');
    });

    it('循环 -> 任务 保存 (应丢弃循环特有的 pattern 等字段并初始化 nodeOrder)', async () => {
      setupStore({
        groups: { [mockGroup.id]: { ...mockGroup, timelineOrder: ['recurrence-timeline'] } },
        timelines: { [mockRecurrenceTimeline.id]: mockRecurrenceTimeline },
      });
      const { user, onOpenChange } = renderDialog(mockRecurrenceTimeline);

      // 切到任务直接保存
      await user.click(screen.getByText('任务', { exact: true }));
      await waitFor(() => expect(screen.queryByRole('group', { name: '任务模板' })).not.toBeInTheDocument());

      await user.click(screen.getByText('保存'));
      await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));

      const saved = useAppStore.getState().timelines[mockRecurrenceTimeline.id] as TaskTimelineFlat;
      expect(saved.type).toBe('task');
      expect(saved.title).toBe('测试循环时间线');

      // 核心断言：清洗清理了独有字段，并补全了 `nodeOrder` 这种 Task 需要的前置要求
      expect(saved).not.toHaveProperty('pattern');
      expect(saved).not.toHaveProperty('frequency');
      expect(saved).not.toHaveProperty('startDate');
      expect(saved).toHaveProperty('nodeOrder');
    });
  });
});
