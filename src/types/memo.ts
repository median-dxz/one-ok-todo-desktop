export type MemoNodeType = 'string' | 'object' | 'array' | 'number' | 'boolean';

export interface MemoNode {
  id: string;
  key: string;
  type: MemoNodeType;
  value: string | number | boolean;
  children: MemoNode[];
  isCollapsed?: boolean; // For UI state
}
