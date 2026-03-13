import type { UseDialogReturn } from '@chakra-ui/react';
import { Dialog, Portal, Button } from '@chakra-ui/react';

export const UniversalErrorDialog = ({ disclosure, message }: { disclosure: UseDialogReturn; message: string }) => (
  <Dialog.RootProvider value={disclosure}>
    <Portal>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>错误</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>{ message }</Dialog.Body>
          <Dialog.Footer>
            <Dialog.ActionTrigger asChild>
              <Button variant="outline">关闭</Button>
            </Dialog.ActionTrigger>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  </Dialog.RootProvider>
);
