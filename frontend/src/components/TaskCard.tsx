import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Task } from '../types';
import { STATUS_COLORS, PRIORITY_COLORS } from '../lib/constants';
import { Calendar, Edit, Trash2, Users, X, ChevronDown, Circle, Clock, CheckCircle2, ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useUsers } from '../hooks/useTasks';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: allUsers = [] } = useUsers();
  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  
  const creatorId = typeof task.creatorId === 'string' ? task.creatorId : task.creatorId._id;
  const isCreator = user?._id === creatorId;
  
  // Check if task is overdue
  const isOverdue = task.dueDate && isPast(parseISO(task.dueDate)) && task.status !== 'Completed';
  
  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        buttonRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowPopover(false);
      }
    };

    if (showPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopover]);
  
  // Get assignees with proper data
  const getAssignees = (): Array<{ _id: string; name: string; email: string }> => {
    if (!task.assignedTo || task.assignedTo.length === 0) return [];
    
    return task.assignedTo.map(assignee => {
      // If it's already a User object, use it
      if (typeof assignee !== 'string') {
        return {
          _id: assignee._id || assignee.id || '',
          name: assignee.name,
          email: assignee.email,
        };
      }
      
      // If it's a string (ID), find the user in the users list
      const foundUser = allUsers.find(u => u._id === assignee || u.id === assignee);
      if (foundUser) {
        return {
          _id: foundUser._id || foundUser.id || assignee,
          name: foundUser.name,
          email: foundUser.email,
        };
      }
      
      // Fallback if user not found
      return { _id: assignee, name: 'Unknown User', email: '' };
    });
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get color for avatar based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-teal-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const assignees = getAssignees();
  const visibleAssignees = assignees.slice(0, 3);
  const remainingCount = assignees.length - 3;
  const showMoreButton = assignees.length > 0;
  const showCountBadge = assignees.length > 3;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all p-6 cursor-pointer group">
      {/* Header - Clickable to view details */}
      <div 
        className="flex items-start justify-between mb-3"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/tasks/${task._id}`);
        }}
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate mb-1 group-hover:text-blue-600 transition-colors">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Badges with Labels */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Status:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${STATUS_COLORS[task.status]}`}>
            {task.status === 'To-Do' && <Circle className="w-3 h-3" />}
            {task.status === 'In-Progress' && <Clock className="w-3 h-3" />}
            {task.status === 'Completed' && <CheckCircle2 className="w-3 h-3" />}
            {task.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Priority:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${PRIORITY_COLORS[task.priority]}`}>
            {task.priority === 'Low' && <ArrowDown className="w-3 h-3" />}
            {task.priority === 'Medium' && <Minus className="w-3 h-3" />}
            {task.priority === 'High' && <ArrowUp className="w-3 h-3" />}
            {task.priority}
          </span>
        </div>
      </div>

      {/* Assignees */}
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-gray-500 flex-shrink-0" />
        {assignees.length === 0 ? (
          <span className="text-sm text-gray-400">Unassigned</span>
        ) : (
          <div className="flex items-center gap-1.5 flex-wrap">
            {(showCountBadge ? visibleAssignees : assignees).map((assignee) => (
              <div
                key={assignee._id}
                className="flex items-center gap-1.5 group relative"
                title={assignee.name}
              >
                <div
                  className={`w-7 h-7 rounded-full ${getAvatarColor(assignee.name)} text-white text-xs font-semibold flex items-center justify-center flex-shrink-0`}
                >
                  {getInitials(assignee.name)}
                </div>
                <span className="text-sm text-gray-700 hidden sm:inline truncate max-w-[80px]">
                  {assignee.name.split(' ')[0]}
                </span>
              </div>
            ))}
            {showMoreButton && (
              <div className="relative">
                <div
                  ref={buttonRef}
                  onClick={() => setShowPopover(!showPopover)}
                  className={`${
                    showCountBadge
                      ? 'w-7 h-7 rounded-full bg-gray-300 hover:bg-gray-400 text-gray-700 text-xs font-semibold'
                      : 'w-7 h-7 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600'
                  } flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors`}
                  title="View all assignees"
                >
                  {showCountBadge ? (
                    `+${remainingCount}`
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
                
                {/* Popover */}
                {showPopover && (
                  <div
                    ref={popoverRef}
                    className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-3"
                  >
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900">All Assignees</h4>
                      <button
                        onClick={() => setShowPopover(false)}
                        className="text-gray-400 hover:text-gray-600 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {assignees.map((assignee) => (
                        <div
                          key={assignee._id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition"
                        >
                          <div
                            className={`w-8 h-8 rounded-full ${getAvatarColor(assignee.name)} text-white text-xs font-semibold flex items-center justify-center flex-shrink-0`}
                          >
                            {getInitials(assignee.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {assignee.name}
                            </div>
                            {assignee.email && (
                              <div className="text-xs text-gray-500 truncate">
                                {assignee.email}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Due Date and Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        {task.dueDate ? (
          <div className={`flex items-center gap-2 text-sm ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
            <Calendar className="w-4 h-4" />
            <span>{format(parseISO(task.dueDate), 'MMM dd, yyyy')}</span>
          </div>
        ) : (
          <div className="text-sm text-gray-400">No due date</div>
        )}

        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="Edit task"
          >
            <Edit className="w-4 h-4" />
          </button>
          
          {isCreator && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task._id);
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

