import type { MemoNode } from '@/types/memo';
import type { TimelineGroup } from '@/types/timeline';
import type { StoreState } from '@/store';

/**
 * 加载模拟数据到store
 */
export const loadMockData = (setState: (partial: Partial<StoreState>) => void) => {
  console.log('[MockData] Loading mock data...');

  setState({
    timelineGroups: initialTimelineGroups,
    memo: initialMemo,
    selectedTimelineGroupId: initialTimelineGroups[0]?.id || null,
    view: 'timeline',
    isAppDataLoaded: true,
  });

  console.log('[MockData] Mock data loaded successfully');
};

export const initialTimelineGroups: TimelineGroup[] = [
  {
    id: 'project-dev',
    title: '项目开发 - Fork & Merge',
    timelines: [
      {
        id: 'main-workflow',
        title: '主工作流',
        type: 'task',
        nodes: [
          {
            id: 'main-start',
            type: 'delimiter',
            markerType: 'start',
            prevs: [],
            succs: ['task-1'],
          },
          {
            id: 'task-1',
            type: 'task',
            title: '需求分析',
            description: '分析项目需求，明确功能范围和技术栈',
            status: 'done',
            prevs: ['main-start'],
            succs: ['task-2'],
          },
          {
            id: 'task-2',
            type: 'task',
            title: '技术方案设计',
            description: '设计系统架构、技术选型和开发规范',
            status: 'done',
            prevs: ['task-1'],
            succs: ['fork-point', 'task-5'], // Fork点:从这里分出并行工作流
            milestone: true,
          },
          {
            id: 'fork-point',
            type: 'task',
            title: '前端开发启动',
            status: 'todo',
            prevs: ['task-2'],
            succs: ['task-4'], // 连接到parallel-workflow
          },
          {
            id: 'task-5',
            type: 'task',
            title: '数据库设计',
            status: 'lock',
            prevs: ['task-2'],
            succs: ['merge-point'],
          },
          {
            id: 'merge-point',
            type: 'task',
            title: '集成测试',
            status: 'lock',
            prevs: ['task-5', 'task-4'], // Merge点:等待两条timeline
            succs: ['deploy'],
          },
          {
            id: 'deploy',
            type: 'task',
            title: '部署上线',
            status: 'lock',
            prevs: ['merge-point'],
            succs: [],
          },
        ],
      },
      {
        id: 'parallel-workflow',
        title: '前端工作流 (Fork产生)',
        type: 'task',
        nodes: [
          {
            id: 'parallel-start',
            type: 'delimiter',
            markerType: 'start',
            prevs: [],
            succs: ['task-3'],
          },
          {
            id: 'task-3',
            type: 'task',
            title: 'UI组件开发',
            description: '开发通用UI组件库，提供按钮、表单等基础组件',
            status: 'todo',
            prevs: ['parallel-start'],
            succs: ['task-4'],
            subtasks: [
              { title: '按钮组件', status: 'done' },
              { title: '表单组件', status: 'todo' },
            ],
          },
          {
            id: 'task-4',
            type: 'task',
            title: '前端单元测试',
            status: 'lock',
            prevs: ['task-3'],
            succs: [], // 后继在main-workflow的merge-point
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
        title: '功能开发',
        type: 'task',
        nodes: [
          {
            id: 'feature-start',
            type: 'delimiter',
            markerType: 'start',
            prevs: [],
            succs: ['design-v1'],
          },
          {
            id: 'design-v1',
            type: 'task',
            title: '设计方案 v1',
            status: 'done',
            prevs: ['feature-start'],
            succs: ['implement-v1'],
          },
          {
            id: 'implement-v1',
            type: 'task',
            title: '实现 v1',
            status: 'done',
            prevs: ['design-v1'],
            succs: ['review-v1'],
          },
          {
            id: 'review-v1',
            type: 'task',
            title: '代码审查',
            status: 'skipped', // 发现问题,跳过
            prevs: ['implement-v1'],
            succs: ['design-v2'],
          },
          {
            id: 'design-v2',
            type: 'task',
            title: '设计方案 v2 (Revert重做)',
            status: 'todo',
            prevs: ['review-v1'],
            succs: ['implement-v2'],
          },
          {
            id: 'implement-v2',
            type: 'task',
            title: '实现 v2',
            status: 'lock',
            prevs: ['design-v2'],
            succs: ['final-deploy'],
          },
          {
            id: 'final-deploy',
            type: 'task',
            title: '最终部署',
            status: 'lock',
            prevs: ['implement-v2'],
            succs: ['verify'],
          },
          {
            id: 'verify',
            type: 'task',
            title: '验证上线',
            status: 'lock',
            prevs: ['final-deploy'],
            succs: [], // 有跨timeline后继时不能Revert
          },
        ],
      },
      {
        id: 'monitoring',
        title: '监控维护',
        type: 'task',
        nodes: [
          {
            id: 'monitor-start',
            type: 'delimiter',
            markerType: 'start',
            prevs: [],
            succs: ['setup-monitor'],
          },
          {
            id: 'setup-monitor',
            type: 'task',
            title: '配置监控',
            status: 'lock',
            prevs: ['monitor-start', 'verify'], // 依赖feature-dev的verify
            succs: [],
          },
        ],
      },
    ],
  },
  {
    id: 'personal-growth',
    title: '学习计划 - 循环任务',
    timelines: [
      {
        id: 'learn-tech',
        title: '技术学习',
        type: 'task',
        nodes: [
          {
            id: 'tech-start',
            type: 'delimiter',
            markerType: 'start',
            prevs: [],
            succs: ['learn-basics'],
          },
          {
            id: 'learn-basics',
            type: 'task',
            title: '学习基础知识',
            status: 'done',
            prevs: ['tech-start'],
            succs: ['practice'],
          },
          {
            id: 'practice',
            type: 'task',
            title: '完成5个练习',
            description: '通过实践练习巩固所学知识，包括算法和项目实战',
            status: 'todo',
            prevs: ['learn-basics'],
            succs: ['advanced'],
            executionConfig: {
              mode: 'quantitative',
              quantitativeConfig: {
                target: 5,
                current: 2,
              },
            },
          },
          {
            id: 'advanced',
            type: 'task',
            title: '进阶项目',
            description: '独立完成一个综合性项目，展示技术能力',
            status: 'lock',
            prevs: ['practice'],
            succs: [],
            milestone: true,
          },
        ],
      },
      {
        id: 'weekly-routine',
        title: '每周习惯',
        type: 'recurrence',
        startDate: '2025-10-01T00:00:00Z',
        completedTasks: [
          {
            id: 'recurrence-1',
            type: 'task',
            title: '阅读技术文章',
            status: 'skipped',
            prevs: [],
            succs: [],
            completedDate: '2025-10-28T10:00:00Z',
          },
          {
            id: 'recurrence-2',
            type: 'task',
            title: '运动1小时',
            status: 'done',
            prevs: [],
            succs: [],
            completedDate: '2025-10-30T18:00:00Z',
          },
        ],
        frequency: {
          weekdays: [1, 3, 5], // 周一、三、五
          occurrencesPerWeek: 3,
        },
        pattern: {
          taskTemplates: [
            {
              id: 'template-read',
              type: 'task',
              title: '阅读技术文章',
              status: 'todo',
              prevs: [],
              succs: [],
            },
            {
              id: 'template-exercise',
              type: 'task',
              title: '运动1小时',
              status: 'todo',
              prevs: [],
              succs: [],
            },
            {
              id: 'template-report',
              type: 'task',
              title: '写周报',
              status: 'todo',
              prevs: [],
              succs: [],
            },
          ],
          currentIndex: 0,
        },
      },
      {
        id: 'daily-challenge',
        title: '每日健身',
        type: 'recurrence',
        startDate: '2025-10-01T00:00:00Z',
        endDate: '2025-10-31T23:59:59Z',
        completedTasks: [
          {
            id: 'fitness-1',
            type: 'task',
            title: '俯卧撑 50个',
            status: 'done',
            prevs: [],
            succs: [],
            completedDate: '2025-10-29T08:00:00Z',
          },
          {
            id: 'fitness-2',
            type: 'task',
            title: '深蹲 100个',
            status: 'done',
            prevs: [],
            succs: [],
            completedDate: '2025-10-30T08:00:00Z',
          },
        ],
        frequency: 'daily',
        pattern: {
          taskTemplates: [
            {
              id: 'template-pushup',
              type: 'task',
              title: '俯卧撑 50个',
              status: 'todo',
              prevs: [],
              succs: [],
            },
            {
              id: 'template-squat',
              type: 'task',
              title: '深蹲 100个',
              status: 'todo',
              prevs: [],
              succs: [],
            },
            {
              id: 'template-plank',
              type: 'task',
              title: '平板支撑 3分钟',
              status: 'todo',
              prevs: [],
              succs: [],
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
