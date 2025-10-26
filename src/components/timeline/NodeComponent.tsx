import { Box, Heading, HStack, VStack, Icon } from '@chakra-ui/react';
import type { FC } from 'react';
import { useSetAtom } from 'jotai';
import { FaCheck } from 'react-icons/fa';
import type { TaskNode, SubTask } from '@/types/timeline';
import { selectedNodeIdAtom } from '@/store/timelineGroups';

import SubTaskComponent from './SubTaskComponent';

interface NodeComponentProps {
  node: TaskNode;
}

const NodeComponent: FC<NodeComponentProps> = ({ node }) => {
  const setSelectedNodeId = useSetAtom(selectedNodeIdAtom);
  const isLocked = node.status === 'lock';

  const getStatusStyles = () => {
    if (node.milestone) {
      return {
        bg: 'blue.500',
        borderColor: 'blue.500',
      };
    }
    switch (node.status) {
      case 'todo':
        return {
          borderColor: 'blue.500',
          borderWidth: 2,
          bg: 'white',
        };
      case 'done':
        return {
          bg: 'green.500',
          borderColor: 'green.500',
        };
      case 'lock':
        return {
          bg: 'gray.200',
          borderColor: 'gray.400',
        };
      default:
        return {
          bg: 'gray.100',
          borderColor: 'gray.300',
        };
    }
  };

  const statusStyles = getStatusStyles();

  return (
    <HStack
      w="100%"
      align="center"
      onClick={() => setSelectedNodeId(node.id)}
      cursor="pointer"
      opacity={isLocked ? 0.6 : 1}
      _hover={{ bg: 'gray.100' }}
      p={2}
      borderRadius="md"
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        boxSize="24px"
        borderRadius="full"
        {...statusStyles}
      >
        {node.status === 'done' && <Icon as={FaCheck} color="white" boxSize="12px" />}
      </Box>
      <VStack align="stretch" gap={1} flex={1}>
        <Heading size="sm">{node.title}</Heading>
        {node.subtasks && node.subtasks.length > 0 && (
          <VStack w="100%" align="stretch" gap={2} pl={4}>
            {node.subtasks.map((subtask: SubTask) => (
              <SubTaskComponent key={subtask.id} subtask={subtask} />
            ))}
          </VStack>
        )}
      </VStack>
    </HStack>
  );
};

export default NodeComponent;
