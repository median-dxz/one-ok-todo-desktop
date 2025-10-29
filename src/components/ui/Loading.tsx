import { AbsoluteCenter, Box, Spinner, type BoxProps } from '@chakra-ui/react';

interface LoadingProps extends Omit<BoxProps, 'overlay'> {
  /** Loading 文本 */
  text?: string;
  /** Spinner 大小 */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** 是否全屏覆盖 */
  withOverlay?: boolean;
}

export const Loading = ({ text, size = 'md', withOverlay = false, ...props }: LoadingProps) => {
  const content = (
    <Box display="flex" flexDirection="column" alignItems="center" gap={3} {...props}>
      <Spinner size={size} color="teal.500" />
      {text && (
        <Box color="fg.muted" fontSize="sm">
          {text}
        </Box>
      )}
    </Box>
  );

  if (withOverlay) {
    return (
      <Box pos="absolute" inset="0" bg="bg/80" backdropFilter="blur(2px)">
        <AbsoluteCenter>{content}</AbsoluteCenter>
      </Box>
    );
  }

  return content;
};
