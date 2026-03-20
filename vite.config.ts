import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [react(), babel({ presets: [reactCompilerPreset({ compilationMode: 'annotation' })] })],

  resolve: {
    tsconfigPaths: true,
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ['**/src-tauri/**'],
    },
  },

  // Vitest 配置
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './tests/ui/setup.ts',
    include: ['tests/ui/**/*.{test,spec}.{ts,tsx}'],
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      exclude: ['tests/**', '**/*.config.*', '**/mockData.ts', 'src-tauri/**'],
    },
  },
}));
