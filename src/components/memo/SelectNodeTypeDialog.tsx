import { addMemoNodeAtom } from '@/store/actions/memoActions';
import { selectNodeTypeDialogAtom } from '@/store/memoAtom';
import type { MemoNodeType } from '@/types/memo';
import { Button, Dialog, Text, VStack } from '@chakra-ui/react';
import { useAtom, useSetAtom } from 'jotai';
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
  const [dialogState, setDialogState] = useAtom(selectNodeTypeDialogAtom);
  const addNode = useSetAtom(addMemoNodeAtom);

  const handleSelect = (type: MemoNodeType) => {
    addNode({ parentId: dialogState.parentId, type });
    setDialogState({ isOpen: false, parentId: null });
  };

  const handleClose = () => {
    setDialogState({ isOpen: false, parentId: null });
  };

  return (
    <Dialog.Root open={dialogState.isOpen} onOpenChange={handleClose}>
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
