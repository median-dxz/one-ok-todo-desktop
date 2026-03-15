import { PERSISTENCE_ERROR_EVENT } from '@/utils/persistenceError';
import superjson from 'superjson';
import { beforeEach, describe, expect, it, vi, beforeAll } from 'vitest';

const mockInvoke = vi.fn();
const mockDbGet = vi.fn();
const mockDbPut = vi.fn();
const mockDbDelete = vi.fn();
const mockIsTauri = vi.fn();

vi.mock('@tauri-apps/api', () => ({
  core: {
    invoke: mockInvoke,
    isTauri: mockIsTauri,
  },
}));

vi.mock('idb', () => ({
  openDB: vi.fn(async () => ({
    get: mockDbGet,
    put: mockDbPut,
    delete: mockDbDelete,
    objectStoreNames: {
      contains: () => true,
    },
  })),
}));

describe('storage 持久化冒烟测试', () => {
  const APPDATA_KEY = 'one-ok-todo-app-data';
  let appStorage: typeof import('@/utils/storage/index').appStorage;

  beforeAll(async () => {
    // 强制清除模块缓存以确保 mock 生效
    vi.resetModules();
    const module = await import('@/utils/storage/index');
    appStorage = module.appStorage;
  });

  beforeEach(() => {
    mockIsTauri.mockReturnValue(false); // 默认非 Tauri 环境
    vi.clearAllMocks();
  });

  const validMetadata = {
    lastModified: '2026-03-04T00:00:00.000Z',
    syncStatus: 'synced' as const,
  };

  it('可恢复数据应通过恢复流程并正常返回', async () => {
    const validData = {
      version: 3,
      state: {
        metadata: validMetadata,
        memo: [],
        timelineGroups: [],
      },
    };
    // IndexedDB 适配器期望存储的是 superjson 序列化后的字符串
    mockDbGet.mockResolvedValueOnce(superjson.stringify(validData));

    const value = await appStorage.getItem(APPDATA_KEY);

    expect(value).toBeTruthy();
    expect(value?.state.memo).toEqual([]);
    expect(value?.state.timelineGroups).toEqual([]);
  });

  it('不可恢复数据应抛出错误并发送 UI 错误事件', async () => {
    const invalidData = {
      version: 3,
      state: {
        metadata: validMetadata,
        memo: 'invalid-should-be-array',
        timelineGroups: [],
      },
    };
    mockDbGet.mockResolvedValueOnce(superjson.stringify(invalidData));

    const eventSpy = vi.fn();
    window.addEventListener(PERSISTENCE_ERROR_EVENT, eventSpy);

    try {
      await expect(appStorage.getItem(APPDATA_KEY)).rejects.toThrow('所有可用数据源均不可恢复');
      expect(eventSpy).toHaveBeenCalled();
    } finally {
      window.removeEventListener(PERSISTENCE_ERROR_EVENT, eventSpy);
    }
  });

  it('在 Tauri 环境下保存时应向 Tauri 适配器写入', async () => {
    vi.useFakeTimers();
    mockIsTauri.mockReturnValue(true);
    const payload = {
      version: 3,
      state: {
        metadata: validMetadata,
        memo: [],
        timelineGroups: [],
      },
    };

    appStorage.setItem(APPDATA_KEY, payload);
    await vi.advanceTimersByTimeAsync(300);

    expect(mockDbPut).not.toHaveBeenCalled();
    expect(mockInvoke).toHaveBeenCalledWith('save_data_rust', {
      data: superjson.stringify(payload),
    });
    vi.useRealTimers();
  });

  it('在 Tauri 环境下删除时应调用 tauri remove 命令', async () => {
    mockIsTauri.mockReturnValue(true);
    await appStorage.removeItem(APPDATA_KEY);

    expect(mockDbDelete).not.toHaveBeenCalled();
    expect(mockInvoke).toHaveBeenCalledWith('remove_data_rust');
  });

  it('首次启动（所有数据源均为空）时，应正常返回而不抛出错误', async () => {
    mockIsTauri.mockReturnValue(true);
    // Rust 端返回 null
    mockInvoke.mockResolvedValueOnce(null);

    // 不应该抛出“不可恢复”的异常，而是正常执行完毕
    const value = await appStorage.getItem(APPDATA_KEY);

    // 返回默认数据
    expect(value).not.toBeNull();
    expect(value?.state.metadata).toBeDefined();

    // 确保查询过 Rust 端
    expect(mockInvoke).toHaveBeenCalledWith('load_data_rust');
  });
});
