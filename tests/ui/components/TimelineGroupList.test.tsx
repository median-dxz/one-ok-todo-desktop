import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from '@/components/ui/Provider';
import { TimelineGroupList } from '@/components/timeline/TimelineGroupList';
import { useStore } from '@/store';
import type { TimelineGroup } from '@/types/timeline';

// 模拟Swapy库
vi.mock('swapy', () => ({
  createSwapy: vi.fn(() => ({
    onSwap: vi.fn(),
    onSwapEnd: vi.fn(),
    destroy: vi.fn(),
    enable: vi.fn(),
  })),
  utils: {
    initSlotItemMap: vi.fn((items) => items.map((item, index) => ({ slot: `slot-${index}`, item: item.id }))),
    toSlottedItems: vi.fn((items, key, slotItemMap) =>
      items.map((item, index) => ({
        slotId: `slot-${index}`,
        itemId: item[key],
        item,
      }))
    ),
    dynamicSwapy: vi.fn(),
  },
}));

const mockTimelineGroups: TimelineGroup[] = [
  {
    id: 'group-1',
    title: '工作',
    timelines: [],
  },
  {
    id: 'group-2',
    title: '生活',
    timelines: [],
  },
];

describe('TimelineGroupList 组件测试', () => {
  const mockOnEdit = vi.fn();

  beforeEach(() => {
    // 重置store状态
    useStore.setState({
      timelineGroups: mockTimelineGroups,
      selectedTimelineGroup: mockTimelineGroups[0],
    });
    mockOnEdit.mockClear();
  });

  it('应该渲染时间线组列表', () => {
    render(
      <Provider>
        <TimelineGroupList onEdit={mockOnEdit} />
      </Provider>
    );

    expect(screen.getByText('工作')).toBeInTheDocument();
    expect(screen.getByText('生活')).toBeInTheDocument();
  });

  it('点击编辑按钮应该调用onEdit回调', async () => {
    const user = userEvent.setup();
    
    render(
      <Provider>
        <TimelineGroupList onEdit={mockOnEdit} />
      </Provider>
    );

    const editButtons = screen.getAllByLabelText(/编辑/i);
    await user.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it('点击时间线组应该更新选中状态', async () => {
    const user = userEvent.setup();
    
    render(
      <Provider>
        <TimelineGroupList onEdit={mockOnEdit} />
      </Provider>
    );

    const secondGroup = screen.getByText('生活');
    await user.click(secondGroup);

    await waitFor(() => {
      expect(useStore.getState().selectedTimelineGroup?.id).toBe('group-2');
    });
  });

  it('空列表时应该显示适当的内容', () => {
    useStore.setState({ timelineGroups: [] });

    render(
      <Provider>
        <TimelineGroupList onEdit={mockOnEdit} />
      </Provider>
    );

    // 由于列表为空，不应该有任何时间线组
    expect(screen.queryByText('工作')).not.toBeInTheDocument();
    expect(screen.queryByText('生活')).not.toBeInTheDocument();
  });
});
