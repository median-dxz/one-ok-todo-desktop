import { useAppStore } from '@/store';
import type { MemoNodeType } from '@/types/memo';
import { Button, Dialog, Text, VStack } from '@chakra-ui/react';
import { FiFileText, FiFolder, FiHash, FiList, FiToggleLeft } from 'react-icons/fi';
import type { IconType } from 'react-icons/lib';

const NODE_TYPE_OPTIONS: {
  type: MemoNodeType;
  label: string;
  icon: IconType;
}[] = [
  { type: 'object', label: 'Object', icon: FiFolder },
  { type: 'array', label: 'Array', icon: FiList },
  { type: 'string', label: 'String', icon: FiFileText },
  { type: 'number', label: 'Number', icon: FiHash },
  { type: 'boolean', label: 'Boolean', icon: FiToggleLeft },
];

export const SelectNodeTypeDialog = () => {
  const {
    selectNodeTypeDialog: dialogState,
    closeSelectNodeTypeDialog,
    addMemoNode,
  } = useAppStore();

  const handleSelect = (type: MemoNodeType) => {
    addMemoNode(dialogState.parentId, type);
    closeSelectNodeTypeDialog();
  };

  return (
    <Dialog.Root open={dialogState.isOpen} onOpenChange={closeSelectNodeTypeDialog}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Select Node Type</Dialog.Title>
            <Dialog.CloseTrigger asChild>
              <Button variant="ghost">X</Button>
            </Dialog.CloseTrigger>
          </Dialog.Header>
          <Dialog.Body>
            <VStack gap={3} align="stretch">
              {NODE_TYPE_OPTIONS.map(({ type, label, icon: ItemIcon }) => (
                <Button key={type} onClick={() => handleSelect(type)} justifyContent="flex-start" size="lg" gap={3}>
                  <ItemIcon />
                  <Text>{label}</Text>
                </Button>
              ))}
            </VStack>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};
