import { Flex, Heading } from '@chakra-ui/react';
import type { NodeMouseHandler } from '@xyflow/react';
import { Panel, ReactFlow } from '@xyflow/react';
import { useAtomValue } from 'jotai';
import { useState } from 'react';

import '@xyflow/react/dist/style.css';

import { reactFlowObjectsAtom, type RFNode } from '@/store/reactFlowObjects';
import { selectedTLGroupValueAtom } from '@/store/timelineGroup';
import type { TimelineNode } from '@/types/timeline';
import { DelimiterComponent } from './DelimiterComponent';
import { EmptyTimelineGroupScreen } from './EmptyTimelineGroupScreen';
import { EmptyTimelineScreen } from './EmptyTimelineScreen';
import { RightSidebar } from './RightSidebar';
import { TaskNodeComponent } from './TaskNodeComponent';
import { TimelineChat } from './TimelineChat';

export function TimelineDisplay() {
  const group = useAtomValue(selectedTLGroupValueAtom);

  const { nodes, edges } = useAtomValue(reactFlowObjectsAtom);

  const [selectedNode, setSelectedNode] = useState<RFNode<TimelineNode> | null>(null);

  const onNodeClick: NodeMouseHandler<RFNode<TimelineNode>> = (_evt, node) => {
    setSelectedNode(node);
  };

  const handleCloseSidebar = () => {
    setSelectedNode(null);
  };

  if (group == null) {
    return <EmptyTimelineGroupScreen />;
  }

  if (group.timelines.length === 0) {
    return <EmptyTimelineScreen />;
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
          <Panel position="bottom-center">
            <TimelineChat />
          </Panel>
        </ReactFlow>
      </Flex>
      <RightSidebar node={selectedNode} onClose={handleCloseSidebar} />
    </Flex>
  );
}
