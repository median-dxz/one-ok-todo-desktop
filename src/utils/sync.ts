import * as path from '@tauri-apps/api/path';
import { uploadToWebDAV as webdavUpload, downloadFromWebDAV as webdavDownload, type WebDAVConfig } from './webdav';

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
const REMOTE_PATH = `${REMOTE_DIR}${DATA_FILE}`;

async function getLocalFilePath(): Promise<string> {
  const docDir = await path.documentDir();
  const dataDirPath = await path.join(docDir, 'OneOkTodo', 'data');
  return path.join(dataDirPath, DATA_FILE);
}

// Uploads local data to the WebDAV server.
export async function uploadToWebDAV(config: WebDAVConfig) {
  try {
    const filePath = await getLocalFilePath();
    const fileContent = await fs.readTextFile(filePath);
    const data = JSON.parse(fileContent);
    
    await webdavUpload(config, data, REMOTE_PATH);
    console.log('Sync upload successful!');
  } catch (error) {
    console.error('Sync upload failed:', error);
    throw error;
  }
}

// Downloads data from the WebDAV server and overwrites local data.
export async function downloadFromWebDAV(config: WebDAVConfig) {
  try {
    const data = await webdavDownload(config, REMOTE_PATH);
    const filePath = await getLocalFilePath();
    await fs.writeTextFile(filePath, JSON.stringify(data, null, 2));

    console.log('Sync download successful!');
    // It's recommended to reload the app state after download.
  } catch (error) {
    console.error('Sync download failed:', error);
    throw error;
  }
}
