import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Separator,
  Spacer,
  Text,
  VStack,
  type ButtonProps,
} from '@chakra-ui/react';
import { useAtom, useSetAtom } from 'jotai';
import { useMemo, useState } from 'react';
import { MemoDisplay } from './components/memo/MemoDisplay';
import { PersistenceProvider } from './components/PersistenceProvider';
import { TimelineDisplay } from './components/timeline/TimelineDisplay';
import { viewAtom, type ViewType } from './store/appAtom';
import { loadDataAtom } from './store/persistence';

import './App.css';

import { FaEdit, FaEye } from 'react-icons/fa';
import { FiRefreshCw } from 'react-icons/fi';

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

const TabsButton = ({
  view,
  children,
  ...buttonProps
}: {
  view: ViewType;
} & ButtonProps) => {
  const [currentView, setView] = useAtom(viewAtom);

  const buttonStyles = useMemo(
    () =>
      ({
        colorPalette: currentView === view ? 'blue' : 'gray',
        onClick: () => setView(view),
        width: '100%',
        gap: 2,
        justifyContent: 'flex-start',
        variant: currentView === view ? 'subtle' : 'ghost',
      }) satisfies Partial<ButtonProps>,
    [currentView, view],
  );

  const selected = view === currentView;

  return (
    <Box position="relative">
      {selected ? (
        <Box
          css={{
            bgColor: 'blue.500/75',
            position: 'absolute',
            left: '-0.125rem',
            height: '75%',
            width: '0.25rem',
            rounded: 'md',
            transform: 'translateY(12.5%)',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        />
      ) : null}
      <Button {...buttonStyles} {...buttonProps}>
        {children}
      </Button>
    </Box>
  );
};

function App() {
  const [currentView] = useAtom(viewAtom);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const reloadData = useSetAtom(loadDataAtom);

  const handleSync = async () => {
    setSyncStatus('syncing');
    try {
      // IMPORTANT: Replace with your actual WebDAV credentials
      /*
      const webdavOptions = {
        url: 'YOUR_WEBDAV_URL', // e.g., https://dav.box.com/dav
        username: 'YOUR_USERNAME',
        password: 'YOUR_PASSWORD',
      };

      await uploadToWebDAV(webdavOptions);
      await downloadFromWebDAV(webdavOptions);
      */
      await reloadData(); // Reload data into Jotai state from local files
      setSyncStatus('success');
    } catch (error) {
      setSyncStatus('error');
    }
  };

  const syncStatusColors = {
    idle: 'gray',
    syncing: 'blue',
    success: 'green',
    error: 'red',
  };

  return (
    <>
      <PersistenceProvider />
      <Grid
        templateAreas={`"nav main"
                        "nav footer"`}
        gridTemplateRows="1fr 40px"
        gridTemplateColumns="240px 1fr"
        h="100vh"
      >
        <GridItem bg="gray.50" area="nav">
          <Flex direction="column" h="100%">
            <Flex alignItems="center" justifyContent="center" p={4} gap={2}>
              <img src="/favicon.svg" width={36} />
              <Text fontSize="xl" fontWeight="bold" textAlign="center">
                One OK Todo
              </Text>
            </Flex>
            <VStack alignItems="stretch" p={2}>
              <TabsButton view={'timeline'} aria-label="Timeline View">
                <FaEye />
                Timeline
              </TabsButton>

              <TabsButton view={'memo'} aria-label="Memo View">
                <FaEdit />
                Memo
              </TabsButton>
            </VStack>
            <Spacer />
            <VStack>
              <Separator />
              <Flex p={2} align="center" w="100%">
                <Button size="sm" variant="ghost" onClick={handleSync} loading={syncStatus === 'syncing'} gap={2}>
                  <FiRefreshCw />
                  Sync
                </Button>
                <Spacer />
                <Badge colorPalette={syncStatusColors[syncStatus]}>{syncStatus}</Badge>
              </Flex>
            </VStack>
          </Flex>
        </GridItem>
        <GridItem area="main" overflowY="auto">
          {currentView === 'timeline' ? <TimelineDisplay /> : <MemoDisplay />}
        </GridItem>
        <GridItem area="footer">Footer</GridItem>
      </Grid>
    </>
  );
}

export default App;
