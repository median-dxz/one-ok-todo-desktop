import { UniversalErrorDialog } from '@/components/ui/UniversalErrorDialog';
import { useAppStore } from '@/store';
import { selectTimelineById } from '@/store/timelineSlice';
import type { TaskNodeDraft } from '@/types/flat';
import { TaskNodeSchema, type NodeStatus, type TaskNode } from '@/types/timeline';
import type { RFNode } from '@/utils/reactFlowObjects';
import { RadioGroup, Stack, type UseDialogReturn } from '@chakra-ui/react';
import { produce } from 'immer';
import { useMemo, useState } from 'react';
import { TaskNodeDialogBase } from './TaskNodeDialogBase';

interface EditTaskNodeDialogProps {
  targetNode: RFNode<TaskNode>;
  disclosure: UseDialogReturn;
}

export const EditTaskNodeDialog = ({ targetNode, disclosure }: EditTaskNodeDialogProps) => {
  const { timelineId } = targetNode.data;
  const [node, setNode] = useState<TaskNodeDraft>(() => structuredClone(targetNode.data));
  const updateNode = useAppStore((s) => s.updateNode);
  const timeline = useAppStore(useMemo(() => selectTimelineById(timelineId), [timelineId]));

  if (timeline?.type !== 'task') {
    return <UniversalErrorDialog disclosure={disclosure} message="只能在任务时间线中编辑任务节点" />;
  }

  const handleSubmit = () => {
    const payload = TaskNodeSchema.parse(node);
    // TODO: handle error here
    updateNode(payload.id, () => payload);
  };

  return (
    <TaskNodeDialogBase
      disclosure={disclosure}
      nodeDraft={node}
      setNodeDraft={setNode}
      title="编辑任务"
      saveButtonText="保存"
      onSubmit={handleSubmit}
    >
      <RadioGroup.Root
        data-value={node.status}
        value={node.status}
        onValueChange={(details) => {
          setNode(
            produce((draft) => {
              draft.status = details.value as NodeStatus;
            }),
          );
        }}
      >
        <RadioGroup.Label>选择状态</RadioGroup.Label>
        <Stack direction="row" gap={4}>
          <RadioGroup.Item value="todo">
            <RadioGroup.ItemHiddenInput />
            <RadioGroup.ItemIndicator />
            <RadioGroup.ItemText>Todo</RadioGroup.ItemText>
          </RadioGroup.Item>
          <RadioGroup.Item value="done">
            <RadioGroup.ItemHiddenInput />
            <RadioGroup.ItemIndicator />
            <RadioGroup.ItemText>Done</RadioGroup.ItemText>
          </RadioGroup.Item>
          <RadioGroup.Item value="skipped">
            <RadioGroup.ItemHiddenInput />
            <RadioGroup.ItemIndicator />
            <RadioGroup.ItemText>Skipped</RadioGroup.ItemText>
          </RadioGroup.Item>
          <RadioGroup.Item value="locked">
            <RadioGroup.ItemHiddenInput />
            <RadioGroup.ItemIndicator />
            <RadioGroup.ItemText>Locked</RadioGroup.ItemText>
          </RadioGroup.Item>
        </Stack>
      </RadioGroup.Root>
    </TaskNodeDialogBase>
  );
};
