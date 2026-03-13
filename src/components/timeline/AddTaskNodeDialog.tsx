import { Field, RadioGroup, Stack, type UseDialogReturn } from '@chakra-ui/react';
import { useMemo, useState } from 'react';

import { UniversalErrorDialog } from '@/components/ui/UniversalErrorDialog';
import { useAppStore } from '@/store';
import { selectTimelineById, type TimelineSlice } from '@/store/timelineSlice';
import { TaskNodeDraftSchema, type TaskNodeDraft } from '@/types/flat';
import type { BaseNode } from '@/types/timeline';

import { TaskNodeDialogBase } from './TaskNodeDialogBase';

interface AddTaskNodeDialogProps {
  sourceNode: BaseNode;
  disclosure: UseDialogReturn;
}

const createDefaultDraft = (): TaskNodeDraft => ({
  type: 'task',
  title: '',
  content: {
    description: '',
    subtasks: [],
  },
});

type InsertMode = Parameters<TimelineSlice['addTaskNode']>[1]['insertMode'];

export const AddTaskNodeDialog = ({ sourceNode, disclosure }: AddTaskNodeDialogProps) => {
  const timeline = useAppStore(useMemo(() => selectTimelineById(sourceNode.timelineId), [sourceNode.timelineId]));
  const addTaskNode = useAppStore((s) => s.addTaskNode);
  const [nodeDraft, setNodeDraft] = useState(createDefaultDraft);
  const [insertMode, setInsertMode] = useState<InsertMode>('after');

  if (timeline?.type !== 'task') {
    return <UniversalErrorDialog message="只能在任务时间线中添加任务节点" disclosure={disclosure} />;
  }

  const handleSubmit = () => {
    const payload = TaskNodeDraftSchema.parse(nodeDraft); // TODO handle error here
    addTaskNode(timeline.id, { draft: payload, sourceId: sourceNode.id, insertMode });
  };

  return (
    <TaskNodeDialogBase
      disclosure={disclosure}
      nodeDraft={nodeDraft}
      setNodeDraft={setNodeDraft}
      title="创建任务"
      saveButtonText="创建"
      onSubmit={handleSubmit}
    >
      <Field.Root>
        <Field.Label>插入位置</Field.Label>
        <RadioGroup.Root value={insertMode} onValueChange={(details) => setInsertMode(details.value as InsertMode)}>
          <Stack direction="row" gap={4}>
            <RadioGroup.Item value={'after' satisfies InsertMode}>
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemIndicator />
              <RadioGroup.ItemText>之后</RadioGroup.ItemText>
            </RadioGroup.Item>
            <RadioGroup.Item value={'before' satisfies InsertMode}>
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemIndicator />
              <RadioGroup.ItemText>之前</RadioGroup.ItemText>
            </RadioGroup.Item>
          </Stack>
        </RadioGroup.Root>
      </Field.Root>
    </TaskNodeDialogBase>
  );
};
