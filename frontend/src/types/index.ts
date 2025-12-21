// Type definitions for the application

export type TaskStatus = 'To-Do' | 'In-Progress' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface User {
  _id: string;
  id?: string; // Backend might return 'id' instead of '_id'
  name: string;
  email: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  creatorId: User | string;
  assignedTo: (User | string)[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date | string;
  assignedTo?: string[];
}

export interface SocketEvents {
  TASK_CREATED: Task;
  TASK_UPDATED: Task;
  TASK_FINISHED: Task;
  TASK_DELETED: { taskId: string };
  TASK_ASSIGNED: { task: Task; assignedTo: string[] };
}

