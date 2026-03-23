import { Tooltip } from '@/components/ui/Tooltip';
import type { FieldErrors } from '@/utils/zodHelpers';
import {
  Accordion,
  Button,
  createListCollection,
  Field,
  Fieldset,
  IconButton,
  Input,
  Select,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react';
import type { Producer } from 'immer';
import { nanoid } from 'nanoid';
import { useState } from 'react';
import { LuPlus, LuTrash2 } from 'react-icons/lu';
import { MIN_TEMPLATES, type TaskPattern } from './helper';

interface EditTaskPatternProps {
  state: TaskPattern;
  onUpdate: (updater: Producer<TaskPattern>) => void;
  fieldErrors: FieldErrors;
}

export function EditTaskPattern({ state, onUpdate, fieldErrors }: EditTaskPatternProps) {
  const [expandedValue, setExpandedValue] = useState<string[]>(['template-0']);

  const updateTaskTemplates = (index: number, updater: Producer<TaskPattern['taskTemplates'][number]>) => {
    onUpdate((draft) => {
      const template = draft.taskTemplates.at(index);
      if (template) updater(template);
    });
  };

  const handleAddTemplate = () => {
    onUpdate((draft) => {
      draft.taskTemplates.push({
        title: '新任务模板',
        content: { description: '', subtasks: [] },
      });
    });
    setExpandedValue([`template-${state.taskTemplates.length}`]);
  };

  const handleRemoveTemplate = (index: number) => {
    if (state.taskTemplates.length <= MIN_TEMPLATES) return;
    onUpdate((draft) => {
      draft.taskTemplates.splice(index, 1);
      if (index < draft.currentIndex) {
        draft.currentIndex -= 1; // 删除了前面的项，游标前移
      } else if (index === draft.currentIndex) {
        draft.currentIndex = 0; // 删除了当前项，重置
      }
    });
    setExpandedValue([`template-${Math.max(0, state.taskTemplates.length - 2)}`]);
  };

  return (
    <Fieldset.Root invalid={fieldErrors.pattern !== undefined}>
      <Fieldset.Legend fontWeight="bold">任务模板</Fieldset.Legend>
      <Accordion.Root
        collapsible
        value={expandedValue}
        onValueChange={(e) => setExpandedValue(e.value)}
        mt={2}
        variant="enclosed"
        borderWidth="1px"
        borderRadius="md"
        bg="bg.panel"
        focusRing="none"
      >
        {state.taskTemplates.map((template, index) => (
          <Accordion.Item key={index} value={`template-${index}`}>
            <Accordion.ItemTrigger py={2}>
              <Text flex="1" textAlign="left" fontSize="md">
                {template.title || `模板 ${index + 1}`}
              </Text>
              <Tooltip content="至少需要保留一个任务模板" disabled={state.taskTemplates.length > MIN_TEMPLATES}>
                <IconButton
                  role="button"
                  as="span"
                  aria-label="删除模板"
                  size="sm"
                  variant="ghost"
                  colorPalette="red"
                  disabled={state.taskTemplates.length <= MIN_TEMPLATES}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveTemplate(index);
                  }}
                >
                  <LuTrash2 />
                </IconButton>
              </Tooltip>
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
                          onChange={(e) =>
                            updateTaskTemplates(index, (t) => {
                              const s = t.content.subtasks.at(subIndex);
                              s && (s.title = e.target.value);
                            })
                          }
                        />
                        <IconButton
                          aria-label="Remove subtask"
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            updateTaskTemplates(index, (t) => {
                              t.content.subtasks.splice(subIndex, 1);
                            })
                          }
                        >
                          <LuTrash2 />
                        </IconButton>
                      </Stack>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateTaskTemplates(index, (t) => {
                          t.content.subtasks.push({ title: '新子任务', done: false, id: nanoid() });
                        })
                      }
                    >
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
            items: state.taskTemplates.map((t, i) => ({
              label: t.title || `模板 ${i + 1}`,
              value: String(i),
            })),
          })}
          value={[String(state.currentIndex)]}
          onValueChange={(e) => {
            const index = parseInt(e.value[0] ?? '0', 10);
            onUpdate((draft) => {
              draft.currentIndex = index;
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
              {state.taskTemplates.map((t, i) => (
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
}
