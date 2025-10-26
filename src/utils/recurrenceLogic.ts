import type { Timeline, RecurrenceTimeline, RecurrenceInstance } from '@/types/timeline';

export function generateRecurrenceInstances(timeline: Timeline, startDate: Date, endDate: Date): RecurrenceInstance[] {
  if (!('completedTasks' in timeline)) return [];

  const recurrenceTimeline = timeline as RecurrenceTimeline;
  const { frequency, pattern } = recurrenceTimeline;

  const instances: RecurrenceInstance[] = [];

  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0); // Start from the beginning of the day

  let patternIndex = pattern?.currentIndex || 0;

  while (current <= endDate) {
    let shouldGenerate = false;

    if (frequency === 'daily') {
      shouldGenerate = true;
    } else if ('weekdays' in frequency) {
      const weekday = current.getDay();
      shouldGenerate = frequency.weekdays.includes(weekday);
    } else if ('days' in frequency) {
      const day = current.getDate();
      shouldGenerate = frequency.days.includes(day);
    }

    if (shouldGenerate) {
      const taskTitle = pattern?.tasks[patternIndex % (pattern.tasks.length || 1)] || timeline.title;

      instances.push({
        taskTitle,
        scheduledDate: current.toISOString(),
        completedDate: '',
        status: 'done',
      });

      patternIndex++;
    }

    // Move to the next day
    current.setDate(current.getDate() + 1);
  }

  return instances;
}
