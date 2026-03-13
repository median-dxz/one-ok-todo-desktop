import { Provider } from '@/components/context/Provider';
import { ReactFlowProvider } from '@xyflow/react';
import type { ReactNode } from 'react';

/** 包含 Chakra UI + ReactFlow Context，用于需要 Handle 等 RF 组件的测试 */
export function AppTestProvider({ children }: { children: ReactNode }) {
  return (
    <Provider>
      <ReactFlowProvider>{children}</ReactFlowProvider>
    </Provider>
  );
}
