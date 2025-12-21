import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  useCreatedTasks,
  useAssignedTasks,
  useOverdueTasks,
  useDeleteTask,
} from '../hooks/useTasks';
import type { Task, TaskStatus, TaskPriority } from '../types';
import { TaskCard } from '../components/TaskCard';
import { TaskModal } from '../components/TaskModal';
import { TaskFilters } from '../components/TaskFilters';
import { TaskListSkeleton } from '../components/SkeletonLoader';
import { Plus, LogOut, AlertCircle, CheckCircle, Clock, Briefcase, User, Menu, X } from 'lucide-react';
import { parseISO } from 'date-fns';

type TabType = 'assigned' | 'created' | 'overdue';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('assigned');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'none' | 'earliest' | 'latest'>('none');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch tasks based on active tab
  const { data: assignedTasks, isLoading: isLoadingAssigned } = useAssignedTasks();
  const { data: createdTasks, isLoading: isLoadingCreated } = useCreatedTasks();
  const { data: overdueTasks, isLoading: isLoadingOverdue } = useOverdueTasks();

  const deleteTask = useDeleteTask();

  // Get current tasks based on active tab
  const currentTasks = useMemo(() => {
    switch (activeTab) {
      case 'assigned':
        return assignedTasks || [];
      case 'created':
        return createdTasks || [];
      case 'overdue':
        return overdueTasks || [];
      default:
        return [];
    }
  }, [activeTab, assignedTasks, createdTasks, overdueTasks]);

  // Apply filters and sorting
  const filteredAndSortedTasks = useMemo(() => {
    if (!Array.isArray(currentTasks)) return [];
    let filtered = [...currentTasks];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }

    // Sort by due date
    if (sortOrder !== 'none') {
      filtered.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;

        const dateA = parseISO(a.dueDate);
        const dateB = parseISO(b.dueDate);

        const timeA = dateA.getTime();
        const timeB = dateB.getTime();
        
        if (sortOrder === 'earliest') {
          // Earliest first: smaller timestamps first (Dec 23 < Dec 26)
          return timeA - timeB;
        } else {
          // Latest first: larger timestamps first (Dec 26 > Dec 23)
          return timeB - timeA;
        }
      });
    }

    return filtered;
  }, [currentTasks, statusFilter, priorityFilter, sortOrder]);

  const isLoading = useMemo(() => {
    switch (activeTab) {
      case 'assigned':
        return isLoadingAssigned;
      case 'created':
        return isLoadingCreated;
      case 'overdue':
        return isLoadingOverdue;
      default:
        return false;
    }
  }, [activeTab, isLoadingAssigned, isLoadingCreated, isLoadingOverdue]);

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask.mutateAsync(taskId);
    }
  };

  const overdueCount = overdueTasks?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Side Panel Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Side Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Panel Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Menu</h2>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
              aria-label="Close menu"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <button
              onClick={() => {
                handleCreateTask();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span>New Task</span>
            </button>

            <div className="space-y-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  navigate('/profile');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition active:scale-95"
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 border border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition active:scale-95"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between py-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Task Manager</h1>
              <p className="text-lg text-gray-600">Welcome back, {user?.name}!</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCreateTask}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>New Task</span>
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                title="Profile Settings"
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden py-4">
            {/* Top Row: Title and Menu Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Task Manager</h1>
                <p className="text-base text-gray-600">Welcome back, {user?.name}!</p>
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition flex-shrink-0"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-7 h-7 text-gray-700" />
                ) : (
                  <Menu className="w-7 h-7 text-gray-700" />
                )}
              </button>
            </div>

            {/* Floating Action Button for Mobile (when menu is closed and modal is closed) */}
            {!mobileMenuOpen && !isModalOpen && (
              <button
                onClick={handleCreateTask}
                className="fixed bottom-6 right-6 md:hidden w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 active:scale-95 flex items-center justify-center z-30"
                aria-label="Create new task"
              >
                <Plus className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6 shadow-sm">
          {/* Desktop Tabs */}
          <div className="hidden md:flex">
            <button
              onClick={() => setActiveTab('assigned')}
              className={`flex-1 px-6 py-4 font-semibold text-sm transition flex items-center justify-center gap-2 ${
                activeTab === 'assigned'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Briefcase className="w-5 h-5" />
              <span>Assigned to Me</span>
            </button>

            <button
              onClick={() => setActiveTab('created')}
              className={`flex-1 px-6 py-4 font-semibold text-sm transition flex items-center justify-center gap-2 ${
                activeTab === 'created'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span>Created by Me</span>
            </button>

            <button
              onClick={() => setActiveTab('overdue')}
              className={`flex-1 px-6 py-4 font-semibold text-sm transition flex items-center justify-center gap-2 relative ${
                activeTab === 'overdue'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <AlertCircle className="w-5 h-5" />
              <span>Overdue</span>
              {overdueCount > 0 && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {overdueCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Tabs - Card Style */}
          <div className="md:hidden p-3 space-y-2">
            <button
              onClick={() => setActiveTab('assigned')}
              className={`w-full px-4 py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-between active:scale-98 ${
                activeTab === 'assigned'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5" />
                <span>Assigned to Me</span>
              </div>
              {activeTab === 'assigned' && (
                <div className="w-2 h-2 bg-white rounded-full"></div>
              )}
            </button>

            <button
              onClick={() => setActiveTab('created')}
              className={`w-full px-4 py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-between active:scale-98 ${
                activeTab === 'created'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5" />
                <span>Created by Me</span>
              </div>
              {activeTab === 'created' && (
                <div className="w-2 h-2 bg-white rounded-full"></div>
              )}
            </button>

            <button
              onClick={() => setActiveTab('overdue')}
              className={`w-full px-4 py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-between active:scale-98 relative ${
                activeTab === 'overdue'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                <span>Overdue</span>
                {overdueCount > 0 && (
                  <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${
                    activeTab === 'overdue'
                      ? 'bg-white text-red-600'
                      : 'bg-red-500 text-white'
                  }`}>
                    {overdueCount}
                  </span>
                )}
              </div>
              {activeTab === 'overdue' && (
                <div className="w-2 h-2 bg-white rounded-full"></div>
              )}
            </button>
          </div>
        </div>

        {/* Filters */}
        <TaskFilters
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          sortOrder={sortOrder}
          onStatusFilterChange={setStatusFilter}
          onPriorityFilterChange={setPriorityFilter}
          onSortOrderChange={setSortOrder}
        />

        {/* Task List */}
        {isLoading ? (
          <TaskListSkeleton count={6} />
        ) : filteredAndSortedTasks.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'assigned' && "You don't have any tasks assigned to you yet."}
              {activeTab === 'created' && "You haven't created any tasks yet."}
              {activeTab === 'overdue' && "No overdue tasks. Great job!"}
            </p>
            {activeTab !== 'overdue' && (
              <button
                onClick={handleCreateTask}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                <Plus className="w-5 h-5" />
                Create Your First Task
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}
      </main>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        task={selectedTask}
      />
    </div>
  );
};

