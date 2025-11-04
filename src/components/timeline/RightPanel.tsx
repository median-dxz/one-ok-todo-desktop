import { useDeleteTimeline, useReactFlowStore, useUpdateTaskNodeStatus } from '@/store/reactFlowStore';
import type { DelimiterNode, TaskNode } from '@/types/timeline';
import type { RFNode } from '@/utils/reactFlowObjects';
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
  useDialog,
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

interface RightSidebarProps {
  nodeId: string | null;
  onClose?: () => void;
}

// Panel for Task Nodes
function TaskPanel({ node, onClose }: { node: RFNode<TaskNode>; onClose?: () => void }) {
  const taskNodeEditControl = useDialog();
  const taskNodeAddControl = useDialog();
  const taskNode = node.data;
  const updateTaskNodeStatus = useUpdateTaskNodeStatus();

  const { status } = taskNode;

  const canBeCompleted = status === 'todo';
  const canBeUndone = status === 'done' || status === 'skipped';
  const canBeModified = status === 'todo' || status === 'lock';

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
          {taskNode.description || 'No description provided.'}
        </Text>
      </VStack>

      {taskNode.subtasks && taskNode.subtasks.length > 0 && (
        <VStack align="flex-start" gap={2}>
          <Text fontSize="sm" fontWeight="bold" color="gray.500">
            Subtasks ({taskNode.subtasks.filter((st) => st.status === 'done').length}/{taskNode.subtasks.length})
          </Text>
          <VStack align="stretch" gap={2} w="100%">
            {taskNode.subtasks.map((subtask, index) => (
              <Checkbox.Root key={index} checked={subtask.status === 'done'} readOnly size="sm">
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
                updateTaskNodeStatus(taskNode.timeline.id, taskNode, 'done');
              }}
            >
              <Icon as={LuCheck} mr={2} />
              Complete
            </Button>
            <Button
              size="sm"
              colorScheme="orange"
              onClick={() => {
                updateTaskNodeStatus(taskNode.timeline.id, taskNode, 'skipped');
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
              updateTaskNodeStatus(taskNode.timeline.id, taskNode, 'todo');
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
                taskNodeEditControl.setOpen(true);
              }}
            >
              <Icon as={LuPencil} mr={2} />
              Edit
            </Button>
            <Button
              size="sm"
              onClick={() => {
                taskNodeAddControl.setOpen(true);
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
      <EditTaskNodeDialog key={`${node.id}-edit-task`} targetNode={node} control={taskNodeEditControl} />
      <AddTaskNodeDialog key={`${node.id}-add-task`} sourceNode={taskNode} control={taskNodeAddControl} />
    </VStack>
  );
}

// Panel for Delimiter (Start/End) Nodes
function DelimiterPanel({ node, onClose }: { node: RFNode<DelimiterNode>; onClose?: () => void }) {
  const timelineEditControl = useDialog();
  const taskNodeAddControl = useDialog();
  const deleteTimeline = useDeleteTimeline();
  const timeline = node.data.timeline;
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
            timelineEditControl.setOpen(true);
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
              taskNodeAddControl.setOpen(true);
            }}
          >
            <Icon as={LuPlus} mr={2} />
            Add Task Node
          </Button>
        )}
      </Wrap>
      <EditTimelineDialog key={`${timeline.id}-edit`} timeline={timeline} control={timelineEditControl} />
      <AddTaskNodeDialog key={`${timeline.id}-add-task`} sourceNode={delimiterNode} control={taskNodeAddControl} />
    </VStack>
  );
}

export const RightSidebar = ({ nodeId, onClose }: RightSidebarProps) => {
  const node = useReactFlowStore((state) => state.nodes.find((n) => n.id === nodeId));

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
