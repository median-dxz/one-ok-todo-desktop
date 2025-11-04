export interface AppMetaData {
  lastModified: string; // ISO 8601 格式
  syncStatus?: 'synced' | 'pending' | 'error';
}
