import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Task, TaskFormData, User } from '../types';
import toast from 'react-hot-toast';

// Fetch created tasks
export const useCreatedTasks = () => {
  return useQuery({
    queryKey: ['tasks', 'created'],
    queryFn: async () => {
      const response = await api.get<{ tasks: Task[] }>('/api/tasks/created');
      return response.data.tasks || [];
    },
  });
};

// Fetch assigned tasks
export const useAssignedTasks = () => {
  return useQuery({
    queryKey: ['tasks', 'assigned'],
    queryFn: async () => {
      const response = await api.get<{ tasks: Task[] }>('/api/tasks/assigned');
      return response.data.tasks || [];
    },
  });
};

// Fetch overdue tasks
export const useOverdueTasks = () => {
  return useQuery({
    queryKey: ['tasks', 'overdue'],
    queryFn: async () => {
      const response = await api.get<{ tasks: Task[] }>('/api/tasks/overdue');
      return response.data.tasks || [];
    },
  });
};

// Fetch single task by ID
export const useTask = (taskId: string | undefined) => {
  return useQuery({
    queryKey: ['tasks', taskId],
    queryFn: async () => {
      if (!taskId) throw new Error('Task ID is required');
      const response = await api.get<Task>(`/api/tasks/${taskId}`);
      return response.data;
    },
    enabled: !!taskId,
  });
};

// Fetch all users (for assignment dropdown)
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get<User[]>('/api/users');
      return response.data;
    },
  });
};

// Create task mutation
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TaskFormData) => {
      const response = await api.post<Task>('/api/tasks', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.msg || 'Failed to create task';
      toast.error(message);
    },
  });
};

// Update task mutation
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TaskFormData> }) => {
      const response = await api.patch<Task>(`/api/tasks/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task updated successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.msg || 'Failed to update task';
      toast.error(message);
    },
  });
};

// Assign/Unassign task mutation
export const useAssignTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, userId }: { taskId: string; userId: string }) => {
      const response = await api.patch(`/api/tasks/assign/${taskId}`, { targetUserId: userId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task assignment updated!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.msg || error.response?.data?.message || 'Failed to update assignment';
      toast.error(message);
    },
  });
};

// Delete task mutation
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      await api.delete(`/api/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.msg || 'Failed to delete task';
      toast.error(message);
    },
  });
};

