import type { MemoNode, MemoNodeType } from '@/types/memo';
import type { StateCreator } from 'zustand';
import { nanoid } from 'nanoid';
import type { StoreState } from './index';

export interface MemoSlice {
  memo: MemoNode[];
  selectedMemoNodeId: string | null;
  selectNodeTypeDialog: {
    isOpen: boolean;
    parentId: string | null;
  };
  setMemo: (memo: MemoNode[]) => void;
  setSelectedMemoNodeId: (id: string | null) => void;
  openSelectNodeTypeDialog: (parentId: string | null) => void;
  closeSelectNodeTypeDialog: () => void;
  deleteMemoNode: (nodeId: string) => void;
  updateMemoNode: (nodeId: string, newKey: string) => void;
  addMemoNode: (parentId: string | null, type: MemoNodeType) => void;
}

const findAndAddNode = (nodes: MemoNode[], parentId: string, newNode: MemoNode): boolean => {
  for (const node of nodes) {
    if (node.id === parentId) {
      node.children.push(newNode);
      return true;
    }
    if (node.children && findAndAddNode(node.children, parentId, newNode)) {
      return true;
    }
  }
  return false;
};

const findAndDeleteNode = (nodes: MemoNode[], nodeId: string): MemoNode[] => {
  return nodes.filter((node) => {
    if (node.id === nodeId) {
      return false;
    }
    if (node.children) {
      node.children = findAndDeleteNode(node.children, nodeId);
    }
    return true;
  });
};

const findAndUpdateNode = (nodes: MemoNode[], nodeId: string, newKey: string): void => {
  for (const node of nodes) {
    if (node.id === nodeId) {
      node.key = newKey;
      return;
    }
    if (node.children) {
      findAndUpdateNode(node.children, nodeId, newKey);
    }
  }
};

export const createMemoSlice: StateCreator<
  StoreState,
  [['zustand/immer', never], ['zustand/persist', unknown]],
  [],
  MemoSlice
> = (set) => ({
  memo: [],
  selectedMemoNodeId: null,
  selectNodeTypeDialog: {
    isOpen: false,
    parentId: null,
  },
  setMemo: (memo) => set({ memo }),
  setSelectedMemoNodeId: (id) => set({ selectedMemoNodeId: id }),
  openSelectNodeTypeDialog: (parentId) =>
    set((state) => {
      state.selectNodeTypeDialog.isOpen = true;
      state.selectNodeTypeDialog.parentId = parentId;
    }),
  closeSelectNodeTypeDialog: () =>
    set((state) => {
      state.selectNodeTypeDialog.isOpen = false;
    }),
  addMemoNode: (parentId, type) =>
    set((state) => {
      const newNode: MemoNode = {
        id: nanoid(),
        key: 'new node',
        type,
        value: type === 'string' ? '' : type === 'number' ? 0 : type === 'boolean' ? false : '',
        children: [],
      };
      if (parentId === null) {
        state.memo.push(newNode);
      } else {
        findAndAddNode(state.memo, parentId, newNode);
      }
    }),
  deleteMemoNode: (nodeId) =>
    set((state) => {
      state.memo = findAndDeleteNode(state.memo, nodeId);
    }),
  updateMemoNode: (nodeId, newKey) =>
    set((state) => {
      findAndUpdateNode(state.memo, nodeId, newKey);
    }),
});