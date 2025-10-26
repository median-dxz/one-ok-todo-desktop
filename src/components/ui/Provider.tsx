'use client';

import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import type { PropsWithChildren } from 'react';

export function Provider({ children }: PropsWithChildren<{}>) {
  return <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>;
}
