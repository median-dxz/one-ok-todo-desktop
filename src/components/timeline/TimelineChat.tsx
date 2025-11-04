import { Button, HStack, Input } from '@chakra-ui/react';
import { useState } from 'react';
import { LuPlus } from 'react-icons/lu';
import { createTaskTimeline } from '@/store/timelineSlice';
import { useAddTimeline } from '@/store/reactFlowStore';

export function TimelineChat() {
  const [chatMsg, setChatMsg] = useState('');
  const addTimeline = useAddTimeline();
  const [focusInput, setFocusInput] = useState(false);

  const onAddTimeline = () => {
    if (chatMsg.trim() === '') return;
    addTimeline(createTaskTimeline(chatMsg));
    setChatMsg('');
  };

  return (
    <HStack css={{ width: 'full', py: 2, px: 2, bg: 'white', rounded: 'lg', boxShadow: 'lg', gap: 4 }}>
      <Input
        name="timeline-chat-input"
        placeholder="New timeline title"
        value={chatMsg}
        variant="subtle"
        onFocus={() => setFocusInput(true)}
        onBlur={() => setFocusInput(false)}
        onChange={(e) => setChatMsg(e.target.value)}
        flex={1}
        minW={focusInput || chatMsg ? 'calc(max(30vw, 40%))' : '12rem'}
        css={{
          transition: 'min-width 0.2s ease-in-out',
        }}
        size="md"
      />
      <Button variant="outline" onClick={onAddTimeline} size="md" rounded="lg">
        <LuPlus />
        Add Timeline
      </Button>
    </HStack>
  );
}
