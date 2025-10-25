import { HStack, Checkbox } from '@chakra-ui/react';

import type { FC } from 'react';
import type { SubTask } from '@/types/timeline';

interface SubTaskProps {
  subtask: SubTask;
}

const SubTaskComponent: FC<SubTaskProps> = ({ subtask }) => {
  return (
    <HStack w="100%" justify="space-between">
      <Checkbox.Root checked={subtask.status === 'done'}>
        <Checkbox.Control />
        <Checkbox.Label> {subtask.title}</Checkbox.Label>
      </Checkbox.Root>
    </HStack>
  );
};

export default SubTaskComponent;
