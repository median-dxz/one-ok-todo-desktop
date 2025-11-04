import { z } from 'zod';
import type { MemoNode } from './memo';

export const NodeStatusSchema = z.enum(['todo', 'done', 'skipped', 'lock']);

export const TaskExecutionModeSchema = z.enum(['scheduled', 'quantitative']);

export const ExecutionModeConfigSchema = z.object({
  mode: TaskExecutionModeSchema,
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
  type: z.enum(['task', 'delimiter']),
  prevs: z.array(z.string()),
  succs: z.array(z.string()),
});

export const SubTaskSchema = z.object({
  title: z.string().min(1),
  status: z.enum(['todo', 'done']),
});

export const TaskNodeSchema = BaseNodeSchema.extend({
  type: z.literal('task'),
  title: z.string(),
  description: z.string().optional(),
  status: NodeStatusSchema,
  executionConfig: ExecutionModeConfigSchema.optional(),
  subtasks: z.array(SubTaskSchema).optional(),
  milestone: z.boolean().optional(),
  completedDate: z.string().optional(),
});

export const DelimiterNodeSchema = BaseNodeSchema.extend({
  type: z.literal('delimiter'),
  markerType: z.enum(['start', 'end']),
});

export const TimelineNodeSchema = z.union([TaskNodeSchema, DelimiterNodeSchema]);

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

export const RecurrenceTaskTemplateSchema = TaskNodeSchema.omit({
  milestone: true,
  executionConfig: true,
});

export const RecurrencePatternSchema = z.object({
  taskTemplates: z.array(RecurrenceTaskTemplateSchema).min(1),
  currentIndex: z.number().optional(),
});

export const RecurrenceInstanceSchema = TaskNodeSchema.omit({
  milestone: true,
});

const BaseTimelineSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  type: z.enum(['task', 'recurrence']),
});

export const TaskTimelineSchema = BaseTimelineSchema.extend({
  type: z.literal('task'),
  nodes: z.array(TimelineNodeSchema),
});

export const RecurrenceTimelineSchema = BaseTimelineSchema.extend({
  type: z.literal('recurrence'),
  completedTasks: z.array(RecurrenceInstanceSchema),
  frequency: RecurrenceFrequencySchema,
  pattern: RecurrencePatternSchema,
  startDate: z.string(),
  endDate: z.string().optional(),
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

export const AppMetadataSchema = z.object({
  version: z.string(),
  metadata: z
    .object({
      lastModified: z.string(),
      syncStatus: z.enum(['synced', 'pending', 'error']).optional(),
    })
    .optional(),
});
