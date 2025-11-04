import type { TaskNode } from '@/types/timeline';
import { Button, Checkbox, Dialog, Field, Input, Portal, Stack, Textarea, type UseDialogReturn } from '@chakra-ui/react';
import { produce } from 'immer';

interface TaskNodeDialogBaseProps {
  control: UseDialogReturn;
  node: TaskNode;
  setNode: React.Dispatch<React.SetStateAction<TaskNode>>;
  title: string;
  saveButtonText: string;
  onSubmit: () => void;
  children?: React.ReactNode;
}

export const TaskNodeDialogBase = ({
  control,
  node,
  setNode,
  title,
  saveButtonText,
  onSubmit,
  children,
}: TaskNodeDialogBaseProps) => {
  const handleSubmit = () => {
    if (node.title.trim()) {
      onSubmit();
      control.setOpen(false);
    }
  };

  return (
    <Dialog.RootProvider value={control}>
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
                    value={node.title}
                    onChange={(e) =>
                      setNode(
                        produce((draft) => {
                          draft.title = e.target.value;
                        }),
                      )
                    }
                  />
                </Field.Root>
                <Field.Root>
                  <Field.Label>描述</Field.Label>
                  <Textarea
                    value={node.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setNode(
                        produce((draft) => {
                          draft.description = e.target.value;
                        }),
                      )
                    }
                  />
                </Field.Root>
                {children}
                <Field.Root>
                  <Checkbox.Root
                    checked={node.milestone}
                    onCheckedChange={(e) =>
                      setNode(
                        produce((draft) => {
                          draft.milestone = !!e.checked;
                        }),
                      )
                    }
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>里程碑</Checkbox.Label>
                  </Checkbox.Root>
                </Field.Root>
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">取消</Button>
              </Dialog.ActionTrigger>
              <Dialog.ActionTrigger asChild>
                <Button onClick={handleSubmit} disabled={!node.title.trim()}>
                  {saveButtonText}
                </Button>
              </Dialog.ActionTrigger>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.RootProvider>
  );
};
