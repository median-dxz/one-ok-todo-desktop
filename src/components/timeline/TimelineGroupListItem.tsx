import { Flex, IconButton, Menu, Portal, Text, type SystemStyleObject } from '@chakra-ui/react';
import { useSetAtom } from 'jotai';
import { FiEdit, FiList, FiMoreVertical, FiTrash2 } from 'react-icons/fi';

import { viewAtom } from '@/store/appAtom';
import { deleteTimelineGroupAtom, selectedTimelineGroupIdAtom } from '@/store/timelineGroup';
import type { TimelineGroup } from '@/types/timeline';

interface TimelineListItemProps {
  slotId: string; // Swapy slot ID
  itemId: string; // Swapy item ID
  group: TimelineGroup;
  selected: boolean;
  onEdit: (group: TimelineGroup) => void;
}

export function TimelineGroupListItem({ group, onEdit, slotId, itemId, selected }: TimelineListItemProps) {
  const setCurrentId = useSetAtom(selectedTimelineGroupIdAtom);
  const deleteGroup = useSetAtom(deleteTimelineGroupAtom);
  const setView = useSetAtom(viewAtom);

  const handleSelect = () => {
    setCurrentId(group.id);
    setView('timeline');
  };

  const handleDelete = () => {
    deleteGroup(group);
    // 如果删除的是当前选中的组，清除选中状态
    if (selected) {
      setCurrentId(null);
    }
  };

  const handleEdit = () => {
    onEdit(group);
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
                <Menu.Item value="edit" onClick={handleEdit}>
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
