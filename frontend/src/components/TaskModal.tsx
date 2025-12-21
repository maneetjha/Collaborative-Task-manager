import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import type { Task } from '../types';
import { TASK_STATUSES, TASK_PRIORITIES } from '../lib/constants';
import { useCreateTask, useUpdateTask, useUsers, useAssignTask } from '../hooks/useTasks';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().optional(),
  status: z.enum(['To-Do', 'In-Progress', 'Completed']),
  priority: z.enum(['Low', 'Medium', 'High']),
  dueDate: z.string().optional().refine((date) => {
    if (!date) return true;
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }, 'Due date cannot be in the past'),
  assignedTo: z.array(z.string()).optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task }) => {
  const { user } = useAuth();
  const { data: users = [] } = useUsers();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const assignTask = useAssignTask();

  const isEditMode = !!task;
  const creatorId = task && (typeof task.creatorId === 'string' ? task.creatorId : task.creatorId._id);
  const isCreator = user?._id === creatorId;

  // Permission check: Assignees can only edit status
  const canEditAllFields = !isEditMode || isCreator;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'To-Do',
      priority: 'Medium',
      dueDate: '',
      assignedTo: [],
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
        assignedTo: task.assignedTo.map(a => typeof a === 'string' ? a : a._id),
      });
    } else {
      reset({
        title: '',
        description: '',
        status: 'To-Do',
        priority: 'Medium',
        dueDate: '',
        assignedTo: [],
      });
    }
  }, [task, reset]);

  const onSubmit = async (data: TaskFormValues) => {
    try {
      if (isEditMode && task) {
        // If user is assignee (not creator), only send status
        const updateData = canEditAllFields ? data : { status: data.status };
        await updateTask.mutateAsync({ id: task._id, data: updateData });
      } else {
        // Clean up data for creation - remove empty dueDate
        const createData: any = {
          title: data.title,
          description: data.description || '',
          status: data.status,
          priority: data.priority,
        };
        
        // Only include dueDate if it's provided
        if (data.dueDate) {
          createData.dueDate = data.dueDate;
        }
        
        const createdTask = await createTask.mutateAsync(createData);
        
        // Assign users if provided (after task creation)
        if (data.assignedTo && data.assignedTo.length > 0 && createdTask) {
          for (const userId of data.assignedTo) {
            try {
              await assignTask.mutateAsync({ 
                taskId: createdTask._id, 
                userId
              });
            } catch (assignError) {
              console.error('Failed to assign user:', assignError);
            }
          }
        }
      }
      onClose();
    } catch (error) {
      // Error handled in mutation
      console.error('Task submission error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal panel */}
      <div className="flex items-center justify-center min-h-screen px-4 py-8 relative z-10">
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Task' : 'Create New Task'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Permission notice for assignees */}
          {isEditMode && !canEditAllFields && (
            <div className="px-6 py-3 bg-yellow-50 border-b border-yellow-100">
              <p className="text-sm text-yellow-800">
                As an assignee, you can only update the task status.
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-5">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                {...register('title')}
                type="text"
                id="title"
                disabled={!canEditAllFields}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter task title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                id="description"
                rows={3}
                disabled={!canEditAllFields}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter task description"
              />
            </div>

            {/* Status and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('status')}
                  id="status"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  {TASK_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('priority')}
                  id="priority"
                  disabled={!canEditAllFields}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  {TASK_PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                {...register('dueDate')}
                type="date"
                id="dueDate"
                disabled={!canEditAllFields}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {errors.dueDate && (
                <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>
              )}
            </div>

            {/* Assign To */}
            {canEditAllFields && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign To
                </label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50">
                  <Controller
                    name="assignedTo"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <>
                        <div className="space-y-2">
                          {users.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">No users available</p>
                          ) : (
                            users.map((u) => {
                              const isSelected = (value || []).includes(u._id);
                              return (
                                <label
                                  key={u._id}
                                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white cursor-pointer transition"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      const currentValue = value || [];
                                      if (e.target.checked) {
                                        onChange([...currentValue, u._id]);
                                      } else {
                                        onChange(currentValue.filter((id: string) => id !== u._id));
                                      }
                                    }}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900">{u.name}</div>
                                    <div className="text-xs text-gray-500">{u.email}</div>
                                  </div>
                                </label>
                              );
                            })
                          )}
                        </div>
                        {users.length > 0 && (
                          <p className="mt-3 text-xs text-gray-500 border-t border-gray-200 pt-2">
                            {(value || []).length} user(s) selected
                          </p>
                        )}
                      </>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditMode ? 'Update Task' : 'Create Task'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

