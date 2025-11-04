import { useUpdateTimeline } from '@/store/reactFlowStore';
import type { SubTask, TaskNode, TaskTimeline } from '@/types/timeline';
import type { RFNode } from '@/utils/reactFlowObjects';
import {
  Button,
  Checkbox,
  Dialog,
  Field,
  HStack,
  IconButton,
  Input,
  Portal,
  RadioGroup,
  Separator,
  Stack,
  VStack,
  type UseDialogReturn,
} from '@chakra-ui/react';
import { produce } from 'immer';
import { useState } from 'react';
import { LuPlus, LuTrash2 } from 'react-icons/lu';
import { TaskNodeDialogBase } from './TaskNodeDialogBase';

interface EditTaskNodeDialogProps {
  targetNode: RFNode<TaskNode>;
  control: UseDialogReturn;
}

const NotTaskTimelineError = ({ control }: { control: UseDialogReturn }) => (
  <Dialog.RootProvider value={control}>
    <Portal>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>错误</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>只能在任务时间线中编辑任务节点。</Dialog.Body>
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

export const EditTaskNodeDialog = ({ targetNode, control }: EditTaskNodeDialogProps) => {
  const [edit, setEdit] = useState<TaskNode>({ ...targetNode.data });
  const updateTimeline = useUpdateTimeline();
  const timeline = targetNode.data.timeline;

  if (timeline.type !== 'task') {
    return <NotTaskTimelineError control={control} />;
  }

  const handleSubmit = () => {
    updateTimeline(timeline.id, (draft) => {
      const taskTimeline = draft as TaskTimeline;
      const nodeIndex = taskTimeline.nodes.findIndex((n) => n.id === edit.id);
      if (nodeIndex !== -1) {
        taskTimeline.nodes[nodeIndex] = edit;
      }
    });
  };

  const handleAddSubtask = () => {
    setEdit(
      produce((draft) => {
        if (!draft.subtasks) {
          draft.subtasks = [];
        }
        draft.subtasks.push({ title: '', status: 'todo' });
      }),
    );
  };

  const handleDeleteSubtask = (index: number) => {
    setEdit(
      produce((draft) => {
        if (draft.subtasks) {
          draft.subtasks.splice(index, 1);
        }
      }),
    );
  };

  const handleUpdateSubtask = (index: number, updates: Partial<SubTask>) => {
    setEdit(
      produce((draft) => {
        if (draft.subtasks && draft.subtasks[index]) {
          draft.subtasks[index] = { ...draft.subtasks[index], ...updates };
        }
      }),
    );
  };

  return (
    <TaskNodeDialogBase
      control={control}
      node={edit}
      setNode={setEdit}
      title="编辑任务"
      saveButtonText="保存"
      onSubmit={handleSubmit}
    >
      <RadioGroup.Root
        value={edit.status}
        onValueChange={(details) => {
          setEdit(
            produce((draft) => {
              draft.status = details.value as TaskNode['status'];
            }),
          );
        }}
      >
        <RadioGroup.Label>选择状态</RadioGroup.Label>
        <Stack direction="row" gap={4}>
          <RadioGroup.Item value="todo">
            <RadioGroup.ItemHiddenInput />
            <RadioGroup.ItemIndicator />
            <RadioGroup.ItemText>Todo</RadioGroup.ItemText>
          </RadioGroup.Item>
          <RadioGroup.Item value="done">
            <RadioGroup.ItemHiddenInput />
            <RadioGroup.ItemIndicator />
            <RadioGroup.ItemText>Done</RadioGroup.ItemText>
          </RadioGroup.Item>
          <RadioGroup.Item value="skipped">
            <RadioGroup.ItemHiddenInput />
            <RadioGroup.ItemIndicator />
            <RadioGroup.ItemText>Skipped</RadioGroup.ItemText>
          </RadioGroup.Item>
          <RadioGroup.Item value="lock">
            <RadioGroup.ItemHiddenInput />
            <RadioGroup.ItemIndicator />
            <RadioGroup.ItemText>Lock</RadioGroup.ItemText>
          </RadioGroup.Item>
        </Stack>
      </RadioGroup.Root>

      <Separator />

      <Field.Root>
        <HStack justify="space-between">
          <Field.Label>子任务</Field.Label>
          <Button size="xs" onClick={handleAddSubtask}>
            <LuPlus />
            添加子任务
          </Button>
        </HStack>
        {edit.subtasks && edit.subtasks.length > 0 && (
          <VStack align="stretch" gap={2} mt={2}>
            {edit.subtasks.map((subtask, index) => (
              <HStack key={index} gap={2}>
                <Checkbox.Root
                  checked={subtask.status === 'done'}
                  onCheckedChange={(e) => {
                    handleUpdateSubtask(index, {
                      status: e.checked ? 'done' : 'todo',
                    });
                  }}
                  size="sm"
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                </Checkbox.Root>
                <Input
                  size="sm"
                  flex="1"
                  value={subtask.title}
                  onChange={(e) => {
                    handleUpdateSubtask(index, { title: e.target.value });
                  }}
                  placeholder="输入子任务标题"
                />
                <IconButton size="sm" variant="ghost" colorPalette="red" onClick={() => handleDeleteSubtask(index)}>
                  <LuTrash2 />
                </IconButton>
              </HStack>
            ))}
          </VStack>
        )}
      </Field.Root>
    </TaskNodeDialogBase>
  );
};
