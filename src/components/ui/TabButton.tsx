import { Box, Button, type ButtonProps } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { useMemo } from 'react';
import { viewAtom, type ViewType } from '../../store/appAtom';

export const TabButton = ({
  view,
  onClick: handleClick,
  children,
  ...buttonProps
}: {
  view: ViewType;
} & ButtonProps) => {
  const [currentView, setView] = useAtom(viewAtom);

  const buttonStyles = useMemo(
    () =>
      ({
        colorPalette: currentView === view ? 'blue' : 'gray',
        onClick: (e) => {
          handleClick?.(e);
          setView(view);
        },
        width: '100%',
        gap: 2,
        justifyContent: 'flex-start',
        variant: currentView === view ? 'subtle' : 'ghost',
      }) satisfies Partial<ButtonProps>,
    [currentView, view, setView, handleClick],
  );

  const selected = view === currentView;

  return (
    <Box position="relative">
      {selected ? (
        <Box
          css={{
            bgColor: 'blue.500/75',
            position: 'absolute',
            left: '-0.125rem',
            height: '75%',
            width: '0.25rem',
            rounded: 'md',
            transform: 'translateY(12.5%)',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        />
      ) : null}
      <Button {...buttonStyles} {...buttonProps}>
        {children}
      </Button>
    </Box>
  );
};
