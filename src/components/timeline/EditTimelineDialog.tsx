import { addTimelineAtom, newTaskTimeline } from '@/store/actions/timelineActions';
import type { Timeline } from '@/types/timeline';
import { Button, Dialog, Field, Input, Portal, type UseDialogReturn } from '@chakra-ui/react';
import { useSetAtom } from 'jotai';
import { useState } from 'react';

interface EditTimelineDialogProps {
  control: UseDialogReturn;
  timeline?: Timeline | null;
}

export const EditTimelineDialog = ({ control, timeline }: EditTimelineDialogProps) => {
  const [title, setTitle] = useState(timeline?.title ?? '');

  const addTimeline = useSetAtom(addTimelineAtom);

  const isEditMode = Boolean(timeline);

  const handleSubmit = () => {
    if (title.trim()) {
      if (isEditMode) {
      } else {
        addTimeline(newTaskTimeline(title));
      }
      setTitle('');
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
                <Input placeholder="输入时间线名称" value={title} onChange={(e) => setTitle(e.target.value)} />
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
