import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
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
    prevs: [],
    succs: [],
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
  const timeline: TaskTimeline = {
    id: 'timeline-1',
    groupId: 'group-1',
    title: '测试时间线',
    type: 'task',
    nodes: [taskNode],
  };
  return {
    id: taskNode.id,
    type: 'task',
    position: { x: 0, y: 0 },
    data: { ...taskNode, timeline },
  };
}

// ─── 包装组件（使用真实的 useDialog，模拟 RightPanel 行为） ──────────────────
//
// RightPanel 使用 key={`${node.data.id}-task-edit-${taskNodeEditControl.open}`}，
// 这意味着对话框在每次开/关时重新挂载，确保 useState 使用最新的 targetNode 初始化。

function DialogWrapper({ initialStatus }: { initialStatus: TaskNode['status'] }) {
  const control = useDialog();
  const [status, setStatus] = useState<TaskNode['status']>(initialStatus);

  const rfNode = makeRFNode(makeTaskNode(status));

  return (
    <>
      <button onClick={() => control.setOpen(true)}>打开对话框</button>
      <button onClick={() => control.setOpen(false)}>关闭对话框</button>
      <button onClick={() => setStatus('done')}>外部更改为done</button>
      {/* key 包含 open 值，与 RightPanel 行为一致：每次开/关时重新挂载 */}
      <EditTaskNodeDialog
        key={`${rfNode.data.id}-task-edit-${control.open}`}
        targetNode={rfNode}
        disclosure={control}
      />
    </>
  );
}

// 不带 key 技巧的包装组件，用于验证 key 机制的必要性
function DialogWrapperNoKey({ initialStatus }: { initialStatus: TaskNode['status'] }) {
  const control = useDialog({ defaultOpen: true });
  const [status, setStatus] = useState<TaskNode['status']>(initialStatus);

  const rfNode = makeRFNode(makeTaskNode(status));

  return (
    <>
      <button onClick={() => setStatus('done')}>外部更改为done</button>
      {/* 固定 key：props 变化不会触发重新挂载 */}
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

    render(
      <Provider>
        <DialogWrapper initialStatus="todo" />
      </Provider>,
    );

    // 1. 打开对话框，验证初始状态为 todo
    await user.click(screen.getByText('打开对话框'));
    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-value', 'todo');

    // 2. 关闭对话框（组件因 key 变化而卸载）
    await user.click(screen.getByText('关闭对话框'));

    // 3. 模拟外部更改节点状态（例如其他面板更新了 store）
    await user.click(screen.getByText('外部更改为done'));

    // 4. 重新打开对话框（组件因 key 变化重新挂载，useState 以最新的 targetNode 初始化）
    await user.click(screen.getByText('打开对话框'));

    // 5. 验证表单显示最新状态 done，而非旧的 todo
    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-value', 'done');
  });

  it('不更改 key 直接重渲染时，表单将保留旧状态（说明 key 机制的必要性）', async () => {
    const user = userEvent.setup();

    render(
      <Provider>
        <DialogWrapperNoKey initialStatus="todo" />
      </Provider>,
    );

    // 初始状态 todo
    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-value', 'todo');

    // 外部更改状态，但 key 不变 → 组件不重新挂载
    await user.click(screen.getByText('外部更改为done'));

    // useState 不会因 prop 变化重新初始化，仍然显示 todo（旧状态）
    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-value', 'todo');
  });
});
