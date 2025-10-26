import { completeRecurrenceInstanceAtom } from '@/store/actions/timelineActions';
import { selectedNodeIdAtom, timelineGroupsAtom } from '@/store/timelineGroups';
import type { Timeline, TaskTimelineNode } from '@/types/timeline';
import { generateRecurrenceInstances } from '@/utils/recurrenceLogic';
import { Box, Flex, VisuallyHidden } from '@chakra-ui/react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import type { Stage as StageType } from 'konva/lib/Stage';
import { Fragment, useLayoutEffect, useRef, useState } from 'react';
import { Circle, Group, Layer, Path, Stage, Text } from 'react-konva';
import { RightSidebar } from './RightSidebar';

// Pattern colors for different statuses
const STATUS_COLORS = {
  done: '#107c41', // Green
  doing: '#0078d4', // Blue
  lock: '#d83b01', // Orange/Red
  todo: '#605e5c', // Neutral Gray
};

const NodeComponent = ({ node, x, y }: { node: TaskTimelineNode; x: number; y: number }) => {
  const [isHovered, setIsHovered] = useState(false);
  const selectedNodeId = useAtomValue(selectedNodeIdAtom);
  const isSelected = selectedNodeId === node.id;

  const radius = 14; // Increased radius
  const hitRadius = 24; // Larger radius for click/hover area
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
      {/* Invisible hit area */}
      <Circle radius={hitRadius} fill="transparent" />

      {/* Selection and Hover Indicator */}
      {(isSelected || isHovered) && (
        <Circle radius={isSelected ? radius + 4 : radius + 2} fill={color} opacity={isSelected ? 0.4 : 0.2} />
      )}

      {/* Main Node Circle */}
      <Circle radius={radius} fill={color} />
      {node.status === 'doing' && <Circle radius={radius - 4} fill="white" />}

      {/* Node Title */}
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

const renderIntraTimelineDependencies = (timeline: Timeline, nodePositions: Map<string, { x: number; y: number }>) => {
  return (
    timeline.dependencies
      ?.map((dep) => {
        const fromPos = nodePositions.get(dep.from as string);
        const toPos = nodePositions.get(dep.to as string);

        if (fromPos && toPos) {
          const startX = fromPos.x;
          const startY = fromPos.y;
          const endX = toPos.x;
          const endY = toPos.y;
          const midX = startX + (endX - startX) / 2;

          const pathData = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

          return <Path key={dep.id} data={pathData} stroke={STATUS_COLORS.done} strokeWidth={2.5} lineCap="round" />;
        }
        return null;
      })
      .filter(Boolean) ?? []
  );
};

const renderInterTimelineDependencies = (
  allTimelines: Timeline[],
  nodePositions: Map<string, { x: number; y: number }>,
  timelineEndPositions: Map<string, { x: number; y: number }>,
) => {
  const lines: Array<React.ReactElement> = [];
  allTimelines.forEach((timeline) => {
    timeline.nodes.forEach((node) => {
      if (node.depends_on_timeline) {
        node.depends_on_timeline.forEach((depTimelineId) => {
          const fromPos = timelineEndPositions.get(depTimelineId);
          const toPos = nodePositions.get(node.id);

          if (fromPos && toPos) {
            const startX = fromPos.x;
            const startY = fromPos.y;
            const endX = toPos.x;
            const endY = toPos.y;
            const midY = startY + (endY - startY) / 2;

            const pathData = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
            lines.push(
              <Path
                key={`${depTimelineId}-${node.id}`}
                data={pathData}
                stroke={STATUS_COLORS.lock}
                strokeWidth={2.5}
                lineCap="round"
                dash={[10, 5]}
              />,
            );
          }
        });
      }
    });
  });
  return lines;
};

export function TimelineDisplay() {
  const timelineGroups = useAtomValue(timelineGroupsAtom);
  const [selectedNodeId, setSelectedNodeId] = useAtom(selectedNodeIdAtom);
  const completeRecurrenceInstance = useSetAtom(completeRecurrenceInstanceAtom);

  // Layout parameters
  const nodeHorizontalGap = 200;
  const timelineVerticalGap = 70;
  const groupVerticalGap = 50;
  const startX = 60;

  const nodePositions = new Map<string, { x: number; y: number }>();
  const timelineEndPositions = new Map<string, { x: number; y: number }>();
  let currentY = 40;

  const allTimelines = timelineGroups.flatMap((g) => g.timelines);

  // Pre-calculate all node and timeline end positions
  timelineGroups.forEach((group) => {
    currentY += groupVerticalGap;
    group.timelines.forEach((timeline) => {
      timeline.nodes.forEach((node, nodeIndex) => {
        const x = startX + nodeIndex * nodeHorizontalGap;
        const y = currentY;
        nodePositions.set(node.id, { x, y });

        if (nodeIndex === timeline.nodes.length - 1) {
          timelineEndPositions.set(timeline.id, { x, y });
        }
      });
      currentY += timelineVerticalGap;
    });
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<StageType>(null);
  let stage = (
    <Stage ref={stageRef} draggable>
      <Layer>
        {timelineGroups.map((group) => (
          <Group key={group.id}>
            <Text
              text={group.title}
              fontSize={20}
              fontStyle="bold"
              y={(nodePositions.get(group.timelines[0]?.nodes[0]?.id)?.y ?? 0) - 60}
              x={startX - 30}
              fill="#333"
              fontFamily="Segoe UI, sans-serif"
            />
            {group.timelines.map((timeline) => (
              <Group key={timeline.id}>
                <Text
                  text={timeline.title}
                  fontSize={16}
                  y={(nodePositions.get(timeline.nodes[0]?.id)?.y ?? 0) - 35}
                  x={startX - 15}
                  fill="#555"
                  fontFamily="Segoe UI, sans-serif"
                />
                {renderIntraTimelineDependencies(timeline, nodePositions)}
                {timeline.recurrence
                  ? generateRecurrenceInstances(
                      timeline,
                      new Date(),
                      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    ).map((instance, index) => {
                      const pos = {
                        x: startX + index * nodeHorizontalGap,
                        y: nodePositions.get(timeline.nodes[0]?.id)?.y || currentY,
                      };
                      return (
                        <Group
                          key={instance.id}
                          onClick={() =>
                            completeRecurrenceInstance({
                              timelineId: instance.timelineId,
                              instanceDate: instance.scheduledDate,
                            })
                          }
                          onTap={() =>
                            completeRecurrenceInstance({
                              timelineId: instance.timelineId,
                              instanceDate: instance.scheduledDate,
                            })
                          }
                        >
                          <NodeComponent
                            node={
                              {
                                ...instance,
                                title: instance.taskTitle,
                                type: 'task',
                              } as any
                            }
                            x={pos.x}
                            y={pos.y}
                          />
                        </Group>
                      );
                    })
                  : timeline.nodes.map((node) => {
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
            ))}
          </Group>
        ))}
        {renderInterTimelineDependencies(allTimelines, nodePositions, timelineEndPositions)}
      </Layer>
    </Stage>
  );

  const handleResize = () => {
    if (
      containerRef.current &&
      stageRef.current &&
      containerRef.current.clientWidth > 100 &&
      containerRef.current.clientHeight > 50
    ) {
      stageRef.current.width(containerRef.current?.clientWidth);
      stageRef.current.height(containerRef.current?.clientHeight);
    }
  };

  useLayoutEffect(() => {
    handleResize();
  });

  return (
    <Flex height="100%" width="100%">
      <Box
        id="timeline-container"
        ref={containerRef}
        css={{
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        {stage}
      </Box>

      <RightSidebar />
    </Flex>
  );
}
