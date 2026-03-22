import { Box, Button, HStack, Input, Portal, Presence, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { LuMessageSquare, LuPlus, LuX } from 'react-icons/lu';
import { useAppStore } from '@/store';

export function TimelineChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const addTimeline = useAppStore((s) => s.addTimeline);
  const selectedGroupId = useAppStore((s) => s.selectedTimelineGroupId);

  const onAddTimeline = () => {
    if (chatMsg.trim() === '') return;
    if (selectedGroupId === null) return;
    addTimeline(selectedGroupId, { title: chatMsg, type: 'task' });
    setChatMsg('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onAddTimeline();
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <>
      <Box position="fixed" bottom="24px" right="24px" zIndex="50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          colorPalette="blue"
          rounded="full"
          boxShadow="lg"
          css={{ w: '56px', h: '56px', p: 0 }}
          data-testid="timeline-chat-bubble-trigger"
        >
          {isOpen ? <LuX size={24} /> : <LuMessageSquare size={24} />}
        </Button>
      </Box>

      <Portal>
        <Presence
          present={isOpen}
          animationName={{ _open: 'slide-from-bottom, fade-in', _closed: 'slide-to-bottom, fade-out' }}
          animationDuration="moderate"
          unmountOnExit
        >
          <Box
            position="fixed"
            bottom="96px"
            right="24px"
            zIndex="50"
            css={{
              w: '320px',
              bg: 'white',
              rounded: 'xl',
              boxShadow: '2xl',
              overflow: 'hidden',
            }}
          >
            <VStack gap={0} align="stretch">
              <Box css={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'gray.100' }}>
                <Box css={{ fontWeight: 'medium', fontSize: 'sm' }}>AI Assistant</Box>
                <Box css={{ fontSize: 'xs', color: 'gray.500' }}>Describe what you want to do</Box>
              </Box>
              <Box css={{ p: 3 }} data-testid="timeline-chat-bubble-panel">
                <HStack gap={2}>
                  <Input
                    placeholder="Add a timeline..."
                    value={chatMsg}
                    onChange={(e) => setChatMsg(e.target.value)}
                    onKeyDown={handleKeyDown}
                    variant="subtle"
                    size="sm"
                    autoFocus
                    disabled={selectedGroupId === null}
                    data-testid="timeline-chat-input"
                  />
                  <Button
                    size="sm"
                    colorPalette="blue"
                    onClick={onAddTimeline}
                    disabled={chatMsg.trim() === '' || selectedGroupId === null}
                    css={{ px: 3 }}
                    data-testid="timeline-chat-submit"
                  >
                    <LuPlus />
                  </Button>
                </HStack>
                {selectedGroupId === null && (
                  <Box css={{ fontSize: 'xs', color: 'gray.400', mt: 2 }}>Please select a group first</Box>
                )}
              </Box>
            </VStack>
          </Box>
        </Presence>
      </Portal>
    </>
  );
}
