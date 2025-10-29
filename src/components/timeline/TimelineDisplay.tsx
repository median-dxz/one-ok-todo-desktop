import { Flex, Heading } from '@chakra-ui/react';
import type { NodeMouseHandler } from '@xyflow/react';
import { Controls, MiniMap, ReactFlow } from '@xyflow/react';
import { useAtomValue } from 'jotai';
import { useMemo, useState } from 'react';

import '@xyflow/react/dist/style.css';

import { useTimelineGroupAtom } from '@/store/timelineGroup';
import { EmptyTimelineGroupScreen } from './EmptyTimelineGroupScreen';
import { EmptyTimelineScreen } from './EmptyTimelineScreen';
import { RightSidebar } from './RightSidebar';
import { TimelineChat } from './TimelineChat';
import { TaskNodeComponent } from './TaskNodeComponent';
import { DelimiterComponent } from './DelimiterComponent';
import { createReactFlowObjects } from './createReactFlowObjects';

interface TimelineDisplayProps {
  timelineGroupId: string | null;
}

export function TimelineDisplay({ timelineGroupId }: TimelineDisplayProps) {
  const groupAtom = useTimelineGroupAtom(timelineGroupId);
  const group = useAtomValue(groupAtom);

  const { nodes, edges } = useMemo(() => (group ? createReactFlowObjects(group) : { nodes: [], edges: [] }), [group]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const onNodeClick: NodeMouseHandler = (_evt, node) => {
    setSelectedNodeId(node.id);
  };

  const onCloseSidebar = () => {
    setSelectedNodeId(null);
  };

  if (group == null) {
    return <EmptyTimelineGroupScreen />;
  }

  if (group.timelines.length === 0) {
    return <EmptyTimelineScreen groupId={group.id} />;
  }

  return (
    <Flex h="100%" p={2} gap={4}>
      <Flex
        id="timeline-container"
        css={{
          flex: 1,
          position: 'relative',
          h: '100%',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 4,
        }}
      >
        <Heading
          size="lg"
          css={{
            p: 4,
            bg: 'white',
            rounded: 'lg',
            shadow: 'lg',
          }}
        >
          {group.title}
        </Heading>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={{
            task: TaskNodeComponent,
            delimiter: DelimiterComponent,
          }}
          onNodeClick={onNodeClick}
          fitView
        >
          <Controls />
          <MiniMap />
        </ReactFlow>
        <TimelineChat timelineGroupId={group.id} />
      </Flex>
      <RightSidebar selectedNodeId={selectedNodeId} onClose={onCloseSidebar} />
    </Flex>
  );
}
