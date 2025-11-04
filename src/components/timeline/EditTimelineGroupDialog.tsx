import { useAppStore } from '@/store';
import { createTimelineGroup, DIRTY_TIMELINE_GROUP } from '@/store/timelineSlice';
import { Button, Dialog, Field, Input, Portal, type UseDialogReturn } from '@chakra-ui/react';
import { produce } from 'immer';
import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

interface EditTimelineGroupDialogProps {
  control: UseDialogReturn;
}

export const EditTimelineGroupDialog = ({ control }: EditTimelineGroupDialogProps) => {
  const { addTimelineGroup, updateTimelineGroup, editingTimelineGroup, setEditingTimelineGroup } = useAppStore(
    useShallow((state) => ({
      addTimelineGroup: state.addTimelineGroup,
      updateTimelineGroup: state.updateTimelineGroup,
      setEditingTimelineGroup: state.setEditingTimelineGroup,
      editingTimelineGroup: state.editingTimelineGroup,
    })),
  );

  const isEditMode = Boolean(editingTimelineGroup);
  const [group, setGroup] = useState(editingTimelineGroup ?? createTimelineGroup());
  const title = group.title;

  const handleSubmit = () => {
    if (title.trim()) {
      if (isEditMode) {
        updateTimelineGroup(group.id, () => group);
      } else {
        addTimelineGroup(group);
        setEditingTimelineGroup(DIRTY_TIMELINE_GROUP);
      }
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
