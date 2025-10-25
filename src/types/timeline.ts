export type NodeStatus = 'todo' | 'doing' | 'done' | 'skipped' | 'lock';

export type TaskMode = 'scheduled' | 'quantitative';

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
    unit?: string; // 单位（如"次"、"个"、"小时"）
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
  id: string; // 全局唯一标识
  title: string; // 节点标题
  status: NodeStatus; // 节点状态（自动计算）
  mode?: TaskModeConfig; // 任务执行模式
  depends_on?: string[]; // 依赖的节点 ID 列表
  depends_on_timeline?: string[]; // 依赖的 Timeline ID 列表
}

// 普通任务节点
export interface TaskNode extends BaseNode {
  type: 'task';
}

// 子任务（仅存在于 GroupNode 中）
export interface SubTask {
  id: string;
  title: string;
  status: NodeStatus; // 也支持自动计算
  mode?: TaskModeConfig; // SubTask 也支持执行模式
  // 注意: SubTask 不支持 depends_on 和 depends_on_timeline 字段
}

// 并列任务组
export interface GroupNode extends BaseNode {
  type: 'group';
  subtasks: SubTask[]; // 组内子任务（扁平结构，不支持嵌套）
}

export type TimelineNode = TaskNode | GroupNode;

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly';

export interface WeeklyConfig {
  // 选定星期（0-6，0表示周日）
  weekdays: number[]; // 例如 [1, 3, 5] 表示周一、三、五
  // 总时长分摊到每周
  totalDuration?: number; // 单位：小时
  durationPerWeek?: number; // 自动计算或手动设置
}

export interface MonthlyConfig {
  // 选定日期（1-31）
  days: number[]; // 例如 [1, 15] 表示每月1号和15号
}

export interface RecurrencePattern {
  // 任务序列（支持多任务轮换）
  tasks: string[]; // 任务标题数组，例如 ["A", "B", "C"]
  // 当前轮换位置
  currentIndex?: number; // 默认 0
}

export interface RecurrenceStats {
  totalCompleted: number; // 总完成次数
  totalSkipped: number; // 总跳过次数
  lastCompleted?: string; // 最后完成时间（ISO 8601）
  lastSkipped?: string; // 最后跳过时间
  // 按任务统计（当有多任务轮换时）
  byTask?: Record<
    string,
    {
      completed: number;
      skipped: number;
    }
  >;
}

export interface RecurrenceConfig {
  frequency: RecurrenceFrequency;

  // 时间参数（根据 frequency 选择）
  weeklyConfig?: WeeklyConfig;
  monthlyConfig?: MonthlyConfig;

  // 任务轮换
  pattern?: RecurrencePattern;

  // 统计信息
  stats: RecurrenceStats;

  // 是否激活
  active: boolean;
}

export interface RecurrenceInstance {
  id: string; // 实例唯一标识
  timelineId: string; // 所属循环 Timeline
  taskTitle: string; // 当前任务标题（来自 pattern）
  scheduledDate: string; // 计划执行日期（ISO 8001）
  status: NodeStatus; // 实例状态
  completedDate?: string; // 完成日期
}

export interface Timeline {
  id: string; // 时间线唯一标识
  title: string; // 时间线标题
  nodes: TimelineNode[]; // 节点列表（按执行顺序排列）
  dependencies?: Dependency[]; // 依赖关系列表

  // 循环任务配置
  recurrence?: RecurrenceConfig; // 如果存在则为循环任务

  status?: 'todo' | 'doing' | 'done'; // Timeline 整体状态（自动计算）
}

export interface TimelineGroup {
  id: string; // 分组唯一标识
  title: string; // 分组标题
  timelines: Timeline[]; // 该分组下的所有时间线
}
