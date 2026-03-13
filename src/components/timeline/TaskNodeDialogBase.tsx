import type { Subtask } from '@/types/timeline';
import type { TaskNodeDraft } from '@/types/flat';
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Dialog,
  Field,
  Fieldset,
  HStack,
  IconButton,
  Input,
  Portal,
  Separator,
  Stack,
  Textarea,
  VStack,
  type UseDialogReturn,
} from '@chakra-ui/react';
import { produce } from 'immer';
import React, { useCallback } from 'react';
import { LuPlus, LuTrash2 } from 'react-icons/lu';
import { nanoid } from 'nanoid';

interface TaskNodeDialogBaseProps<T extends TaskNodeDraft> {
  disclosure: UseDialogReturn;
  title: string;
  nodeDraft: T;
  setNodeDraft: React.Dispatch<React.SetStateAction<T>>;
  saveButtonText: string;
  onSubmit: () => void;
}

interface SubtaskItemProps {
  subtask: Subtask;
  index: number;
  onUpdate: (index: number, updates: Partial<Subtask>) => void;
  onDelete: (index: number) => void;
}

const SubtaskItem = React.memo(({ subtask, index, onUpdate, onDelete }: SubtaskItemProps) => {
  return (
    <HStack gap={2}>
      <Checkbox.Root
        checked={subtask.done}
        onCheckedChange={(e) => {
          onUpdate(index, { done: Boolean(e.checked) });
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
          onUpdate(index, { title: e.target.value });
        }}
        placeholder="输入子任务标题"
      />
      <IconButton size="sm" variant="ghost" colorPalette="red" onClick={() => onDelete(index)}>
        <LuTrash2 />
      </IconButton>
    </HStack>
  );
});

SubtaskItem.displayName = 'SubtaskItem';

export function TaskNodeDialogBase<T extends TaskNodeDraft>({
  disclosure,
  nodeDraft,
  setNodeDraft,
  title,
  saveButtonText,
  onSubmit,
  children,
  ...rest
}: TaskNodeDialogBaseProps<T> & Omit<Dialog.RootProviderProps, 'value'>) {
  const { content } = nodeDraft;

  const handleSubmit = () => {
    if (nodeDraft.title.trim()) {
      onSubmit();
    }
  };

  const handleAddSubtask = () => {
    setNodeDraft(
      produce<T>((draft) => {
        draft.content.subtasks.push({
          id: nanoid(),
          title: '',
          done: false,
        });
      }),
    );
  };

  // 使用 useCallback 缓存函数引用，配合子组件的 React.memo
  const handleUpdateSubtask = useCallback(
    (index: number, updates: Partial<Subtask>) => {
      setNodeDraft(
        produce<T>((draft) => {
          const { subtasks } = draft.content;
          if (!subtasks?.at(index)) return;
          subtasks[index] = { ...subtasks[index], ...updates };
        }),
      );
    },
    [setNodeDraft],
  );

  const handleDeleteSubtask = useCallback(
    (index: number) => {
      setNodeDraft(
        produce<T>((draft) => {
          const { subtasks } = draft.content;
          subtasks.splice(index, 1);
        }),
      );
    },
    [setNodeDraft],
  );

  const handleUpdateTitle = (title: string) => {
    setNodeDraft(
      produce<T>((draft) => {
        draft.title = title;
      }),
    );
  };

  const handleUpdateDescription = (description: string) => {
    setNodeDraft(
      produce<T>((draft) => {
        draft.content.description = description;
      }),
    );
  };

  const handleUpdateMilestone = (milestone: boolean) => {
    setNodeDraft(
      produce<T>((draft) => {
        draft.milestone = milestone;
      }),
    );
  };

  return (
    <Dialog.RootProvider {...rest} value={disclosure}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap={4}>
                <Field.Root>
                  <Field.Label>任务名称</Field.Label>
                  <Input
                    placeholder="输入任务名称"
                    value={nodeDraft.title}
                    onChange={(e) => handleUpdateTitle(e.target.value)}
                  />
                </Field.Root>
                <Field.Root>
                  <Field.Label>描述</Field.Label>
                  <Textarea
                    value={nodeDraft.content.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleUpdateDescription(e.target.value)}
                  />
                </Field.Root>
                <Separator />
                <Fieldset.Root>
                  <Fieldset.Legend width="full">
                    <HStack justify="space-between" width="full">
                      <span>子任务</span>
                      <Button size="xs" onClick={handleAddSubtask}>
                        <LuPlus />
                        添加子任务
                      </Button>
                    </HStack>
                  </Fieldset.Legend>
                  <CheckboxGroup>
                    <Fieldset.Content>
                      {content.subtasks?.length > 0 && (
                        <VStack align="stretch" gap={2} mt={2}>
                          {content.subtasks.map((subtask, index) => (
                            <SubtaskItem
                              key={subtask.id}
                              index={index}
                              subtask={subtask}
                              onUpdate={handleUpdateSubtask}
                              onDelete={handleDeleteSubtask}
                            />
                          ))}
                        </VStack>
                      )}
                    </Fieldset.Content>
                  </CheckboxGroup>
                </Fieldset.Root>
                <Field.Root>
                  <Checkbox.Root
                    checked={nodeDraft.milestone}
                    onCheckedChange={(e) => handleUpdateMilestone(Boolean(e.checked))}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>里程碑</Checkbox.Label>
                  </Checkbox.Root>
                </Field.Root>
                <Separator />
                {children}
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">取消</Button>
              </Dialog.ActionTrigger>
              <Dialog.ActionTrigger asChild>
                <Button onClick={handleSubmit} disabled={!nodeDraft.title.trim()}>
                  {saveButtonText}
                </Button>
              </Dialog.ActionTrigger>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.RootProvider>
  );
}
