import { selectedTLGroupValueAtom } from '@/store/timelineGroup';
import type { TaskNode, Timeline, TimelineNode } from '@/types/timeline';
import { Badge, CloseButton, Flex, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';

interface RightSidebarProps {
  selectedNodeId: string | null;
  onClose?: () => void;
}

export const RightSidebar = ({ selectedNodeId, onClose }: RightSidebarProps) => {
  const timelineGroup = useAtomValue(selectedTLGroupValueAtom);

  const selectedNode = timelineGroup?.timelines
    .flatMap((t: Timeline) => ('nodes' in t ? t.nodes : []))
    .find((n: TimelineNode) => n.id === selectedNodeId) as TaskNode | undefined;

  if (!selectedNode || selectedNode.type !== 'task') {
    return null;
  }

  return (
    <Flex
      as="aside"
      css={{
        minW: '20rem',
        bgColor: 'white',
        rounded: 'lg',
        boxShadow: 'md',
        p: 4,
        gap: 4,
        opacity: selectedNode ? 1 : 0,
        position: 'relative',
      }}
      direction="column"
    >
      <HStack justify="space-between" align="flex-start">
        <Heading size="md">{selectedNode.title}</Heading>
        <CloseButton size="sm" onClick={onClose} />
      </HStack>
      <VStack align="flex-start" gap={1}>
        <Text fontSize="sm" color="gray.500">
          Status
        </Text>
        <Badge colorScheme={selectedNode.status === 'done' ? 'green' : 'blue'}>{selectedNode.status}</Badge>
      </VStack>
      <VStack align="flex-start" gap={1}>
        <Text fontSize="sm" color="gray.500">
          Type
        </Text>
        <Text>{selectedNode.type}</Text>
      </VStack>
    </Flex>
  );
};
