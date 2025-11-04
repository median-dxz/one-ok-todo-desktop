import { Box, Button, Center, Heading, useDialog, VStack } from '@chakra-ui/react';
import { LuPlus, LuFolderOpen } from 'react-icons/lu';
import { EditTimelineGroupDialog } from './EditTimelineGroupDialog';
import { useAppStore } from '@/store';

export const EmptyTimelineGroupScreen = () => {
  const newTimelineGroupDialog = useDialog();
  const setEditingTimelineGroup = useAppStore(state => state.setEditingTimelineGroup);

  return (
    <Center h="100%">
      <VStack gap={4} textAlign="center">
        <Box as="span" color="gray.500">
          <LuFolderOpen size={48} />
        </Box>
        <Heading size="md">尚未选择时间线组</Heading>
        <Box color="gray.500">请在左侧选择一个时间线组，或创建新的时间线组开始添加任务。</Box>
        <Button
          colorPalette="blue"
          variant="solid"
          size="sm"
          onClick={() => {
            setEditingTimelineGroup(null);
            newTimelineGroupDialog.setOpen(true);
          }}
        >
          <LuPlus />
          新建
        </Button>
        <EditTimelineGroupDialog control={newTimelineGroupDialog} />
      </VStack>
    </Center>
  );
};
