import { FormDialogShell } from '@/components/ui/FormDialogShell';
import { useZodFormValidation } from '@/hooks/useZodFormValidation';
import { useAppStore } from '@/store';
import { selectTimelineGroupById } from '@/store/timelineSlice';
import { TimelineGroupDraftSchema, TimelineGroupFlatSchema, type TimelineGroupDraft } from '@/types/flat';
import { Field, Input, type UseDialogReturn } from '@chakra-ui/react';
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

  const [draft, setDraft] = useState<TimelineGroupDraft>(() =>
    targetGroup ? structuredClone(targetGroup) : { title: '', timelineOrder: [] },
  );
  const { fieldErrors, validate } = useZodFormValidation();

  const handleSubmit = () => {
    if (isEditMode) {
      const result = validate(TimelineGroupFlatSchema, draft);
      if (!result.success) return;
      updateTimelineGroup(result.data.id, () => result.data);
    } else {
      const result = validate(TimelineGroupDraftSchema, draft);
      if (!result.success) return;
      addTimelineGroup(result.data);
    }
    disclosure.setOpen(false);
  };

  return (
    <FormDialogShell
      disclosure={disclosure}
      title={isEditMode ? '编辑组' : '创建组'}
      submitText={isEditMode ? '保存' : '创建'}
      onSubmit={handleSubmit}
    >
      <Field.Root invalid={fieldErrors.title !== undefined}>
        <Field.Label>组名称</Field.Label>
        <Input
          placeholder="输入组名称"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        />
        <Field.ErrorText>{fieldErrors.title}</Field.ErrorText>
      </Field.Root>
    </FormDialogShell>
  );
};
