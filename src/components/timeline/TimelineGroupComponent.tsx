import { Box, Heading, VStack } from "@chakra-ui/react";
import type { FC } from "react";
import type { TimelineGroup } from "@/types/timeline";
import TimelineComponent from "./TimelineComponent";

interface TimelineGroupComponentProps {
  group: TimelineGroup;
}

const TimelineGroupComponent: FC<TimelineGroupComponentProps> = ({ group }) => {
  return (
    <Box w="100%">
      <VStack align="stretch" gap={5}>
        <Heading size="lg" color="gray.600">{group.title}</Heading>
        {group.timelines.map((timeline) => (
          <TimelineComponent key={timeline.id} timeline={timeline} />
        ))}
      </VStack>
    </Box>
  );
};

export default TimelineGroupComponent;
