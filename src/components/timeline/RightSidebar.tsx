import type { RFNode } from '@/store/reactFlowObjects';
import type { DelimiterNode, TaskNode, TimelineNode } from '@/types/timeline';
import {
  Badge,
  Box,
  Button,
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
import { useAtomValue } from 'jotai';
import {
  LuGitBranch,
  LuGitCommitHorizontal,
  LuGitMerge,
  LuGitPullRequest,
  LuPencil,
  LuPlus,
  LuUndo2,
} from 'react-icons/lu';

interface RightSidebarProps {
  node: RFNode<TimelineNode> | null;
  onClose?: () => void;
}

// Panel for Task Nodes
function TaskPanel({ node, onClose }: { node: RFNode<TaskNode>; onClose?: () => void }) {
  const task = node.data;
  const { status } = task;

  const canBeCompleted = status === 'todo';
  const canBeUndone = status === 'done' || status === 'skipped';
  const canBeModified = status === 'todo' || status === 'lock';

  return (
    <VStack w="100%" align="stretch" gap={4}>
      <HStack justify="space-between" align="flex-start">
        <Heading size="md">{task.title}</Heading>
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
          {task.description || 'No description provided.'}
        </Text>
      </VStack>

      <Separator />

      <Heading size="sm" mt={2}>
        Actions
      </Heading>
      <Wrap>
        {canBeCompleted && (
          <>
            <Button size="sm" colorScheme="green" onClick={() => {}}>
              Complete
            </Button>
            <Button size="sm" colorScheme="orange" onClick={() => {}}>
              Skip
            </Button>
          </>
        )}
        {canBeUndone && (
          <Button size="sm" onClick={() => {}}>
            <Icon as={LuUndo2} mr={2} />
            Undo Completion
          </Button>
        )}
        {canBeModified && (
          <>
            <Button size="sm" onClick={() => {}}>
              <Icon as={LuPencil} mr={2} />
              Edit
            </Button>
            <Button size="sm" onClick={() => {}}>
              <Icon as={LuPlus} mr={2} />
              Add Subtask
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
    </VStack>
  );
}

// Panel for Delimiter (Start/End) Nodes
function DelimiterPanel({ node, onClose }: { node: RFNode<DelimiterNode>; onClose?: () => void }) {
  const timeline = useAtomValue(node.data.timelineAtom);
  const isStart = node.data.markerType === 'start';

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

      <Button size="sm" onClick={() => {}}>
        <Icon as={LuPencil} mr={2} />
        Edit Timeline
      </Button>
    </VStack>
  );
}

// Panel when no node is selected
function DefaultPanel() {
  return (
    <VStack w="100%" h="100%" justify="center" align="center" gap={2}>
      <Box p={4} bg="gray.100" borderRadius="full">
        <Icon as={LuGitCommitHorizontal} boxSize="24px" color="gray.500" />
      </Box>
      <Heading size="sm" color="gray.600">
        Select a Node
      </Heading>
      <Text fontSize="sm" color="gray.500">
        Click on a node to see its details and actions.
      </Text>
    </VStack>
  );
}

export const RightSidebar = ({ node, onClose }: RightSidebarProps) => {
  const renderContent = () => {
    if (!node) {
      return <DefaultPanel />;
    }
    switch (node.type) {
      case 'task':
        return <TaskPanel node={node as RFNode<TaskNode>} onClose={onClose} />;
      case 'delimiter':
        return <DelimiterPanel node={node as RFNode<DelimiterNode>} onClose={onClose} />;
      default:
        return <DefaultPanel />;
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
