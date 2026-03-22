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

describe('EditTimelineDialog 组件测试', () => {
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
          content: {
            subtasks: [],
            description: '',
          },
        },
      ],
      currentIndex: 0,
    },
    startDate: new Date('2024-01-01'),
  };

  beforeEach(() => {
    useAppStore.setState({
      groups: { [mockGroup.id]: mockGroup },
      timelines: { [mockTaskTimeline.id]: mockTaskTimeline },
      nodes: { [startDelimiterId]: mockStartDelimiter },
      groupOrder: [mockGroup.id],
      selectedTimelineGroupId: mockGroup.id,
    });
  });

  it('编辑模式应该显示正确的标题', () => {
    render(
      <Provider>
        <DialogTestWrapper timeline={mockTaskTimeline} />
      </Provider>,
    );

    expect(screen.getByText('编辑时间线')).toBeInTheDocument();
    expect(screen.getByDisplayValue('测试任务时间线')).toBeInTheDocument();
  });

  it('检查 RadioGroup 选中状态是否正确', async () => {
    const user = userEvent.setup();

    render(
      <Provider>
        <DialogTestWrapper timeline={mockTaskTimeline} />
      </Provider>,
    );

    const taskRadioInput = screen.getByRole('radio', { name: /任务/i });
    const recurrenceRadioInput = screen.getByRole('radio', { name: /循环/i });

    expect(taskRadioInput).toBeChecked();
    expect(recurrenceRadioInput).not.toBeChecked();

    await user.click(recurrenceRadioInput);
    expect(recurrenceRadioInput).toBeChecked();
    expect(taskRadioInput).not.toBeChecked();

    await user.click(taskRadioInput);
    expect(taskRadioInput).toBeChecked();
    expect(recurrenceRadioInput).not.toBeChecked();
  });

  it('任务->循环->任务 类型切换后应该能够保存', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <Provider>
        <DialogTestWrapper timeline={mockTaskTimeline} onOpenChange={onOpenChange} />
      </Provider>,
    );

    expect(screen.getByText('任务')).toBeInTheDocument();

    const recurrenceRadio = screen.getByText('循环');
    await user.click(recurrenceRadio);

    await waitFor(() => {
      expect(screen.getByText('任务模板')).toBeInTheDocument();
    });

    const taskRadio = screen.getByText('任务');
    await user.click(taskRadio);

    await waitFor(() => {
      expect(screen.queryByText('任务模板')).not.toBeInTheDocument();
    });

    const saveButton = screen.getByText('保存');
    await user.click(saveButton);

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    const state = useAppStore.getState();
    expect(state.timelines[mockTaskTimeline.id]).toBeDefined();
    expect(state.timelines[mockTaskTimeline.id].type).toBe('task');
    expect(state.timelines[mockTaskTimeline.id].title).toBe('测试任务时间线');
  });

  it('任务->循环 类型切换后应该能够保存', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <Provider>
        <DialogTestWrapper timeline={mockTaskTimeline} onOpenChange={onOpenChange} />
      </Provider>,
    );

    const recurrenceRadio = screen.getByText('循环');
    await user.click(recurrenceRadio);

    await waitFor(() => {
      expect(screen.getByText('任务模板')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('保存');
    await user.click(saveButton);

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    const state = useAppStore.getState();
    expect(state.timelines[mockTaskTimeline.id]).toBeDefined();
    expect(state.timelines[mockTaskTimeline.id].type).toBe('recurrence');
  });

  it('创建模式应该能够创建任务类型时间线', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    useAppStore.setState({
      groups: { [mockGroup.id]: { ...mockGroup, timelineOrder: [] } },
      timelines: {},
      nodes: {},
      groupOrder: [mockGroup.id],
      selectedTimelineGroupId: mockGroup.id,
    });

    render(
      <Provider>
        <DialogTestWrapper timeline={null} onOpenChange={onOpenChange} />
      </Provider>,
    );

    expect(screen.getByText('创建时间线')).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/输入时间线名称/i);
    await user.type(input, '新任务时间线');

    const saveButton = screen.getByText('创建');
    await user.click(saveButton);

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    const state = useAppStore.getState();
    const timelineIds = Object.keys(state.timelines);
    expect(timelineIds).toHaveLength(1);
    expect(state.timelines[timelineIds[0]].title).toBe('新任务时间线');
    expect(state.timelines[timelineIds[0]].type).toBe('task');
  });

  it('验证失败时应该显示错误信息', async () => {
    const user = userEvent.setup();

    render(
      <Provider>
        <DialogTestWrapper timeline={mockTaskTimeline} />
      </Provider>,
    );

    const input = screen.getByPlaceholderText(/输入时间线名称/i);
    await user.clear(input);

    const saveButton = screen.getByText('保存');
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Too small/i)).toBeInTheDocument();
    });
  });

  it('任务->循环->任务 类型切换后应该保留 nodeOrder', async () => {
    const user = userEvent.setup();

    render(
      <Provider>
        <DialogTestWrapper timeline={mockTaskTimeline} />
      </Provider>,
    );

    const recurrenceLabel = screen.getByText('循环');
    await user.click(recurrenceLabel);

    await waitFor(() => {
      expect(screen.getByText('任务模板')).toBeInTheDocument();
    });

    const taskLabel = screen.getByText('任务', { exact: true });
    await user.click(taskLabel);

    await waitFor(() => {
      expect(screen.queryByText('任务模板')).not.toBeInTheDocument();
    });

    const saveButton = screen.getByText('保存');
    await user.click(saveButton);

    await waitFor(() => {
      const state = useAppStore.getState();
      const timeline = state.timelines[mockTaskTimeline.id];
      expect(timeline).toBeDefined();
      expect(timeline.type).toBe('task');
      expect(timeline.title).toBe('测试任务时间线');
      expect('nodeOrder' in timeline).toBe(true);
    });
  });

  it('任务->循环->任务 类型切换后应该保留原有 nodeOrder 中的节点 ID', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    useAppStore.setState({
      groups: { [mockGroup.id]: mockGroup },
      timelines: { [mockTaskTimeline.id]: mockTaskTimeline },
      nodes: { [startDelimiterId]: mockStartDelimiter },
      groupOrder: [mockGroup.id],
      selectedTimelineGroupId: mockGroup.id,
    });

    render(
      <Provider>
        <DialogTestWrapper timeline={mockTaskTimeline} onOpenChange={onOpenChange} />
      </Provider>,
    );

    const recurrenceLabel = screen.getByText('循环');
    await user.click(recurrenceLabel);

    await waitFor(() => {
      expect(screen.getByText('任务模板')).toBeInTheDocument();
    });

    const taskLabel = screen.getByText('任务', { exact: true });
    await user.click(taskLabel);

    await waitFor(() => {
      expect(screen.queryByText('任务模板')).not.toBeInTheDocument();
    });

    const saveButton = screen.getByText('保存');
    await user.click(saveButton);

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    const state = useAppStore.getState();
    const savedTimeline = state.timelines[mockTaskTimeline.id];
    expect(savedTimeline).toBeDefined();
    expect(savedTimeline.type).toBe('task');
    if (savedTimeline.type === 'task') {
      expect(savedTimeline.nodeOrder).toContain(startDelimiterId);
      expect(savedTimeline.nodeOrder.length).toBe(1);
    }
  });

  it('循环->任务 类型切换后应该能够保存', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    useAppStore.setState({
      groups: { [mockGroup.id]: { ...mockGroup, timelineOrder: ['recurrence-timeline'] } },
      timelines: { [mockRecurrenceTimeline.id]: mockRecurrenceTimeline },
      nodes: {},
      groupOrder: [mockGroup.id],
      selectedTimelineGroupId: mockGroup.id,
    });

    render(
      <Provider>
        <DialogTestWrapper timeline={mockRecurrenceTimeline} onOpenChange={onOpenChange} />
      </Provider>,
    );

    expect(screen.getByRole('group', { name: '任务模板' })).toBeInTheDocument();

    const taskLabel = screen.getByText('任务', { exact: true });
    await user.click(taskLabel);

    await waitFor(() => {
      expect(screen.queryByRole('group', { name: '任务模板' })).not.toBeInTheDocument();
    });

    const saveButton = screen.getByText('保存');
    await user.click(saveButton);

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    const state = useAppStore.getState();
    const savedTimeline = state.timelines[mockRecurrenceTimeline.id];
    expect(savedTimeline).toBeDefined();
    expect(savedTimeline.type).toBe('task');
    expect(savedTimeline.title).toBe('测试循环时间线');
  });

  it('循环->任务->循环 类型切换后应该能够保存', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    useAppStore.setState({
      groups: { [mockGroup.id]: { ...mockGroup, timelineOrder: ['recurrence-timeline'] } },
      timelines: { [mockRecurrenceTimeline.id]: mockRecurrenceTimeline },
      nodes: {},
      groupOrder: [mockGroup.id],
      selectedTimelineGroupId: mockGroup.id,
    });

    render(
      <Provider>
        <DialogTestWrapper timeline={mockRecurrenceTimeline} onOpenChange={onOpenChange} />
      </Provider>,
    );

    expect(screen.getByRole('group', { name: '任务模板' })).toBeInTheDocument();

    const taskLabel = screen.getByText('任务', { exact: true });
    await user.click(taskLabel);

    await waitFor(() => {
      expect(screen.queryByRole('group', { name: '任务模板' })).not.toBeInTheDocument();
    });

    const recurrenceLabel = screen.getByText('循环');
    await user.click(recurrenceLabel);

    await waitFor(() => {
      expect(screen.getByRole('group', { name: '任务模板' })).toBeInTheDocument();
    });

    const saveButton = screen.getByText('保存');
    await user.click(saveButton);

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    const state = useAppStore.getState();
    const savedTimeline = state.timelines[mockRecurrenceTimeline.id];
    expect(savedTimeline).toBeDefined();
    expect(savedTimeline.type).toBe('recurrence');
    expect(savedTimeline.title).toBe('测试循环时间线');
  });

  it('循环->任务 类型切换后不应该保留 recurrence 特有字段', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    useAppStore.setState({
      groups: { [mockGroup.id]: { ...mockGroup, timelineOrder: ['recurrence-timeline'] } },
      timelines: { [mockRecurrenceTimeline.id]: mockRecurrenceTimeline },
      nodes: {},
      groupOrder: [mockGroup.id],
      selectedTimelineGroupId: mockGroup.id,
    });

    render(
      <Provider>
        <DialogTestWrapper timeline={mockRecurrenceTimeline} onOpenChange={onOpenChange} />
      </Provider>,
    );

    const taskLabel = screen.getByText('任务', { exact: true });
    await user.click(taskLabel);

    await waitFor(() => {
      expect(screen.queryByRole('group', { name: '任务模板' })).not.toBeInTheDocument();
    });

    const saveButton = screen.getByText('保存');
    await user.click(saveButton);

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    const state = useAppStore.getState();
    const savedTimeline = state.timelines[mockRecurrenceTimeline.id];
    expect(savedTimeline).toBeDefined();
    expect(savedTimeline.type).toBe('task');
    expect(savedTimeline).not.toHaveProperty('pattern');
    expect(savedTimeline).not.toHaveProperty('frequency');
    expect(savedTimeline).not.toHaveProperty('startDate');
  });
});
