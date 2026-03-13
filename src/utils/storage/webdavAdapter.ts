import type { StorageAdapter } from '@/types/storage';
import superjson from 'superjson';

interface WebDAVConfig {
  url: string;
  username?: string;
  password?: string;
  remotePath: string;
}

class WebDAVClient {
  private config: WebDAVConfig;

  constructor(config: WebDAVConfig) {
    this.config = config;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {};
    if (this.config.username && this.config.password) {
      headers['Authorization'] = 'Basic ' + btoa(`${this.config.username}:${this.config.password}`);
    }
    return headers;
  }

  private getFullUrl(remotePath: string): string {
    return new URL(remotePath, this.config.url).toString();
  }

  /**
   * 上传数据到 WebDAV 服务器
   * @param data 要上传的 JSON 数据
   * @param remotePath 服务器上的远程路径 (e.g., '/backups/data.json')
   */
  async upload(data: unknown, remotePath: string): Promise<void> {
    const fullUrl = this.getFullUrl(remotePath);
    const headers: HeadersInit = {
      ...this.getHeaders(),
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(fullUrl, {
        method: 'PUT',
        headers,
        body: superjson.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`WebDAV upload failed: ${response.status} ${response.statusText}`);
      }

      console.log('WebDAV upload successful.');
    } catch (error) {
      console.error('Error uploading to WebDAV:', error);
      throw error;
    }
  }

  /**
   * 从 WebDAV 服务器下载数据
   * @param remotePath 服务器上的远程路径 (e.g., '/backups/data.json')
   * @returns 下载的 JSON 数据
   */
  async download<T = unknown>(remotePath: string): Promise<T> {
    const fullUrl = this.getFullUrl(remotePath);
    const headers = this.getHeaders();

    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('WebDAV file not found.');
        }
        throw new Error(`WebDAV download failed: ${response.status} ${response.statusText}`);
      }

      const dataText = await response.text();
      const data = superjson.parse<T>(dataText);
      console.log('WebDAV download successful.');
      return data;
    } catch (error) {
      console.error('Error downloading from WebDAV:', error);
      throw error;
    }
  }

  /**
   * 从 WebDAV 服务器删除数据
   * @param remotePath 服务器上的远程路径 (e.g., '/backups/data.json')
   */
  async delete(remotePath: string): Promise<void> {
    const fullUrl = this.getFullUrl(remotePath);
    const headers = this.getHeaders();

    try {
      const response = await fetch(fullUrl, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(`WebDAV delete failed: ${response.status} ${response.statusText}`);
      }

      console.log('WebDAV delete successful.');
    } catch (error) {
      console.error('Error deleting from WebDAV:', error);
      throw error;
    }
  }
}

// TODO: 改为从配置文件读取 WebDAV 参数，并提供 UI 让用户配置。
type ImportMetaEnvWithWebdav = {
  VITE_WEBDAV_URL?: string;
  VITE_WEBDAV_USERNAME?: string;
  VITE_WEBDAV_PASSWORD?: string;
  VITE_WEBDAV_PATH?: string;
};

// TODO: 后续会动态切换 WebDAV 配置，届时当前实现将无法满足要求
export function getWebdavConfig() {
  const env = import.meta.env as ImportMetaEnvWithWebdav;
  if (!env.VITE_WEBDAV_URL) {
    return null;
  }

  return {
    url: env.VITE_WEBDAV_URL,
    username: env.VITE_WEBDAV_USERNAME,
    password: env.VITE_WEBDAV_PASSWORD,
    remotePath: env.VITE_WEBDAV_PATH ?? '/one-ok-todo/data/root-data.json',
  };
}

export function setWebdavConfig(_config: WebDAVConfig) {
  throw new Error('Not Implemented: WebDAV configuration is currently static and cannot be changed at runtime.');
  // client = new WebDAVClient(_config);
}

let cachedAdapter: StorageAdapter | null = null;
let lastConfigStr: string | null = null;

export const getWebDAVAdapter = (): StorageAdapter | null => {
  const config = getWebdavConfig();

  if (!config) {
    cachedAdapter = null;
    lastConfigStr = null;
    return null;
  }

  const currentConfigStr = superjson.stringify(config);

  if (cachedAdapter && currentConfigStr === lastConfigStr) {
    return cachedAdapter;
  }

  lastConfigStr = currentConfigStr;
  const client = new WebDAVClient(config);

  cachedAdapter = {
    name: 'webdav',

    async getItem() {
      try {
        return await client.download(config.remotePath);
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        if (message.includes('not found')) {
          return null;
        }
        console.error('Failed to load data from WebDAV:', error);
        return null;
      }
    },

    async setItem(value) {
      await client.upload(value, config.remotePath);
    },

    async removeItem() {
      await client.delete(config.remotePath);
    },
  };

  return cachedAdapter;
};
