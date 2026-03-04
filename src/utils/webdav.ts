import superjson from 'superjson';

export interface WebDAVConfig {
  url: string;
  username?: string;
  password?: string;
}

export class WebDAVClient {
  private config: WebDAVConfig;

  constructor(config: WebDAVConfig) {
    this.config = config;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {};
    if (this.config.username && this.config.password) {
      headers['Authorization'] =
        'Basic ' + btoa(`${this.config.username}:${this.config.password}`);
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
        throw new Error(
          `WebDAV upload failed: ${response.status} ${response.statusText}`,
        );
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
  async download<T>(remotePath: string): Promise<T> {
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
        throw new Error(
          `WebDAV download failed: ${response.status} ${response.statusText}`,
        );
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
        throw new Error(
          `WebDAV delete failed: ${response.status} ${response.statusText}`,
        );
      }

      console.log('WebDAV delete successful.');
    } catch (error) {
      console.error('Error deleting from WebDAV:', error);
      throw error;
    }
  }
}
