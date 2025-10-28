import { addTimelineGroupAtom } from '@/store/timelineGroups';
import { timelineGroupsAtom } from '@/store/timelineGroups';
import type { TimelineGroup } from '@/types/timeline';
import { Button, Dialog, Field, Input, Portal, type UseDialogReturn } from '@chakra-ui/react';
import { useSetAtom } from 'jotai';
import { useState } from 'react';

interface EditTimelineGroupDialogProps {
  control: UseDialogReturn;
  group?: TimelineGroup | null;
}

export const EditTimelineGroupDialog = ({ control, group }: EditTimelineGroupDialogProps) => {
  const [title, setTitle] = useState(group?.title ?? '');

  const addTimelineGroups = useSetAtom(addTimelineGroupAtom);
  const updateTimelineGroups = useSetAtom(timelineGroupsAtom);

  const isEditMode = Boolean(group);

  const handleSubmit = () => {
    if (title.trim()) {
      if (isEditMode) {
        updateTimelineGroups((prev) => prev.map((item) => (item.id === group?.id ? { ...item, title } : item)));
      } else {
        addTimelineGroups({ title });
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
              <Dialog.Title>{isEditMode ? '编辑组' : '创建组'}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Field.Root>
                <Field.Label>组名称</Field.Label>
                <Input placeholder="输入组名称" value={title} onChange={(e) => setTitle(e.target.value)} />
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
