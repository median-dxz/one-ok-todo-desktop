import type { RFNode } from '@/store/reactFlowObjects';
import type { DelimiterNode } from '@/types/timeline';
import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useAtomValue } from 'jotai';
import { LuCircleCheckBig, LuPlay } from 'react-icons/lu';

interface DelimiterProps {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  color: {
    iconBg: string;
    iconColor: string;
    textColor: string;
    labelColor: string;
    borderColor: string;
    hoverBg: string;
  };
  label: string;
}

const delimiterProps: Record<DelimiterNode['markerType'], DelimiterProps> = {
  start: {
    icon: LuPlay,
    color: {
      iconBg: 'blue.500',
      iconColor: 'white',
      textColor: 'blue.700',
      labelColor: 'gray.600',
      borderColor: 'blue.600',
      hoverBg: 'blue.100',
    },
    label: 'START',
  },
  end: {
    icon: LuCircleCheckBig,
    color: {
      iconBg: 'green.500',
      iconColor: 'white',
      textColor: 'green.700',
      labelColor: 'gray.600',
      borderColor: 'green.600',
      hoverBg: 'green.100',
    },
    label: 'FINISH',
  },
} as const;

export function DelimiterComponent({ data: node }: NodeProps<RFNode<DelimiterNode>>) {
  const theme = delimiterProps[node.markerType] ?? delimiterProps.start;
  const Icon = theme.icon;
  const timeline = useAtomValue(node.timelineAtom);

  return (
    <>
      {node.markerType !== 'start' && <Handle type="target" position={Position.Left} />}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minW="160px"
        h="4rem"
        borderRadius="lg"
        border="1px solid"
        borderColor={theme.color.borderColor}
        p={3}
        shadow="sm"
        _hover={{
          shadow: 'md',
          bg: theme.color.hoverBg,
        }}
        css={{ transition: 'background 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        <HStack gap={3} align="center">
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            w="40px"
            h="40px"
            borderRadius="full"
            bg={theme.color.iconBg}
            color={theme.color.iconColor}
            shadow="sm"
          >
            <Icon size={20} strokeWidth={2.5} />
          </Box>
          <VStack align="flex-start" gap={0.5}>
            <Text fontSize="xs" fontWeight="500" color={theme.color.labelColor} lineHeight="1">
              {theme.label}
            </Text>
            <Text
              fontSize="sm"
              fontWeight="600"
              color={theme.color.textColor}
              lineHeight="1.2"
              lineClamp={1}
              textOverflow="ellipsis"
              maxW="100px"
            >
              {timeline?.title || 'Timeline'}
            </Text>
          </VStack>
        </HStack>
      </Box>
      {node.markerType === 'start' && <Handle type="source" position={Position.Right} />}
    </>
  );
}
