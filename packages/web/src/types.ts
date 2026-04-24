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

export interface Habit {
  id: number;
  userId: number;
  title: string;
  frequency: string;
  emoji?: string;
}

export interface HabitLog {
  id: number;
  habitId: number;
  userId: number;
  date: string;
  completed: boolean;
}

export interface WorkoutSet {
  weight: number;
  reps: number;
}

export interface WorkoutExercise {
  name: string;
  sets: WorkoutSet[];
}

export interface Workout {
  id: number;
  userId: number;
  name: string;
  date: string;
  exercises: WorkoutExercise[];
}

export interface Goal {
  id: number;
  userId: number;
  title: string;
  category: string;
  targetValue: number;
  currentValue: number;
  deadline?: string;
}

export interface Transaction {
  id: number;
  userId: number;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
}
