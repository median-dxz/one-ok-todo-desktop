import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from '@/components/context/Provider';
import { EditTimelineGroupDialog } from '@/components/timeline/EditTimelineGroupDialog';
import { useAppStore } from '@/store';
import type { TimelineGroup } from '@/types/timeline';
import { useDialog } from '@chakra-ui/react';

function DialogTestWrapper({ groupId, onOpenChange }: { groupId: string | null, onOpenChange?: (open: boolean) => void }) {
  const disclosure = useDialog({ 
    defaultOpen: true,
    onOpenChange: (details) => onOpenChange?.(details.open)
  });
  return <EditTimelineGroupDialog disclosure={disclosure} groupId={groupId} />;
}

describe('EditTimelineGroupDialog 组件测试', () => {
  const mockGroup: TimelineGroup = {
    id: 'test-group',
    title: '测试分组',
    timelineOrder: [],
  };

  beforeEach(() => {
    useAppStore.setState({
      groups: {},
      groupOrder: [],
    });
  });

  it('创建模式应该显示正确的标题', () => {
    render(
      <Provider>
        <DialogTestWrapper groupId={null} />
      </Provider>
    );

    expect(screen.getByText('创建组')).toBeInTheDocument();
  });

  it('编辑模式应该显示正确的标题和现有值', () => {
    useAppStore.setState({
      groups: { [mockGroup.id]: mockGroup as any },
      groupOrder: [mockGroup.id],
    });

    render(
      <Provider>
        <DialogTestWrapper groupId={mockGroup.id} />
      </Provider>
    );

    expect(screen.getByText('编辑组')).toBeInTheDocument();
    
    const input = screen.getByPlaceholderText(/输入组名称/i) as HTMLInputElement;
    expect(input.value).toBe('测试分组');
  });

  it('输入分组名称并保存应该创建新分组', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <Provider>
        <DialogTestWrapper groupId={null} onOpenChange={onOpenChange} />
      </Provider>
    );

    const input = screen.getByPlaceholderText(/输入组名称/i);
    await user.clear(input);
    await user.type(input, '新分组');

    const saveButton = screen.getByText('创建');
    await user.click(saveButton);

    await waitFor(() => {
      const state = useAppStore.getState();
      expect(state.groupOrder).toHaveLength(1);
      expect(state.groups[state.groupOrder[0]].title).toBe('新分组');
    });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('点击取消应该关闭对话框', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <Provider>
        <DialogTestWrapper groupId={null} onOpenChange={onOpenChange} />
      </Provider>
    );

    const cancelButton = screen.getByText('取消');
    await user.click(cancelButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
