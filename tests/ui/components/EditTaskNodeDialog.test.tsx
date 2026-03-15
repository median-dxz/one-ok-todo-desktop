import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, useEffect } from 'react';
import { useDialog } from '@chakra-ui/react';
import { Provider } from '@/components/context/Provider';
import { EditTaskNodeDialog } from '@/components/timeline/EditTaskNodeDialog';
import { useAppStore } from '@/store';
import type { TaskNode, TaskTimeline } from '@/types/timeline';
import type { RFNode } from '@/utils/reactFlowObjects';

// ─── 测试数据工厂 ─────────────────────────────────────────────────────────────

function makeTaskNode(status: TaskNode['status']): TaskNode {
  return {
    id: 'task-1',
    type: 'task',
    timelineId: 'timeline-1',
    title: '测试任务',
    status,
    content: {
      description: '',
      subtasks: [],
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

// ─── 包装组件（使用真实的 useDialog，模拟 RightPanel 行为） ──────────────────
//
// RightPanel 使用 key={`${node.data.id}-task-edit-${taskNodeEditControl.open}`}，
// 这意味着对话框在每次开/关时重新挂载，确保 useState 使用最新的 targetNode 初始化。

function DialogWrapper({
  initialStatus,
  externalChangeTrigger,
}: {
  initialStatus: TaskNode['status'];
  externalChangeTrigger?: boolean;
}) {
  const control = useDialog();
  const [status, setStatus] = useState<TaskNode['status']>(initialStatus);

  useEffect(() => {
    if (externalChangeTrigger) {
      setStatus('done');
    }
  }, [externalChangeTrigger]);

  const rfNode = makeRFNode(makeTaskNode(status));

  return (
    <>
      <button onClick={() => control.setOpen(true)} data-testid="open-btn">
        打开对话框
      </button>
      <EditTaskNodeDialog
        key={`${rfNode.data.id}-task-edit-${control.open}`}
        targetNode={rfNode}
        disclosure={control}
      />
    </>
  );
}

function DialogWrapperNoKey({
  initialStatus,
  externalChangeTrigger,
}: {
  initialStatus: TaskNode['status'];
  externalChangeTrigger?: boolean;
}) {
  const control = useDialog({ defaultOpen: true });
  const [status, setStatus] = useState<TaskNode['status']>(initialStatus);

  useEffect(() => {
    if (externalChangeTrigger) {
      setStatus('done');
    }
  }, [externalChangeTrigger]);

  const rfNode = makeRFNode(makeTaskNode(status));

  return (
    <>
      <EditTaskNodeDialog key="fixed-key" targetNode={rfNode} disclosure={control} />
    </>
  );
}

// ─── 测试 ─────────────────────────────────────────────────────────────────────

describe('EditTaskNodeDialog — 外部状态变更后重新打开', () => {
  beforeEach(() => {
    useAppStore.setState({
      groups: {},
      timelines: {
        'timeline-1': {
          id: 'timeline-1',
          groupId: 'group-1',
          title: '测试时间线',
          type: 'task',
          nodeOrder: ['task-1'],
        },
      },
      nodes: {
        'task-1': makeTaskNode('todo'),
      },
      groupOrder: [],
    });
  });

  it('关闭对话框 → 外部更改节点状态 → 重新打开后，表单应展示新状态', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <Provider>
        <DialogWrapper initialStatus="todo" externalChangeTrigger={false} />
      </Provider>,
    );

    await user.click(screen.getByTestId('open-btn'));
    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-value', 'todo');

    await user.keyboard('{Escape}');

    rerender(
      <Provider>
        <DialogWrapper initialStatus="todo" externalChangeTrigger={true} />
      </Provider>,
    );

    await user.click(screen.getByTestId('open-btn'));

    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-value', 'done');
  });

  it('不更改 key 直接重渲染时，表单将保留旧状态（说明 key 机制的必要性）', async () => {
    const { rerender } = render(
      <Provider>
        <DialogWrapperNoKey initialStatus="todo" externalChangeTrigger={false} />
      </Provider>,
    );

    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-value', 'todo');

    rerender(
      <Provider>
        <DialogWrapperNoKey initialStatus="todo" externalChangeTrigger={true} />
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByRole('radiogroup')).toHaveAttribute('data-value', 'todo');
    });
  });
});
