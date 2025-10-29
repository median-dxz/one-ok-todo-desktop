import { addTimelineAtom } from '@/store/actions/timelineActions';
import { useTimelineGroupAtom } from '@/store/timelineGroup';
import { Button, HStack, Input } from '@chakra-ui/react';
import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { LuPlus } from 'react-icons/lu';

interface TimelineChatProps {
  timelineGroupId: string;
}

export function TimelineChat({ timelineGroupId }: TimelineChatProps) {
  const [chatMsg, setChatMsg] = useState('');
  const groupAtom = useTimelineGroupAtom(timelineGroupId);
  const addTimeline = useSetAtom(addTimelineAtom);

  const onAddTimeline = () => {
    if (chatMsg.trim() === '') return;
    addTimeline({ groupAtom, title: chatMsg });
    setChatMsg('');
  };

  return (
    <HStack css={{ width: 'full', py: 2, px: 2, bg: 'white', rounded: 'lg', boxShadow: 'lg', gap: 4 }}>
      <Input
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
