import { Box, Heading, VStack } from '@chakra-ui/react';
import type { FC } from 'react';
import type { Timeline, TaskNode } from '@/types/timeline';
import NodeComponent from './NodeComponent';

interface TimelineComponentProps {
  timeline: Timeline;
}

const TimelineComponent: FC<TimelineComponentProps> = ({ timeline }) => {
  if (!('nodes' in timeline)) {
    // This component only renders timelines with nodes, not recurrence timelines.
    return null;
  }

  return (
    <Box w="100%" borderWidth={1} borderRadius="md" p={4} borderColor="gray.300">
      <VStack align="stretch" gap={4}>
        <Heading size="md">{timeline.title}</Heading>
        <Box position="relative" pl={8}>
          <Box position="absolute" left="20px" top={0} bottom={0} width="2px" bg="gray.200" />
          <VStack align="stretch" gap={2}>
            {timeline.nodes.map((node: TaskNode) => (
              <Box key={node.id} position="relative">
                <Box
                  position="absolute"
                  left="-23px"
                  top="18px"
                  width="10px"
                  height="2px"
                  bg="gray.200"
                />
                <NodeComponent node={node} />
              </Box>
            ))}
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default TimelineComponent;
