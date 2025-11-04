import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from '@/components/ui/Provider';
import { EditTimelineGroupDialog } from '@/components/timeline/EditTimelineGroupDialog';
import { useStore } from '@/store';
import type { TimelineGroup } from '@/types/timeline';

describe('EditTimelineGroupDialog 组件测试', () => {
  const mockGroup: TimelineGroup = {
    id: 'test-group',
    title: '测试分组',
    timelines: [],
  };

  beforeEach(() => {
    useStore.setState({
      editingTimelineGroup: null,
      timelineGroups: [],
    });
  });

  it('创建模式应该显示正确的标题', () => {
    useStore.setState({ editingTimelineGroup: null });

    const control = {
      open: true,
      setOpen: vi.fn(),
    };

    render(
      <Provider>
        <EditTimelineGroupDialog control={control as any} />
      </Provider>
    );

    expect(screen.getByText('创建分组')).toBeInTheDocument();
  });

  it('编辑模式应该显示正确的标题和现有值', () => {
    useStore.setState({ editingTimelineGroup: mockGroup });

    const control = {
      open: true,
      setOpen: vi.fn(),
    };

    render(
      <Provider>
        <EditTimelineGroupDialog control={control as any} />
      </Provider>
    );

    expect(screen.getByText('编辑分组')).toBeInTheDocument();
    
    const input = screen.getByPlaceholderText(/分组名称/i) as HTMLInputElement;
    expect(input.value).toBe('测试分组');
  });

  it('输入分组名称并保存应该创建新分组', async () => {
    const user = userEvent.setup();
    const setOpen = vi.fn();

    const control = {
      open: true,
      setOpen,
    };

    render(
      <Provider>
        <EditTimelineGroupDialog control={control as any} />
      </Provider>
    );

    const input = screen.getByPlaceholderText(/分组名称/i);
    await user.clear(input);
    await user.type(input, '新分组');

    const saveButton = screen.getByText('保存');
    await user.click(saveButton);

    await waitFor(() => {
      const groups = useStore.getState().timelineGroups;
      expect(groups).toHaveLength(1);
      expect(groups[0].title).toBe('新分组');
    });

    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it('点击取消应该关闭对话框', async () => {
    const user = userEvent.setup();
    const setOpen = vi.fn();

    const control = {
      open: true,
      setOpen,
    };

    render(
      <Provider>
        <EditTimelineGroupDialog control={control as any} />
      </Provider>
    );

    const cancelButton = screen.getByText('取消');
    await user.click(cancelButton);

    expect(setOpen).toHaveBeenCalledWith(false);
  });
});
