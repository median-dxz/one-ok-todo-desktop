import { FormDialogShell } from '@/components/ui/FormDialogShell';
import { useZodFormValidation } from '@/hooks/useZodFormValidation';
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
import {
  Accordion,
  Button,
  createListCollection,
  Field,
  Fieldset,
  IconButton,
  Input,
  RadioGroup,
  Select,
  Stack,
  Text,
  Textarea,
  type UseDialogReturn,
} from '@chakra-ui/react';
import dayjs from 'dayjs';
import { produce } from 'immer';
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
      if (draft.pattern.currentIndex >= draft.pattern.taskTemplates.length) {
        draft.pattern.currentIndex = Math.max(0, draft.pattern.taskTemplates.length - 1);
      }
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
      <Fieldset.Legend fontWeight="bold">任务模板</Fieldset.Legend>
      <Accordion.Root
        collapsible
        defaultValue={[`template-0`]}
        mt={2}
        variant="enclosed"
        borderWidth="1px"
        borderRadius="md"
        bg="bg.panel"
        focusRing="none"
      >
        {edit.pattern.taskTemplates.map((template, index) => (
          <Accordion.Item key={index} value={`template-${index}`}>
            <Accordion.ItemTrigger py={2}>
              <Text flex="1" textAlign="left" fontSize="md">
                {template.title || `模板 ${index + 1}`}
              </Text>
              <IconButton
                role="button"
                as="span"
                aria-label="删除模板"
                size="sm"
                variant="ghost"
                colorPalette="red"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveTemplate(index);
                }}
              >
                <LuTrash2 />
              </IconButton>
              <Accordion.ItemIndicator />
            </Accordion.ItemTrigger>
            <Accordion.ItemContent>
              <Accordion.ItemBody pt={1} pb={3}>
                <Stack gap={3} align="stretch">
                  <Field.Root>
                    <Field.Label>标题</Field.Label>
                    <Input
                      size="sm"
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
                      size="sm"
                      value={template.content.description}
                      onChange={(e) =>
                        updateTaskTemplates(index, (t) => {
                          t.content.description = e.target.value;
                        })
                      }
                    />
                  </Field.Root>
                  <Stack gap={2} align="stretch">
                    <Text fontSize="sm" fontWeight="medium">
                      子任务
                    </Text>
                    {template.content.subtasks.map((subtask, subIndex) => (
                      <Stack direction="row" key={subtask.id}>
                        <Input
                          size="sm"
                          value={subtask.title}
                          onChange={(e) => handleSubtaskChange(index, subIndex, e.target.value)}
                        />
                        <IconButton
                          aria-label="Remove subtask"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveSubtask(index, subIndex)}
                        >
                          <LuTrash2 />
                        </IconButton>
                      </Stack>
                    ))}
                    <Button size="sm" variant="outline" onClick={() => handleAddSubtask(index)}>
                      <LuPlus />
                      添加子任务
                    </Button>
                  </Stack>
                </Stack>
              </Accordion.ItemBody>
            </Accordion.ItemContent>
          </Accordion.Item>
        ))}
      </Accordion.Root>
      <Field.Root mt={2}>
        <Select.Root
          collection={createListCollection({
            items: edit.pattern.taskTemplates.map((t, i) => ({
              label: t.title || `模板 ${i + 1}`,
              value: String(i),
            })),
          })}
          value={[String(edit.pattern.currentIndex)]}
          onValueChange={(e) => {
            const index = parseInt(e.value[0] ?? '0', 10);
            updateRecurrence((draft) => {
              draft.pattern.currentIndex = index;
            });
          }}
        >
          <Select.HiddenSelect />
          <Select.Label fontWeight="bold">起始任务</Select.Label>
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="选择起始任务" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Select.Positioner>
            <Select.Content>
              {edit.pattern.taskTemplates.map((t, i) => (
                <Select.Item key={i} item={{ label: t.title || `模板 ${i + 1}`, value: String(i) }}>
                  {t.title || `模板 ${i + 1}`}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
      </Field.Root>
      <Button onClick={handleAddTemplate} mt={2}>
        <LuPlus />
        添加模板
      </Button>
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
    <Stack align="stretch" gap={4} p={2}>
      <Field.Root invalid={fieldErrors.title !== undefined}>
        <Field.Label fontWeight="bold">时间线名称</Field.Label>
        <Input placeholder="输入时间线名称" value={edit.title} onChange={(e) => updateTitle(e.target.value)} />
        <Field.ErrorText>{fieldErrors.title}</Field.ErrorText>
      </Field.Root>
      <RadioGroup.Root
        colorPalette="blue"
        value={edit.type}
        onValueChange={(e) => e.value && handleTypeChange(e.value as TimelineType)}
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

      {edit.type === 'recurrence' && (
        <>
          <Field.Root invalid={fieldErrors.startDate !== undefined}>
            <Field.Label fontWeight="bold">开始日期</Field.Label>
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
    </Stack>
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
    >
      <EditTimelineField key={edit.type} edit={edit} setEdit={setEdit} fieldErrors={fieldErrors} />
    </FormDialogShell>
  );
};
