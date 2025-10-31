import type { SubTask, TaskNode } from '@/types/timeline';
import { Box, Checkbox, Heading, HStack, Icon, VStack } from '@chakra-ui/react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { FaCheck } from 'react-icons/fa';
import type { RFNode } from '@/store/reactFlowObjects';

export function TaskNodeComponent({ data }: NodeProps<RFNode<TaskNode>>) {
  const taskNode = data;
  const isLocked = taskNode.status === 'lock';

  const getStatusStyles = () => {
    if (taskNode.milestone) {
      return {
        bg: 'blue.500',
        borderColor: 'blue.500',
      };
    }
    switch (taskNode.status) {
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
    <>
      <Handle type="target" position={Position.Left} />
      <HStack
        w="100%"
        align="center"
        cursor="pointer"
        opacity={isLocked ? 0.6 : 1}
        _hover={{ bg: 'gray.100' }}
        p={2}
        borderRadius="md"
        bg="white"
        border="1px solid"
        borderColor="gray.200"
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxSize="24px"
          borderRadius="full"
          {...statusStyles}
        >
          {taskNode.status === 'done' && <Icon as={FaCheck} color="white" boxSize="12px" />}
        </Box>
        <VStack align="stretch" gap={1} flex={1}>
          <Heading size="sm">{taskNode.title}</Heading>
          {taskNode.subtasks && taskNode.subtasks.length > 0 && (
            <VStack w="100%" align="stretch" gap={2} pl={4}>
              {taskNode.subtasks.map((subtask: SubTask, index: number) => (
                <HStack key={`${taskNode.id}-subtask-${index}`} w="100%">
                  <Checkbox.Root readOnly>
                    <Checkbox.Control />
                    <Checkbox.Label>{subtask.title}</Checkbox.Label>
                  </Checkbox.Root>
                </HStack>
              ))}
            </VStack>
          )}
        </VStack>
      </HStack>
      <Handle type="source" position={Position.Right} />
    </>
  );
}
