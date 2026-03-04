import { PERSISTENCE_ERROR_EVENT } from '@/utils/persistenceError';
import superjson from 'superjson';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { appStorage } from '@/utils/storage';

const mockInvoke = vi.fn();
const mockDbGet = vi.fn();
const mockDbPut = vi.fn();
const mockDbDelete = vi.fn();

vi.mock('@tauri-apps/api/core', () => ({
  invoke: mockInvoke,
}));

vi.mock('idb', () => ({
  openDB: vi.fn(async () => ({
    get: mockDbGet,
    put: mockDbPut,
    delete: mockDbDelete,
  })),
}));

describe('storage 持久化冒烟测试', () => {
  const APPDATA_KEY = 'one-ok-todo-app-data';
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    window.__TAURI__ = undefined;
  });

  it('可恢复数据应通过恢复流程并正常返回', async () => {
    mockDbGet.mockResolvedValueOnce(
      superjson.stringify({
        version: 3,
        state: {
          lastModified: '2026-03-04T00:00:00.000Z',
        },
      }),
    );

    const value = await appStorage.getItem(APPDATA_KEY);

    expect(value).toBeTruthy();
    expect(value?.state.memo).toEqual([]);
    expect(value?.state.timelineGroups).toEqual([]);
  });

  it('不可恢复数据应抛出错误并发送 UI 错误事件', async () => {
    mockDbGet.mockResolvedValueOnce(
      superjson.stringify({
        version: 3,
        state: {
          lastModified: '2026-03-04T00:00:00.000Z',
          memo: 'invalid-memo',
          timelineGroups: [],
        },
      }),
    );

    const eventSpy = vi.fn();
    window.addEventListener(PERSISTENCE_ERROR_EVENT, eventSpy);

    try {
      await expect(appStorage.getItem(APPDATA_KEY)).rejects.toThrow('所有可用数据源均不可恢复');
      expect(eventSpy).toHaveBeenCalled();
    } finally {
      window.removeEventListener(PERSISTENCE_ERROR_EVENT, eventSpy);
    }
  });

  it('多源场景下应选择最新且非空的数据', async () => {
    window.__TAURI__ = {};

    const olderIndexedDb = {
      version: 3,
      state: {
        lastModified: '2026-03-01T00:00:00.000Z',
        syncStatus: 'synced',
        memo: [{ id: 'memo-1', key: 'a', type: 'string', value: 'old', children: [] }],
        timelineGroups: [],
      },
    };

    const newerTauri = {
      version: 3,
      state: {
        lastModified: '2026-03-04T00:00:00.000Z',
        syncStatus: 'synced',
        memo: [{ id: 'memo-2', key: 'b', type: 'string', value: 'new', children: [] }],
        timelineGroups: [],
      },
    };

    mockDbGet.mockResolvedValueOnce(superjson.stringify(olderIndexedDb));
    mockInvoke.mockResolvedValueOnce(superjson.stringify(newerTauri));

    const value = await appStorage.getItem(APPDATA_KEY);

    expect(value?.state.lastModified).toBe(newerTauri.state.lastModified);
    expect(value?.state.memo[0]?.id).toBe('memo-2');
    expect(mockInvoke).toHaveBeenCalledWith('load_data_rust');
  });

  it('在 Tauri 环境下保存时应向 Tauri 适配器写入', async () => {
    window.__TAURI__ = {};

    const payload = {
      version: 3,
      state: {
        lastModified: '2026-03-04T00:00:00.000Z',
        syncStatus: 'synced' as const,
        memo: [],
        timelineGroups: [],
      },
    };

    await appStorage.setItem(APPDATA_KEY, payload);

    expect(mockDbPut).not.toHaveBeenCalled();
    expect(mockInvoke).toHaveBeenCalledWith('save_data_rust', {
      data: superjson.stringify(payload),
    });
  });

  it('在 Tauri 环境下删除时应调用 tauri remove 命令', async () => {
    window.__TAURI__ = {};

    await appStorage.removeItem(APPDATA_KEY);

    expect(mockDbDelete).not.toHaveBeenCalled();
    expect(mockInvoke).toHaveBeenCalledWith('remove_data_rust');
  });

  it('首次启动（所有数据源均为空）时，应正常返回而不抛出错误', async () => {
    window.__TAURI__ = {}; // 模拟 Tauri 环境

    // Rust 端返回 null
    mockInvoke.mockResolvedValueOnce(null);

    // 不应该抛出“不可恢复”的异常，而是正常执行完毕
    const value = await appStorage.getItem(APPDATA_KEY);

    // Zustand 的规范：如果没有持久化数据，应返回 null/undefined 等 Falsy 值
    expect(value).toBeFalsy();

    // 确保两端都被正确查询过
    expect(mockInvoke).toHaveBeenCalledWith('load_data_rust');
  });
});
