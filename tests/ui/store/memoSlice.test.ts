import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/store';

describe('memoSlice Store测试', () => {
  beforeEach(() => {
    useAppStore.setState({
      memo: [],
      selectedMemoNodeId: null,
      selectNodeTypeDialog: { isOpen: false, parentId: null },
    });
  });

  describe('基本memo操作', () => {
    it('应该能够添加字符串类型的根节点', () => {
      useAppStore.getState().addMemoNode(null, 'string');

      const { memo } = useAppStore.getState();
      expect(memo).toHaveLength(1);
      expect(memo[0].key).toBe('new node');
      expect(memo[0].value).toBe('');
      expect(memo[0].type).toBe('string');
    });

    it('应该能够添加数字类型的节点', () => {
      useAppStore.getState().addMemoNode(null, 'number');

      const { memo } = useAppStore.getState();
      expect(memo[0].type).toBe('number');
      expect(memo[0].value).toBe(0);
    });

    it('应该能够添加布尔类型的节点', () => {
      useAppStore.getState().addMemoNode(null, 'boolean');

      const { memo } = useAppStore.getState();
      expect(memo[0].type).toBe('boolean');
      expect(memo[0].value).toBe(false);
    });

    it('应该能够添加对象类型的节点', () => {
      useAppStore.getState().addMemoNode(null, 'object');

      const { memo } = useAppStore.getState();
      expect(memo[0].type).toBe('object');
      expect(memo[0].children).toEqual([]);
    });

    it('应该能够添加数组类型的节点', () => {
      useAppStore.getState().addMemoNode(null, 'array');

      const { memo } = useAppStore.getState();
      expect(memo[0].type).toBe('array');
      expect(memo[0].children).toEqual([]);
    });
  });

  describe('节点层级操作', () => {
    it('应该能够添加子节点到对象节点', () => {
      useAppStore.getState().addMemoNode(null, 'object');
      const parentId = useAppStore.getState().memo[0].id;

      useAppStore.getState().addMemoNode(parentId, 'string');

      const { memo } = useAppStore.getState();
      expect(memo[0].children).toHaveLength(1);
      expect(memo[0].children[0].type).toBe('string');
    });

    it('应该能够添加子节点到数组节点', () => {
      useAppStore.getState().addMemoNode(null, 'array');
      const arrayId = useAppStore.getState().memo[0].id;

      useAppStore.getState().addMemoNode(arrayId, 'string');

      const { memo } = useAppStore.getState();
      expect(memo[0].children).toHaveLength(1);
      expect(memo[0].children[0].type).toBe('string');
    });
  });

  describe('节点更新和删除', () => {
    it('应该能够更新节点key', () => {
      useAppStore.getState().addMemoNode(null, 'string');
      const nodeId = useAppStore.getState().memo[0].id;

      useAppStore.getState().updateMemoNode(nodeId, 'updatedKey');

      const { memo } = useAppStore.getState();
      expect(memo[0].key).toBe('updatedKey');
    });

    it('应该能够删除节点', () => {
      useAppStore.getState().addMemoNode(null, 'string');
      const nodeId = useAppStore.getState().memo[0].id;
      expect(useAppStore.getState().memo).toHaveLength(1);

      useAppStore.getState().deleteMemoNode(nodeId);

      expect(useAppStore.getState().memo).toHaveLength(0);
    });

    it('删除父节点应该同时删除子节点', () => {
      useAppStore.getState().addMemoNode(null, 'object');
      const parentId = useAppStore.getState().memo[0].id;

      useAppStore.getState().addMemoNode(parentId, 'string');
      expect(useAppStore.getState().memo[0].children).toHaveLength(1);

      useAppStore.getState().deleteMemoNode(parentId);

      expect(useAppStore.getState().memo).toHaveLength(0);
    });
  });

  describe('节点选择状态', () => {
    it('应该能够设置选中的节点', () => {
      useAppStore.getState().addMemoNode(null, 'string');
      const nodeId = useAppStore.getState().memo[0].id;

      useAppStore.getState().setSelectedMemoNodeId(nodeId);

      expect(useAppStore.getState().selectedMemoNodeId).toBe(nodeId);
    });

    it('应该能够清除选中状态', () => {
      useAppStore.getState().setSelectedMemoNodeId('some-id');
      useAppStore.getState().setSelectedMemoNodeId(null);

      expect(useAppStore.getState().selectedMemoNodeId).toBeNull();
    });
  });

  describe('选择节点类型对话框', () => {
    it('应该能够打开选择节点类型对话框', () => {
      useAppStore.getState().openSelectNodeTypeDialog('parent-id');

      const { selectNodeTypeDialog } = useAppStore.getState();
      expect(selectNodeTypeDialog.isOpen).toBe(true);
      expect(selectNodeTypeDialog.parentId).toBe('parent-id');
    });

    it('应该能够关闭选择节点类型对话框', () => {
      useAppStore.getState().openSelectNodeTypeDialog('parent-id');
      useAppStore.getState().closeSelectNodeTypeDialog();

      const { selectNodeTypeDialog } = useAppStore.getState();
      expect(selectNodeTypeDialog.isOpen).toBe(false);
    });
  });

  describe('直接设置memo', () => {
    it('应该能够通过setMemo直接设置数据', () => {
      useAppStore.getState().setMemo([
        {
          id: 'node-1',
          key: 'test',
          type: 'string',
          value: 'hello',
          children: [],
        },
      ]);

      const { memo } = useAppStore.getState();
      expect(memo).toHaveLength(1);
      expect(memo[0].key).toBe('test');
      expect(memo[0].value).toBe('hello');
    });
  });
});
