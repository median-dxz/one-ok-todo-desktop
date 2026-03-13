import z from 'zod';

export const AppMetadataSchema = z.object({
  lastModified: z
    .string()
    .min(1)
    .catch(() => new Date().toISOString()),
  syncStatus: z.enum(['synced', 'pending', 'error']).optional().catch('error'),
});

export interface AppMetaData {
  lastModified: string; // ISO 8601 格式
  syncStatus?: 'synced' | 'pending' | 'error';
}
