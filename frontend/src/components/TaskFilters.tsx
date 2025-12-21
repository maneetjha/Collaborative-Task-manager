import React, { useState } from 'react';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';
import type { TaskStatus, TaskPriority } from '../types';
import { TASK_STATUSES, TASK_PRIORITIES } from '../lib/constants';

interface TaskFiltersProps {
  statusFilter: TaskStatus | 'all';
  priorityFilter: TaskPriority | 'all';
  sortOrder: 'none' | 'earliest' | 'latest';
  onStatusFilterChange: (status: TaskStatus | 'all') => void;
  onPriorityFilterChange: (priority: TaskPriority | 'all') => void;
  onSortOrderChange: (order: 'none' | 'earliest' | 'latest') => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  statusFilter,
  priorityFilter,
  sortOrder,
  onStatusFilterChange,
  onPriorityFilterChange,
  onSortOrderChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters = statusFilter !== 'all' || priorityFilter !== 'all' || sortOrder !== 'none';

  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-6 shadow-sm overflow-hidden">
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full md:hidden flex items-center justify-between p-4 hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-700">Filters & Sort</h3>
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              !
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </button>

      <div className="hidden md:flex items-center gap-2 px-4 pt-4 pb-2">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="text-sm font-semibold text-gray-700">Filters & Sort</h3>
      </div>

      {/* Filters Content */}
      <div className={`${isExpanded ? 'block' : 'hidden'} md:block px-4 pb-4 md:pb-4`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label htmlFor="statusFilter" className="block text-xs font-medium text-gray-600 mb-1.5">
              Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value as TaskStatus | 'all')}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
            >
              <option value="all">All Statuses</option>
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label htmlFor="priorityFilter" className="block text-xs font-medium text-gray-600 mb-1.5">
              Priority
            </label>
            <select
              id="priorityFilter"
              value={priorityFilter}
              onChange={(e) => onPriorityFilterChange(e.target.value as TaskPriority | 'all')}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
            >
              <option value="all">All Priorities</option>
              {TASK_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>

          {/* Sort by Due Date */}
          <div>
            <label htmlFor="sortOrder" className="block text-xs font-medium text-gray-600 mb-1.5">
              Sort by Due Date
            </label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => onSortOrderChange(e.target.value as 'none' | 'earliest' | 'latest')}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
            >
              <option value="none">No Sorting</option>
              <option value="earliest">Earliest First</option>
              <option value="latest">Latest First</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

