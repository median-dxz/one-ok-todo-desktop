import { addTimelineDependencyAtom, forkTimelineAtom } from '@/store/actions/timelineActions';
import { selectedNodeAtom } from '@/store/derivedAtoms';
import { timelineGroupsAtom } from '@/store/timelineGroups';
import {
  Badge,
  Box,
  Button,
  Checkbox,
  CloseButton,
  Dialog,
  Heading,
  HStack,
  Input,
  Portal,
  Stack,
  Text,
  useDialog,
  VStack,
} from '@chakra-ui/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { useMemo, useState } from 'react';

export const RightSidebar = () => {
  const [newTimelineTitle, setNewTimelineTitle] = useState('');
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);

  const forkDialog = useDialog();
  const depDialog = useDialog();

  const forkTimeline = useSetAtom(forkTimelineAtom);
  const addTimelineDependency = useSetAtom(addTimelineDependencyAtom);
  const timelineGroups = useAtomValue(timelineGroupsAtom);
  const selectedNode = useAtomValue(selectedNodeAtom);

  const availableTimelines = useMemo(() => {
    if (!selectedNode) return [];
    let parentTimelineId: string | null = null;
    for (const group of timelineGroups) {
      for (const timeline of group.timelines) {
        if (timeline.nodes.some((n) => n.id === selectedNode.id)) {
          parentTimelineId = timeline.id;
          break;
        }
      }
      if (parentTimelineId) break;
    }
    return timelineGroups
      .flatMap((g) => g.timelines)
      .filter((tl) => tl.id !== parentTimelineId && !selectedNode.depends_on_timeline?.includes(tl.id));
  }, [timelineGroups, selectedNode]);

  const handleFork = () => {
    if (selectedNode && newTimelineTitle) {
      forkTimeline({
        fromNodeId: selectedNode.id,
        newTimelineTitle,
      });
      setNewTimelineTitle('');
    }
  };

  const handleAddDependency = () => {
    if (selectedNode && selectedDependencies.length > 0) {
      addTimelineDependency({
        toNodeId: selectedNode.id,
        fromTimelineIds: selectedDependencies,
      });
      setSelectedDependencies([]);
    }
  };

  return (
    <Box
      as="aside"
      css={{
        minW: '20rem',
        bgColor: 'white',
        m: 4,
        ml: 0,
        rounded: 'lg',
        boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.05)',
        p: 5,
        opacity: selectedNode ? 1 : 0,
      }}
    >
      {selectedNode ? (
        <VStack align="flex-start" gap={4}>
          <Heading size="md">{selectedNode.title}</Heading>
          <VStack align="flex-start" gap={1}>
            <Text fontSize="sm" color="gray.500">
              Status
            </Text>
            <Badge colorPalette={selectedNode.status === 'done' ? 'green' : 'blue'}>{selectedNode.status}</Badge>
          </VStack>
          <VStack align="flex-start" gap={1}>
            <Text fontSize="sm" color="gray.500">
              Type
            </Text>
            <Text>{selectedNode.type}</Text>
          </VStack>
          <HStack mt={4}>
            <Dialog.RootProvider value={forkDialog}>
              <Dialog.Trigger asChild>
                <Button size="sm">Fork Timeline</Button>
              </Dialog.Trigger>
              <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                  <Dialog.Content>
                    <Dialog.CloseTrigger asChild>
                      <CloseButton size="sm" />
                    </Dialog.CloseTrigger>
                    <Dialog.Header>
                      <Dialog.Title>Create a new Timeline from this node</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body>
                      <Input
                        placeholder="Enter new timeline title"
                        value={newTimelineTitle}
                        onChange={(e) => setNewTimelineTitle(e.target.value)}
                      />
                    </Dialog.Body>
                    <Dialog.Footer>
                      <Dialog.ActionTrigger asChild>
                        <Button variant="outline">Cancel</Button>
                      </Dialog.ActionTrigger>
                      <Dialog.ActionTrigger asChild>
                        <Button colorPalette="blue" onClick={handleFork}>
                          Create
                        </Button>
                      </Dialog.ActionTrigger>
                    </Dialog.Footer>
                  </Dialog.Content>
                </Dialog.Positioner>
              </Portal>
            </Dialog.RootProvider>

            <Dialog.RootProvider value={depDialog}>
              <Dialog.Trigger asChild>
                <Button size="sm">Add Dependency</Button>
              </Dialog.Trigger>
              <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                  <Dialog.Content>
                    <Dialog.CloseTrigger>
                      <CloseButton size="sm" />
                    </Dialog.CloseTrigger>
                    <Dialog.Header>
                      <Dialog.Title>Add Timeline Dependencies</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body>
                      <Stack>
                        {availableTimelines.map((tl) => (
                          <Checkbox.Root
                            key={tl.id}
                            checked={selectedDependencies.includes(tl.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedDependencies((prev) => [...prev, tl.id]);
                              } else {
                                setSelectedDependencies((prev) => prev.filter((id) => id !== tl.id));
                              }
                            }}
                          >
                            <Checkbox.Control />
                            <Checkbox.Label>{tl.title}</Checkbox.Label>
                          </Checkbox.Root>
                        ))}
                      </Stack>
                    </Dialog.Body>
                    <Dialog.Footer>
                      <Dialog.ActionTrigger asChild>
                        <Button variant="outline">Cancel</Button>
                      </Dialog.ActionTrigger>
                      <Dialog.ActionTrigger asChild>
                        <Button colorPalette="blue" onClick={handleAddDependency}>
                          Save
                        </Button>
                      </Dialog.ActionTrigger>
                    </Dialog.Footer>
                  </Dialog.Content>
                </Dialog.Positioner>
              </Portal>
            </Dialog.RootProvider>
          </HStack>
        </VStack>
      ) : null}
    </Box>
  );
};
