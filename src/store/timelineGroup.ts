import type { TimelineGroup } from '@/types/timeline';
import { produce } from 'immer';
import { atom, type PrimitiveAtom } from 'jotai';
import { splitAtom } from 'jotai/utils';
import { nanoid } from 'nanoid';
import { persistState } from './actions/persistence';

/* Atoms */

export const _timelineGroupsAtom = atom<TimelineGroup[]>([]);

export const timelineGroupsAtom = atom(
  (get) => get(_timelineGroupsAtom),
  (get, set, newValue: TimelineGroup[]) => {
    set(_timelineGroupsAtom, newValue);

    if (newValue.length > 0 && get(selectedTLGroupRefAtom) === null) {
      set(selectedTLGroupRefAtom, get(timelineGroupAtomsAtom)[0]);
    }

    persistState(get, set);
  },
);

/* Derived Atoms */

export const timelineGroupAtomsAtom = splitAtom(timelineGroupsAtom, (item) => item.id);

export const selectedTLGroupRefAtom = atom<null | PrimitiveAtom<TimelineGroup>>(null);

export const selectedTLGroupValueAtom = atom((get) => {
  const groupAtom = get(selectedTLGroupRefAtom);
  if (groupAtom == null) {
    return null;
  } else {
    return get(groupAtom);
  }
});

const dirtyEditingTLGroupAtom = atom<TimelineGroup>({
  id: null as unknown as string,
  title: '',
  timelines: [],
});
export const editingTLGroupAtom = atom<null | PrimitiveAtom<TimelineGroup>>(null);

export const newTimelineGroup = (): TimelineGroup => ({
  id: nanoid(),
  timelines: [],
  title: '',
});

/* Actions */

// 添加时间线组
export const addTimelineGroupAtom = atom(null, (get, set, value: TimelineGroup) => {
  const prev = get(timelineGroupsAtom);
  set(
    timelineGroupsAtom,
    produce(prev, (draft: TimelineGroup[]) => {
      draft.push(value);
    }),
  );

  set(selectedTLGroupRefAtom, get(timelineGroupAtomsAtom).at(-1)!);
});

// 编辑时间线组
export const editTimelineGroupStateAtom = atom(
  (get) => {
    const groupAtom = get(editingTLGroupAtom);
    if (groupAtom == null) {
      return newTimelineGroup();
    } else {
      return get(groupAtom);
    }
  },
  (get, set, state: TimelineGroup) => {
    const groupAtom = get(editingTLGroupAtom);
    if (groupAtom == null) {
      set(addTimelineGroupAtom, state);
      set(editingTLGroupAtom, dirtyEditingTLGroupAtom);
    } else {
      set(groupAtom, state);
    }
  },
);

// 删除时间线组
export const deleteTimelineGroupAtom = atom(null, (get, set, value: PrimitiveAtom<TimelineGroup>) => {
  const prev = get(timelineGroupsAtom);
  const deletedId = get(value).id;
  const selected = get(selectedTLGroupRefAtom);

  if (selected === value) {
    set(selectedTLGroupRefAtom, null);
  }

  set(
    timelineGroupsAtom,
    prev.filter((group) => group.id !== deletedId),
  );
});

// 重新排序时间线组
export const reorderTimelineGroupsAtom = atom(null, (get, set, groupIds: string[]) => {
  const prev = get(timelineGroupsAtom);
  // 创建 ID 到 group 的映射
  const groupMap = new Map(prev.map((group) => [group.id, group]));

  // 按新顺序重新排列
  set(
    timelineGroupsAtom,
    groupIds.map((id) => groupMap.get(id)!),
  );
});
