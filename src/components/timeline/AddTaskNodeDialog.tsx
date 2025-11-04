import { useAppStore } from '@/store';
import { useAddTaskNode } from '@/store/reactFlowStore';
import { selectTimelineGroupById } from '@/store/timelineSlice';
import type { BaseNode, TaskNode, TaskTimeline } from '@/types/timeline';
import { Button, Dialog, Field, Portal, RadioGroup, Stack, type UseDialogReturn } from '@chakra-ui/react';
import { useState } from 'react';
import { TaskNodeDialogBase } from './TaskNodeDialogBase';

interface AddTaskNodeDialogProps {
  sourceNode: BaseNode;
  control: UseDialogReturn;
}

const defaultNode: Omit<TaskNode, 'id' | 'prevs' | 'succs'> = {
  title: '',
  status: 'todo',
  type: 'task',
};

const createNewTaskNode = (): Omit<TaskNode, 'id' | 'prevs' | 'succs'> => ({
  ...defaultNode,
});

const NotTaskTimelineError = ({ control }: { control: UseDialogReturn }) => (
  <Dialog.RootProvider value={control}>
    <Portal>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>错误</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>只能在任务时间线中添加任务节点。</Dialog.Body>
          <Dialog.Footer>
            <Dialog.ActionTrigger asChild>
              <Button variant="outline">关闭</Button>
            </Dialog.ActionTrigger>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  </Dialog.RootProvider>
);

export const AddTaskNodeDialog = ({ sourceNode, control }: AddTaskNodeDialogProps) => {
  const selectedTimelineGroupId = useAppStore((state) => state.selectedTimelineGroupId);
  const selectedTimelineGroup = useAppStore(selectTimelineGroupById(selectedTimelineGroupId));
  const addTaskNode = useAddTaskNode();
  const [newNode, setNewNode] = useState<Omit<TaskNode, 'id' | 'prevs' | 'succs'>>(createNewTaskNode());
  const [insertMode, setInsertMode] = useState<'succ' | 'prev'>('succ');

  const timeline = selectedTimelineGroup?.timelines.find((tl) =>
    (tl as TaskTimeline).nodes?.some((n) => n.id === sourceNode.id),
  );

  if (timeline?.type !== 'task') {
    return <NotTaskTimelineError control={control} />;
  }

  const handleSubmit = () => {
    addTaskNode(timeline.id, sourceNode.id, newNode, insertMode);
    setNewNode(createNewTaskNode());
  };

  return (
    <TaskNodeDialogBase
      control={control}
      node={newNode as TaskNode}
      setNode={setNewNode as React.Dispatch<React.SetStateAction<TaskNode>>}
      title="创建任务"
      saveButtonText="创建"
      onSubmit={handleSubmit}
    >
      <Field.Root>
        <Field.Label>插入位置</Field.Label>
        <RadioGroup.Root
          value={insertMode}
          onValueChange={(details) => setInsertMode(details.value as 'succ' | 'prev')}
        >
          <Stack direction="row" gap={4}>
            <RadioGroup.Item value="succ">
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemIndicator />
              <RadioGroup.ItemText>之后</RadioGroup.ItemText>
            </RadioGroup.Item>
            <RadioGroup.Item value="prev">
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemIndicator />
              <RadioGroup.ItemText>之前</RadioGroup.ItemText>
            </RadioGroup.Item>
          </Stack>
        </RadioGroup.Root>
      </Field.Root>
    </TaskNodeDialogBase>
  );
};
