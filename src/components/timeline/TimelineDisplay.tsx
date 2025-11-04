import { Editable, Flex, Heading, IconButton } from '@chakra-ui/react';
import type { NodeMouseHandler } from '@xyflow/react';
import { Controls, Panel, ReactFlow } from '@xyflow/react';
import { useState } from 'react';
import { LuCheck, LuPencilLine, LuX } from 'react-icons/lu';

import '@xyflow/react/dist/style.css';

import { useAppStore } from '@/store';
import { reactFlowSelector, useReactFlowStore } from '@/store/reactFlowStore';
import type { TimelineNode } from '@/types/timeline';
import type { RFNode } from '@/utils/reactFlowObjects';
import { DelimiterComponent } from './DelimiterComponent';
import { EmptyTimelineGroupScreen } from './EmptyTimelineGroupScreen';
import { EmptyTimelineScreen } from './EmptyTimelineScreen';
import { RightSidebar } from './RightPanel';
import { TaskNodeComponent } from './TaskNodeComponent';
import { TimelineChat } from './TimelineChat';
import { useShallow } from 'zustand/react/shallow';
import { selectTimelineGroupById } from '@/store/timelineSlice';

export function TimelineDisplay() {
  const groupId = useAppStore((state) => state.selectedTimelineGroupId);
  const group = useAppStore(selectTimelineGroupById(groupId));
  const updateTimelineGroup = useAppStore((state) => state.updateTimelineGroup);
  const { nodes, edges, onNodesChange, onEdgesChange } = useReactFlowStore(useShallow(reactFlowSelector));

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const onNodeClick: NodeMouseHandler<RFNode<TimelineNode>> = (_evt, node) => {
    setSelectedNodeId(node.id);
    console.log('Node clicked:', node);
  };

  const handleCloseSidebar = () => {
    setSelectedNodeId(null);
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
        <Editable.Root
          activationMode="dblclick"
          value={group.title}
          onValueCommit={(details) => {
            updateTimelineGroup(group.id, (draft) => {
              draft.title = details.value;
            });
          }}
          css={{
            px: 4,
            py: 2,
            bg: 'white',
            rounded: 'lg',
            boxShadow: 'md',
            w: 'unset',
          }}
        >
          <Editable.Preview>
            <Heading>{group.title}</Heading>
          </Editable.Preview>
          <Editable.Input />
          <Editable.Control>
            <Editable.EditTrigger asChild>
              <IconButton variant="ghost" size="xs">
                <LuPencilLine />
              </IconButton>
            </Editable.EditTrigger>
            <Editable.CancelTrigger asChild>
              <IconButton variant="outline" size="xs">
                <LuX />
              </IconButton>
            </Editable.CancelTrigger>
            <Editable.SubmitTrigger asChild>
              <IconButton variant="outline" size="xs">
                <LuCheck />
              </IconButton>
            </Editable.SubmitTrigger>
          </Editable.Control>
        </Editable.Root>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={{
            task: TaskNodeComponent,
            delimiter: DelimiterComponent,
          }}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          panOnDrag={[1, 2]}
        >
          <Panel position="bottom-center">
            <TimelineChat />
          </Panel>
          <Controls style={{ zIndex: 10 }} position="bottom-right" />
        </ReactFlow>
      </Flex>
      <RightSidebar nodeId={selectedNodeId} onClose={handleCloseSidebar} />
    </Flex>
  );
}
