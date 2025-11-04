import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from '@/components/ui/Provider';
import { TaskNodeComponent } from '@/components/timeline/TaskNodeComponent';
import type { TaskNode } from '@/types/timeline';
import type { RFNode } from '@/utils/reactFlowObjects';

describe('TaskNodeComponent 组件测试', () => {
  const mockTaskNode: RFNode<TaskNode> = {
    id: 'task-1',
    type: 'task',
    position: { x: 0, y: 0 },
    data: {
      id: 'task-1',
      type: 'task',
      title: '测试任务',
      description: '这是一个测试任务',
      status: 'todo',
      prevs: [],
      succs: [],
    },
  };

  beforeEach(() => {
    // 重置任何必要的状态
  });

  it('应该渲染任务标题', () => {
    render(
      <Provider>
        <TaskNodeComponent {...mockTaskNode} />
      </Provider>
    );

    expect(screen.getByText('测试任务')).toBeInTheDocument();
  });

  it('todo状态应该显示正确的样式', () => {
    render(
      <Provider>
        <TaskNodeComponent {...mockTaskNode} />
      </Provider>
    );

    const node = screen.getByText('测试任务').closest('div');
    expect(node).toHaveAttribute('data-status', 'todo');
  });

  it('done状态应该显示正确的样式', () => {
    const doneNode = {
      ...mockTaskNode,
      data: {
        ...mockTaskNode.data,
        status: 'done' as const,
      },
    };

    render(
      <Provider>
        <TaskNodeComponent {...doneNode} />
      </Provider>
    );

    const node = screen.getByText('测试任务').closest('div');
    expect(node).toHaveAttribute('data-status', 'done');
  });

  it('locked状态应该显示正确的样式', () => {
    const lockedNode = {
      ...mockTaskNode,
      data: {
        ...mockTaskNode.data,
        status: 'lock' as const,
      },
    };

    render(
      <Provider>
        <TaskNodeComponent {...lockedNode} />
      </Provider>
    );

    const node = screen.getByText('测试任务').closest('div');
    expect(node).toHaveAttribute('data-status', 'lock');
  });

  it('里程碑任务应该显示特殊标记', () => {
    const milestoneNode = {
      ...mockTaskNode,
      data: {
        ...mockTaskNode.data,
        milestone: true,
      },
    };

    render(
      <Provider>
        <TaskNodeComponent {...milestoneNode} />
      </Provider>
    );

    // 应该有里程碑标记（可能是图标或徽章）
    const node = screen.getByText('测试任务').closest('div');
    expect(node).toHaveAttribute('data-milestone', 'true');
  });

  it('有子任务的任务应该显示子任务计数', () => {
    const nodeWithSubtasks = {
      ...mockTaskNode,
      data: {
        ...mockTaskNode.data,
        subtasks: [
          { title: '子任务1', status: 'done' as const },
          { title: '子任务2', status: 'todo' as const },
        ],
      },
    };

    render(
      <Provider>
        <TaskNodeComponent {...nodeWithSubtasks} />
      </Provider>
    );

    // 应该显示子任务数量或进度
    expect(screen.getByText(/1.*2/)).toBeInTheDocument();
  });

  it('skipped状态应该显示正确的样式', () => {
    const skippedNode = {
      ...mockTaskNode,
      data: {
        ...mockTaskNode.data,
        status: 'skipped' as const,
      },
    };

    render(
      <Provider>
        <TaskNodeComponent {...skippedNode} />
      </Provider>
    );

    const node = screen.getByText('测试任务').closest('div');
    expect(node).toHaveAttribute('data-status', 'skipped');
  });
});
