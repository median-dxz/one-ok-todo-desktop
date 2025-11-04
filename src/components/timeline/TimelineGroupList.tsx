import { VStack } from '@chakra-ui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createSwapy, utils } from 'swapy';

import { useAppStore } from '@/store';
import { TimelineGroupListItem } from './TimelineGroupListItem';

interface TimelineGroupListProps {
  onEdit: () => void;
}

export function TimelineGroupList({ onEdit }: TimelineGroupListProps) {
  const reorderTimelineGroups = useAppStore((state) => state.reorderTimelineGroups);
  const timelineGroups = useAppStore((state) => state.timelineGroups);

  const swapyRef = useRef<ReturnType<typeof createSwapy> | null>(null);
  const swapyContainerRef = useRef<HTMLDivElement>(null);

  // 创建 slotItemMap 状态
  const [slotItemMap, setSlotItemMap] = useState(utils.initSlotItemMap(timelineGroups, 'id'));

  // 创建 slottedItems
  const slottedItems = useMemo(
    () => utils.toSlottedItems(timelineGroups, 'id', slotItemMap),
    [timelineGroups, slotItemMap],
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
      const newOrder = event.slotItemMap.asArray.map(({ item }) => item as string);
      reorderTimelineGroups(newOrder);
    });

    return () => {
      swapyRef.current?.destroy();
    };
  }, [reorderTimelineGroups]);

  // 在添加或删除项目时更新 Swapy 实例
  useEffect(() => {
    utils.dynamicSwapy(swapyRef.current, timelineGroups, 'id', slotItemMap, setSlotItemMap);
  }, [timelineGroups]);

  return (
    <VStack alignItems="stretch" gap={1} ref={swapyContainerRef}>
      {slottedItems.map(({ slotId, itemId, item }) => {
        if (!item) return null;
        return <TimelineGroupListItem key={slotId} slotId={slotId} itemId={itemId} groupId={item.id} onEdit={onEdit} />;
      })}
    </VStack>
  );
}
