import { Provider } from '@/components/context/Provider';
import { EditTaskNodeDialog } from '@/components/timeline/EditTaskNodeDialog';
import { useAppStore } from '@/store';
import type { TimelineFlat } from '@/types/flat';
import type { TaskNode } from '@/types/timeline';
import type { RFNode } from '@/utils/reactFlowObjects';
import { useDialog } from '@chakra-ui/react';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

function makeTaskNode(): TaskNode {
  return {
    id: 'task-1',
    type: 'task',
    timelineId: 'timeline-1',
    title: '原始任务',
    status: 'todo',
    content: {
      description: '原始描述',
      subtasks: [{ id: 'sub-1', title: '初始子任务', done: false }],
    },
    dependedBy: [],
    dependsOn: [],
    milestone: false,
  };
}

function makeRFNode(taskNode: TaskNode): RFNode<TaskNode> {
  return {
    id: taskNode.id,
    type: 'task',
    position: { x: 0, y: 0 },
    data: taskNode,
  };
}

function DialogTestWrapper({ taskNode, onOpenChange }: { taskNode: TaskNode; onOpenChange?: (open: boolean) => void }) {
  const disclosure = useDialog({
    defaultOpen: true,
    onOpenChange: (details) => onOpenChange?.(details.open),
  });
  const rfNode = makeRFNode(taskNode);
  return <EditTaskNodeDialog targetNode={rfNode} disclosure={disclosure} />;
}

describe('EditTaskNodeDialog 组件综合测试', () => {
  const setupStore = (timelineType: 'task' | 'recurrence' = 'task') => {
    useAppStore.setState({
      groups: {},
      timelines: {
        'timeline-1': {
          id: 'timeline-1',
          groupId: 'group-1',
          title: '测试时间线',
          type: timelineType,
          nodeOrder: timelineType === 'task' ? ['task-1'] : undefined,
          ...(timelineType === 'recurrence'
            ? {
                completedTasks: [],
                frequency: 'daily',
                startDate: new Date(),
                pattern: { currentIndex: 0, taskTemplates: [] },
              }
            : {}),
        } as TimelineFlat,
      },
      nodes: {
        'task-1': makeTaskNode(),
      },
      groupOrder: [],
    });
  };

  const renderDialog = () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    const utils = render(
      <Provider>
        <DialogTestWrapper taskNode={makeTaskNode()} onOpenChange={onOpenChange} />
      </Provider>,
    );
    return { ...utils, user, onOpenChange };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('交互流程：正常修改任务信息并成功保存 (包含基础信息、子任务增删改、里程碑)', async () => {
    setupStore('task');
    const { user, onOpenChange } = renderDialog();

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // 1. 修改基本信息
    const titleInput = screen.getByTestId('task-title-input');
    await user.clear(titleInput);
    await user.type(titleInput, '修改后的任务');

    const descInput = screen.getByDisplayValue('原始描述');
    await user.clear(descInput);
    await user.type(descInput, '修改后的描述');

    // 2. 管理子任务
    const subtaskInput = screen.getByDisplayValue('初始子任务');
    await user.clear(subtaskInput);
    await user.type(subtaskInput, '已修改的子任务');

    await user.click(screen.getByRole('button', { name: /添加子任务/i }));
    const newSubtaskInputs = screen.getAllByPlaceholderText('输入子任务标题');
    await user.type(newSubtaskInputs[1], '全新子任务');

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);

    const firstSubtaskRow = subtaskInput.closest('div');
    const deleteBtn = within(firstSubtaskRow as HTMLElement).getByRole('button');
    await user.click(deleteBtn);

    // 3. 切换里程碑
    const milestoneCheckbox = screen.getByRole('checkbox', { name: /里程碑/i });
    await user.click(milestoneCheckbox);

    // 4. 提交保存
    await user.click(screen.getByTestId('task-node-submit-btn'));

    // 5. 验证状态更新与对话框关闭
    await waitFor(() => {
      const state = useAppStore.getState();
      const updatedNode = state.nodes['task-1'] as TaskNode;
      expect(updatedNode.title).toBe('修改后的任务');
      expect(updatedNode.content.description).toBe('修改后的描述');
      expect(updatedNode.milestone).toBe(true);
      expect(updatedNode.content.subtasks).toHaveLength(1);

      const remainingSubtask = updatedNode.content.subtasks[0];
      expect(remainingSubtask.title).toBe('全新子任务');
      expect(remainingSubtask.done).toBe(true);
    });

    // 验证 onSubmit 后调用了 disclosure.setOpen(false)
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('交互流程：表单校验拦截器 (清空必填项无法保存且不关闭对话框)', async () => {
    setupStore('task');
    const { user, onOpenChange } = renderDialog();

    const titleInput = screen.getByTestId('task-title-input');
    await user.clear(titleInput);

    await user.click(screen.getByTestId('task-node-submit-btn'));

    // 断言显示了错误信息，且没有触发关闭对话框
    await waitFor(() => {
      expect(screen.getByText(/Too small/i)).toBeInTheDocument();
    });
    expect(onOpenChange).not.toHaveBeenCalled();

    // 断言 Store 数据未被意外更新
    const state = useAppStore.getState();
    expect((state.nodes['task-1'] as TaskNode).title).toBe('原始任务');
  });

  it('边界处理：非任务时间线中应显示错误提示对话框', async () => {
    setupStore('recurrence');
    await act(async () => {
      renderDialog();
    });

    // 当时间线类型不为 task 时，渲染 UniversalErrorDialog
    expect(screen.getByText('只能在任务时间线中编辑任务节点')).toBeInTheDocument();

    // 断言不存在正常的编辑表单
    expect(screen.queryByTestId('task-title-input')).not.toBeInTheDocument();
  });
});
