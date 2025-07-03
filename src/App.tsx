import {
  FluentProvider,
  makeResetStyles,
  makeStyles,
  mergeClasses,
  tokens,
  webLightTheme,
  Text,
} from '@fluentui/react-components';
import { TodoArea } from './components/TodoArea';
import './App.css';

const useSidebarStyles = makeResetStyles({
  display: 'flex',
  flexDirection: 'column',
  margin: tokens.spacingHorizontalS,
  backgroundColor: tokens.colorNeutralBackground1,
  borderRadius: tokens.borderRadiusXLarge,
  boxShadow: `0 0 28px rgba(0, 0, 0, .08)`,
  transition: `width 0.2s ${tokens.curveDecelerateMin}`,
  overflow: 'hidden',
  width: '15rem',
  '@media (max-width: 600px)': {
    display: 'none !important',
  },
});

const useStyles = makeStyles({
  root: {
    display: 'flex',
    height: '100vh',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  main: {
    flex: 1,
    minWidth: 0,
    overflow: 'auto',
    padding: tokens.spacingVerticalXXL,
  },
  metaContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: tokens.spacingVerticalXL,
  },
  metaTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: '1rem',
  },
});

function App() {
  const styles = { ...useStyles(), sidebar: useSidebarStyles() };

  return (
    <FluentProvider theme={webLightTheme} className={styles.root}>
      <aside className={mergeClasses(styles.sidebar)}>
        <div className={styles.metaContainer}>
          <img src="/favicon.svg" width={64} height={64} alt="Logo" />
          <div className={styles.metaTextContainer}>
            <Text size={600}>One OK Todo</Text>
            <Text>v0.1.0</Text>
          </div>
        </div>
      </aside>
      <main className={styles.main}>
        <TodoArea />
      </main>
    </FluentProvider>
  );
}

export default App;
