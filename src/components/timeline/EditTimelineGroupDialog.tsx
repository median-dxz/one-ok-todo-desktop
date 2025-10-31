import { editingTLGroupAtom, editTimelineGroupStateAtom } from '@/store/timelineGroup';
import { Button, Dialog, Field, Input, Portal, type UseDialogReturn } from '@chakra-ui/react';
import { produce } from 'immer';
import { useAtom, useAtomValue } from 'jotai';
import { useState } from 'react';

interface EditTimelineGroupDialogProps {
  control: UseDialogReturn;
}

export const EditTimelineGroupDialog = ({ control }: EditTimelineGroupDialogProps) => {
  const isEditMode = Boolean(useAtomValue(editingTLGroupAtom));
  const [editInitialValues, saveEdited] = useAtom(editTimelineGroupStateAtom);
  const [group, setGroup] = useState(editInitialValues);
  const title = group.title;

  const handleSubmit = () => {
    if (title.trim()) {
      saveEdited(group);
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
              <Dialog.Title>{isEditMode ? '编辑组' : '创建组'}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Field.Root>
                <Field.Label>组名称</Field.Label>
                <Input
                  placeholder="输入组名称"
                  value={title}
                  onChange={(e) =>
                    setGroup(
                      produce((group) => {
                        group.title = e.target.value;
                      }),
                    )
                  }
                />
              </Field.Root>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">取消</Button>
              </Dialog.ActionTrigger>
              <Dialog.ActionTrigger asChild>
                <Button onClick={handleSubmit} disabled={!title.trim()}>
                  {isEditMode ? '保存' : '创建'}
                </Button>
              </Dialog.ActionTrigger>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.RootProvider>
  );
};
