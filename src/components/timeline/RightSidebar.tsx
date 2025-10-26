import { selectedNodeAtom } from '@/store/derivedAtoms';
import { Badge, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';

export const RightSidebar = () => {
  const selectedNode = useAtomValue(selectedNodeAtom);

  if (!selectedNode) {
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
      }}
      direction="column"
    >
      <Heading size="md">{selectedNode.title}</Heading>
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
