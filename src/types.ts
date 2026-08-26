export type Priority = '높음' | '보통' | '낮음';

export type Category = '설비' | '품질' | '안전' | '행정' | '기타';

export type DueStatus = 'delayed' | 'urgent' | 'normal' | 'none' | 'completed';

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  category: Category;
  due_date?: string; // YYYY-MM-DD
  done: boolean;
  completedAt?: string;
  createdAt: string;
  memo?: string;
}

export type FilterStatus = 'all' | 'pending' | 'completed' | 'urgent' | 'delayed';
