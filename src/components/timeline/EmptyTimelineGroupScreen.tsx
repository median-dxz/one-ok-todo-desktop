import { useSessionDialog } from '@/hooks/useSessionDialog';
import { Box, Button, Center, Heading, VStack } from '@chakra-ui/react';
import { LuFolderOpen, LuPlus } from 'react-icons/lu';
import { EditTimelineGroupDialog } from './EditTimelineGroupDialog';

export const EmptyTimelineGroupScreen = () => {
  const newTimelineGroupControl = useSessionDialog();

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
            newTimelineGroupControl.openDialog();
          }}
        >
          <LuPlus />
          新建
        </Button>
        <EditTimelineGroupDialog groupId={null} disclosure={newTimelineGroupControl.dialog} />
      </VStack>
    </Center>
  );
};
