import { type PersistedAppData, appStorage } from '@/utils/storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { type AppSlice, createAppSlice } from './appSlice';
import { type MemoSlice, createMemoSlice } from './memoSlice';
import { type TimelineSlice, createTimelineSlice } from './timelineSlice';

export type StoreState = AppSlice & MemoSlice & TimelineSlice;

export const useAppStore = create<StoreState>()(
  persist(
    immer((...a) => ({
      ...createAppSlice(...a),
      ...createMemoSlice(...a),
      ...createTimelineSlice(...a),
    })),
    {
      name: 'one-ok-todo-app-data',
      storage: appStorage,
      // 只持久化核心数据
      partialize: (state): PersistedAppData => ({
        ...state.appMetadata,
        memo: state.memo,
        timelineGroups: state.timelineGroups,
      }),
      version: 3,
      // 从存储恢复状态后的回调
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('[Store] Error during hydration:', error);
          return;
        }

        if (state) {
          state.setTimelineGroups(() => state.timelineGroups);
          console.log('[Store] Hydration complete');
        } else {
          console.log('[Store] No data to hydrate');
        }
      },
    },
  ),
);
