import { createClient, type WebDAVClientOptions } from 'webdav';
import * as path from '@tauri-apps/api/path';

type MockFs = {
  readTextFile: (filePath: string) => Promise<string>;
  writeTextFile: (filePath: string, contents: string) => Promise<void>;
};

// Temporary in-memory mock while Tauri fs access is unavailable.
const mockFileStorage = new Map<string, string>();

const fs: MockFs = {
  async readTextFile(filePath) {
    if (!mockFileStorage.has(filePath)) {
      throw new Error(`Mock fs missing file: ${filePath}`);
    }
    return mockFileStorage.get(filePath) as string;
  },
  async writeTextFile(filePath, contents) {
    mockFileStorage.set(filePath, contents);
  },
};

const REMOTE_DIR = '/OneOkTodo/data/';
const DATA_FILE = 'root-data.json';

async function getLocalFilePath(): Promise<string> {
  const docDir = await path.documentDir();
  const dataDirPath = await path.join(docDir, 'OneOkTodo', 'data');
  return path.join(dataDirPath, DATA_FILE);
}

type SyncOptions = WebDAVClientOptions & { url: string };

// Uploads local data to the WebDAV server.
export async function uploadToWebDAV(options: SyncOptions) {
  const client = createClient(options.url, {
    username: options.username,
    password: options.password,
  });

  try {
    if (!(await client.exists(REMOTE_DIR))) {
      await client.createDirectory(REMOTE_DIR, { recursive: true });
    }

  const filePath = await getLocalFilePath();
  const fileContent = await fs.readTextFile(filePath);
  await client.putFileContents(`${REMOTE_DIR}${DATA_FILE}`, fileContent);

    console.log('Sync upload successful!');
  } catch (error) {
    console.error('Sync upload failed:', error);
    throw error;
  }
}

// Downloads data from the WebDAV server and overwrites local data.
export async function downloadFromWebDAV(options: SyncOptions) {
  const client = createClient(options.url, {
    username: options.username,
    password: options.password,
  });

  try {
  const fileContent = await client.getFileContents(`${REMOTE_DIR}${DATA_FILE}`, { format: 'text' });
  const filePath = await getLocalFilePath();
  await fs.writeTextFile(filePath, fileContent as string);

    console.log('Sync download successful!');
    // It's recommended to reload the app state after download.
  } catch (error) {
    console.error('Sync download failed:', error);
    throw error;
  }
}
