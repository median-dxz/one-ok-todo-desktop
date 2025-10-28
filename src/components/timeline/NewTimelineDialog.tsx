import { addTimelineAtom } from '@/store/actions/timelineActions';
import { Button, Dialog, Field, Input, Portal, type UseDialogReturn } from '@chakra-ui/react';
import { useSetAtom } from 'jotai';
import { useState } from 'react';

interface NewTimelineDialogProps {
  control: UseDialogReturn;
  groupId: string;
}

export const NewTimelineDialog = ({ control, groupId }: NewTimelineDialogProps) => {
  const [title, setTitle] = useState('');

  const addTimeline = useSetAtom(addTimelineAtom);

  const handleCreate = () => {
    if (title.trim()) {
      addTimeline({ groupId, title });
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
              <Dialog.Title>创建时间线</Dialog.Title>
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
                <Button onClick={handleCreate} disabled={!title.trim()}>
                  创建
                </Button>
              </Dialog.ActionTrigger>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.RootProvider>
  );
};
