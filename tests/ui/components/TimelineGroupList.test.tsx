import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from '@/components/context/Provider';
import { TimelineGroupList } from '@/components/timeline/TimelineGroupList';
import { useAppStore } from '@/store';
import type { TimelineGroup } from '@/types/timeline';

const mockGroups: Record<string, TimelineGroup> = {
  'group-1': {
    id: 'group-1',
    title: '工作',
    timelineOrder: [],
  },
  'group-2': {
    id: 'group-2',
    title: '生活',
    timelineOrder: [],
  },
};
const mockGroupOrder = ['group-1', 'group-2'];

describe('TimelineGroupList 组件测试', () => {
  const mockOnEdit = vi.fn();

  beforeEach(() => {
    // 重置store状态
    useAppStore.setState({
      groups: mockGroups,
      groupOrder: mockGroupOrder,
      selectedTimelineGroupId: 'group-1',
    });
    mockOnEdit.mockClear();
  });

  it('应该渲染时间线组列表', () => {
    render(
      <Provider>
        <TimelineGroupList onEdit={mockOnEdit} />
      </Provider>,
    );

    expect(screen.getByText('工作')).toBeInTheDocument();
    expect(screen.getByText('生活')).toBeInTheDocument();
  });

  it('点击编辑按钮应该调用onEdit回调', async () => {
    const user = userEvent.setup();

    render(
      <Provider>
        <TimelineGroupList onEdit={mockOnEdit} />
      </Provider>,
    );

    const moreButtons = screen.getAllByLabelText(/更多操作/i);
    await user.click(moreButtons[0]);
    
    const editItem = screen.getByText(/编辑/i);
    await user.click(editItem);

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it('点击时间线组应该更新选中状态', async () => {
    const user = userEvent.setup();

    render(
      <Provider>
        <TimelineGroupList onEdit={mockOnEdit} />
      </Provider>,
    );

    const secondGroup = screen.getByText('生活');
    await user.click(secondGroup);

    await waitFor(() => {
      expect(useAppStore.getState().selectedTimelineGroupId).toBe('group-2');
    });
  });

  it('空列表时应该显示适当的内容', () => {
    useAppStore.setState({ groups: {}, groupOrder: [] });

    render(
      <Provider>
        <TimelineGroupList onEdit={mockOnEdit} />
      </Provider>,
    );

    // 由于列表为空，不应该有任何时间线组
    expect(screen.queryByText('工作')).not.toBeInTheDocument();
    expect(screen.queryByText('生活')).not.toBeInTheDocument();
  });
});
