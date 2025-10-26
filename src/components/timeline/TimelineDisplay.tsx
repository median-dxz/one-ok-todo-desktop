import { Box, Button, Center, Flex, Heading, useDialog, VStack } from '@chakra-ui/react';
import { useAtom, useSetAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { Circle, Group, Layer, Path, Stage, Text } from 'react-konva';
import { nanoid } from 'nanoid';

import { FiCalendar } from 'react-icons/fi';
import { LuPlus } from 'react-icons/lu';

import { completeRecurrenceInstanceAtom } from '@/store/actions/timelineActions';
import { selectedNodeIdAtom } from '@/store/timelineGroups';
import type { TaskNode, Timeline, TimelineGroup } from '@/types/timeline';
import { generateRecurrenceInstances } from '@/utils/recurrenceLogic';

import { NewTimelineGroupDialog } from './NewTimelineGroupDialog';
import { RightSidebar } from './RightSidebar';

// Pattern colors for different statuses
const STATUS_COLORS = {
  done: '#107c41', // Green
  lock: '#d83b01', // Orange/Red
  todo: '#605e5c', // Neutral Gray
  skipped: '#7a7573', // Lighter Gray
};

const NodeComponent = ({ node, x, y }: { node: TaskNode; x: number; y: number }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedNodeId] = useAtom(selectedNodeIdAtom);
  const isSelected = selectedNodeId === node.id;

  const radius = 14;
  const hitRadius = 24;
  const color = STATUS_COLORS[node.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.todo;

  return (
    <Group
      x={x}
      y={y}
      onMouseEnter={(e) => {
        setIsHovered(true);
        const stage = e.target.getStage();
        if (stage) {
          stage.container().style.cursor = 'pointer';
        }
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        const stage = e.target.getStage();
        if (stage) {
          stage.container().style.cursor = 'default';
        }
      }}
    >
      <Circle radius={hitRadius} fill="transparent" />
      {(isSelected || isHovered) && (
        <Circle radius={isSelected ? radius + 4 : radius + 2} fill={color} opacity={isSelected ? 0.4 : 0.2} />
      )}
      <Circle radius={radius} fill={color} />
      {node.milestone && <Circle radius={radius - 4} fill="white" />}
      <Text
        text={node.title}
        x={radius + 12}
        y={-radius / 2 - 2}
        fontSize={16}
        fill="#333"
        fontFamily="Segoe UI, sans-serif"
        verticalAlign="middle"
      />
    </Group>
  );
};

const renderDependencies = (timelines: Timeline[], nodePositions: Map<string, { x: number; y: number }>) => {
  const lines: Array<React.ReactElement> = [];
  const allNodes = timelines.flatMap((t) => ('nodes' in t ? t.nodes : []));

  allNodes.forEach((node) => {
    node.succs.forEach((succId) => {
      const fromPos = nodePositions.get(node.id);
      const toPos = nodePositions.get(succId);

      if (fromPos && toPos) {
        const startX = fromPos.x;
        const startY = fromPos.y;
        const endX = toPos.x;
        const endY = toPos.y;
        const midX = startX + (endX - startX) / 2;

        const pathData = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
        lines.push(
          <Path
            key={`${node.id}-${succId}`}
            data={pathData}
            stroke={STATUS_COLORS.done}
            strokeWidth={2.5}
            lineCap="round"
          />,
        );
      }
    });
  });
  return lines;
};

interface TimelineDisplayProps {
  timelineGroup: TimelineGroup | null;
}

const EmptyScreen = () => {
  const newTimelineGroupDialog = useDialog();

  return (
    <Center h="100%">
      <VStack gap={4} textAlign="center">
        <Box as="span" color="gray.500">
          <FiCalendar size={48} />
        </Box>
        <Heading size="md">尚未选择时间线</Heading>
        <Box color="gray.500">请在左侧选择一个时间线，或创建新的时间线开始添加任务。</Box>
        <Button colorPalette="blue" variant="solid" size="sm" onClick={() => newTimelineGroupDialog.setOpen(true)}>
          <LuPlus />
          新建
        </Button>
        <NewTimelineGroupDialog control={newTimelineGroupDialog} />
      </VStack>
    </Center>
  );
};

export function TimelineDisplay({ timelineGroup }: TimelineDisplayProps) {
  if (timelineGroup == null) {
    return <EmptyScreen />;
  }

  const setSelectedNodeId = useSetAtom(selectedNodeIdAtom);
  const completeRecurrenceInstance = useSetAtom(completeRecurrenceInstanceAtom);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  const nodeHorizontalGap = 200;
  const timelineVerticalGap = 70;

  const startX = 60;

  const nodePositions = new Map<string, { x: number; y: number }>();
  let currentY = 40;

  timelineGroup.timelines.forEach((timeline: Timeline) => {
    if ('nodes' in timeline) {
      timeline.nodes.forEach((node: TaskNode, nodeIndex: number) => {
        const x = startX + nodeIndex * nodeHorizontalGap;
        const y = currentY;
        nodePositions.set(node.id, { x, y });
      });
    }
    currentY += timelineVerticalGap;
  });

  const { timelines } = timelineGroup;

  const containerRef = useRef<HTMLDivElement>(null);

  const layer = (
    <Layer>
      {timelines.map((timeline: Timeline) => {
        const firstNodeId = 'nodes' in timeline ? timeline.nodes[0]?.id : undefined;
        return (
          <Group key={timeline.id}>
            <Text
              text={timeline.title}
              fontSize={16}
              y={(nodePositions.get(firstNodeId ?? '')?.y ?? 0) - 35}
              x={startX - 15}
              fill="#555"
            />
            {timeline.type === 'recurrence-timeline'
              ? generateRecurrenceInstances(timeline, new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).map(
                  (instance, index) => {
                    const yPos = nodePositions.get(timeline.id)?.y || currentY;
                    const xPos = startX + index * nodeHorizontalGap;
                    const id = nanoid();
                    const nodeForRender: TaskNode = {
                      id,
                      title: instance.taskTitle,
                      status: instance.status,
                      type: 'task',
                      prevs: [],
                      succs: [],
                    };
                    return (
                      <Group
                        key={id}
                        onClick={() =>
                          completeRecurrenceInstance({
                            timelineId: timeline.id,
                            instanceDate: instance.scheduledDate,
                          })
                        }
                      >
                        <NodeComponent node={nodeForRender} x={xPos} y={yPos} />
                      </Group>
                    );
                  },
                )
              : timeline.nodes.map((node: TaskNode) => {
                  const pos = nodePositions.get(node.id);
                  if (!pos) return null;
                  return (
                    <Group
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      onTap={() => setSelectedNodeId(node.id)}
                    >
                      <NodeComponent node={node} x={pos.x} y={pos.y} />
                    </Group>
                  );
                })}
          </Group>
        );
      })}
      {renderDependencies(timelines, nodePositions)}
    </Layer>
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    setStageSize({ width: rect.width, height: rect.height });

    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setStageSize({ width: r.width, height: r.height });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <Flex h="100%">
      <Box
        id="timeline-container"
        ref={containerRef}
        css={{
          flex: 1,
          position: 'relative',
          h: '100%',
          overflow: 'hidden',
          minW: 0,
        }}
      >
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'block',
          }}
          draggable
        >
          {layer}
        </Stage>
      </Box>
      <RightSidebar />
    </Flex>
  );
}
