import type { Subtask } from '@/types/timeline';
import type { TaskNodeDraft } from '@/types/flat';
import { TaskNodeDraftSchema } from '@/types/flat';
import { useZodFormValidation } from '@/hooks/useZodFormValidation';
import { FormDialogShell } from '@/components/ui/FormDialogShell';
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Field,
  Fieldset,
  HStack,
  IconButton,
  Input,
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
  onSubmit: (validatedData: T) => void;
  children?: React.ReactNode;
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
}: TaskNodeDialogBaseProps<T>) {
  const { content } = nodeDraft;
  const { fieldErrors, validate } = useZodFormValidation();

  const handleSubmit = () => {
    const result = validate(TaskNodeDraftSchema.loose(), nodeDraft);
    if (!result.success) return;
    onSubmit(result.data as T);
    disclosure.setOpen(false);
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
    <FormDialogShell
      disclosure={disclosure}
      title={title}
      submitText={saveButtonText}
      onSubmit={handleSubmit}
      contentProps={{ 'data-testid': 'task-node-dialog' }}
    >
      <Stack gap={4}>
        <Field.Root invalid={fieldErrors.title !== undefined}>
          <Field.Label>任务名称</Field.Label>
          <Input
            data-testid="task-title-input"
            placeholder="输入任务名称"
            value={nodeDraft.title}
            onChange={(e) => handleUpdateTitle(e.target.value)}
          />
          <Field.ErrorText>{fieldErrors.title}</Field.ErrorText>
        </Field.Root>
        <Field.Root>
          <Field.Label>描述</Field.Label>
          <Textarea
            value={nodeDraft.content.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleUpdateDescription(e.target.value)}
          />
        </Field.Root>
        <Separator />
        <Fieldset.Root invalid={fieldErrors.content !== undefined}>
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
          <Fieldset.ErrorText>{fieldErrors.content}</Fieldset.ErrorText>
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
    </FormDialogShell>
  );
}
