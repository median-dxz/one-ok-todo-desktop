import { Box, Flex, Text, useBreakpointValue } from '@chakra-ui/react';
import './App.css';
import { TodoArea } from './components/TodoArea';

export default function App() {
  const sidebarDisplay = useBreakpointValue({ base: 'none', md: 'flex' });
  return (
    <Flex height="100vh" bg="gray.50">
      <Box
        as="aside"
        display={sidebarDisplay}
        flexDirection="column"
        alignItems="center"
        m={2}
        p={6}
        bg="white"
        borderRadius="xl"
        boxShadow="lg"
        transition="width 0.2s"
        overflow="hidden"
        width="14rem"
      >
        <Flex mb={4} alignItems="center">
          <img src="/favicon.svg" width={48} height={48} alt="Logo" />
          <Box ml={4} display="flex" flexDirection="column">
            <Text fontSize="md" fontWeight="bold" whiteSpace="nowrap">
              One OK Todo
            </Text>
            <Text fontSize="sm">v0.1.0</Text>
          </Box>
        </Flex>
        <Box mb={4} />
        <Box mt={4} display="flex"></Box>
      </Box>
      <Box as="main" flex={1} minW={0} overflow="auto" p={{ base: 2, md: 10 }}>
        <TodoArea />
      </Box>
    </Flex>
  );
}
