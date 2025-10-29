import type { MemoNode } from '@/types/memo';
import { atom } from 'jotai';
import { persistState } from './actions/persistence';

interface SelectNodeTypeDialog {
  isOpen: boolean;
  parentId: string | null;
}

export const _memoAtom = atom<MemoNode[]>([]);

export const selectedMemoNodeIdAtom = atom<string | null>(null);

export const selectNodeTypeDialogAtom = atom<SelectNodeTypeDialog>({
  isOpen: false,
  parentId: null,
});

export const memoAtom = atom(
  (get) => get(_memoAtom),
  (get, set, newValue: MemoNode[]) => {
    set(_memoAtom, newValue);
    persistState(get, set);
  },
);
