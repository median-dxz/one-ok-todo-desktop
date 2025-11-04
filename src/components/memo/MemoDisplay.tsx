import { Box, Input, InputGroup, InputElement, VStack, Button, Icon } from '@chakra-ui/react';
import { useAppStore } from '@/store';
import type { MemoNode as MemoNodeType } from '../../types/memo'; // Import MemoNode type
import { MemoNode } from './MemoNode';
import { FiSearch, FiPlus } from 'react-icons/fi';
import { SelectNodeTypeDialog } from './SelectNodeTypeDialog';

export const MemoDisplay = () => {
  const { memo: memoData, openSelectNodeTypeDialog } = useAppStore();

  const handleAddRoot = () => {
    openSelectNodeTypeDialog(null);
  };

  return (
    <Box p={4} bg="gray.50" h="100%" overflowY="auto">
      <InputGroup mb={4}>
        <InputElement pointerEvents="none">
          <Icon as={FiSearch} color="gray.300" />
          <Input placeholder="Search nodes..." bg="white" />
        </InputElement>
      </InputGroup>
      <Button size="sm" onClick={handleAddRoot} mb={4} variant="outline" w="100%">
        <Icon as={FiPlus} mr={2} />
        Add Root Item
      </Button>
      <VStack align="stretch" gap={0}>
        {memoData.map((node: MemoNodeType, index: number) => (
          <MemoNode key={node.id} node={node} level={0} isLast={index === memoData.length - 1} />
        ))}
      </VStack>
      <SelectNodeTypeDialog />
    </Box>
  );
};
