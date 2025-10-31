import { addTimelineAtom, newTaskTimeline } from '@/store/actions/timelineActions';
import { Button, HStack, Input } from '@chakra-ui/react';
import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { LuPlus } from 'react-icons/lu';

export function TimelineChat() {
  const [chatMsg, setChatMsg] = useState('');
  const addTimeline = useSetAtom(addTimelineAtom);

  const onAddTimeline = () => {
    if (chatMsg.trim() === '') return;
    addTimeline(newTaskTimeline(chatMsg));
    setChatMsg('');
  };

  return (
    <HStack css={{ width: 'full', py: 2, px: 2, bg: 'white', rounded: 'lg', boxShadow: 'lg', gap: 4 }}>
      <Input
        name="timeline-chat-input"
        placeholder="New timeline title"
        value={chatMsg}
        variant="subtle"
        onChange={(e) => setChatMsg(e.target.value)}
        flex={1}
        size="md"
      />
      <Button variant="outline" onClick={onAddTimeline} size="md" rounded="lg">
        <LuPlus />
        Add Timeline
      </Button>
    </HStack>
  );
}
