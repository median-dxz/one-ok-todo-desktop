import { nanoid } from 'nanoid';
import { z } from 'zod';

export const NodeStatusSchema = z.enum(['todo', 'done', 'skipped', 'locked']);
export const TaskExecutionModeSchema = z.enum(['scheduled', 'quantitative']);
export const NodeTypeSchema = z.enum(['task', 'delimiter']);
export const TimelineTypeSchema = z.enum(['task', 'recurrence']);

// 任务执行配置
export const ExecutionModeConfigSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('scheduled'), // 执行模式：定时

    deadline: z.coerce.date(), // 任务截止日期
    reminder: z.iso.datetime({ offset: true }).optional(), // 提醒时间
  }),
  z.object({
    mode: z.literal('quantitative'), // 执行模式：定量

    target: z.number(), // 目标数量
    current: z.number(), // 当前完成数量
    timeUnit: z.string().default('天'), // 时间单位（如"天"、"周"、"月"、"次"）
  }),
]);

// 基础节点
export const BaseNodeSchema = z.object({
  id: z.string().default(nanoid), // 节点唯一标识
  type: z.string(), // 节点类型
  timelineId: z.string(), // 所属时间线 ID

  dependedBy: z.array(z.string()).default([]), // 被依赖的节点 ID 列表 (反向引用)
});

// 子任务
export const SubtaskSchema = z.object({
  id: z.string().default(nanoid), // 子任务唯一标识
  title: z.string().trim().min(1),
  done: z.boolean(),
});

// 普通任务节点
export const TaskNodeSchema = z.object({
  ...BaseNodeSchema.shape,
  type: z.literal('task'),

  title: z.string().trim().min(1), // 节点标题
  content: z.object({
    description: z.string(), // 节点描述
    subtasks: z.array(SubtaskSchema), // 子任务列表
    // 其他可能的字段，如标签、优先级等
  }),
  status: NodeStatusSchema.default('todo'), // 节点状态
  dependsOn: z.array(z.string()).default([]), // 依赖的节点 ID 列表 (前向引用)

  executionConfig: ExecutionModeConfigSchema.optional(), // 任务执行模式
  milestone: z.boolean().default(false), // 里程碑，用户手动高亮的节点
  completedDate: z.iso.datetime({ offset: true }).optional(), // 完成日期
});

// 分隔符节点
export const DelimiterNodeSchema = z.object({
  ...BaseNodeSchema.shape,
  type: z.literal('delimiter'),
  markerType: z.enum(['start', 'end', 'date']),
});

export const TimelineNodeSchema = z.discriminatedUnion('type', [TaskNodeSchema, DelimiterNodeSchema]);

export const WeeklyConfigSchema = z
  .object({
    // 选定星期（0-6，0表示周日）
    weekdays: z.array(z.number().min(0).max(6)), // 例如 [1, 3, 5] 表示周一、三、五
    // 总时长 分摊到天
    durationPerWeek: z.number().optional(),
    // 总次数 分摊到天
    occurrencesPerWeek: z.number().optional(),
  })
  .refine((data) => data.durationPerWeek || data.occurrencesPerWeek, {
    message: '至少需要提供 durationPerWeek 或 occurrencesPerWeek 之一',
  });

export const MonthlyConfigSchema = z
  .object({
    // 选定日期（1-31）
    days: z.array(z.number().min(1).max(31)), // 例如 [1, 15] 表示每月1号和15号
    // 总时长 分摊到天
    durationPerMonth: z.number().optional(),
    // 总次数 分摊到天
    occurrencesPerMonth: z.number().optional(),
  })
  .refine((data) => data.durationPerMonth || data.occurrencesPerMonth, {
    message: '至少需要提供 durationPerMonth 或 occurrencesPerMonth 之一',
  });

export const RecurrenceFrequencySchema = z.union([z.literal('daily'), WeeklyConfigSchema, MonthlyConfigSchema]);

export const RecurrenceTaskTemplateSchema = TaskNodeSchema.pick({
  content: true,
  title: true,
});

export const RecurrenceTaskInstanceSchema = TaskNodeSchema.omit({
  milestone: true,
  dependedBy: true,
  dependsOn: true,
});

export const BaseTimelineSchema = z.object({
  id: z.string().default(nanoid), // 时间线唯一标识
  groupId: z.string(), // 所属分组 ID
  title: z.string().trim().min(1), // 时间线标题
});

export const TaskTimelineSchema = z.object({
  ...BaseTimelineSchema.shape,
  type: z.literal('task'),
  nodes: z.array(TimelineNodeSchema).default([]), // 时间线包含的节点列表
});

export const RecurrenceTimelineSchema = z.object({
  ...BaseTimelineSchema.shape,
  type: z.literal('recurrence'),
  completedTasks: z.array(RecurrenceTaskInstanceSchema).default([]),
  // 任务轮换频率
  frequency: RecurrenceFrequencySchema,
  // 任务轮换模式
  pattern: z
    .object({
      // 任务模板序列（支持多任务轮换）
      // 长度为一时为单任务
      taskTemplates: z.array(RecurrenceTaskTemplateSchema),
      // 当前轮换位置
      currentIndex: z.number().optional(),
    })
    .refine(
      ({ taskTemplates, currentIndex }) => {
        if (currentIndex === undefined && taskTemplates.length === 0) return true;
        return currentIndex !== undefined && currentIndex >= 0 && currentIndex < taskTemplates.length;
      },
      {
        message: 'currentIndex 必须在 taskTemplates 数组范围内',
      },
    ),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
});

export const TimelineSchema = z.discriminatedUnion('type', [TaskTimelineSchema, RecurrenceTimelineSchema]);

export const TimelineGroupSchema = z.object({
  id: z.string().default(nanoid), // 分组唯一标识
  title: z.string().trim().min(1), // 分组标题
  timelines: z.array(TimelineSchema).default([]), // 有序 Timeline 列表
});

export type NodeStatus = z.infer<typeof NodeStatusSchema>;
export type TaskExecutionMode = z.infer<typeof TaskExecutionModeSchema>;
export type NodeType = z.infer<typeof NodeTypeSchema>;
export type TimelineType = z.infer<typeof TimelineTypeSchema>;

export type ExecutionModeConfig = z.infer<typeof ExecutionModeConfigSchema>;
export type Subtask = z.infer<typeof SubtaskSchema>;

export type BaseNode = z.infer<typeof BaseNodeSchema>;
export type TaskNode = z.infer<typeof TaskNodeSchema>;
export type DelimiterNode = z.infer<typeof DelimiterNodeSchema>;
export type TimelineNode = z.infer<typeof TimelineNodeSchema>;

export type RecurrenceFrequency = z.infer<typeof RecurrenceFrequencySchema>;
export type RecurrenceTaskTemplate = z.infer<typeof RecurrenceTaskTemplateSchema>;
export type RecurrenceTaskInstance = z.infer<typeof RecurrenceTaskInstanceSchema>;

export type BaseTimeline = z.infer<typeof BaseTimelineSchema>;
export type TaskTimeline = z.infer<typeof TaskTimelineSchema>;

export type RecurrenceTimeline = z.infer<typeof RecurrenceTimelineSchema>;
export type Timeline = z.infer<typeof TimelineSchema>;
export type TimelineGroup = z.infer<typeof TimelineGroupSchema>;
