import type {
  RecurrenceTimelineDraft,
  RecurrenceTimelineFlat,
  TaskTimelineDraft,
  TaskTimelineFlat,
  TimelineFlat,
} from '@/types/flat';
import type { RecurrenceFrequency, TimelineType } from '@/types/timeline';
import { createListCollection } from '@chakra-ui/react';

export const MIN_TEMPLATES = 1;

export const frequencyCollection = createListCollection({
  items: [
    { label: '每日', value: 'daily' },
    { label: '每周', value: 'weekly' },
    { label: '每月', value: 'monthly' },
  ],
});

export type FrequencyType = 'daily' | 'weekly' | 'monthly';

export const getFrequencyType = (frequency: RecurrenceFrequency): FrequencyType => {
  if (frequency === 'daily') return 'daily';
  if ('weekdays' in frequency) return 'weekly';
  return 'monthly';
};

export const createFrequency = (type: FrequencyType): RecurrenceFrequency => {
  switch (type) {
    case 'daily':
      return 'daily';
    case 'weekly':
      return { weekdays: [1, 2, 3, 4, 5] };
    case 'monthly':
      return { days: [1] };
  }
};

const createEmptyTaskDraft = (title: string = ''): TaskTimelineDraft => ({
  title,
  type: 'task',
});

const createEmptyRecurrenceDraft = (title: string = ''): RecurrenceTimelineDraft => ({
  title,
  type: 'recurrence',
  completedTasks: [],
  frequency: 'daily',
  pattern: {
    taskTemplates: [
      {
        title: 'Recurrence Task',
        content: { subtasks: [], description: '' },
      },
    ],
    currentIndex: 0,
  },
  startDate: new Date(),
});

export type TaskPattern = (RecurrenceTimelineDraft | RecurrenceTimelineFlat)['pattern'];

export interface DualDraftState {
  selectedType: TimelineType;
  taskDraft: TaskTimelineDraft | TaskTimelineFlat;
  recurrenceDraft: RecurrenceTimelineDraft | RecurrenceTimelineFlat;
}

export const initDualDraft = (timeline?: TimelineFlat | null): DualDraftState => {
  if (!timeline) {
    return {
      selectedType: 'task',
      taskDraft: createEmptyTaskDraft(),
      recurrenceDraft: createEmptyRecurrenceDraft(),
    };
  }

  if (timeline.type === 'task') {
    return {
      selectedType: 'task',
      taskDraft: structuredClone(timeline),
      recurrenceDraft: {
        id: timeline.id,
        ...createEmptyRecurrenceDraft(timeline.title),
      } satisfies RecurrenceTimelineDraft, // 保持 id 一致性...虽然想不到什么好处，但是可以方便测试
    };
  } else {
    return {
      selectedType: 'recurrence',
      taskDraft: { id: timeline.id, ...createEmptyTaskDraft(timeline.title) } satisfies TaskTimelineDraft,
      recurrenceDraft: structuredClone(timeline),
    };
  }
};
