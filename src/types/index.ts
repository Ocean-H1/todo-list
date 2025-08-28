export type FilterType = 'all' | 'active' | 'completed';

export interface TodoItem {
  id: string;  // 唯一标识
  title: string;  // 标题
  completed: boolean;  // 是否完成
  createdAt: number;  // 创建时间
  updatedAt: number;  // 更新时间
  order: number;  // 排序
  note?: string;  // 备注
  dueAt?: number;  // 截止时间
}