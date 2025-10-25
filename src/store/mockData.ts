import type { AppData } from '@/types/app';
import type { MemoNode } from '@/types/memo';
import type { TimelineGroup } from '@/types/timeline';

export const initialTimelineGroups: TimelineGroup[] = [
  {
    id: 'complex-project',
    title: '复杂项目（展示多种依赖）',
    timelines: [
      {
        id: 'visa-timeline',
        title: '签证办理',
        status: 'done',
        nodes: [
          { id: 'visa-prep', type: 'task', title: '准备签证材料', status: 'done' },
          { id: 'visa-submit', type: 'task', title: '提交申请', status: 'done', depends_on: ['visa-prep'] },
          { id: 'visa-get', type: 'task', title: '领取签证', status: 'done', depends_on: ['visa-submit'] },
        ],
        dependencies: [
          { id: 'dep-visa-1', type: 'normal', from: 'visa-prep', to: 'visa-submit' },
          { id: 'dep-visa-2', type: 'normal', from: 'visa-submit', to: 'visa-get' },
        ],
      },
      {
        id: 'travel-prep',
        title: '旅行准备',
        status: 'doing',
        nodes: [
          {
            id: 'booking-group',
            type: 'group',
            title: '预订事项',
            status: 'lock',
            depends_on_timeline: ['visa-timeline'], // 依赖于整个'签证办理'时间线
            subtasks: [
              { id: 'book-flight', title: '订机票', status: 'todo' },
              { id: 'book-hotel', title: '订酒店', status: 'todo' },
            ],
          },
          {
            id: 'pack-stuff',
            type: 'task',
            title: '整理行李',
            status: 'lock',
            depends_on: ['booking-group'],
          },
        ],
        dependencies: [
          // 跨时间线依赖在数据模型中定义，但可视化需要特殊处理
          // 这里用普通依赖模拟组内关系
          { id: 'dep-travel-1', type: 'normal', from: 'booking-group', to: 'pack-stuff' },
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
        status: 'doing',
        nodes: [
          { id: 'konva-docs', type: 'task', title: '阅读官方文档', status: 'done' },
          {
            id: 'konva-demo',
            type: 'task',
            title: '完成5个小 Demo',
            status: 'doing',
            depends_on: ['konva-docs'],
            mode: {
              mode: 'quantitative',
              quantitativeConfig: {
                target: 5,
                current: 2,
                unit: '个',
              },
            },
          },
          { id: 'konva-integrate', type: 'task', title: '集成到项目中', status: 'lock', depends_on: ['konva-demo'] },
        ],
        dependencies: [
          { id: 'dep-konva-1', type: 'normal', from: 'konva-docs', to: 'konva-demo' },
          { id: 'dep-konva-2', type: 'normal', from: 'konva-demo', to: 'konva-integrate' },
        ],
      },
      {
        id: 'weekly-routine',
        title: '每周例行',
        nodes: [], // 循环任务没有固定节点
        recurrence: {
          frequency: 'weekly',
          weeklyConfig: {
            weekdays: [1, 3, 5], // 周一、三、五
          },
          pattern: {
            tasks: ['阅读技术文章', '健身1小时', '总结周报'],
            currentIndex: 0,
          },
          stats: {
            totalCompleted: 12,
            totalSkipped: 2,
          },
          active: true,
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
