import { Flex, IconButton, Menu, Portal, Text, type SystemStyleObject } from '@chakra-ui/react';
import { useAtom, useAtomValue, useSetAtom, type PrimitiveAtom } from 'jotai';
import { FiEdit, FiList, FiMoreVertical, FiTrash2 } from 'react-icons/fi';

import { viewAtom } from '@/store/appAtom';
import { deleteTimelineGroupAtom, editingTLGroupAtom, selectedTLGroupRefAtom } from '@/store/timelineGroup';
import type { TimelineGroup } from '@/types/timeline';
import type { MouseEventHandler } from 'react';

interface TimelineListItemProps {
  slotId: string; // Swapy slot ID
  itemId: string; // Swapy item ID
  groupAtom: PrimitiveAtom<TimelineGroup>;
  onEdit: () => void;
}

export function TimelineGroupListItem({ groupAtom, onEdit, slotId, itemId }: TimelineListItemProps) {
  const [currentTimelineGroup, setCurrentTimelineGroup] = useAtom(selectedTLGroupRefAtom);
  const group = useAtomValue(groupAtom);
  const deleteGroup = useSetAtom(deleteTimelineGroupAtom);
  const setView = useSetAtom(viewAtom);
  const setEditingTLGroup = useSetAtom(editingTLGroupAtom);

  const selected = currentTimelineGroup?.toString() === groupAtom.toString();

  const handleSelect: MouseEventHandler = (e) => {
    e.stopPropagation();
    setCurrentTimelineGroup(groupAtom);
    setView('timeline');
  };

  const handleDelete: MouseEventHandler = (e) => {
    e.stopPropagation();
    deleteGroup(groupAtom);
  };

  const itemStyles: SystemStyleObject = {
    ps: 4,
    pe: 2,
    py: 1,
    gap: 2,
    width: 'full',
    alignItems: 'center',
    justifyContent: 'space-between',
    rounded: 'md',
    cursor: 'pointer',
    transition: 'background 0.15s',
    bg: selected ? 'colorPalette.subtle' : 'transparent',
    _hover: {
      bg: selected ? 'colorPalette.subtle' : 'bg.subtle',
    },
    '&[data-swapy-dragging]': {
      scale: '1.05',
    },
  };

  return (
    <Flex key={slotId} data-swapy-slot={slotId} minHeight="40px">
      <Flex key={itemId} data-swapy-item={itemId} onClick={handleSelect} css={itemStyles}>
        <Flex css={{ gap: 2, alignItems: 'center', flex: 1, minWidth: 0, userSelect: 'none' }}>
          <FiList />
          <Text fontSize="sm" truncate>
            {group.title}
          </Text>
        </Flex>

        <Menu.Root positioning={{ placement: 'bottom-end' }}>
          <Menu.Trigger asChild data-swapy-no-drag>
            <IconButton
              p={1}
              outline="none"
              _hover={{ bg: 'bg.emphasized' }}
              size="sm"
              variant="ghost"
              aria-label="更多操作"
            >
              <FiMoreVertical />
            </IconButton>
          </Menu.Trigger>

          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                <Menu.Item
                  value="edit"
                  onClick={() => {
                    setEditingTLGroup(groupAtom);
                    onEdit();
                  }}
                >
                  <FiEdit />
                  编辑
                </Menu.Item>
                <Menu.Item
                  value="delete"
                  onClick={handleDelete}
                  color="fg.error"
                  _hover={{ bg: 'bg.error', color: 'fg.error' }}
                >
                  <FiTrash2 />
                  删除
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </Flex>
    </Flex>
  );
}
