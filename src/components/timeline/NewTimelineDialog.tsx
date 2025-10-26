import {
  Button,
  Dialog,
  Field,
  Input,
  Portal,
} from '@chakra-ui/react';
import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { addTimelineAtom } from '@/store/actions/timelineActions';
import { LuPlus } from 'react-icons/lu';

interface NewTimelineDialogProps {
  groupId: string;
}

export const NewTimelineDialog = ({ groupId }: NewTimelineDialogProps) => {
  const [title, setTitle] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const addTimeline = useSetAtom(addTimelineAtom);

  const handleCreate = () => {
    if (title.trim()) {
      addTimeline({ groupId, title });
      setTitle('');
      setIsOpen(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
      <Dialog.Trigger asChild>
        <Button size="sm" variant="outline">
          <LuPlus />
          New Timeline
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Create New Timeline</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Field.Root>
                <Field.Label>Timeline Title</Field.Label>
                <Input
                  placeholder="Enter timeline title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Field.Root>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.CloseTrigger>
              <Button onClick={handleCreate} disabled={!title.trim()}>
                Create
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
