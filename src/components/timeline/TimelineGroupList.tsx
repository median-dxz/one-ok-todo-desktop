import { VStack } from '@chakra-ui/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createSwapy, utils } from 'swapy';

import { reorderTimelineGroupsAtom, selectedTimelineGroupIdAtom, timelineGroupsAtom } from '@/store/timelineGroup';
import type { TimelineGroup } from '@/types/timeline';

import { TimelineGroupListItem } from './TimelineGroupListItem';

interface TimelineGroupListProps {
  onEdit: (group: TimelineGroup) => void;
}

export function TimelineGroupList({ onEdit }: TimelineGroupListProps) {
  const timelineGroups = useAtomValue(timelineGroupsAtom);
  const reorderTimelineGroups = useSetAtom(reorderTimelineGroupsAtom);
  const currentTimelineGroupId = useAtomValue(selectedTimelineGroupIdAtom);

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
      console.log('onSwap', event);
      setSlotItemMap(event.newSlotItemMap.asArray);
    });

    swapyRef.current.onSwapEnd((event) => {
      console.log('onSwapEnd', event);
      // 重新排序 timeline groups
      const newOrder = event.slotItemMap.asArray.map(({ item }) => item);
      reorderTimelineGroups(newOrder);
    });

    return () => {
      swapyRef.current?.destroy();
    };
  }, [reorderTimelineGroups]);

  // 在添加或删除项目时更新 Swapy 实例
  useEffect(() => {
    utils.dynamicSwapy(swapyRef.current, timelineGroups, 'id', slotItemMap, setSlotItemMap);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timelineGroups]);

  return (
    <VStack alignItems="stretch" gap={1} ref={swapyContainerRef}>
      {slottedItems.map(({ slotId, itemId, item }) => {
        if (!item) return null;
        const selected = currentTimelineGroupId === item.id;
        return (
          <TimelineGroupListItem
            key={slotId}
            slotId={slotId}
            itemId={itemId}
            group={item}
            onEdit={onEdit}
            selected={selected}
          />
        );
      })}
    </VStack>
  );
}
