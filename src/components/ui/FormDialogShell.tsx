import type { FlexProps, UseDialogReturn } from '@chakra-ui/react';
import { Button, Dialog, Flex, Portal } from '@chakra-ui/react';

interface FormDialogShellProps {
  disclosure: UseDialogReturn;
  title: string;
  submitText: string;
  onSubmit: () => void;
  children: React.ReactNode;
  bodyProps?: Omit<FlexProps, 'flexDir' | 'gap'>;
  /** 传递给 Dialog.Content 的额外 props，如 data-testid */
  contentProps?: Record<string, string>;
}

export const FormDialogShell = ({
  disclosure,
  title,
  submitText,
  onSubmit,
  children,
  bodyProps,
  contentProps,
}: FormDialogShellProps) => (
  <Dialog.RootProvider value={disclosure}>
    <Portal>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content {...contentProps}>
          <Dialog.Header>
            <Dialog.Title>{title}</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Flex flexDir="column" gap={4} {...bodyProps}>
              {children}
            </Flex>
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.ActionTrigger asChild>
              <Button variant="outline">取消</Button>
            </Dialog.ActionTrigger>
            <Button onClick={onSubmit}>{submitText}</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  </Dialog.RootProvider>
);
