import type { TimelineType } from '@/types/timeline';
import type { FieldErrors } from '@/utils/zodHelpers';
import { Field, Input, RadioGroup, Select, Stack, Text } from '@chakra-ui/react';
import dayjs from 'dayjs';
import { produce, type Producer } from 'immer';
import type { Dispatch, SetStateAction } from 'react';
import { EditTaskPattern } from './EditTaskPattern';
import {
  createFrequency,
  frequencyCollection,
  getFrequencyType,
  type DualDraftState,
  type FrequencyType,
  type TaskPattern,
} from './helper';

interface EditTimelineFieldProps {
  state: DualDraftState;
  onUpdate: Dispatch<SetStateAction<DualDraftState>>;
  fieldErrors: FieldErrors;
}

export function EditTimelineField({ state, onUpdate, fieldErrors }: EditTimelineFieldProps) {
  const { selectedType } = state;

  const handleTypeChange = (type: TimelineType) => {
    if (type === selectedType) return;

    onUpdate(
      produce((draft) => {
        draft.selectedType = type;
      }),
    );
  };

  const updateTitle = (title: string) => {
    onUpdate(
      produce((draft) => {
        draft.taskDraft.title = draft.recurrenceDraft.title = title;
      }),
    );
  };

  const updateRecurrence = (updater: Producer<typeof state.recurrenceDraft>) => {
    onUpdate(
      produce((draft) => {
        updater(draft.recurrenceDraft);
      }),
    );
  };

  const updateRecurrenceFrequency = (frequency: FrequencyType) => {
    updateRecurrence((draft) => {
      draft.frequency = createFrequency(frequency);
    });
  };

  const updateRecurrencePattern = (updater: Producer<TaskPattern>) => {
    updateRecurrence((draft) => {
      updater(draft.pattern);
    });
  };

  const currentDraft = selectedType === 'task' ? state.taskDraft : state.recurrenceDraft;

  return (
    <Stack align="stretch" gap={4} p={2}>
      <Field.Root invalid={fieldErrors.title !== undefined}>
        <Field.Label fontWeight="bold">时间线名称</Field.Label>
        <Input placeholder="输入时间线名称" value={currentDraft.title} onChange={(e) => updateTitle(e.target.value)} />
        <Field.ErrorText>{fieldErrors.title}</Field.ErrorText>
      </Field.Root>
      <RadioGroup.Root
        colorPalette="blue"
        value={selectedType}
        onValueChange={(details) => {
          const val = Array.isArray(details.value) ? details.value[0] : details.value;
          if (val === 'task' || val === 'recurrence') handleTypeChange(val);
        }}
      >
        <Stack align="stretch" gap={2}>
          <Text fontWeight="bold">时间线类型</Text>
          <Stack direction="row">
            <RadioGroup.Item value="task">
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemIndicator />
              <RadioGroup.ItemText>任务</RadioGroup.ItemText>
            </RadioGroup.Item>
            <RadioGroup.Item value="recurrence">
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemIndicator />
              <RadioGroup.ItemText>循环</RadioGroup.ItemText>
            </RadioGroup.Item>
          </Stack>
        </Stack>
      </RadioGroup.Root>

      {selectedType === 'recurrence' && (
        <>
          <Field.Root invalid={fieldErrors.startDate !== undefined}>
            <Field.Label fontWeight="bold">开始日期</Field.Label>
            <Input
              type="date"
              value={dayjs(state.recurrenceDraft.startDate).format('YYYY-MM-DD')}
              onChange={(e) =>
                updateRecurrence((d) => {
                  d.startDate = dayjs(e.target.value).toDate();
                })
              }
            />
            <Field.ErrorText>{fieldErrors.startDate}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={fieldErrors.frequency !== undefined}>
            <Select.Root
              collection={frequencyCollection}
              value={[getFrequencyType(state.recurrenceDraft.frequency)]}
              onValueChange={(e) => {
                const freq = e.value[0] as FrequencyType | undefined;
                if (freq) updateRecurrenceFrequency(freq);
              }}
            >
              <Select.HiddenSelect />
              <Select.Label fontWeight="bold">选择频率</Select.Label>
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="选择频率" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Select.Positioner>
                <Select.Content>
                  {frequencyCollection.items.map((f) => (
                    <Select.Item item={f} key={f.value}>
                      {f.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Select.Root>
            <Field.ErrorText>{fieldErrors.frequency}</Field.ErrorText>
          </Field.Root>
          <EditTaskPattern
            state={state.recurrenceDraft.pattern}
            onUpdate={updateRecurrencePattern}
            fieldErrors={fieldErrors}
          />
        </>
      )}
    </Stack>
  );
}
