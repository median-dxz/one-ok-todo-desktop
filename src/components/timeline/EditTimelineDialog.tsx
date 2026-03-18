import { useAppStore } from '@/store';
import { createRecurrenceTimeline } from '@/store/timelineSlice';
import {
  TimelineDraftSchema,
  TimelineFlatSchema,
  type RecurrenceTimelineDraft,
  type TimelineDraft,
  type TimelineFlat,
} from '@/types/flat';
import type { RecurrenceFrequency, TimelineType } from '@/types/timeline';
import type { FieldErrors } from '@/utils/zodHelpers';
import { useZodFormValidation } from '@/hooks/useZodFormValidation';
import { FormDialogShell } from '@/components/ui/FormDialogShell';
import {
  Box,
  Button,
  createListCollection,
  Field,
  Fieldset,
  Flex,
  HStack,
  IconButton,
  Input,
  RadioGroup,
  Select,
  Text,
  Textarea,
  VStack,
  type UseDialogReturn,
} from '@chakra-ui/react';
import { produce } from 'immer';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
import { LuPlus, LuTrash2 } from 'react-icons/lu';

const frequencyCollection = createListCollection({
  items: [
    { label: '每日', value: 'daily' },
    { label: '每周', value: 'weekly' },
    { label: '每月', value: 'monthly' },
  ],
});

type FrequencyType = 'daily' | 'weekly' | 'monthly';

const getFrequencyType = (frequency: RecurrenceFrequency): FrequencyType => {
  if (frequency === 'daily') return 'daily';
  if ('weekdays' in frequency) return 'weekly';
  return 'monthly';
};

const createFrequency = (type: FrequencyType): RecurrenceFrequency => {
  switch (type) {
    case 'daily':
      return 'daily';
    case 'weekly':
      return { weekdays: [1, 2, 3, 4, 5] };
    case 'monthly':
      return { days: [1] };
  }
};

interface EditTimelineFieldProps {
  edit: TimelineDraft;
  setEdit: Dispatch<SetStateAction<TimelineDraft>>;
  fieldErrors: FieldErrors;
}

const EditTaskTemplates = ({
  edit,
  setEdit,
  fieldErrors,
}: {
  edit: RecurrenceTimelineDraft;
  setEdit: Dispatch<SetStateAction<TimelineDraft>>;
  fieldErrors: FieldErrors;
}) => {
  const updateRecurrence = (updater: (draft: RecurrenceTimelineDraft) => void) => {
    setEdit(
      produce((draft) => {
        if (draft.type === 'recurrence') {
          updater(draft);
        }
      }),
    );
  };

  type RecurrenceTaskTemplate = RecurrenceTimelineDraft['pattern']['taskTemplates'][number];

  const updateTaskTemplates = (index: number, updater: (template: RecurrenceTaskTemplate) => void) => {
    updateRecurrence((draft) => {
      const template = draft.pattern.taskTemplates.at(index);
      if (!template) return;
      updater(template);
    });
  };

  const handleAddTemplate = () => {
    updateRecurrence((draft) => {
      draft.pattern.taskTemplates.push({
        title: '新任务模板',
        content: {
          description: '',
          subtasks: [],
        },
      });
    });
  };

  const handleRemoveTemplate = (index: number) => {
    updateRecurrence((draft) => {
      draft.pattern.taskTemplates.splice(index, 1);
    });
  };

  const handleAddSubtask = (templateIndex: number) => {
    updateTaskTemplates(templateIndex, (template) => {
      template.content.subtasks.push({ title: '新子任务', done: false, id: nanoid() });
    });
  };

  const handleRemoveSubtask = (templateIndex: number, subtaskIndex: number) => {
    updateTaskTemplates(templateIndex, (template) => {
      template.content.subtasks.splice(subtaskIndex, 1);
    });
  };

  const handleSubtaskChange = (templateIndex: number, subtaskIndex: number, value: string) => {
    updateTaskTemplates(templateIndex, (template) => {
      const subtask = template.content.subtasks.at(subtaskIndex);
      if (subtask) {
        subtask.title = value;
      }
    });
  };

  return (
    <Fieldset.Root invalid={fieldErrors.pattern !== undefined}>
      <VStack gap={4} align="stretch">
        <Text fontWeight="bold">任务模板</Text>
      {edit.pattern.taskTemplates.map((template, index) => (
        <Box key={index} p={4} borderWidth="1px" borderRadius="md">
          <VStack gap={4} align="stretch">
            <HStack justify="space-between">
              <Text fontWeight="medium">模板 {index + 1}</Text>
              <IconButton
                aria-label="Remove template"
                size="sm"
                variant="ghost"
                onClick={() => handleRemoveTemplate(index)}
              >
                <LuTrash2 />
              </IconButton>
            </HStack>
            <Field.Root>
              <Field.Label>标题</Field.Label>
              <Input
                value={template.title}
                onChange={(e) =>
                  updateTaskTemplates(index, (t) => {
                    t.title = e.target.value;
                  })
                }
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>描述</Field.Label>
              <Textarea
                value={template.content.description}
                onChange={(e) =>
                  updateTaskTemplates(index, (t) => {
                    t.content.description = e.target.value;
                  })
                }
              />
            </Field.Root>
            <VStack gap={2} align="stretch">
              <Text>子任务</Text>
              {template.content.subtasks.map((subtask, subIndex) => (
                <HStack key={subtask.id}>
                  <Input value={subtask.title} onChange={(e) => handleSubtaskChange(index, subIndex, e.target.value)} />
                  <IconButton
                    aria-label="Remove subtask"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveSubtask(index, subIndex)}
                  >
                    <LuTrash2 />
                  </IconButton>
                </HStack>
              ))}
              <Button size="sm" variant="outline" onClick={() => handleAddSubtask(index)}>
                <LuPlus />
                添加子任务
              </Button>
            </VStack>
          </VStack>
        </Box>
      ))}
      <Button onClick={handleAddTemplate}>
        <LuPlus />
        添加模板
      </Button>
      </VStack>
      <Fieldset.ErrorText>{fieldErrors.pattern}</Fieldset.ErrorText>
    </Fieldset.Root>
  );
};

