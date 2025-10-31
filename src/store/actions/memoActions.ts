import { atom } from 'jotai';
import { memoAtom } from '../memoAtom';
import type { MemoNode, MemoNodeType } from '@/types/memo';
import YAML from 'yaml';
import { nanoid } from 'nanoid';

// Helper function to recursively find a node and its parent
const findNodeRecursive = (
  nodes: MemoNode[],
  nodeId: string,
  parent: MemoNode | null = null,
): { node: MemoNode | null; parent: MemoNode | null; index: number } => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.id === nodeId) {
      return { node, parent, index: i };
    }
    const found = findNodeRecursive(node.children, nodeId, node);
    if (found.node) {
      return found;
    }
  }
  return { node: null, parent: null, index: -1 };
};

export const addMemoNodeAtom = atom(
  null,
  (get, set, { parentId, type }: { parentId: string | null; type: MemoNodeType }) => {
    const memoData = get(memoAtom);
    const newMemoData = YAML.parse(YAML.stringify(memoData));

    const getDefaultValue = (type: MemoNodeType) => {
      switch (type) {
        case 'number':
          return 0;
        case 'boolean':
          return false;
        case 'object':
        case 'array':
        case 'string':
        default:
          return '';
      }
    };

    const newNode: MemoNode = {
      id: nanoid(),
      key: 'newKey',
      type: type,
      value: getDefaultValue(type),
      children: [],
      isCollapsed: type === 'object' || type === 'array' ? false : undefined,
    };

    if (parentId === null) {
      newMemoData.push(newNode);
    } else {
      const { node: parentNode } = findNodeRecursive(newMemoData, parentId);
      if (parentNode && (parentNode.type === 'object' || parentNode.type === 'array')) {
        if (parentNode.type === 'array') {
          newNode.key = parentNode.children.length.toString();
        }
        parentNode.children.push(newNode);
      }
    }
    set(memoAtom, newMemoData);
  },
);

export const updateMemoNodeAtom = atom(
  null,
  (get, set, { nodeId, newKey, newValue }: { nodeId: string; newKey?: string; newValue?: any }) => {
    const memoData = get(memoAtom);
    const newMemoData = YAML.parse(YAML.stringify(memoData));
    const { node } = findNodeRecursive(newMemoData, nodeId);

    if (node) {
      if (newKey !== undefined) {
        node.key = newKey;
      }
      if (newValue !== undefined) {
        node.value = newValue;
      }
    }
    set(memoAtom, newMemoData);
  },
);

export const deleteMemoNodeAtom = atom(null, (get, set, { nodeId }: { nodeId: string }) => {
  const memoData = get(memoAtom);
  const newMemoData = YAML.parse(YAML.stringify(memoData));
  const { parent, index } = findNodeRecursive(newMemoData, nodeId);

  if (parent) {
    parent.children.splice(index, 1);
  } else if (index !== -1) {
    newMemoData.splice(index, 1);
  }

  set(memoAtom, newMemoData);
});

export const toggleMemoNodeCollapseAtom = atom(null, (get, set, { nodeId }: { nodeId: string }) => {
  const memoData = get(memoAtom);
  const newMemoData = YAML.parse(YAML.stringify(memoData));
  const { node } = findNodeRecursive(newMemoData, nodeId);

  if (node) {
    node.isCollapsed = !node.isCollapsed;
  }

  set(memoAtom, newMemoData);
});
