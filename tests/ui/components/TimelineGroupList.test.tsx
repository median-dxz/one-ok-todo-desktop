import { Provider } from '@/components/context/Provider';
import { TimelineGroupList } from '@/components/timeline/TimelineGroupList';
import { useAppStore } from '@/store';
import type { TimelineGroupFlat } from '@/types/flat';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGroups: Record<string, TimelineGroupFlat> = {
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
    mockOnEdit.mockClear();
  });

  it('交互操作：有数据时应正常渲染列表、支持选中切换并能触发编辑回调', async () => {
    const user = userEvent.setup();

    useAppStore.setState({
      groups: mockGroups,
      groupOrder: mockGroupOrder,
      selectedTimelineGroupId: 'group-1',
    });

    render(
      <Provider>
        <TimelineGroupList onEdit={mockOnEdit} />
      </Provider>,
    );

    // 1. 正常渲染
    expect(screen.getByText('工作')).toBeInTheDocument();
    expect(screen.getByText('生活')).toBeInTheDocument();

    // 2. 切换选中状态
    const secondGroup = screen.getByText('生活');
    await user.click(secondGroup);

    await waitFor(() => {
      expect(useAppStore.getState().selectedTimelineGroupId).toBe('group-2');
    });

    // 3. 点击菜单并进行编辑
    const moreButtons = screen.getAllByLabelText(/更多操作/i);
    await user.click(moreButtons[0]); // 点击工作项的更多按钮

    const editItem = screen.getByText(/编辑/i);
    await user.click(editItem);

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });
});
