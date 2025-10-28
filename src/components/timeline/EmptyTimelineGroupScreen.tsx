import { useDialog, Center, VStack, Box, Heading, Button } from '@chakra-ui/react';
import { FiCalendar } from 'react-icons/fi';
import { LuPlus } from 'react-icons/lu';
import { EditTimelineGroupDialog } from './EditTimelineGroupDialog';

export const EmptyTimelineGroupScreen = () => {
  const newTimelineGroupDialog = useDialog();

  return (
    <Center h="100%">
      <VStack gap={4} textAlign="center">
        <Box as="span" color="gray.500">
          <FiCalendar size={48} />
        </Box>
        <Heading size="md">尚未选择时间线</Heading>
        <Box color="gray.500">请在左侧选择一个时间线，或创建新的时间线开始添加任务。</Box>
        <Button colorPalette="blue" variant="solid" size="sm" onClick={() => newTimelineGroupDialog.setOpen(true)}>
          <LuPlus />
          新建
        </Button>
        <EditTimelineGroupDialog control={newTimelineGroupDialog} />
      </VStack>
    </Center>
  );
};
