'use client';

import { useAppStore } from '@/store';
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';
import { useEffect, type PropsWithChildren } from 'react';
import { Toaster } from '../ui/Toaster';
import { useShallow } from 'zustand/shallow';

const system = createSystem(defaultConfig, {});

export function Provider({ children }: PropsWithChildren) {
  const {
    view: currentViewType,
    isAppDataLoaded,
    groupOrderLength,
  } = useAppStore(
    useShallow((state) => ({
      view: state.view,
      isAppDataLoaded: state.isAppDataLoaded,
      groupOrderLength: state.groupOrder.length,
    })),
  );

  // 初始化应用数据
  useEffect(() => {
    console.log('[App] Initializing app...', {
      groupOrderLength,
      isAppDataLoaded,
      currentViewType,
    });

    // 总是检查数据状态
    if (groupOrderLength === 0) {
      console.log('[App] Data restored from storage');
      useAppStore.setState({ isAppDataLoaded: true, view: 'timeline' });
    }
  }, []);

  return (
    <ChakraProvider value={system}>
      {children}
      <Toaster />
    </ChakraProvider>
  );
}
