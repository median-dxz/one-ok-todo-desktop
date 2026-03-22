import { TaskNodeComponent } from '@/components/timeline/TaskNodeComponent';
import type { TaskNode } from '@/types/timeline';
import type { RFNode } from '@/utils/reactFlowObjects';
import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppTestProvider } from '../TestProviders';
import type { NodeProps } from '@xyflow/react';

type TaskNodeComponentProps = NodeProps<RFNode<TaskNode>>;

describe('TaskNodeComponent 组件测试', () => {
  const baseTaskNode: RFNode<TaskNode> = {
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

  const baseNodeProps: Omit<NodeProps<RFNode<TaskNode>>, 'data' | 'id' | 'type'> = {
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 150,
    height: 50,
    dragHandle: undefined,
    parentId: undefined,
    dragging: false,
    zIndex: 0,
    selectable: true,
    deletable: true,
    selected: false,
    draggable: true,
    isConnectable: true,
  };

  it.each([['todo'], ['done'], ['locked'], ['skipped']] as const)(
    '任务状态展示: 当状态为 %s 时，应渲染正确的 data-status 属性',
    async (status) => {
      const nodeData: TaskNodeComponentProps = {
        ...baseNodeProps,
        ...baseTaskNode,
        data: { ...baseTaskNode.data, status },
      };

      await act(async () => {
        render(
          <AppTestProvider>
            <TaskNodeComponent {...nodeData} />
          </AppTestProvider>,
        );
      });

      const node = screen.getByTestId('task-node');
      expect(node).toHaveAttribute('data-status', status);
    },
  );

  it('额外标记展示：当为里程碑时，应显示特殊的里程碑标记', async () => {
    const nodeData: TaskNodeComponentProps = {
      ...baseNodeProps,
      ...baseTaskNode,
      data: { ...baseTaskNode.data, milestone: true },
    };
    await act(async () => {
      render(
        <AppTestProvider>
          <TaskNodeComponent {...nodeData} />
        </AppTestProvider>,
      );
    });
    const node = screen.getByTestId('task-node');
    expect(node).toHaveAttribute('data-milestone', 'true');
  });

  it('子任务展示：当存在子任务时，应正确渲染已完成/总计进度 (例如 1/2)', async () => {
    const nodeData: TaskNodeComponentProps = {
      ...baseNodeProps,
      ...baseTaskNode,
      data: {
        ...baseTaskNode.data,
        content: {
          ...baseTaskNode.data.content,
          subtasks: [
            { id: '1', title: '子任务1', done: true },
            { id: '2', title: '子任务2', done: false },
          ],
        },
      },
    };

    await act(async () => {
      render(
        <AppTestProvider>
          <TaskNodeComponent {...nodeData} />
        </AppTestProvider>,
      );
    });

    expect(screen.getByText(/1.*2/)).toBeInTheDocument();
  });
});
