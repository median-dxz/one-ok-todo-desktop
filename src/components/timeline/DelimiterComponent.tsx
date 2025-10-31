import type { RFNode } from '@/store/reactFlowObjects';
import { timelineAtomsAtom } from '@/store/timeline';
import type { DelimiterNode } from '@/types/timeline';
import { Box, Text } from '@chakra-ui/react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useAtomValue } from 'jotai';

// 从上下文获得时间线atoms
// 找到自己的那个atom并缓存
// 读取value

export function DelimiterComponent({ data: node }: NodeProps<RFNode<DelimiterNode>>) {
  const isStart = node.markerType === 'start';

  const timelineAtoms = useAtomValue(timelineAtomsAtom);

  return (
    <>
      {!isStart && <Handle type="target" position={Position.Left} />}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        w="120px"
        h="60px"
        borderRadius="md"
        bg={isStart ? 'green.100' : 'red.100'}
        border="2px dashed"
        borderColor={isStart ? 'green.500' : 'red.500'}
        p={2}
      >
        <Text fontSize="sm" fontWeight="bold" color={isStart ? 'green.700' : 'red.700'}>
          {`${1} ${isStart ? '开始' : '结束'}`}
        </Text>
      </Box>
      {isStart && <Handle type="source" position={Position.Right} />}
    </>
  );
}
