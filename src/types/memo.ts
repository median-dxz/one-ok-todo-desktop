import z from 'zod';

export const MemoNodeTypeSchema = z.enum(['string', 'object', 'array', 'number', 'boolean']);

export const MemoNodeSchema: z.ZodType<MemoNode> = z.lazy(() =>
  z.object({
    id: z.string(),
    key: z.string(),
    type: MemoNodeTypeSchema,
    value: z.union([z.string(), z.number(), z.boolean()]),
    children: z.array(MemoNodeSchema),
    isCollapsed: z.boolean().optional(),
  }),
);

export type MemoNodeType = 'string' | 'object' | 'array' | 'number' | 'boolean';

export interface MemoNode {
  id: string;
  key: string;
  type: MemoNodeType;
  value: string | number | boolean;
  children: MemoNode[];
  isCollapsed?: boolean; // For UI state
}
