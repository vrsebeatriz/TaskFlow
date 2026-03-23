export type Priority = 'low' | 'medium' | 'high';
export type Status = 'pending' | 'inProgress' | 'completed';

export interface Task {
  id: number;
  description: string;
  content?: string;
  priority: Priority;
  status: Status;
  dueDate?: string;
  category?: string;
  createdAt?: string;
  completedAt?: string | null;
  userId?: number;
}

export interface TaskDraft {
  description: string;
  priority: Priority;
  dueDate?: string;
  category?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}
