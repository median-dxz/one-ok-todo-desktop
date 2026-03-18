import { UniversalErrorDialog } from '@/components/ui/UniversalErrorDialog';
import { useAppStore } from '@/store';
import { selectTimelineById } from '@/store/timelineSlice';
import { type TaskNodeFlat } from '@/types/flat';
import type { TaskNode } from '@/types/timeline';
import type { RFNode } from '@/utils/reactFlowObjects';
import type { UseDialogReturn } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { TaskNodeDialogBase } from './TaskNodeDialogBase';

interface EditTaskNodeDialogProps {
  targetNode: RFNode<TaskNode>;
  disclosure: UseDialogReturn;
}

export const EditTaskNodeDialog = ({ targetNode, disclosure }: EditTaskNodeDialogProps) => {
  const { timelineId } = targetNode.data;
  const [node, setNode] = useState(() => structuredClone(targetNode.data));
  const updateNode = useAppStore((s) => s.updateNode);
  const timeline = useAppStore(useMemo(() => selectTimelineById(timelineId), [timelineId]));

  if (timeline?.type !== 'task') {
    return <UniversalErrorDialog disclosure={disclosure} message="只能在任务时间线中编辑任务节点" />;
  }

  const handleSubmit = (data: TaskNodeFlat) => {
    updateNode(data.id, () => data);
  };

  return (
    <TaskNodeDialogBase
      disclosure={disclosure}
      nodeDraft={node}
      setNodeDraft={setNode}
      title="编辑任务"
      saveButtonText="保存"
      onSubmit={handleSubmit}
    />
  );
};
