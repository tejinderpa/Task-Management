import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiPlus, FiSearch, FiFilter, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useTaskStore from '../store/taskStore';
import TaskCard from '../components/tasks/TaskCard';
import TaskModal from '../components/tasks/TaskModal';
import { exportToPDF, exportToCSV } from '../utils/exportUtils';

const TaskList = () => {
  const { tasks, pagination, filters, fetchTasks, setFilters } = useTaskStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Apply URL filters on mount
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (filterParam === 'overdue') {
      const now = new Date().toISOString();
      setFilters({ toDate: now, status: '', fromDate: '', search: '', priority: '' });
    } else if (filterParam === 'today') {
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      setFilters({ fromDate: today.toISOString(), toDate: endOfDay.toISOString(), status: '', search: '', priority: '' });
    } else if (filterParam === 'in-progress') {
      setFilters({ status: 'IN_PROGRESS', fromDate: '', toDate: '', search: '', priority: '' });
    } else if (filterParam === 'completed') {
      setFilters({ status: 'DONE', fromDate: '', toDate: '', search: '', priority: '' });
    } else if (!filterParam) {
      // Clear all filters when no filter param
      setFilters({ status: '', fromDate: '', toDate: '', search: '', priority: '' });
    }
  }, [searchParams, setFilters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ search: searchQuery });
  };

  const handleFilterChange = (key, value) => {
    setFilters({ [key]: value });
  };

  const handleExportPDF = () => {
    const filterType = searchParams.get('filter') || '';
    const result = exportToPDF(tasks, filterType);
    if (result.success) {
      toast.success(`Exported ${result.filename}`);
    } else {
      toast.error('Failed to export PDF');
    }
  };

  const handleExportCSV = () => {
    const filterType = searchParams.get('filter') || '';
    const result = exportToCSV(tasks, filterType);
    if (result.success) {
      toast.success(`Exported ${result.filename}`);
    } else {
      toast.error('Failed to export CSV');
    }
  };

  const handleEdit = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handlePageChange = (page) => {
    setFilters({ page });
  };

  // Get page title based on filter
  const getPageTitle = () => {
    const filterParam = searchParams.get('filter');
    switch (filterParam) {
      case 'overdue':
        return 'Overdue Tasks';
      case 'today':
        return "Today's Tasks";
      case 'in-progress':
        return 'In Progress Tasks';
      case 'completed':
        return 'Completed Tasks';
      default:
        return 'All Tasks';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{getPageTitle()}</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              {pagination.total || 0} total tasks
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Export Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <FiDownload className="w-5 h-5" />
                <span>Export</span>
              </button>
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={handleExportPDF}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg"
                >
                  Export as PDF
                </button>
                <button
                  onClick={handleExportCSV}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-b-lg"
                >
                  Export as CSV
                </button>
              </div>
            </div>

            <button
              onClick={handleCreate}
              className="btn-primary flex items-center gap-2"
            >
              <FiPlus /> Create Task
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                className="input-field pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center gap-2"
          >
            <FiFilter /> Filters
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                className="input-field"
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                className="input-field"
                value={filters.priority || ''}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                className="input-field"
                value={filters.sortBy || ''}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="-createdAt">Newest First</option>
                <option value="createdAt">Oldest First</option>
                <option value="dueDate">Due Date</option>
                <option value="-priority">Priority</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.length > 0 ? (
          tasks.map((task, index) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={handleEdit}
              style={{ animationDelay: `${index * 0.05}s` }}
            />
          ))
        ) : (
          <div className="col-span-full">
            <div className="card text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiSearch className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No tasks found
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first task to get started
              </p>
              <button onClick={handleCreate} className="btn-primary">
                <FiPlus className="inline mr-2" /> Create Task
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {isModalOpen && (
        <TaskModal
          task={selectedTask}
          onClose={handleCloseModal}
          onSuccess={() => {
            handleCloseModal();
            fetchTasks();
          }}
        />
      )}
    </div>
  );
};

export default TaskList;
