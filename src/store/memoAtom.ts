import { atom } from 'jotai';
import type { MemoNode } from '@/types/memo';
import { initialMemo } from './mockData';

interface SelectNodeTypeDialog {
  isOpen: boolean;
  parentId: string | null;
}

export const memoAtom = atom<MemoNode[]>(initialMemo);

export const selectedMemoNodeIdAtom = atom<string | null>(null);

export const selectNodeTypeDialogAtom = atom<SelectNodeTypeDialog>({
  isOpen: false,
  parentId: null,
});
