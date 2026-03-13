import { flattenPersistedData, nestFlatData } from '@/utils/dataConversion';
import { type PersistedAppData, appStorage } from '@/utils/storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PersistStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { type AppSlice, createAppSlice } from './appSlice';
import { type MemoSlice, createMemoSlice } from './memoSlice';
import { type TimelineSlice, createTimelineSlice } from './timelineSlice';

export type StoreState = AppSlice & MemoSlice & TimelineSlice;

export function createAppStore(storage: PersistStorage<PersistedAppData> = appStorage) {
  const store = create<StoreState>()(
    subscribeWithSelector(
      persist(
        immer((...a) => ({
          ...createAppSlice(...a),
          ...createMemoSlice(...a),
          ...createTimelineSlice(...a),
        })),
        {
          name: 'one-ok-todo-app-data',
          storage,
          // 只持久化核心数据 — 通过 nestFlatData 转回嵌套格式
          partialize: (state): PersistedAppData => ({
            metadata: state.appMetadata,
            memo: state.memo,
            timelineGroups: nestFlatData({
              groups: state.groups,
              timelines: state.timelines,
              nodes: state.nodes,
              groupOrder: state.groupOrder,
            }),
          }),
          version: 1,
          // 从存储恢复状态后的回调
          merge: (persisted, currentState) => {
            const p = persisted as PersistedAppData;
            const flat = flattenPersistedData(p.timelineGroups);
            return {
              ...currentState,
              ...flat,
              memo: p.memo,
              metadata: p.metadata,
            };
          },
          onRehydrateStorage: () => (state, error) => {
            if (error) {
              console.error('[Store] Error during hydration:', error);
              return;
            }

            if (state) {
              if (state.groupOrder.length > 0 && state.selectedTimelineGroupId === null) {
                store.getState().setSelectedTimelineGroupId(state.groupOrder[0]);
              }
              console.log('[Store] Hydration complete');
            } else {
              console.log('[Store] No data to hydrate');
            }
          },
        },
      ),
    ),
  );
  return store;
}

export const useAppStore = createAppStore();
