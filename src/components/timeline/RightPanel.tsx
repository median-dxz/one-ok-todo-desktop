import { useAppStore } from '@/store';
import { useReactFlowStateStore } from '@/store/reactFlowStore';
import type { DelimiterNode, TaskNode } from '@/types/timeline';
import type { RFNode } from '@/utils/reactFlowObjects';
import { useShallow } from 'zustand/react/shallow';
import {
  Badge,
  Button,
  Checkbox,
  CloseButton,
  Flex,
  Heading,
  HStack,
  Icon,
  Separator,
  Text,
  VStack,
  Wrap,
} from '@chakra-ui/react';
import {
  LuCheck,
  LuGitBranch,
  LuGitCommitHorizontal,
  LuGitMerge,
  LuGitPullRequest,
  LuPencil,
  LuPlus,
  LuSkipForward,
  LuUndo2,
} from 'react-icons/lu';
import { AddTaskNodeDialog } from './AddTaskNodeDialog';
import { EditTaskNodeDialog } from './EditTaskNodeDialog';
import { EditTimelineDialog } from './EditTimelineDialog';
import { useSessionDialog } from '@/hooks/useSessionDialog';

interface RightSidebarProps {
  nodeId: string | null;
  onClose?: () => void;
}

// Panel for Task Nodes
function TaskPanel({ node, onClose }: { node: RFNode<TaskNode>; onClose?: () => void }) {
  const editTaskNodeControl = useSessionDialog();
  const addTaskNodeControl = useSessionDialog();
  const updateTaskNodeStatus = useAppStore((s) => s.updateTaskNodeStatus);

  const taskNode = node.data;
  const { status } = taskNode;

  const canBeCompleted = status === 'todo';
  const canBeUndone = status === 'done' || status === 'skipped';
  const canBeModified = status === 'todo' || status === 'locked';

  return (
    <VStack w="100%" align="stretch" gap={4}>
      <HStack justify="space-between" align="flex-start">
        <Heading size="md">{taskNode.title}</Heading>
        <CloseButton size="sm" onClick={onClose} />
      </HStack>

      <VStack align="flex-start" gap={1}>
        <Text fontSize="sm" fontWeight="bold" color="gray.500">
          Status
        </Text>
        <Badge colorScheme={status === 'done' ? 'green' : 'blue'}>{status}</Badge>
      </VStack>

      <VStack align="flex-start" gap={1}>
        <Text fontSize="sm" fontWeight="bold" color="gray.500">
          Description
        </Text>
        <Text fontSize="sm" color="gray.600">
          {taskNode.content.description || 'No description provided.'}
        </Text>
      </VStack>

      {taskNode.content.subtasks && taskNode.content.subtasks.length > 0 && (
        <VStack align="flex-start" gap={2}>
          <Text fontSize="sm" fontWeight="bold" color="gray.500">
            Subtasks ({taskNode.content.subtasks.filter((st) => st.done).length}/{taskNode.content.subtasks.length})
          </Text>
          <VStack align="stretch" gap={2} w="100%">
            {taskNode.content.subtasks.map((subtask, index) => (
              <Checkbox.Root key={index} checked={subtask.done} readOnly size="sm">
                <Checkbox.HiddenInput />
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Label>{subtask.title}</Checkbox.Label>
              </Checkbox.Root>
            ))}
          </VStack>
        </VStack>
      )}

      <Separator />

      <Heading size="sm" mt={2}>
        Actions
      </Heading>
      <Wrap>
        {canBeCompleted && (
          <>
            <Button
              size="sm"
              colorScheme="green"
              onClick={() => {
                updateTaskNodeStatus(taskNode.timelineId, taskNode, 'done');
              }}
            >
              <Icon as={LuCheck} mr={2} />
              Complete
            </Button>
            <Button
              size="sm"
              colorScheme="orange"
              onClick={() => {
                updateTaskNodeStatus(taskNode.timelineId, taskNode, 'skipped');
              }}
            >
              <Icon as={LuSkipForward} mr={2} />
              Skip
            </Button>
          </>
        )}
        {canBeUndone && (
          <Button
            size="sm"
            onClick={() => {
              updateTaskNodeStatus(taskNode.timelineId, taskNode, 'todo');
            }}
          >
            <Icon as={LuUndo2} mr={2} />
            Undo Completion
          </Button>
        )}
        {canBeModified && (
          <>
            <Button
              size="sm"
              onClick={() => {
                editTaskNodeControl.openDialog();
              }}
            >
              <Icon as={LuPencil} mr={2} />
              Edit
            </Button>
            <Button
              size="sm"
              onClick={() => {
                addTaskNodeControl.openDialog();
              }}
            >
              <Icon as={LuPlus} mr={2} />
              Add Task Node
            </Button>
            <Button size="sm" onClick={() => {}}>
              <Icon as={LuGitBranch} mr={2} />
              Fork
            </Button>
            <Button size="sm" onClick={() => {}}>
              <Icon as={LuGitMerge} mr={2} />
              Merge
            </Button>
            <Button size="sm" onClick={() => {}}>
              <Icon as={LuGitPullRequest} mr={2} />
              Swap
            </Button>
            <Button size="sm" colorScheme="red" onClick={() => {}}>
              <Icon as={LuGitCommitHorizontal} mr={2} />
              Revert
            </Button>
          </>
        )}
      </Wrap>
      <EditTaskNodeDialog key={editTaskNodeControl.session} targetNode={node} disclosure={editTaskNodeControl.dialog} />
      <AddTaskNodeDialog key={addTaskNodeControl.session} sourceNode={taskNode} disclosure={addTaskNodeControl.dialog} />
    </VStack>
  );
}

