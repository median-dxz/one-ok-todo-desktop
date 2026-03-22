import { Provider } from '@/components/context/Provider';
import { EditTimelineGroupDialog } from '@/components/timeline/EditTimelineGroupDialog';
import { useAppStore } from '@/store';
import type { TimelineGroupFlat } from '@/types/flat';
import { useDialog } from '@chakra-ui/react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

function DialogTestWrapper({
  groupId,
  onOpenChange,
}: {
  groupId: string | null;
  onOpenChange?: (open: boolean) => void;
}) {
  const disclosure = useDialog({
    defaultOpen: true,
    onOpenChange: (details) => onOpenChange?.(details.open),
  });
  return <EditTimelineGroupDialog disclosure={disclosure} groupId={groupId} />;
}

describe('EditTimelineGroupDialog 组件综合测试', () => {
  const mockGroup: TimelineGroupFlat = {
    id: 'test-group',
    title: '测试分组',
    timelineOrder: [],
  };

  const setupStore = (customState = {}) => {
    useAppStore.setState({
      groups: {},
      groupOrder: [],
      ...customState,
    });
  };

  const renderDialog = (groupId: string | null = null) => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    const utils = render(
      <Provider>
        <DialogTestWrapper groupId={groupId} onOpenChange={onOpenChange} />
      </Provider>,
    );
    return { ...utils, user, onOpenChange };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('交互流程：正常填写并创建新分组', async () => {
    setupStore();
    const { user, onOpenChange } = renderDialog(null);

    expect(screen.getByText('创建组')).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/输入组名称/i);
    await user.clear(input);
    await user.type(input, '新分组');

    await user.click(screen.getByText('创建'));

    await waitFor(() => {
      const state = useAppStore.getState();
      expect(state.groupOrder).toHaveLength(1);
      expect(state.groups[state.groupOrder[0]].title).toBe('新分组');
    });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('交互流程：点击取消应直接关闭对话框且不更改数据', async () => {
    setupStore();
    const { user, onOpenChange } = renderDialog(null);

    expect(screen.getByText('创建组')).toBeInTheDocument();
    await user.click(screen.getByText('取消'));

    expect(onOpenChange).toHaveBeenCalledWith(false);

    // 断言 Store 没有被修改
    const state = useAppStore.getState();
    expect(state.groupOrder).toHaveLength(0);
  });

  it('交互流程：编辑模式下正常回显现有数据', async () => {
    setupStore({
      groups: { [mockGroup.id]: mockGroup },
      groupOrder: [mockGroup.id],
    });

    await act(async () => {
      renderDialog(mockGroup.id);
    });

    expect(screen.getByText('编辑组')).toBeInTheDocument();
    const editInput = screen.getByPlaceholderText(/输入组名称/i) as HTMLInputElement;
    expect(editInput.value).toBe('测试分组');
  });
});
