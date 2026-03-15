import { Flex, IconButton, Menu, Portal, Text, type SystemStyleObject } from '@chakra-ui/react';
import { FiEdit, FiList, FiMoreVertical, FiTrash2 } from 'react-icons/fi';

import { useAppStore } from '@/store';
import { useMemo, type MouseEventHandler } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { selectTimelineGroupById } from '@/store/timelineSlice';

interface TimelineGroupListItemProps {
  slotId: string; // Swapy slot ID
  itemId: string; // Swapy item ID
  groupId: string;
  onEdit: (groupId: string) => void;
}

export function TimelineGroupListItem({ groupId, onEdit, slotId, itemId }: TimelineGroupListItemProps) {
  const { currentTLGroupId, setSelectedTimelineGroup, deleteTimelineGroup, setView } = useAppStore(
    useShallow((state) => ({
      currentTLGroupId: state.selectedTimelineGroupId,
      setSelectedTimelineGroup: state.setSelectedTimelineGroupId,
      deleteTimelineGroup: state.deleteTimelineGroup,
      setView: state.setView,
    })),
  );
  const group = useAppStore(useMemo(() => selectTimelineGroupById(groupId), [groupId]));
  const selected = currentTLGroupId === groupId;

  const handleSelect: MouseEventHandler = (e) => {
    e.stopPropagation();
    setSelectedTimelineGroup(groupId);
    setView('timeline');
  };

  const handleDelete: MouseEventHandler = (e) => {
    e.stopPropagation();
    deleteTimelineGroup(groupId);
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

  if (!group) {
    console.error(`TimelineGroup with id ${groupId} not found`);
    return null;
  }

  return (
    <Flex key={slotId} data-swapy-slot={slotId} minHeight="40px">
      <Flex key={itemId} data-swapy-item={itemId} onClick={handleSelect} css={itemStyles} aria-selected={selected}>
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
                <Menu.Item value="edit" onClick={() => onEdit(groupId)}>
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
