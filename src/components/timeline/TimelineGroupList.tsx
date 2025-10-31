import { VStack } from '@chakra-ui/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createSwapy, utils } from 'swapy';

import { reorderTimelineGroupsAtom, timelineGroupAtomsAtom, timelineGroupsAtom } from '@/store/timelineGroup';
import { TimelineGroupListItem } from './TimelineGroupListItem';

interface TimelineGroupListProps {
  onEdit: () => void;
}

export function TimelineGroupList({ onEdit }: TimelineGroupListProps) {
  const reorderTimelineGroups = useSetAtom(reorderTimelineGroupsAtom);
  const timelineGroups = useAtomValue(timelineGroupsAtom);
  const atoms = useAtomValue(timelineGroupAtomsAtom);
  const groupWithAtoms = useMemo(
    () => timelineGroups.map((group, index) => ({ group, atom: atoms[index], id: group.id })),
    [timelineGroups, atoms],
  );

  const swapyRef = useRef<ReturnType<typeof createSwapy> | null>(null);
  const swapyContainerRef = useRef<HTMLDivElement>(null);

  // 创建 slotItemMap 状态
  const [slotItemMap, setSlotItemMap] = useState(utils.initSlotItemMap(groupWithAtoms, 'id'));

  // 创建 slottedItems
  const slottedItems = useMemo(
    () => utils.toSlottedItems(groupWithAtoms, 'id', slotItemMap),
    [groupWithAtoms, slotItemMap],
  );

  // 初始化 Swapy
  useEffect(() => {
    if (!swapyContainerRef.current) return;

    swapyRef.current = createSwapy(swapyContainerRef.current, {
      animation: 'dynamic',
      dragOnHold: true,
      manualSwap: true,
    });

    swapyRef.current.onSwap((event) => {
      setSlotItemMap(event.newSlotItemMap.asArray);
    });

    swapyRef.current.onSwapEnd((event) => {
      const newOrder = event.slotItemMap.asArray.map(({ item }) => item);
      reorderTimelineGroups(newOrder);
    });

    return () => {
      swapyRef.current?.destroy();
    };
  }, [reorderTimelineGroups]);

  // 在添加或删除项目时更新 Swapy 实例
  useEffect(() => {
    utils.dynamicSwapy(swapyRef.current, groupWithAtoms, 'id', slotItemMap, setSlotItemMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupWithAtoms]);

  return (
    <VStack alignItems="stretch" gap={1} ref={swapyContainerRef}>
      {slottedItems.map(({ slotId, itemId, item }) => {
        if (!item) return null;
        return (
          <TimelineGroupListItem key={slotId} slotId={slotId} itemId={itemId} groupAtom={item.atom} onEdit={onEdit} />
        );
      })}
    </VStack>
  );
}
