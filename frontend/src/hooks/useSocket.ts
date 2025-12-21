import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { SOCKET_EVENTS } from '../lib/constants';
import type { Task } from '../types';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const { user, token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      // Only log if it's not a manual disconnect or navigation
      if (reason !== 'io client disconnect') {
        console.log('Socket disconnected:', reason);
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Handle TASK_CREATED event
    socket.on(SOCKET_EVENTS.TASK_CREATED, (task: Task) => {
      console.log('Task created:', task);
      // Invalidate created and assigned task lists
      queryClient.invalidateQueries({ queryKey: ['tasks', 'created'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'assigned'] });
      
      // Show notification if current user is assigned
      if (task.assignedTo && Array.isArray(task.assignedTo) && user) {
        const taskAssignedIds = task.assignedTo.map(a => typeof a === 'string' ? a : (a._id || a.id));
        if (taskAssignedIds.includes(user._id)) {
          toast.success(`New task assigned: ${task.title}`);
        }
      }
    });

    // Handle TASK_UPDATED event
    socket.on(SOCKET_EVENTS.TASK_UPDATED, (task: Task) => {
      console.log('Task updated:', task);
      // Invalidate all task queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      // Update specific task in cache if exists
      queryClient.setQueryData(['task', task._id], task);
    });

    // Handle TASK_FINISHED event
    // Backend sends: { message, taskId }
    socket.on(SOCKET_EVENTS.TASK_FINISHED, (data: { message?: string; taskId?: string; task?: Task }) => {
      console.log('Task finished:', data);
      
      // Invalidate all task queries
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      // Show notification - backend sends message directly to creator
      if (data.message) {
        toast.success(data.message, {
          duration: 5000,
          icon: '🎉',
        });
      } else if (data.task && data.task.creatorId && user) {
        // Fallback for alternative format
        const creatorId = typeof data.task.creatorId === 'string' ? data.task.creatorId : (data.task.creatorId._id || data.task.creatorId.id);
        if (user._id === creatorId) {
          toast.success(`Your assigned task "${data.task.title}" has been finished!`, {
            duration: 5000,
            icon: '🎉',
          });
        }
      }
    });

    // Handle TASK_DELETED event
    socket.on(SOCKET_EVENTS.TASK_DELETED, ({ taskId }: { taskId: string }) => {
      console.log('Task deleted:', taskId);
      
      // Remove task from all caches
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.removeQueries({ queryKey: ['task', taskId] });
      
      toast('A task has been deleted', { icon: 'ℹ️' });
    });

    // Handle TASK_ASSIGNED event
    // Backend sends: { message, taskId, assignedBy }
    socket.on(SOCKET_EVENTS.TASK_ASSIGNED, (data: { message?: string; taskId?: string; assignedBy?: string; task?: Task; assignedTo?: string[] }) => {
      console.log('Task assigned:', data);
      
      // Invalidate task queries
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      // Show notification - backend sends message directly
      if (data.message) {
        toast.success(data.message, {
          duration: 6000,
          icon: '📋',
        });
      } else if (data.task && data.assignedTo && Array.isArray(data.assignedTo) && user && user._id) {
        // Fallback for alternative format - only check if assignedTo is a valid array
        if (data.assignedTo.includes(user._id)) {
          toast.success(`You have been assigned to: ${data.task.title}`, {
            duration: 6000,
            icon: '📋',
          });
        }
      }
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, token, user, queryClient]);

  return socketRef.current;
};

