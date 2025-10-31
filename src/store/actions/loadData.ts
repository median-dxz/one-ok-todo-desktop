import { loadData } from '@/utils/storage';
import { atom } from 'jotai';
import { _appDataAtom } from '../appAtom';
import { _memoAtom } from '../memoAtom';
import { _timelineGroupsAtom, selectedTLGroupRefAtom, timelineGroupAtomsAtom } from '../timelineGroup';

export const loadDataAtom = atom(null, async (get, set) => {
  console.log('[Persistence] Loading data...');
  const data = await loadData();
  const { memo, timelineGroups, ...appData } = data;

  // 直接更新基础原子，不触发持久化
  set(_appDataAtom, appData);
  set(_memoAtom, memo);
  set(_timelineGroupsAtom, timelineGroups);

  // 设置默认选中的时间线组
  if (timelineGroups.length > 0) {
    set(selectedTLGroupRefAtom, get(timelineGroupAtomsAtom)[0]);
  } else {
    set(selectedTLGroupRefAtom, null);
  }

  console.log('[Persistence] Data loaded successfully');
});
