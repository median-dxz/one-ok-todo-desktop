import { z } from 'zod';
import type { MemoNode } from './memo';

export const NodeStatusSchema = z.enum(['todo', 'done', 'skipped', 'lock']);

export const TaskModeConfigSchema = z.object({
  mode: z.enum(['scheduled', 'quantitative']),
  scheduledConfig: z
    .object({
      deadline: z.string().optional(),
      reminder: z.string().optional(),
    })
    .optional(),
  quantitativeConfig: z
    .object({
      target: z.number(),
      current: z.number(),
      timeUnit: z.string().optional(),
    })
    .optional(),
});

const BaseNodeSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  // 'task' | 'sub-task'
  type: z.enum(['task', 'sub-task']),
  status: NodeStatusSchema,
});

export const SubTaskSchema = BaseNodeSchema.extend({
  type: z.literal('sub-task'),
});

export const TaskNodeSchema = BaseNodeSchema.extend({
  type: z.literal('task'),
  prevs: z.array(z.string()),
  succs: z.array(z.string()),
  mode: TaskModeConfigSchema.optional(),
  subtasks: z.array(SubTaskSchema).optional(),
  milestone: z.boolean().optional(),
});

export const WeeklyConfigSchema = z.object({
  weekdays: z.array(z.number().min(0).max(6)),
  durationPerWeek: z.number().optional(),
  occurrencesPerWeek: z.number().optional(),
});

export const MonthlyConfigSchema = z.object({
  days: z.array(z.number().min(1).max(31)),
  durationPerMonth: z.number().optional(),
  occurrencesPerMonth: z.number().optional(),
});

export const RecurrenceFrequencySchema = z.union([z.literal('daily'), WeeklyConfigSchema, MonthlyConfigSchema]);

export const RecurrencePatternSchema = z.object({
  tasks: z.array(z.string()),
  currentIndex: z.number().optional(),
});

export const RecurrenceInstanceSchema = z.object({
  taskTitle: z.string(),
  scheduledDate: z.string(),
  status: NodeStatusSchema,
  completedDate: z.string().optional(),
});

const BaseTimelineSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  // 'task-timeline' | 'recurrence-timeline'
  type: z.enum(['task-timeline', 'recurrence-timeline']),
});

export const TaskTimelineSchema = BaseTimelineSchema.extend({
  type: z.literal('task-timeline'),
  nodes: z.array(TaskNodeSchema),
});

export const RecurrenceTimelineSchema = BaseTimelineSchema.extend({
  type: z.literal('recurrence-timeline'),
  completedTasks: z.array(RecurrenceInstanceSchema),
  frequency: RecurrenceFrequencySchema,
  pattern: RecurrencePatternSchema.optional(),
});

export const TimelineSchema = z.union([TaskTimelineSchema, RecurrenceTimelineSchema]);

export const TimelineGroupSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  timelines: z.array(TimelineSchema),
});

export const MemoNodeTypeSchema = z.enum(['string', 'object', 'array', 'number', 'boolean']);

export const MemoNodeSchema: z.ZodType<MemoNode> = z.lazy(() =>
  z.object({
    id: z.string(),
    key: z.string(),
    type: MemoNodeTypeSchema,
    value: z.union([z.string(), z.number(), z.boolean()]),
    children: z.array(MemoNodeSchema),
    isCollapsed: z.boolean().optional(),
  }),
);

export const AppDataSchema = z.object({
  version: z.string(),
  metadata: z
    .object({
      lastModified: z.string(),
      syncStatus: z.enum(['synced', 'pending', 'error']).optional(),
    })
    .optional(),
});