// Panel for Delimiter (Start/End) Nodes
function DelimiterPanel({ node, onClose }: { node: RFNode<DelimiterNode>; onClose?: () => void }) {
  const editTimelineControl = useSessionDialog();
  const addTaskNodeControl = useSessionDialog();

  const deleteTimeline = useAppStore((s) => s.deleteTimeline);
  const timeline = useAppStore((s) => s.timelines[node.data.timelineId]);
  const isStart = node.data.markerType === 'start';
  const delimiterNode = node.data;

  return (
    <VStack w="100%" align="stretch" gap={4}>
      <HStack justify="space-between" align="flex-start">
        <Heading size="md">{timeline.title}</Heading>
        <CloseButton size="sm" onClick={onClose} />
      </HStack>

      <VStack align="flex-start" gap={1}>
        <Text fontSize="sm" fontWeight="bold" color="gray.500">
          Node Type
        </Text>
        <Badge colorScheme={isStart ? 'blue' : 'green'}>{isStart ? 'Start' : 'End'}</Badge>
      </VStack>

      <VStack align="flex-start" gap={1}>
        <Text fontSize="sm" fontWeight="bold" color="gray.500">
          Timeline Type
        </Text>
        <Text fontSize="sm" color="gray.600">
          {timeline.type}
        </Text>
      </VStack>

      <Separator />
      <Wrap>
        <Button
          size="sm"
          onClick={() => {
            editTimelineControl.openDialog();
          }}
        >
          <Icon as={LuPencil} mr={2} />
          Edit Timeline
        </Button>
        <Button
          size="sm"
          colorPalette="red"
          onClick={() => {
            deleteTimeline(timeline.id);
          }}
        >
          <Icon as={LuGitCommitHorizontal} mr={2} />
          Delete Timeline
        </Button>

        {isStart && (
          <Button
            size="sm"
            onClick={() => {
              addTaskNodeControl.openDialog();
            }}
          >
            <Icon as={LuPlus} mr={2} />
            Add Task Node
          </Button>
        )}
      </Wrap>
      <EditTimelineDialog
        key={editTimelineControl.session}
        timeline={timeline}
        disclosure={editTimelineControl.dialog}
      />
      <AddTaskNodeDialog
        key={addTaskNodeControl.session}
        sourceNode={delimiterNode}
        disclosure={addTaskNodeControl.dialog}
      />
    </VStack>
  );
}

export const RightSidebar = ({ nodeId, onClose }: RightSidebarProps) => {
  const node = useReactFlowStateStore(useShallow((state) => state.nodes.find((n) => n.id === nodeId)));

  if (!node) {
    return null;
  }

  const renderContent = () => {
    switch (node.type) {
      case 'task':
        return <TaskPanel node={node as RFNode<TaskNode>} onClose={onClose} />;
      case 'delimiter': {
        return <DelimiterPanel node={node as RFNode<DelimiterNode>} onClose={onClose} />;
      }
      default:
        return null;
    }
  };

  return (
    <Flex
      as="aside"
      w="22rem"
      minW="22rem"
      bg="white"
      rounded="lg"
      boxShadow="md"
      p={4}
      transition="all 0.3s ease-in-out"
    >
      {renderContent()}
    </Flex>
  );
};
