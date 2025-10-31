import type { AppData } from '@/types/app';
import type { MemoNode } from '@/types/memo';
import type { TimelineGroup } from '@/types/timeline';

import { appDataAtom } from '@/store/appAtom';
import { memoAtom } from '@/store/memoAtom';
import { selectedTLGroupRefAtom, timelineGroupsAtom } from '@/store/timelineGroup';
import { atom } from 'jotai';

export const initialTimelineGroups: TimelineGroup[] = [
  {
    id: 'complex-project',
    title: '复杂项目 - 展示多种依赖',
    timelines: [
      {
        id: 'visa-timeline',
        title: '签证办理',
        type: 'task',
        nodes: [
          { id: 'visa-prep', type: 'task', title: '准备签证材料', status: 'done', prevs: [], succs: ['visa-submit'] },
          {
            id: 'visa-submit',
            type: 'task',
            title: '提交申请',
            status: 'done',
            prevs: ['visa-prep'],
            succs: ['visa-get'],
          },
          { id: 'visa-get', type: 'task', title: '领取签证', status: 'done', prevs: ['visa-submit'], succs: [] },
        ],
      },
      {
        id: 'travel-prep',
        title: '旅行准备',
        type: 'task',
        nodes: [
          {
            id: 'booking-group',
            type: 'task',
            title: '预订事项',
            status: 'lock',
            prevs: [],
            succs: ['pack-stuff'],
            subtasks: [{ title: '订机票' }, { title: '订酒店' }],
          },
          {
            id: 'pack-stuff',
            type: 'task',
            title: '整理行李',
            status: 'lock',
            prevs: ['booking-group'],
            succs: [],
          },
        ],
      },
    ],
  },
  {
    id: 'personal-growth',
    title: '个人成长',
    timelines: [
      {
        id: 'learn-konva',
        title: '学习 Konva.js',
        type: 'task',
        nodes: [
          { id: 'konva-docs', type: 'task', title: '阅读官方文档', status: 'done', prevs: [], succs: ['konva-demo'] },
          {
            id: 'konva-demo',
            type: 'task',
            title: '完成5个小 Demo',
            status: 'todo',
            prevs: ['konva-docs'],
            succs: ['konva-integrate'],
            executionConfig: {
              mode: 'quantitative',
              quantitativeConfig: {
                target: 5,
                current: 2,
              },
            },
          },
          {
            id: 'konva-integrate',
            type: 'task',
            title: '集成到项目中',
            status: 'lock',
            prevs: ['konva-demo'],
            succs: [],
          },
        ],
      },
      {
        id: 'weekly-routine',
        title: '每周例行',
        type: 'recurrence',
        startDate: '2025-10-01T00:00:00Z',
        completedTasks: [
          {
            id: 'recurrence-1',
            type: 'task',
            title: '阅读技术文章',
            status: 'done',
            prevs: [],
            succs: [],
            completedDate: '2025-10-20T10:30:00Z',
          },
          {
            id: 'recurrence-2',
            type: 'task',
            title: '健身1小时',
            status: 'done',
            prevs: [],
            succs: [],
            completedDate: '2025-10-22T18:00:00Z',
          },
          {
            id: 'recurrence-3',
            type: 'task',
            title: '总结周报',
            status: 'skipped',
            prevs: [],
            succs: [],
          },
        ],
        frequency: {
          weekdays: [1, 3, 5], // 周一、三、五
          occurrencesPerWeek: 3,
        },
        pattern: {
          tasks: ['阅读技术文章', '健身1小时', '总结周报'],
          currentIndex: 0,
        },
      },
    ],
  },
];

export const initialMemo: MemoNode[] = [
  {
    id: 'memo-root-1',
    key: 'config',
    type: 'object',
    value: '',
    isCollapsed: false,
    children: [
      {
        id: 'memo-child-1',
        key: 'version',
        type: 'string',
        value: '1.0.0',
        children: [],
      },
      {
        id: 'memo-child-2',
        key: 'retries',
        type: 'number',
        value: 3,
        children: [],
      },
      {
        id: 'memo-child-3',
        key: 'enabled',
        type: 'boolean',
        value: true,
        children: [],
      },
    ],
  },
  {
    id: 'memo-root-2',
    key: 'data',
    type: 'array',
    value: '',
    isCollapsed: true,
    children: [
      {
        id: 'memo-child-4',
        key: '0',
        type: 'string',
        value: 'First item',
        children: [],
      },
    ],
  },
];

export const initialAppData: AppData = {
  version: '3.0',
  metadata: {
    lastModified: new Date().toISOString(),
    syncStatus: 'synced',
  },
};

// 加载假数据的 atom
export const loadMockDataAtom = atom(null, (_get, set) => {
  console.log('[MockData] Loading mock data...');

  set(selectedTLGroupRefAtom, null);

  // 直接设置假数据
  set(timelineGroupsAtom, initialTimelineGroups);
  set(memoAtom, initialMemo);
  set(appDataAtom, initialAppData);

  console.log('[MockData] Mock data loaded successfully');
});
