'use client';

import { useAppStore } from '@/store';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { useEffect, type PropsWithChildren } from 'react';

export function Provider({ children }: PropsWithChildren) {
  const { view: currentViewType, isAppDataLoaded, timelineGroups } = useAppStore();

  // 初始化应用数据
  useEffect(() => {
    console.log('[App] Initializing app...', {
      timelineGroupsLength: timelineGroups.length,
      isAppDataLoaded,
      currentViewType,
    });

    // 总是检查数据状态
    if (timelineGroups.length === 0) {
      console.log('[App] Data restored from storage');
      useAppStore.setState({ isAppDataLoaded: true, view: 'timeline' });
    }
  }, []);

  return <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>;
}
