export type Priority = 'low' | 'medium' | 'high';
export type Status = 'pending' | 'completed';

export interface Task {
  id: number;
  description: string;
  priority: Priority;
  status: Status;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
}
