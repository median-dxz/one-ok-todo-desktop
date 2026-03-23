import { FormDialogShell } from '@/components/ui/FormDialogShell';
import { useZodFormValidation } from '@/hooks/useZodFormValidation';
import { useAppStore } from '@/store';
import { TimelineDraftSchema, TimelineFlatSchema } from '@/types/flat';
import type { TimelineFlat } from '@/types/flat';

import { type UseDialogReturn } from '@chakra-ui/react';
import { useState } from 'react';

import { EditTimelineField } from './EditTimelineField';
import { type DualDraftState, initDualDraft } from './helper';
import { useShallow } from 'zustand/shallow';

interface EditTimelineDialogProps {
  timeline?: TimelineFlat | null;
  disclosure: UseDialogReturn;
}

export function EditTimelineDialog({ timeline, disclosure }: EditTimelineDialogProps) {
  const isEditMode = Boolean(timeline);
  const { updateTimeline, addTimeline, deleteTimeline } = useAppStore(
    useShallow((s) => ({
      updateTimeline: s.updateTimeline,
      addTimeline: s.addTimeline,
      deleteTimeline: s.deleteTimeline,
    })),
  );

  const selectedGroupId = useAppStore((s) => s.selectedTimelineGroupId);

  const [state, setState] = useState<DualDraftState>(() => initDualDraft(timeline));
  const { fieldErrors, validate } = useZodFormValidation();

  const handleSubmit = () => {
    const currentDraft = state.selectedType === 'task' ? state.taskDraft : state.recurrenceDraft;

    if (timeline?.type === currentDraft.type) {
      const flatData = { ...currentDraft, groupId: timeline.groupId };
      const result = validate(TimelineFlatSchema, flatData);
      if (!result.success) return;
      updateTimeline(result.data.id, () => result.data);
    } else {
      if (!selectedGroupId) return;
      const result = validate(TimelineDraftSchema, currentDraft);
      if (!result.success) return;

      let targetGroupId = selectedGroupId;
      if (timeline) {
        // edit mode but type changed
        deleteTimeline(timeline.id);
        targetGroupId = timeline.groupId;
      }

      addTimeline(targetGroupId, result.data);
    }

    disclosure.setOpen(false);
  };

  return (
    <FormDialogShell
      disclosure={disclosure}
      title={isEditMode ? '编辑时间线' : '创建时间线'}
      submitText={isEditMode ? '保存' : '创建'}
      onSubmit={handleSubmit}
    >
      <EditTimelineField state={state} onUpdate={setState} fieldErrors={fieldErrors} />
    </FormDialogShell>
  );
}
