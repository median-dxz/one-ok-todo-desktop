import type { RFNode } from '@/store/reactFlowObjects';
import type { TaskNode } from '@/types/timeline';
import { Box, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { LuCircle, LuCircleCheckBig, LuLock, LuSkipForward, LuStar } from 'react-icons/lu';

interface TaskNodePropsConfig {
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
  textDecoration?: string;
  opacity?: number;
}

const taskNodeProps: Record<TaskNode['status'], TaskNodePropsConfig> = {
  todo: {
    icon: LuCircle,
    color: {
      iconBg: 'gray.100',
      iconColor: 'gray.600',
      textColor: 'gray.800',
      labelColor: 'gray.500',
      borderColor: 'gray.300',
      hoverBg: 'gray.50',
    },
    label: 'TODO',
  },
  done: {
    icon: LuCircleCheckBig,
    color: {
      iconBg: 'green.500',
      iconColor: 'white',
      textColor: 'green.700',
      labelColor: 'gray.500',
      borderColor: 'green.500',
      hoverBg: 'green.50',
    },
    label: 'DONE',
    textDecoration: 'line-through',
  },
  skipped: {
    icon: LuSkipForward,
    color: {
      iconBg: 'orange.400',
      iconColor: 'white',
      textColor: 'orange.700',
      labelColor: 'gray.500',
      borderColor: 'orange.400',
      hoverBg: 'orange.50',
    },
    label: 'SKIPPED',
  },
  lock: {
    icon: LuLock,
    color: {
      iconBg: 'gray.300',
      iconColor: 'white',
      textColor: 'gray.500',
      labelColor: 'gray.400',
      borderColor: 'gray.300',
      hoverBg: 'gray.100',
    },
    label: 'LOCKED',
    opacity: 0.7,
  },
} as const;

export function TaskNodeComponent({ data: node }: NodeProps<RFNode<TaskNode>>) {
  const theme = taskNodeProps[node.status] ?? taskNodeProps.todo;
  const IconComp = theme.icon;

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <Box
        display="flex"
        alignItems="center"
        minW="180px"
        h="4rem"
        borderRadius="lg"
        border="1px solid"
        borderColor={theme.color.borderColor}
        p={3}
        shadow="sm"
        bg="white"
        position="relative"
        overflow="hidden"
        _hover={{
          shadow: 'md',
          bg: theme.color.hoverBg,
        }}
        css={{
          transition: 'background 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {node.milestone && (
          <Box
            position="absolute"
            top={-1}
            right={-1}
            w="24px"
            h="24px"
            bg="yellow.400"
            clipPath="polygon(100% 0, 0 0, 100% 100%)"
          >
            <Icon as={LuStar} color="white" position="absolute" top="2px" right="2px" boxSize="10px" fill="white" />
          </Box>
        )}

        <HStack gap={3} align="center" opacity={theme.opacity ?? 1}>
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
            <IconComp size={20} strokeWidth={2.5} />
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
              textDecoration={theme.textDecoration}
              textOverflow="ellipsis"
              maxW="100px"
            >
              {node.title}
            </Text>
          </VStack>
        </HStack>
      </Box>
      <Handle type="source" position={Position.Right} />
    </>
  );
}
