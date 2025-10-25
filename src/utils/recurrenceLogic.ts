import type { RecurrenceInstance, Timeline } from '@/types/timeline';

export function generateRecurrenceInstances(timeline: Timeline, startDate: Date, endDate: Date): RecurrenceInstance[] {
  if (!timeline.recurrence || !timeline.recurrence.active) return [];

  const instances: RecurrenceInstance[] = [];
  const { frequency, pattern, weeklyConfig, monthlyConfig } = timeline.recurrence;

  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0); // Start from the beginning of the day

  let patternIndex = pattern?.currentIndex || 0;

  while (current <= endDate) {
    let shouldGenerate = false;

    switch (frequency) {
      case 'daily':
        shouldGenerate = true;
        break;
      case 'weekly':
        if (weeklyConfig) {
          const weekday = current.getDay();
          shouldGenerate = weeklyConfig.weekdays.includes(weekday);
        }
        break;
      case 'monthly':
        if (monthlyConfig) {
          const day = current.getDate();
          shouldGenerate = monthlyConfig.days.includes(day);
        }
        break;
    }

    if (shouldGenerate) {
      const taskTitle = pattern?.tasks[patternIndex % (pattern.tasks.length || 1)] || timeline.title;

      instances.push({
        id: `${timeline.id}-${current.toISOString().split('T')[0]}`,
        timelineId: timeline.id,
        taskTitle,
        scheduledDate: current.toISOString(),
        status: 'todo',
      });

      patternIndex++;
    }

    // Move to the next day
    current.setDate(current.getDate() + 1);
  }

  return instances;
}
