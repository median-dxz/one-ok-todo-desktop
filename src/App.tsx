import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Presence,
  Separator,
  Spacer,
  Text,
  useDialog,
  VStack,
  type PresenceProps,
} from '@chakra-ui/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useState, type ReactElement } from 'react';

import './App.css';

import { FiEdit, FiEye, FiRefreshCw } from 'react-icons/fi';
import { LuPlus } from 'react-icons/lu';

import { MemoDisplay } from '@/components/memo/MemoDisplay';
import { PersistenceProvider } from '@/components/PersistenceProvider';
import { EditTimelineGroupDialog } from '@/components/timeline/EditTimelineGroupDialog';
import { TimelineDisplay } from '@/components/timeline/TimelineDisplay';
import { TimelineGroupList } from '@/components/timeline/TimelineGroupList';
import { TabButton } from '@/components/ui/TabButton';
import { viewAtom } from '@/store/appAtom';
import { selectedTimelineGroupAtom } from '@/store/derivedAtoms';
import { loadDataAtom } from '@/store/persistence';
import type { TimelineGroup } from '@/types/timeline';

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

const syncStatusColors = {
  idle: 'gray',
  syncing: 'blue',
  success: 'green',
  error: 'red',
};

function App() {
  const currentViewType = useAtomValue(viewAtom);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const reloadData = useSetAtom(loadDataAtom);

  const editTimelineGroupDialog = useDialog();
  const [editingGroup, setEditingGroup] = useState<TimelineGroup | null>(null);

  const currentTimelineGroup = useAtomValue(selectedTimelineGroupAtom);

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

  const handleTimelineGroupEdit = useCallback(
    (group: TimelineGroup | null) => {
      setEditingGroup(group);
      editTimelineGroupDialog.setOpen(true);
    },
    [editTimelineGroupDialog],
  );

  let view: ReactElement = <></>;
  const presenceStyle: PresenceProps = {
    css: {
      display: 'flex',
      flexDirection: 'column',
      h: 'full',
      alignItems: 'stretch',
      gap: 1,
    },
    animationName: { _open: 'scale-in, fade-in' },
    animationDuration: 'moderate',
  };

  switch (currentViewType) {
    case 'timeline':
      view = <TimelineDisplay timelineGroup={currentTimelineGroup} />;
      break;
    case 'memo':
      view = <MemoDisplay />;
      break;
    default:
      break;
  }

  return (
    <>
      <PersistenceProvider />
      <Grid templateAreas={`"nav main"`} gridTemplateColumns="18em 1fr" h="100vh" w="100vw" bg="gray.100">
        <GridItem area="nav" p={2}>
          <Flex
            css={{
              bgColor: 'white',
              h: '100%',
              rounded: 'lg',
              boxShadow: 'md',
              p: 4,
            }}
            gap={4}
            direction="column"
            as="nav"
          >
            <Flex alignItems="center" justifyContent="start" gap={2}>
              <img src="/favicon.svg" width={36} />
              <Text fontSize="xl" fontWeight="bold" textAlign="center">
                One OK Todo
              </Text>
            </Flex>

            <VStack alignItems="stretch" gap={1}>
              <TabButton view="timeline" aria-label="Timeline View">
                <FiEye />
                Timeline
              </TabButton>
              <TabButton view="memo" aria-label="Memo View">
                <FiEdit />
                Memo
              </TabButton>
            </VStack>

            {/* 项目组区域 */}
            <Separator />

            {/* 时间线组区域 */}
            <Box flex={1}>
              <Presence present={currentViewType === 'timeline'} {...presenceStyle}>
                <TimelineGroupList onEdit={handleTimelineGroupEdit} />

                <Spacer />
                <Button
                  variant="outline"
                  onClick={() => {
                    handleTimelineGroupEdit(null);
                  }}
                >
                  <LuPlus />
                  新建
                </Button>
                <EditTimelineGroupDialog
                  key={editingGroup?.id}
                  control={editTimelineGroupDialog}
                  group={editingGroup}
                />
              </Presence>

              <Presence present={currentViewType === 'memo'} {...presenceStyle}>
                memo
              </Presence>
            </Box>

            <Separator />
            <Flex align="center" w="100%">
              <Button size="sm" variant="ghost" onClick={handleSync} loading={syncStatus === 'syncing'}>
                <FiRefreshCw />
                Sync
              </Button>
              <Spacer />
              <Badge colorPalette={syncStatusColors[syncStatus]}>{syncStatus}</Badge>
            </Flex>
          </Flex>
        </GridItem>
        <GridItem area="main" p={2}>
          <Presence
            present
            h="full"
            key={currentViewType}
            animationName={{ _open: 'fade-in', _closed: 'fade-out' }}
            animationDuration="moderate"
            unmountOnExit
          >
            {view}
          </Presence>
        </GridItem>
      </Grid>
    </>
  );
}

export default App;
