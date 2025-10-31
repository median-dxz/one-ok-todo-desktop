import { deleteMemoNodeAtom, updateMemoNodeAtom } from '@/store/actions/memoActions';
import { selectNodeTypeDialogAtom, selectedMemoNodeIdAtom } from '@/store/memoAtom';
import type { MemoNode as MemoNodeType } from '@/types/memo';
import { Box, Editable, Flex, HStack, Icon, IconButton, Spacer, VStack } from '@chakra-ui/react';
import { useAtom, useSetAtom } from 'jotai';
import { useState } from 'react';
import { FiFileText, FiFolder, FiList, FiPlus, FiTrash2 } from 'react-icons/fi';

interface MemoNodeProps {
  node: MemoNodeType;
  level: number;
  isLast: boolean;
}

const NODE_TYPE_ICONS = {
  object: { icon: FiFolder, color: 'blue.500' },
  array: { icon: FiList, color: 'green.500' },
  string: { icon: FiFileText, color: 'gray.500' },
  number: { icon: FiFileText, color: 'orange.500' },
  boolean: { icon: FiFileText, color: 'purple.500' },
};

export const MemoNode = ({ node, level, isLast }: MemoNodeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const setDialogState = useSetAtom(selectNodeTypeDialogAtom);
  const deleteNode = useSetAtom(deleteMemoNodeAtom);
  const updateNode = useSetAtom(updateMemoNodeAtom);
  const [selectedNodeId, setSelectedNodeId] = useAtom(selectedMemoNodeIdAtom);

  const isSelected = selectedNodeId === node.id;
  const { icon, color } = NODE_TYPE_ICONS[node.type];

  return (
    <Box position="relative">
      <Flex
        align="center"
        py={1.5}
        px={3}
        ml={`${level * 24}px`}
        my="2px"
        bg={isSelected ? 'blue.500' : isHovered ? 'blackAlpha.50' : 'white'}
        color={isSelected ? 'white' : 'gray.800'}
        borderRadius="md"
        cursor="pointer"
        onClick={() => setSelectedNodeId(node.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        boxShadow="sm"
        border="1px solid"
        borderColor={isSelected ? 'blue.500' : 'gray.100'}
      >
        <Box position="absolute" left="-12px" top="50%" transform="translateY(-50%)" w="12px" h="1px" bg="gray.300" />
        <Box
          position="absolute"
          left="-12px"
          top={isLast ? '0' : '0'}
          bottom={isLast ? '50%' : '0'}
          w="1px"
          bg="gray.300"
        />

        <Icon as={icon} color={isSelected ? 'white' : color} mr={2} />
        <Editable.Root
          defaultValue={node.key}
          onValueCommit={(d) => updateNode({ nodeId: node.id, newKey: d.value })}
          fontSize="sm"
        >
          <Editable.Preview />
          <Editable.Input />
        </Editable.Root>
        <Spacer />
        <HStack gap={1} opacity={isHovered || isSelected ? 1 : 0.3} transition="opacity 0.2s">
          <IconButton
            aria-label="Add child"
            size="xs"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              setDialogState({ isOpen: true, parentId: node.id });
            }}
          >
            <FiPlus />
          </IconButton>
          <IconButton
            aria-label="Delete node"
            size="xs"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              deleteNode({ nodeId: node.id });
            }}
          >
            <FiTrash2 />
          </IconButton>
        </HStack>
      </Flex>
      <VStack align="stretch" gap={0}>
        {node.children.map((child, index) => (
          <MemoNode key={child.id} node={child} level={level + 1} isLast={index === node.children.length - 1} />
        ))}
      </VStack>
    </Box>
  );
};
