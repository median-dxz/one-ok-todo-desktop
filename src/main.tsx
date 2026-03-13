import { createRoot } from 'react-dom/client';
import App from './App';
import React from 'react';
import { Provider } from '@/components/context/Provider';

const root = createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <Provider>
      <App />
    </Provider>
  </React.StrictMode>,
);
