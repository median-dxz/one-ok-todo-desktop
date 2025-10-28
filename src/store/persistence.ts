import { debounce } from '@/utils/debounce';
import { loadData, saveData } from '@/utils/storage';
import { atom } from 'jotai';
import { appDataAtom } from './appAtom';
import { memoAtom } from './memoAtom';
import { selectedTimelineGroupIdAtom, timelineGroupsAtom } from './timelineGroups';

const debouncedSaveData = debounce(async (get) => {
  const appData = get(appDataAtom);
  const memo = get(memoAtom);
  const timelineGroups = get(timelineGroupsAtom);

  await saveData({ ...appData, memo, timelineGroups });
}, 1000);

export const loadDataAtom = atom(null, async (_, set) => {
  const data = await loadData();
  const { memo, timelineGroups, ...appData } = data;

  set(appDataAtom, appData);
  set(memoAtom, memo);
  set(timelineGroupsAtom, timelineGroups);
  if (timelineGroups.length > 0) {
    set(selectedTimelineGroupIdAtom, timelineGroups[0].id);
  } else {
    set(selectedTimelineGroupIdAtom, null);
  }
});

export const persistenceAtom = atom(
  (get) => {
    get(appDataAtom);
    get(memoAtom);
    get(timelineGroupsAtom);
  },
  (get) => {
    debouncedSaveData(get);
  },
);
