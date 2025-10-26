export type NodeStatus = 'todo' | 'done' | 'skipped' | 'lock';
export type TaskMode = 'scheduled' | 'quantitative';
export type NodeType = 'task' | 'sub-task';
export type TimelineType = 'task-timeline' | 'recurrence-timeline';

export interface TaskModeConfig {
  mode: TaskMode;
  // 定时模式配置
  scheduledConfig?: {
    deadline?: string; // ISO 8601 格式
    reminder?: string; // 提醒时间
  };
  // 定量模式配置
  quantitativeConfig?: {
    target: number; // 目标数量
    current: number; // 当前完成数量
    timeUnit?: string; // 时间单位（如"天"、"周"、"月"）
  };
}

export interface Dependency {
  id: string; // 依赖关系唯一标识
  type: 'normal' | 'split' | 'timeline';
  from: string | string[]; // 支持数组：多源依赖
  to: string | string[]; // 支持数组：多目标依赖
  description?: string; // 可选的依赖说明
}

// 基础节点属性
export interface BaseNode {
  id: string; // 节点唯一标识
  title: string; // 节点标题
  type: NodeType; // 节点类型

  status: NodeStatus; // 节点状态
}

// 普通任务节点
export interface TaskNode extends BaseNode {
  type: 'task';

  // 依赖关系
  prevs: string[]; // 前驱节点 ID 列表
  succs: string[]; // 后继节点 ID 列表

  mode?: TaskModeConfig; // 任务执行模式
  subtasks?: SubTask[]; // 子任务列表
  milestone?: boolean; // 里程碑，用户手动高亮的节点
}

// 子任务（仅存在于 GroupNode 中）
export interface SubTask extends BaseNode {
  type: 'sub-task';
}

export type RecurrenceFrequency = 'daily' | WeeklyConfig | MonthlyConfig;

export interface WeeklyConfig {
  // 选定星期（0-6，0表示周日）
  weekdays: number[]; // 例如 [1, 3, 5] 表示周一、三、五
  // 总时长分摊到天
  durationPerWeek?: number;
  // 总次数分摊到天
  occurrencesPerWeek?: number;
}

export interface MonthlyConfig {
  // 选定日期（1-31）
  days: number[]; // 例如 [1, 15] 表示每月1号和15号
  // 总时长分摊到天
  durationPerMonth?: number;
  // 总次数分摊到天
  occurrencesPerMonth?: number;
}

export interface RecurrencePattern {
  // 任务序列（支持多任务轮换）
  tasks: string[]; // 任务标题数组，例如 ["A", "B", "C"]
  // 当前轮换位置
  currentIndex?: number; // 默认 0
}

export interface RecurrenceInstance {
  taskTitle: string; // 当前任务标题（来自 pattern）
  scheduledDate: string; // 计划执行日期（ISO 8001）
  status: NodeStatus; // 实例状态
  completedDate?: string; // 完成日期
}

export interface BaseTimeline {
  id: string; // 时间线唯一标识
  title: string; // 时间线标题
  type: TimelineType; // 时间线类型
}

export interface TaskTimeline extends BaseTimeline {
  type: 'task-timeline';

  nodes: TaskNode[]; // 节点列表（按执行顺序排列）
}

export interface RecurrenceTimeline extends BaseTimeline {
  type: 'recurrence-timeline';

  completedTasks: RecurrenceInstance[];

  frequency: RecurrenceFrequency;

  // 任务轮换模式
  pattern?: RecurrencePattern;
}

export type Timeline = TaskTimeline | RecurrenceTimeline;

export interface TimelineGroup {
  id: string; // 分组唯一标识
  title: string; // 分组标题
  timelines: Timeline[];
}
