import z from 'zod';
import type { TimelineNode } from './timeline';
import {
  DelimiterNodeSchema,
  RecurrenceTimelineSchema,
  SubtaskSchema,
  TaskNodeSchema,
  TaskTimelineSchema,
  TimelineGroupSchema,
} from './timeline';

// Store 层扁平化类型
export const TaskNodeFlatSchema = TaskNodeSchema;
export const DelimiterNodeFlatSchema = DelimiterNodeSchema;
export const TimelineNodeFlatSchema = z.discriminatedUnion('type', [TaskNodeFlatSchema, DelimiterNodeFlatSchema]);

export const TaskTimelineFlatSchema = TaskTimelineSchema.omit({ nodes: true }).extend({
  nodeOrder: z.array(z.string()).default([]),
});
export const RecurrenceTimelineFlatSchema = RecurrenceTimelineSchema;
export const TimelineFlatSchema = z.discriminatedUnion('type', [TaskTimelineFlatSchema, RecurrenceTimelineFlatSchema]);

export const TimelineGroupFlatSchema = TimelineGroupSchema.omit({ timelines: true }).extend({
  timelineOrder: z.array(z.string()).default([]),
});

export type TaskNodeFlat = z.infer<typeof TaskNodeFlatSchema>;
export type DelimiterNodeFlat = z.infer<typeof DelimiterNodeFlatSchema>;
export type TimelineNodeFlat = z.infer<typeof TimelineNodeFlatSchema>;

export type TaskTimelineFlat = z.infer<typeof TaskTimelineFlatSchema>;
export type RecurrenceTimelineFlat = z.infer<typeof RecurrenceTimelineFlatSchema>;
export type TimelineFlat = z.infer<typeof TimelineFlatSchema>;

export type TimelineGroupFlat = z.infer<typeof TimelineGroupFlatSchema>;

export interface FlatTimelineData {
  groups: Record<string, TimelineGroupFlat>;
  timelines: Record<string, TimelineFlat>;
  nodes: Record<string, TimelineNode>;
  groupOrder: string[];
}

// UI 层类型
export const TaskNodeDraftSchema = z.object({
  ...TaskNodeSchema.omit({ timelineId: true }).shape,
  content: z.object({
    ...TaskNodeSchema.shape.content.shape,
    subtasks: z.array(SubtaskSchema.required({ id: true })),
  }),
});
export const DelimiterNodeDraftSchema = DelimiterNodeSchema.omit({ timelineId: true });
export const TimelineNodeDraftSchema = z.discriminatedUnion('type', [TaskNodeDraftSchema, DelimiterNodeDraftSchema]);
export type TaskNodeDraft = z.input<typeof TaskNodeDraftSchema>;
export type DelimiterNodeDraft = z.input<typeof DelimiterNodeDraftSchema>;
export type TimelineNodeDraft = z.input<typeof TimelineNodeDraftSchema>;

export const TaskTimelineDraftSchema = TaskTimelineFlatSchema.omit({ groupId: true });
export const RecurrenceTimelineDraftSchema = RecurrenceTimelineFlatSchema.omit({ groupId: true }).extend({
  startDate: z.date(),
  endDate: z.date().optional(),
});
export const TimelineDraftSchema = z.discriminatedUnion('type', [
  TaskTimelineDraftSchema,
  RecurrenceTimelineDraftSchema,
]);
export type TaskTimelineDraft = z.input<typeof TaskTimelineDraftSchema>;
export type RecurrenceTimelineDraft = z.input<typeof RecurrenceTimelineDraftSchema>;
export type TimelineDraft = z.input<typeof TimelineDraftSchema>;

export const TimelineGroupDraftSchema = TimelineGroupFlatSchema;
export type TimelineGroupDraft = z.input<typeof TimelineGroupDraftSchema>;
