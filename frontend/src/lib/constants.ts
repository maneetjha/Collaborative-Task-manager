export const TASK_STATUSES = ['To-Do', 'In-Progress', 'Completed'] as const;
export const TASK_PRIORITIES = ['Low', 'Medium', 'High'] as const;

export const STATUS_COLORS = {
  'To-Do': 'bg-gray-100 text-gray-800 border-gray-300',
  'In-Progress': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Completed': 'bg-green-100 text-green-800 border-green-300',
};

export const PRIORITY_COLORS = {
  'Low': 'bg-blue-100 text-blue-800 border-blue-300',
  'Medium': 'bg-orange-100 text-orange-800 border-orange-300',
  'High': 'bg-red-100 text-red-800 border-red-300',
};

export const SOCKET_EVENTS = {
  TASK_CREATED: 'TASK_CREATED',
  TASK_UPDATED: 'TASK_UPDATED',
  TASK_FINISHED: 'TASK_FINISHED',
  TASK_DELETED: 'TASK_DELETED',
  TASK_ASSIGNED: 'TASK_ASSIGNED',
} as const;

