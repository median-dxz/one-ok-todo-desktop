export interface WebDAVConfig {
  url: string;
  username?: string;
  password?: string;
}

/**
 * 上传数据到 WebDAV 服务器
 * @param config WebDAV 服务器配置
 * @param data 要上传的 JSON 数据
 * @param remotePath 服务器上的远程路径 (e.g., '/backups/data.json')
 */
export async function uploadToWebDAV(
  config: WebDAVConfig,
  data: unknown,
  remotePath: string,
): Promise<void> {
  const fullUrl = new URL(remotePath, config.url).toString();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (config.username && config.password) {
    headers['Authorization'] =
      'Basic ' + btoa(`${config.username}:${config.password}`);
  }

  try {
    const response = await fetch(fullUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data, null, 2),
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
 * @param config WebDAV 服务器配置
 * @param remotePath 服务器上的远程路径 (e.g., '/backups/data.json')
 * @returns 下载的 JSON 数据
 */
export async function downloadFromWebDAV<T>(
  config: WebDAVConfig,
  remotePath: string,
): Promise<T> {
  const fullUrl = new URL(remotePath, config.url).toString();
  const headers: HeadersInit = {};

  if (config.username && config.password) {
    headers['Authorization'] =
      'Basic ' + btoa(`${config.username}:${config.password}`);
  }

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

    const data = (await response.json()) as T;
    console.log('WebDAV download successful.');
    return data;
  } catch (error) {
    console.error('Error downloading from WebDAV:', error);
    throw error;
  }
}
