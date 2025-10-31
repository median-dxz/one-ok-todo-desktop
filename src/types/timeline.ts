export type NodeStatus = 'todo' | 'done' | 'skipped' | 'lock';
export type TaskExecutionMode = 'scheduled' | 'quantitative';
export type NodeType = 'task' | 'delimiter';
export type TimelineType = 'task' | 'recurrence';

export interface ExecutionModeConfig {
  mode: TaskExecutionMode;
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

// 基础节点属性
export type BaseNode = {
  id: string; // 节点唯一标识
  type: NodeType; // 节点类型

  // 依赖关系
  prevs: string[]; // 前驱节点 ID 列表
  succs: string[]; // 后继节点 ID 列表
};

// 普通任务节点
export type TaskNode = BaseNode & {
  type: 'task';

  title: string; // 节点标题
  description?: string; // 节点描述
  status: NodeStatus; // 节点状态

  executionConfig?: ExecutionModeConfig; // 任务执行模式
  subtasks?: SubTask[]; // 子任务列表
  milestone?: boolean; // 里程碑，用户手动高亮的节点
  completedDate?: string; // 完成日期
};

// 子任务
export interface SubTask {
  title: string;
  status: Exclude<NodeStatus, 'lock' | 'skipped'>;
}

export type DelimiterNode = BaseNode & {
  type: 'delimiter';
  markerType: 'start' | 'end';
};

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

export type RecurrenceInstance = Omit<TaskNode, 'milestone' | 'subtasks'>;

export interface BaseTimeline {
  id: string; // 时间线唯一标识
  title: string; // 时间线标题
  type: TimelineType; // 时间线类型
}

export type TimelineNode = TaskNode | DelimiterNode;

export interface TaskTimeline extends BaseTimeline {
  type: 'task';

  nodes: TimelineNode[];
}

export interface RecurrenceTimeline extends BaseTimeline {
  type: 'recurrence';

  completedTasks: RecurrenceInstance[];

  frequency: RecurrenceFrequency;

  // 任务轮换模式
  pattern?: RecurrencePattern;

  startDate: string;
  endDate?: string;
}

export type Timeline = TaskTimeline | RecurrenceTimeline;

export interface TimelineGroup {
  id: string; // 分组唯一标识
  title: string; // 分组标题
  timelines: Timeline[];
}
