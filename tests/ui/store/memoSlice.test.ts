import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '@/store';
import type { MemoNode } from '@/types/memo';

describe('memoSlice Store测试', () => {
  beforeEach(() => {
    // 重置memo状态
    useStore.setState({
      memo: [],
      selectedMemoNode: null,
      editingMemoNode: null,
      memoNodeType: null,
    });
  });

  describe('基本memo操作', () => {
    it('应该能够添加字符串类型的根节点', () => {
      const node: MemoNode = {
        id: 'node-1',
        key: 'testKey',
        type: 'string',
        value: 'testValue',
        children: [],
      };

      useStore.getState().addMemoNode(node, null);

      const { memo } = useStore.getState();
      expect(memo).toHaveLength(1);
      expect(memo[0].key).toBe('testKey');
      expect(memo[0].value).toBe('testValue');
      expect(memo[0].type).toBe('string');
    });

    it('应该能够添加数字类型的节点', () => {
      const node: MemoNode = {
        id: 'node-1',
        key: 'count',
        type: 'number',
        value: 42,
        children: [],
      };

      useStore.getState().addMemoNode(node, null);

      const { memo } = useStore.getState();
      expect(memo[0].type).toBe('number');
      expect(memo[0].value).toBe(42);
    });

    it('应该能够添加布尔类型的节点', () => {
      const node: MemoNode = {
        id: 'node-1',
        key: 'enabled',
        type: 'boolean',
        value: true,
        children: [],
      };

      useStore.getState().addMemoNode(node, null);

      const { memo } = useStore.getState();
      expect(memo[0].type).toBe('boolean');
      expect(memo[0].value).toBe(true);
    });

    it('应该能够添加对象类型的节点', () => {
      const node: MemoNode = {
        id: 'node-1',
        key: 'config',
        type: 'object',
        value: '',
        children: [],
      };

      useStore.getState().addMemoNode(node, null);

      const { memo } = useStore.getState();
      expect(memo[0].type).toBe('object');
      expect(memo[0].children).toEqual([]);
    });

    it('应该能够添加数组类型的节点', () => {
      const node: MemoNode = {
        id: 'node-1',
        key: 'items',
        type: 'array',
        value: '',
        children: [],
      };

      useStore.getState().addMemoNode(node, null);

      const { memo } = useStore.getState();
      expect(memo[0].type).toBe('array');
      expect(memo[0].children).toEqual([]);
    });
  });

  describe('节点层级操作', () => {
    it('应该能够添加子节点到对象节点', () => {
      const parentNode: MemoNode = {
        id: 'parent',
        key: 'parent',
        type: 'object',
        value: '',
        children: [],
      };

      useStore.getState().addMemoNode(parentNode, null);

      const childNode: MemoNode = {
        id: 'child',
        key: 'child',
        type: 'string',
        value: 'childValue',
        children: [],
      };

      useStore.getState().addMemoNode(childNode, parentNode.id);

      const { memo } = useStore.getState();
      expect(memo[0].children).toHaveLength(1);
      expect(memo[0].children[0].key).toBe('child');
    });

    it('应该能够添加子节点到数组节点', () => {
      const arrayNode: MemoNode = {
        id: 'array',
        key: 'items',
        type: 'array',
        value: '',
        children: [],
      };

      useStore.getState().addMemoNode(arrayNode, null);

      const elementNode: MemoNode = {
        id: 'element',
        key: '0',
        type: 'string',
        value: 'element1',
        children: [],
      };

      useStore.getState().addMemoNode(elementNode, arrayNode.id);

      const { memo } = useStore.getState();
      expect(memo[0].children).toHaveLength(1);
      expect(memo[0].children[0].value).toBe('element1');
    });
  });

  describe('节点更新和删除', () => {
    it('应该能够更新节点值', () => {
      const node: MemoNode = {
        id: 'node-1',
        key: 'test',
        type: 'string',
        value: 'original',
        children: [],
      };

      useStore.getState().addMemoNode(node, null);

      useStore.getState().updateMemoNode(node.id, (draft) => {
        draft.value = 'updated';
      });

      const { memo } = useStore.getState();
      expect(memo[0].value).toBe('updated');
    });

    it('应该能够删除节点', () => {
      const node: MemoNode = {
        id: 'node-1',
        key: 'toDelete',
        type: 'string',
        value: 'value',
        children: [],
      };

      useStore.getState().addMemoNode(node, null);
      expect(useStore.getState().memo).toHaveLength(1);

      useStore.getState().deleteMemoNode(node.id);

      expect(useStore.getState().memo).toHaveLength(0);
    });

    it('删除父节点应该同时删除子节点', () => {
      const parentNode: MemoNode = {
        id: 'parent',
        key: 'parent',
        type: 'object',
        value: '',
        children: [],
      };

      useStore.getState().addMemoNode(parentNode, null);

      const childNode: MemoNode = {
        id: 'child',
        key: 'child',
        type: 'string',
        value: 'value',
        children: [],
      };

      useStore.getState().addMemoNode(childNode, parentNode.id);

      useStore.getState().deleteMemoNode(parentNode.id);

      expect(useStore.getState().memo).toHaveLength(0);
    });
  });

  describe('节点类型转换', () => {
    it('应该能够将字符串节点转换为数字节点', () => {
      const node: MemoNode = {
        id: 'node-1',
        key: 'value',
        type: 'string',
        value: '123',
        children: [],
      };

      useStore.getState().addMemoNode(node, null);

      useStore.getState().updateMemoNode(node.id, (draft) => {
        draft.type = 'number';
        draft.value = 123;
      });

      const { memo } = useStore.getState();
      expect(memo[0].type).toBe('number');
      expect(memo[0].value).toBe(123);
    });

    it('应该能够将字符串节点转换为对象节点', () => {
      const node: MemoNode = {
        id: 'node-1',
        key: 'value',
        type: 'string',
        value: 'text',
        children: [],
      };

      useStore.getState().addMemoNode(node, null);

      useStore.getState().updateMemoNode(node.id, (draft) => {
        draft.type = 'object';
        draft.value = '';
        draft.children = [];
      });

      const { memo } = useStore.getState();
      expect(memo[0].type).toBe('object');
      expect(memo[0].children).toEqual([]);
    });
  });

  describe('节点选择和编辑状态', () => {
    it('应该能够设置选中的节点', () => {
      const node: MemoNode = {
        id: 'node-1',
        key: 'test',
        type: 'string',
        value: 'value',
        children: [],
      };

      useStore.getState().setSelectedMemoNode(node);

      const { selectedMemoNode } = useStore.getState();
      expect(selectedMemoNode).toBe(node);
    });

    it('应该能够设置编辑中的节点', () => {
      const node: MemoNode = {
        id: 'node-1',
        key: 'test',
        type: 'string',
        value: 'value',
        children: [],
      };

      useStore.getState().setEditingMemoNode(node);

      const { editingMemoNode } = useStore.getState();
      expect(editingMemoNode).toBe(node);
    });

    it('应该能够打开选择节点类型对话框', () => {
      useStore.getState().openSelectNodeTypeDialog('parent-id');

      const state = useStore.getState();
      expect(state.editingMemoNode).toBeNull();
      expect(state.selectedMemoNode).toBeTruthy();
    });
  });

  describe('节点折叠状态', () => {
    it('应该能够切换节点折叠状态', () => {
      const node: MemoNode = {
        id: 'node-1',
        key: 'test',
        type: 'object',
        value: '',
        children: [],
        isCollapsed: false,
      };

      useStore.getState().addMemoNode(node, null);

      useStore.getState().updateMemoNode(node.id, (draft) => {
        draft.isCollapsed = true;
      });

      const { memo } = useStore.getState();
      expect(memo[0].isCollapsed).toBe(true);
    });
  });
});
