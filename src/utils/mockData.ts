import type { StoreState } from '@/store';
import type { MemoNode } from '@/types/memo';
import { TimelineGroupSchema } from '@/types/timeline';
import { flattenPersistedData } from '@/utils/dataConversion';
import z from 'zod';

/**
 * 加载模拟数据到store
 */
export const loadMockData = (setState: (partial: Partial<StoreState>) => void) => {
  console.log('[MockData] Loading mock data...');

  const flatData = flattenPersistedData(z.parse(z.array(TimelineGroupSchema), initialTimelineGroups));

  setState({
    ...flatData,
    memo: initialMemo,
  });

  console.log('[MockData] Mock data loaded successfully');
};

export const initialTimelineGroups: z.input<typeof TimelineGroupSchema>[] = [
  {
    id: 'project-dev',
    title: '项目开发 - Fork & Merge',
    timelines: [
      {
        id: 'main-workflow',
        groupId: 'project-dev',
        title: '主工作流',
        type: 'task',
        nodes: [
          {
            id: 'main-start',
            type: 'delimiter',
            timelineId: 'main-workflow',
            markerType: 'start',
            dependedBy: [],
          },
          {
            id: 'task-1',
            type: 'task',
            timelineId: 'main-workflow',
            title: '需求分析',
            content: {
              description: '分析项目需求，明确功能范围和技术栈',
              subtasks: [],
            },
            status: 'done',
            dependsOn: [],
            dependedBy: [],
            milestone: false,
          },
          {
            id: 'task-2',
            type: 'task',
            timelineId: 'main-workflow',
            title: '技术方案设计',
            content: {
              description: '设计系统架构、技术选型和开发规范',
              subtasks: [],
            },
            status: 'done',
            dependsOn: [],
            dependedBy: ['fork-point'], // 依赖分叉
            milestone: true,
          },
          {
            id: 'fork-point',
            type: 'task',
            timelineId: 'main-workflow',
            title: '前端开发启动',
            content: { description: '', subtasks: [] },
            status: 'todo',
            dependsOn: ['task-2'],
            dependedBy: ['task-4'], // 连接到 parallel-workflow
            milestone: false,
          },
          {
            id: 'task-5',
            type: 'task',
            timelineId: 'main-workflow',
            title: '数据库设计',
            content: { description: '', subtasks: [] },
            status: 'locked',
            dependsOn: [],
            dependedBy: [],
            milestone: false,
          },
          {
            id: 'merge-point',
            type: 'task',
            timelineId: 'main-workflow',
            title: '集成测试',
            content: { description: '', subtasks: [] },
            status: 'locked',
            dependsOn: ['task-4'], // 等待 parallel-workflow 汇合
            dependedBy: [],
            milestone: false,
          },
          {
            id: 'deploy',
            type: 'task',
            timelineId: 'main-workflow',
            title: '部署上线',
            content: { description: '', subtasks: [] },
            status: 'locked',
            dependsOn: [],
            dependedBy: [],
            milestone: false,
          },
        ],
      },
      {
        id: 'parallel-workflow',
        groupId: 'project-dev',
        title: '前端工作流 (Fork产生)',
        type: 'task',
        nodes: [
          {
            id: 'parallel-start',
            type: 'delimiter',
            timelineId: 'parallel-workflow',
            markerType: 'start',
            dependedBy: [],
          },
          {
            id: 'task-3',
            type: 'task',
            timelineId: 'parallel-workflow',
            title: 'UI组件开发',
            content: {
              description: '开发通用UI组件库，提供按钮、表单等基础组件',
              subtasks: [
                { title: '按钮组件', done: true },
                { title: '表单组件', done: false },
              ],
            },
            status: 'todo',
            dependsOn: [],
            dependedBy: [],
            milestone: false,
          },
          {
            id: 'task-4',
            type: 'task',
            timelineId: 'parallel-workflow',
            title: '前端单元测试',
            content: { description: '', subtasks: [] },
            status: 'locked',
            dependsOn: ['fork-point'],
            dependedBy: ['merge-point'],
            milestone: false,
          },
        ],
      },
    ],
  },
  {
    id: 'feature-iteration',
    title: '功能迭代 - Revert示例',
    timelines: [
      {
        id: 'feature-dev',
        groupId: 'feature-iteration',
        title: '功能开发',
        type: 'task',
        nodes: [
          {
            id: 'feature-start',
            type: 'delimiter',
            timelineId: 'feature-dev',
            markerType: 'start',
            dependedBy: [],
          },
          {
            id: 'design-v1',
            type: 'task',
            timelineId: 'feature-dev',
            title: '设计方案 v1',
            content: { description: '', subtasks: [] },
            status: 'done',
            dependsOn: [],
            dependedBy: [],
            milestone: false,
          },
          {
            id: 'implement-v1',
            type: 'task',
            timelineId: 'feature-dev',
            title: '实现 v1',
            content: { description: '', subtasks: [] },
            status: 'done',
            dependsOn: [],
            dependedBy: [],
            milestone: false,
          },
          {
            id: 'review-v1',
            type: 'task',
            timelineId: 'feature-dev',
            title: '代码审查',
            content: { description: '', subtasks: [] },
            status: 'skipped', // 发现问题,跳过
            dependsOn: [],
            dependedBy: [],
            milestone: false,
          },
          {
            id: 'design-v2',
            type: 'task',
            timelineId: 'feature-dev',
            title: '设计方案 v2 (Revert重做)',
            content: { description: '', subtasks: [] },
            status: 'todo',
            dependsOn: [],
            dependedBy: [],
            milestone: false,
          },
          {
            id: 'implement-v2',
            type: 'task',
            timelineId: 'feature-dev',
            title: '实现 v2',
            content: { description: '', subtasks: [] },
            status: 'locked',
            dependsOn: [],
            dependedBy: [],
            milestone: false,
          },
          {
            id: 'final-deploy',
            type: 'task',
            timelineId: 'feature-dev',
            title: '最终部署',
            content: { description: '', subtasks: [] },
            status: 'locked',
            dependsOn: [],
            dependedBy: [],
            milestone: false,
          },
          {
            id: 'verify',
            type: 'task',
            timelineId: 'feature-dev',
            title: '验证上线',
            content: { description: '', subtasks: [] },
            status: 'locked',
            dependsOn: [],
            dependedBy: ['setup-monitor'],
            milestone: false,
          },
        ],
      },
      {
        id: 'monitoring',
        groupId: 'feature-iteration',
        title: '监控维护',
        type: 'task',
        nodes: [
          {
            id: 'monitor-start',
            type: 'delimiter',
            timelineId: 'monitoring',
            markerType: 'start',
            dependedBy: [],
          },
          {
            id: 'setup-monitor',
            type: 'task',
            timelineId: 'monitoring',
            title: '配置监控',
            content: { description: '', subtasks: [] },
            status: 'locked',
            dependsOn: ['verify'], // 跨 timeline 依赖
            dependedBy: [],
            milestone: false,
          },
        ],
      },
    ],
  },
  {
    id: 'personal-growth',
    title: '学习计划',
    timelines: [
      {
        id: 'learn-tech',
        groupId: 'personal-growth',
        title: '技术学习',
        type: 'task',
        nodes: [
          {
            id: 'tech-start',
            type: 'delimiter',
            timelineId: 'learn-tech',
            markerType: 'start',
            dependedBy: [],
          },
          {
            id: 'learn-basics',
            type: 'task',
            timelineId: 'learn-tech',
            title: '学习基础知识',
            content: { description: '', subtasks: [] },
            status: 'done',
            dependsOn: [],
            dependedBy: [],
            milestone: false,
          },
          {
            id: 'practice',
            type: 'task',
            timelineId: 'learn-tech',
            title: '完成5个练习',
            content: {
              description: '通过实践练习巩固所学知识，包括算法和项目实战',
              subtasks: [],
            },
            status: 'todo',
            dependsOn: [],
            dependedBy: [],
            executionConfig: {
              mode: 'quantitative',
              target: 5,
              current: 2,
              timeUnit: '次',
            },
            milestone: false,
          },
          {
            id: 'advanced',
            type: 'task',
            timelineId: 'learn-tech',
            title: '进阶项目',
            content: {
              description: '独立完成一个综合性项目，展示技术能力',
              subtasks: [],
            },
            status: 'locked',
            dependsOn: [],
            dependedBy: [],
            milestone: true,
          },
        ],
      },
      {
        id: 'weekly-routine',
        groupId: 'personal-growth',
        title: '每周习惯',
        type: 'recurrence',
        startDate: '2025-10-01T00:00:00Z',
        completedTasks: [
          {
            id: 'recurrence-1',
            type: 'task',
            timelineId: 'weekly-routine',
            title: '阅读技术文章',
            content: { description: '', subtasks: [] },
            status: 'skipped',
            completedDate: '2025-10-28T10:00:00Z',
          },
          {
            id: 'recurrence-2',
            type: 'task',
            timelineId: 'weekly-routine',
            title: '运动1小时',
            content: { description: '', subtasks: [] },
            status: 'done',
            completedDate: '2025-10-30T18:00:00Z',
          },
        ],
        frequency: {
          weekdays: [1, 3, 5],
          occurrencesPerWeek: 3,
        },
        pattern: {
          taskTemplates: [
            {
              title: '阅读技术文章',
              content: { description: '', subtasks: [] },
            },
            {
              title: '运动1小时',
              content: { description: '', subtasks: [] },
            },
            {
              title: '写周报',
              content: { description: '', subtasks: [] },
            },
          ],
          currentIndex: 0,
        },
      },
      {
        id: 'daily-challenge',
        groupId: 'personal-growth',
        title: '每日健身',
        type: 'recurrence',
        startDate: '2025-10-01T00:00:00Z',
        endDate: '2025-10-31T23:59:59Z',
        completedTasks: [
          {
            id: 'fitness-1',
            type: 'task',
            timelineId: 'daily-challenge',
            title: '俯卧撑 50个',
            content: { description: '', subtasks: [] },
            status: 'done',
            completedDate: '2025-10-29T08:00:00Z',
          },
          {
            id: 'fitness-2',
            type: 'task',
            timelineId: 'daily-challenge',
            title: '深蹲 100个',
            content: { description: '', subtasks: [] },
            status: 'done',
            completedDate: '2025-10-30T08:00:00Z',
          },
        ],
        frequency: 'daily',
        pattern: {
          taskTemplates: [
            {
              title: '俯卧撑 50个',
              content: { description: '', subtasks: [] },
            },
            {
              title: '深蹲 100个',
              content: { description: '', subtasks: [] },
            },
            {
              title: '平板支撑 3分钟',
              content: { description: '', subtasks: [] },
            },
          ],
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
