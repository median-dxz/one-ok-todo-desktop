import { Box, Button, Center, Heading, useDialog, VStack } from '@chakra-ui/react';
import { FiCalendar } from 'react-icons/fi';
import { LuPlus } from 'react-icons/lu';
import { NewTimelineDialog } from './NewTimelineDialog';

export const EmptyTimelineScreen = ({ groupId }: { groupId: string }) => {
  const newTimelineDialog = useDialog();

  return (
    <Center h="100%">
      <VStack gap={4} textAlign="center">
        <Box as="span" color="gray.500">
          <FiCalendar size={48} />
        </Box>
        <Heading size="md">创建一条时间线</Heading>
        <Box color="gray.500">该分组下暂无任何时间线，点击下方按钮以创建一条新时间线</Box>
        <Button colorPalette="blue" variant="solid" size="sm" onClick={() => newTimelineDialog.setOpen(true)}>
          <LuPlus />
          新建
        </Button>
        <NewTimelineDialog control={newTimelineDialog} groupId={groupId} />
      </VStack>
    </Center>
  );
};
