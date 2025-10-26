import { addTimelineGroupAtom } from '@/store/actions/timelineActions';
import { Button, Dialog, Field, Input, Portal, type UseDialogReturn } from '@chakra-ui/react';
import { useSetAtom } from 'jotai';
import { useState } from 'react';

export const NewTimelineGroupDialog = ({ control }: { control: UseDialogReturn }) => {
  const [title, setTitle] = useState('');

  const addTimelineGroup = useSetAtom(addTimelineGroupAtom);

  const handleCreate = () => {
    if (title.trim()) {
      addTimelineGroup({ title });
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
              <Dialog.Title>创建组</Dialog.Title>
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
