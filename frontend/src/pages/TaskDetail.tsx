import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTask, useUsers } from '../hooks/useTasks';
import { useAuth } from '../contexts/AuthContext';
import { STATUS_COLORS, PRIORITY_COLORS } from '../lib/constants';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  User,
  Circle,
  Clock,
  CheckCircle2,
  ArrowDown,
  ArrowUp,
  Minus,
  Loader2
} from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import { useDeleteTask } from '../hooks/useTasks';
import { TaskModal } from '../components/TaskModal';

export const TaskDetail: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: task, isLoading } = useTask(taskId);
  const { data: allUsers = [] } = useUsers();
  const deleteTask = useDeleteTask();
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  // Get assignees with proper data
  const getAssignees = () => {
    if (!task?.assignedTo || task.assignedTo.length === 0) return [];
    
    return task.assignedTo.map(assignee => {
      if (typeof assignee !== 'string') {
        return {
          _id: assignee._id || assignee.id || '',
          name: assignee.name,
          email: assignee.email,
        };
      }
      
      const foundUser = allUsers.find(u => u._id === assignee || u.id === assignee);
      if (foundUser) {
        return {
          _id: foundUser._id || foundUser.id || assignee,
          name: foundUser.name,
          email: foundUser.email,
        };
      }
      
      return { _id: assignee, name: 'Unknown User', email: '' };
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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

  const creatorId = task ? (typeof task.creatorId === 'string' ? task.creatorId : task.creatorId._id) : null;
  const isCreator = user?._id === creatorId;
  const isOverdue = task?.dueDate && isPast(parseISO(task.dueDate)) && task.status !== 'Completed';
  const assignees = task ? getAssignees() : [];

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask.mutateAsync(taskId!);
      navigate('/dashboard');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Task not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700"
          >
            Go back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              {isCreator && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Notion Style */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 md:p-12">
          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-8 pb-6 border-b border-gray-200">
            {task.title}
          </h1>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-gray-200">
            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                Status
              </label>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${STATUS_COLORS[task.status]}`}>
                {task.status === 'To-Do' && <Circle className="w-4 h-4" />}
                {task.status === 'In-Progress' && <Clock className="w-4 h-4" />}
                {task.status === 'Completed' && <CheckCircle2 className="w-4 h-4" />}
                <span className="font-semibold">{task.status}</span>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                Priority
              </label>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${PRIORITY_COLORS[task.priority]}`}>
                {task.priority === 'Low' && <ArrowDown className="w-4 h-4" />}
                {task.priority === 'Medium' && <Minus className="w-4 h-4" />}
                {task.priority === 'High' && <ArrowUp className="w-4 h-4" />}
                <span className="font-semibold">{task.priority}</span>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                Due Date
              </label>
              {task.dueDate ? (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  isOverdue 
                    ? 'bg-red-50 text-red-700 border border-red-200' 
                    : 'bg-gray-50 text-gray-700 border border-gray-200'
                }`}>
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">{format(parseISO(task.dueDate), 'MMMM dd, yyyy')}</span>
                  {isOverdue && <span className="text-xs font-bold ml-2">⚠️ Overdue</span>}
                </div>
              ) : (
                <div className="text-gray-400 px-4 py-2">No due date set</div>
              )}
            </div>

            {/* Created Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                Created
              </label>
              <div className="flex items-center gap-2 text-gray-700 px-4 py-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="font-medium">
                  {format(parseISO(task.createdAt), 'MMMM dd, yyyy')}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
              Description
            </label>
            {task.description ? (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            ) : (
              <p className="text-gray-400 italic">No description provided</p>
            )}
          </div>

          {/* Assignees */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <label className="block text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
              Assigned To
            </label>
            {assignees.length === 0 ? (
              <p className="text-gray-400">No one assigned</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {assignees.map((assignee) => (
                  <div
                    key={assignee._id}
                    className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3 border border-gray-200"
                  >
                    <div
                      className={`w-10 h-10 rounded-full ${getAvatarColor(assignee.name)} text-white text-sm font-semibold flex items-center justify-center flex-shrink-0 shadow-sm`}
                    >
                      {getInitials(assignee.name)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {assignee.name}
                      </div>
                      {assignee.email && (
                        <div className="text-xs text-gray-500">
                          {assignee.email}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Creator Info */}
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
              Created By
            </label>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white text-sm font-semibold flex items-center justify-center flex-shrink-0 shadow-sm">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  {typeof task.creatorId === 'string' 
                    ? allUsers.find(u => u._id === task.creatorId)?.name || 'Unknown'
                    : task.creatorId?.name || 'Unknown'
                  }
                </div>
                <div className="text-xs text-gray-500">Task Creator</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      <TaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={task}
      />
    </div>
  );
};

