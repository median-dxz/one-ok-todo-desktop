import { newTaskTimeline, updateOrInsertTimelineAtom } from '@/store/timeline';
import type { Timeline } from '@/types/timeline';
import { useAtomValueOr } from '@/utils/hooks';
import { Button, Dialog, Field, Input, Portal, type UseDialogReturn } from '@chakra-ui/react';
import { produce } from 'immer';
import { useSetAtom, type PrimitiveAtom } from 'jotai';
import { useState } from 'react';

interface EditTimelineDialogProps {
  control: UseDialogReturn;
  timelineAtom?: PrimitiveAtom<Timeline> | null;
}

export const EditTimelineDialog = ({ control, timelineAtom }: EditTimelineDialogProps) => {
  const timeline = useAtomValueOr(timelineAtom);
  const [edit, setEdit] = useState(timeline ?? newTaskTimeline(''));

  const updateOrInsert = useSetAtom(updateOrInsertTimelineAtom);
  const isEditMode = Boolean(timeline);

  const handleSubmit = () => {
    if (edit.title.trim()) {
      updateOrInsert(edit, timelineAtom);
      setEdit(newTaskTimeline(''));
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
              <Dialog.Title>{isEditMode ? '编辑时间线' : '创建时间线'}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Field.Root>
                <Field.Label>时间线名称</Field.Label>
                <Input
                  placeholder="输入时间线名称"
                  value={edit.title}
                  onChange={(e) =>
                    setEdit(
                      produce((draft) => {
                        draft.title = e.target.value;
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
                <Button onClick={handleSubmit} disabled={!edit.title.trim()}>
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
