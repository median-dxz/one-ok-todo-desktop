import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { useAppStore } from '@/store';

// 替换 useAppStore 为注入 noop storage 的实例，阻断 persist 中间件的真实 I/O 调用
vi.mock('@/store', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/store')>();
  return {
    ...original,
    useAppStore: original.createAppStore({
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve(),
    }),
  };
});

// ── 环境 stub：填补 happy-dom 缺少的浏览器 API ──────────────────────────────

// ResizeObserver — Floating UI 定位时用
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverStub;

// IntersectionObserver — 视口检测
class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.IntersectionObserver = IntersectionObserverStub as unknown as typeof IntersectionObserver;

// matchMedia — Chakra 响应式断点检测
Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// ── indexedDB 基础定义 ──
// 即使不使用真实逻辑，也要定义这些类防止 idb 库在模块加载时或简单调用时报错
if (typeof globalThis.IDBRequest === 'undefined') {
  (globalThis as any).IDBRequest = class IDBRequest {};
  (globalThis as any).IDBTransaction = class IDBTransaction {};
  (globalThis as any).IDBDatabase = class IDBDatabase {};
  (globalThis as any).IDBFactory = class IDBFactory {};
  (globalThis as any).IDBCursor = class IDBCursor {};
  (globalThis as any).IDBIndex = class IDBIndex {};
  (globalThis as any).IDBObjectStore = class IDBObjectStore {};
  (globalThis as any).IDBKeyRange = class IDBKeyRange {};
}

if (typeof globalThis.indexedDB === 'undefined') {
  globalThis.indexedDB = {
    open: () => ({ onupgradeneeded: null, onsuccess: null, onerror: null }),
  } as unknown as IDBFactory;
}

// ── Swapy 行为 mock ───────────────────────────────────────────────────────────
vi.mock('swapy', () => ({
  createSwapy: vi.fn(() => ({
    onSwap: vi.fn(),
    onSwapEnd: vi.fn(),
    destroy: vi.fn(),
    enable: vi.fn(),
  })),
  utils: {
    initSlotItemMap: vi.fn((items: Array<{ id: string }>) =>
      items.map((item, index) => ({ slot: `slot-${index}`, item: item.id })),
    ),
    toSlottedItems: vi.fn(
      (items: Array<{ id: string }>, key: string, slotItemMap: Array<{ slot: string; item: string }>) =>
        items.map((item, index) => ({
          slotId: slotItemMap[index]?.slot ?? `slot-${index}`,
          itemId: item[key as keyof typeof item],
          item,
        })),
    ),
    dynamicSwapy: vi.fn(),
  },
}));

afterEach(() => {
  cleanup();
  // 兜底重置
  useAppStore.setState(useAppStore.getInitialState(), true);
});
