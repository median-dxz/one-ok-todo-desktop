import type { AppData } from '@/types/app';
import type { MemoNode } from '@/types/memo';
import type { TimelineGroup } from '@/types/timeline';
import { debounce } from "@/utils";
import { saveData } from '@/utils/storage';
import { produce } from 'immer';
import { type Getter, type Setter } from 'jotai';

import { _appDataAtom } from '../appAtom';
import { _memoAtom } from '../memoAtom';
import { _timelineGroupsAtom } from '../timelineGroup';

/**
 * 去抖保存
 * @description 避免频繁写入存储
 */
const debouncedSaveData = debounce(async (appData: AppData, memo: MemoNode[], timelineGroups: TimelineGroup[]) => {
  console.log('[Persistence] Saving data...');
  await saveData({ ...appData, memo, timelineGroups });
}, 800);

/** 持久化当前所有状态 */
export const persistState = (get: Getter, set: Setter) => {
  set(
    _appDataAtom,
    produce((draft) => {
      if (draft.metadata) {
        draft.metadata.lastModified = new Date().toISOString();
      } else {
        draft.metadata = {
          lastModified: new Date().toISOString(),
        };
      }
    }),
  );

  const appData = get(_appDataAtom);
  const memo = get(_memoAtom);
  const timelineGroups = get(_timelineGroupsAtom);

  debouncedSaveData(appData, memo, timelineGroups);
};
