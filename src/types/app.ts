
export interface AppData {
  version: string; // 数据模型版本（用于未来迁移）
  metadata?: {
    // 元数据
    lastModified: string; // ISO 8601 格式
    syncStatus?: 'synced' | 'pending' | 'error';
  };
}
