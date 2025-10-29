import { Button, HStack, Input } from '@chakra-ui/react';
import React, { useState } from 'react';
import { LuPlus } from 'react-icons/lu';

const TimelineChat: React.FC = () => {
  const [newTimelineTitle, setNewTimelineTitle] = useState('');

  const onAddTimeline = () => {
    setNewTimelineTitle('');
  };

  return (
    <HStack css={{ width: 'full', py: 2, px: 2, bg: 'white', rounded: 'lg', boxShadow: 'lg', gap: 4 }}>
      <Input
        placeholder="New timeline title"
        value={newTimelineTitle}
        variant="subtle"
        onChange={(e) => setNewTimelineTitle(e.target.value)}
        flex={1}
        size="md"
      />
      <Button variant="outline" onClick={onAddTimeline} size="md" rounded="lg">
        <LuPlus />
        Add Timeline
      </Button>
    </HStack>
  );
};

export default TimelineChat;
