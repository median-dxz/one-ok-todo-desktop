import type { MemoNode } from '@/types/memo';
import { atom } from 'jotai';

interface SelectNodeTypeDialog {
  isOpen: boolean;
  parentId: string | null;
}

export const memoAtom = atom<MemoNode[]>([]);

export const selectedMemoNodeIdAtom = atom<string | null>(null);

export const selectNodeTypeDialogAtom = atom<SelectNodeTypeDialog>({
  isOpen: false,
  parentId: null,
});
