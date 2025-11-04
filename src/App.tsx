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
import { useCallback, useState, type ReactElement } from 'react';
import { useShallow } from 'zustand/react/shallow';

import './App.css';

import { FiEdit, FiEye, FiRefreshCw } from 'react-icons/fi';
import { LuPlus } from 'react-icons/lu';

import { MemoDisplay } from '@/components/memo/MemoDisplay';
import { EditTimelineGroupDialog } from '@/components/timeline/EditTimelineGroupDialog';
import { TimelineDisplay } from '@/components/timeline/TimelineDisplay';
import { TimelineGroupList } from '@/components/timeline/TimelineGroupList';
import { Loading } from '@/components/ui/Loading';
import { TabButton } from '@/components/ui/TabButton';
import { useAppStore } from '@/store';
import { loadMockData } from '@/utils/mockData';

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

const syncStatusColors = {
  idle: 'gray',
  syncing: 'blue',
  success: 'green',
  error: 'red',
};

function App() {
  const { currentViewType, isAppDataLoaded, editingTimelineGroup, setEditingTimelineGroup } = useAppStore(
    useShallow((state) => ({
      currentViewType: state.view,
      isAppDataLoaded: state.isAppDataLoaded,
      editingTimelineGroup: state.editingTimelineGroup,
      setEditingTimelineGroup: state.setEditingTimelineGroup,
    })),
  );

  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

  const editTimelineGroupDialog = useDialog();

  const handleSync = async () => {
    setSyncStatus('syncing');
    try {
      // 模拟同步延迟
      await new Promise((resolve) => setTimeout(resolve, 1000));

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

      // 加载模拟数据
      await loadMockData(useAppStore.setState);

      setSyncStatus('success');

      // 2秒后重置状态
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (error) {
      setSyncStatus('error');
      console.error('Sync failed:', error);

      // 2秒后重置状态
      setTimeout(() => setSyncStatus('idle'), 2000);
    }
  };

  const handleTimelineGroupEdit = useCallback(() => {
    editTimelineGroupDialog.setOpen(true);
  }, [editTimelineGroupDialog]);

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

  if (!isAppDataLoaded) {
    return <Loading text="Loading..." size="lg" withOverlay />;
  }

  switch (currentViewType) {
    case 'timeline':
      view = <TimelineDisplay />;
      break;
    case 'memo':
      view = <MemoDisplay />;
      break;
    case 'initializing':
      view = <Loading text="Loading..." size="lg" withOverlay />;
      break;
    default:
      break;
  }

  return (
    <>
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
                <TimelineGroupList key={syncStatus} onEdit={handleTimelineGroupEdit} />

                <Spacer />
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingTimelineGroup(null);
                    editTimelineGroupDialog.setOpen(true);
                  }}
                >
                  <LuPlus />
                  新建
                </Button>
                <EditTimelineGroupDialog key={editingTimelineGroup?.id} control={editTimelineGroupDialog} />
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
        <GridItem area="main">
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
