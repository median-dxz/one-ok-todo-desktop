import { useAppStore } from '@/store';
import { selectTimelineGroupById } from '@/store/timelineSlice';
import { TimelineGroupFlatSchema, TimelineGroupDraftSchema, type TimelineGroupDraft } from '@/types/flat';
import { Button, Dialog, Field, Input, Portal, type UseDialogReturn } from '@chakra-ui/react';
import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

interface EditTimelineGroupDialogProps {
  disclosure: UseDialogReturn;
  groupId: string | null;
}

export const EditTimelineGroupDialog = ({ disclosure, groupId }: EditTimelineGroupDialogProps) => {
  const { addTimelineGroup, updateTimelineGroup } = useAppStore(
    useShallow((state) => ({
      addTimelineGroup: state.addTimelineGroup,
      updateTimelineGroup: state.updateTimelineGroup,
    })),
  );

  const targetGroup = useAppStore(selectTimelineGroupById(groupId ?? undefined));
  const isEditMode = Boolean(targetGroup);
  const [groupDraft, setGroupDraft] = useState<TimelineGroupDraft>(
    () =>
      structuredClone(targetGroup) ?? {
        title: '',
        timelineOrder: [],
      },
  );

  const { title } = groupDraft;

  const handleSubmit = () => {
    if (title.trim()) {
      if (isEditMode) {
        const payload = TimelineGroupFlatSchema.parse(groupDraft);
        updateTimelineGroup(payload.id, () => payload);
      } else {
        const draft = TimelineGroupDraftSchema.parse(groupDraft);
        addTimelineGroup(draft);
      }
    }
  };

  return (
    <Dialog.RootProvider value={disclosure}>
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
                  onChange={(e) => setGroupDraft((prev) => ({ ...prev, title: e.target.value }))}
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