const EditTimelineField = ({ edit, setEdit, fieldErrors }: EditTimelineFieldProps) => {
  const handleTypeChange = (type: TimelineType) => {
    if (type === edit.type) return;
    setEdit(type === 'task' ? { title: edit.title, type } : createRecurrenceTimeline(edit.title));
  };

  const updateTitle = (title: string) => {
    setEdit(
      produce((draft) => {
        draft.title = title;
      }),
    );
  };

  const updateRecurrence = (updater: (draft: RecurrenceTimelineDraft) => void) => {
    setEdit(
      produce((draft) => {
        if (draft.type === 'recurrence') {
          updater(draft);
        }
      }),
    );
  };

  return (
    <>
      <Field.Root invalid={fieldErrors.title !== undefined}>
        <Field.Label>时间线名称</Field.Label>
        <Input placeholder="输入时间线名称" value={edit.title} onChange={(e) => updateTitle(e.target.value)} />
        <Field.ErrorText>{fieldErrors.title}</Field.ErrorText>
      </Field.Root>
      <RadioGroup.Root
        colorPalette="blue"
        value={edit.type}
        onValueChange={(e) => e.value && handleTypeChange(e.value as TimelineType)}
      >
        <Flex flexDir="column" gap={2}>
          <Text>时间线类型</Text>
          <HStack>
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
          </HStack>
        </Flex>
      </RadioGroup.Root>

      {edit.type === 'recurrence' && (
        <>
          <Field.Root invalid={fieldErrors.startDate !== undefined}>
            <Field.Label>开始日期</Field.Label>
            <Input
              type="date"
              value={dayjs(edit.startDate).format('YYYY-MM-DD')}
              onChange={(e) =>
                updateRecurrence((draft) => {
                  draft.startDate = dayjs(e.target.value).toDate();
                })
              }
            />
            <Field.ErrorText>{fieldErrors.startDate}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={fieldErrors.frequency !== undefined}>
            <Select.Root
              collection={frequencyCollection}
              value={[getFrequencyType(edit.frequency)]}
              onValueChange={(e) => {
                const frequency = e.value[0] as FrequencyType | undefined;
                if (!frequency) return;
                updateRecurrence((draft) => {
                  draft.frequency = createFrequency(frequency);
                });
              }}
            >
              <Select.HiddenSelect />
              <Select.Label>Select frequency</Select.Label>
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="Select frequency" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Select.Positioner>
                <Select.Content>
                  {frequencyCollection.items.map((frequency) => (
                    <Select.Item item={frequency} key={frequency.value}>
                      {frequency.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Select.Root>
            <Field.ErrorText>{fieldErrors.frequency}</Field.ErrorText>
          </Field.Root>
          <EditTaskTemplates edit={edit} setEdit={setEdit} fieldErrors={fieldErrors} />
        </>
      )}
    </>
  );
};

interface EditTimelineDialogProps {
  timeline?: TimelineFlat | null;
  disclosure: UseDialogReturn;
}

export const EditTimelineDialog = ({ timeline, disclosure }: EditTimelineDialogProps) => {
  const isEditMode = Boolean(timeline);
  const updateTimeline = useAppStore((s) => s.updateTimeline);
  const addTimeline = useAppStore((s) => s.addTimeline);
  const selectedGroupId = useAppStore((s) => s.selectedTimelineGroupId);

  const [edit, setEdit] = useState<TimelineDraft>(
    () =>
      structuredClone(timeline) ?? {
        title: '',
        type: 'task',
      },
  );
  const { fieldErrors, validate } = useZodFormValidation();

  const handleSubmit = () => {
    if (isEditMode) {
      const result = validate(TimelineFlatSchema, edit);
      if (!result.success) return;
      updateTimeline(result.data.id, () => result.data);
    } else {
      if (!selectedGroupId) return;
      const result = validate(TimelineDraftSchema, edit);
      if (!result.success) return;
      addTimeline(selectedGroupId, result.data);
    }
    disclosure.setOpen(false);
  };

  return (
    <FormDialogShell
      disclosure={disclosure}
      title={isEditMode ? '编辑时间线' : '创建时间线'}
      submitText={isEditMode ? '保存' : '创建'}
      onSubmit={handleSubmit}
      bodyProps={{ maxH: '60vh', overflowY: 'auto' }}
    >
      <EditTimelineField edit={edit} setEdit={setEdit} fieldErrors={fieldErrors} />
    </FormDialogShell>
  );
};
