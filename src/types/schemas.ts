import { z } from 'zod';
import type { MemoNode } from './memo';

export const NodeStatusSchema = z.enum(['todo', 'doing', 'done', 'skipped', 'lock']);

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
      unit: z.string().optional(),
    })
    .optional(),
});

export const DependencySchema = z.object({
  id: z.string(),
  type: z.enum(['normal', 'split', 'timeline']),
  from: z.union([z.string(), z.array(z.string())]),
  to: z.union([z.string(), z.array(z.string())]),
  description: z.string().optional(),
});

const BaseNodeSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  status: NodeStatusSchema,
  mode: TaskModeConfigSchema.optional(),
  depends_on: z.array(z.string()).optional(),
  depends_on_timeline: z.array(z.string()).optional(),
});

export const SubTaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  status: NodeStatusSchema,
  mode: TaskModeConfigSchema.optional(),
});

export const TimelineNodeSchema = z.discriminatedUnion('type', [
  BaseNodeSchema.extend({
    type: z.literal('task'),
  }),
  BaseNodeSchema.extend({
    type: z.literal('group'),
    subtasks: z.array(SubTaskSchema),
  }),
]);

export const RecurrenceConfigSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  weeklyConfig: z
    .object({
      weekdays: z.array(z.number().min(0).max(6)),
      totalDuration: z.number().optional(),
      durationPerWeek: z.number().optional(),
    })
    .optional(),
  monthlyConfig: z
    .object({
      days: z.array(z.number().min(1).max(31)),
    })
    .optional(),
  pattern: z
    .object({
      tasks: z.array(z.string()),
      currentIndex: z.number().optional(),
    })
    .optional(),
  stats: z.object({
    totalCompleted: z.number(),
    totalSkipped: z.number(),
    lastCompleted: z.string().optional(),
    lastSkipped: z.string().optional(),
    byTask: z
      .record(
        z.object({
          completed: z.number(),
          skipped: z.number(),
        }),
      )
      .optional(),
  }),
  active: z.boolean(),
});

export const TimelineSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  nodes: z.array(TimelineNodeSchema),
  dependencies: z.array(DependencySchema).optional(),
  recurrence: RecurrenceConfigSchema.optional(),
  status: z.enum(['todo', 'doing', 'done']).optional(),
});

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
