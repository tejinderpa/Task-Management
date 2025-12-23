import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiClock, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';
import useTaskStore from '../store/taskStore';
import useAuthStore from '../store/authStore';
import TaskModal from '../components/tasks/TaskModal';

const Dashboard = () => {
  const { stats, fetchStats } = useTaskStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Calculate stats from the backend response
  const statusCounts = stats?.statusCount?.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {}) || {};

  const totalTasks = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
  const inProgressTasks = statusCounts['IN_PROGRESS'] || 0;
  const overdueTasks = stats?.overdueTasks?.[0]?.count || 0;
  const completedTasks = statusCounts['DONE'] || 0;
  const todoTasks = statusCounts['TODO'] || 0;
  const reviewTasks = statusCounts['REVIEW'] || 0;

  const statCards = [
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: FiCheckCircle,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
      filter: null,
    },
    {
      title: 'In Progress',
      value: inProgressTasks,
      icon: FiClock,
      color: 'bg-yellow-500',
      bgLight: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      filter: 'in-progress',
    },
    {
      title: 'Overdue',
      value: overdueTasks,
      icon: FiAlertCircle,
      color: 'bg-red-500',
      bgLight: 'bg-red-50',
      textColor: 'text-red-600',
      filter: 'overdue',
    },
    {
      title: 'Completed',
      value: completedTasks,
      icon: FiTrendingUp,
      color: 'bg-green-500',
      bgLight: 'bg-green-50',
      textColor: 'text-green-600',
      filter: 'completed',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="mt-2 text-gray-600">
              Here's an overview of your tasks and activities
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">👋</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <button
            key={index}
            onClick={() => navigate(stat.filter ? `/tasks?filter=${stat.filter}` : '/tasks')}
            className="card hover:shadow-lg transition-all duration-200 animate-slide-in cursor-pointer text-left hover:scale-105"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.bgLight} p-3 rounded-lg`}>
                <stat.icon className={`w-8 h-8 ${stat.textColor}`} />
              </div>
            </div>
            <div className="mt-4">
              <div className={`h-2 ${stat.bgLight} rounded-full overflow-hidden`}>
                <div
                  className={`h-full ${stat.color} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min((stat.value / (totalTasks || 1)) * 100, 100)}%` }}
                />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/tasks?filter=overdue')}
            className="p-4 border-2 border-red-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all duration-200 text-left"
          >
            <FiAlertCircle className="w-6 h-6 text-red-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Review Overdue Tasks</h3>
            <p className="text-sm text-gray-600 mt-1">
              {overdueTasks} tasks need attention
            </p>
          </button>
          <button
            onClick={() => navigate('/tasks?filter=today')}
            className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left"
          >
            <FiClock className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Today's Tasks</h3>
            <p className="text-sm text-gray-600 mt-1">
              Focus on what's due today
            </p>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-4 border-2 border-green-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left"
          >
            <FiTrendingUp className="w-6 h-6 text-green-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Create New Task</h3>
            <p className="text-sm text-gray-600 mt-1">
              Add a new task to your list
            </p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Task Distribution</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-700">To Do</span>
            </div>
            <span className="font-semibold text-gray-900">{todoTasks}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700">In Progress</span>
            </div>
            <span className="font-semibold text-gray-900">{inProgressTasks}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-gray-700">In Review</span>
            </div>
            <span className="font-semibold text-gray-900">{reviewTasks}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Done</span>
            </div>
            <span className="font-semibold text-gray-900">{completedTasks}</span>
          </div>
        </div>
      </div>

      {/* Task Modal */}
      {isModalOpen && (
        <TaskModal
          task={null}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchStats();
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
