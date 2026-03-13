import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppTestProvider } from '../TestProviders';
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
      timelineId: 'timeline-1',
      title: '测试任务',
      content: {
        description: '这是一个测试任务',
        subtasks: [],
      },
      status: 'todo',
      dependedBy: [],
      dependsOn: [],
      milestone: false,
    },
  };

  beforeEach(() => {
    // 重置任何必要的状态
  });

  it('应该渲染任务标题', () => {
    render(
      <AppTestProvider>
        <TaskNodeComponent {...(mockTaskNode as any)} />
      </AppTestProvider>
    );

    expect(screen.getByText('测试任务')).toBeInTheDocument();
  });

  it('todo状态应该显示正确的样式', () => {
    render(
      <AppTestProvider>
        <TaskNodeComponent {...(mockTaskNode as any)} />
      </AppTestProvider>
    );

    const node = screen.getByTestId('task-node');
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
      <AppTestProvider>
        <TaskNodeComponent {...(doneNode as any)} />
      </AppTestProvider>
    );

    const node = screen.getByTestId('task-node');
    expect(node).toHaveAttribute('data-status', 'done');
  });

  it('locked状态应该显示正确的样式', () => {
    const lockedNode = {
      ...mockTaskNode,
      data: {
        ...mockTaskNode.data,
        status: 'locked' as const,
      },
    };

    render(
      <AppTestProvider>
        <TaskNodeComponent {...(lockedNode as any)} />
      </AppTestProvider>
    );

    const node = screen.getByTestId('task-node');
    expect(node).toHaveAttribute('data-status', 'locked');
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
      <AppTestProvider>
        <TaskNodeComponent {...(milestoneNode as any)} />
      </AppTestProvider>
    );

    // 应该有里程碑标记（可能是图标或徽章）
    const node = screen.getByTestId('task-node');
    expect(node).toHaveAttribute('data-milestone', 'true');
  });

  it('有子任务的任务应该显示子任务计数', () => {
    const nodeWithSubtasks = {
      ...mockTaskNode,
      data: {
        ...mockTaskNode.data,
        content: {
          description: '',
          subtasks: [
            { id: '1', title: '子任务1', done: true },
            { id: '2', title: '子任务2', done: false },
          ],
        },
      },
    };

    render(
      <AppTestProvider>
        <TaskNodeComponent {...(nodeWithSubtasks as any)} />
      </AppTestProvider>
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
      <AppTestProvider>
        <TaskNodeComponent {...(skippedNode as any)} />
      </AppTestProvider>
    );

    const node = screen.getByTestId('task-node');
    expect(node).toHaveAttribute('data-status', 'skipped');
  });
});
